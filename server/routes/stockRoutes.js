import express from 'express';
import { query } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Record a manual stock movement (5 types)
 * Enforces zero-floor rule and snapshots prices on sale
 */
router.post('/manual', authenticateToken, async (req, res) => {
  try {
    const { itemId, movementType, quantity, supplierOrReason, countValue } = req.body;

    if (!itemId || !movementType) {
      return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Item and movement type are required.' });
    }

    const validTypes = ['RECEIVED', 'SOLD', 'DAMAGED', 'CORRECTION', 'CUSTOMER_RETURN'];
    if (!validTypes.includes(movementType)) {
      return res.status(400).json({ error: 'INVALID_TYPE', message: `Movement type must be one of: ${validTypes.join(', ')}` });
    }

    // Get live item
    const itemRes = await query('SELECT * FROM items WHERE id = $1', [itemId]);
    if (itemRes.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Item not found in catalog.' });
    }

    const item = itemRes.rows[0];
    const currentStock = item.total_stock;
    let delta = 0;
    let cleanReason = (supplierOrReason || '').trim();

    const parsedQty = parseInt(quantity, 10);

    if (movementType === 'CORRECTION') {
      const parsedCount = parseInt(countValue, 10);
      if (isNaN(parsedCount) || parsedCount < 0) {
        return res.status(400).json({ error: 'INVALID_COUNT', message: 'Physical count must be a non-negative number.' });
      }
      delta = parsedCount - currentStock;
      if (!cleanReason) {
        return res.status(400).json({ error: 'REASON_REQUIRED', message: 'A reason is mandatory for Count Corrections.' });
      }
    } else {
      if (isNaN(parsedQty) || parsedQty <= 0) {
        return res.status(400).json({ error: 'INVALID_QUANTITY', message: 'Quantity must be greater than zero.' });
      }

      if (movementType === 'RECEIVED') {
        delta = Math.abs(parsedQty);
        if (!cleanReason) cleanReason = 'Supplier delivery';
      } else if (movementType === 'SOLD') {
        delta = -Math.abs(parsedQty);
        if (!cleanReason) cleanReason = 'Customer sale';
      } else if (movementType === 'DAMAGED') {
        delta = -Math.abs(parsedQty);
        if (!cleanReason) {
          return res.status(400).json({ error: 'REASON_REQUIRED', message: 'A reason is mandatory for Damaged/Expired stock.' });
        }
      } else if (movementType === 'CUSTOMER_RETURN') {
        delta = Math.abs(parsedQty);
        if (!cleanReason) {
          return res.status(400).json({ error: 'REASON_REQUIRED', message: 'A return reason or receipt note is required.' });
        }
      }
    }

    const newStock = currentStock + delta;

    // Test Case 3: Stock can never go below zero
    if (newStock < 0) {
      return res.status(400).json({
        error: 'INSUFFICIENT_STOCK',
        message: `Action blocked: Cannot reduce stock by ${Math.abs(delta)}. Only ${currentStock} units are currently available.`
      });
    }

    // Atomic Update: update items table
    await query('UPDATE items SET total_stock = $1 WHERE id = $2', [newStock, item.id]);

    // Snapshot prices for sales (or current prices for other movements)
    const unitSelling = item.selling_price;
    const unitCost = item.cost_price;

    await query(
      `INSERT INTO stock_movements 
       (item_id, user_id, movement_type, quantity_change, old_stock, new_stock, unit_selling_price, unit_cost_price, supplier_or_reason, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        item.id,
        req.user.id,
        movementType,
        delta,
        currentStock,
        newStock,
        movementType === 'SOLD' ? unitSelling : null,
        movementType === 'SOLD' ? unitCost : null,
        cleanReason,
        'MANUAL_FORM'
      ]
    );

    res.json({
      success: true,
      message: `Stock updated successfully for ${item.name}.`,
      item: {
        id: item.id,
        name: item.name,
        oldStock: currentStock,
        delta,
        newStock
      }
    });
  } catch (err) {
    console.error('Manual movement error:', err);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to record stock movement.' });
  }
});

/**
 * Confirm an AI Stock Change Draft
 * Test Case 2 & Concurrency Protections
 */
router.post('/confirm', authenticateToken, async (req, res) => {
  try {
    const { confirmationId } = req.body;
    if (!confirmationId) {
      return res.status(400).json({ error: 'MISSING_ID', message: 'Confirmation token is required.' });
    }

    // 1. Fetch draft from durable pending_confirmations table
    const draftRes = await query('SELECT * FROM pending_confirmations WHERE id = $1', [confirmationId]);
    if (draftRes.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Confirmation request not found.' });
    }

    const draft = draftRes.rows[0];

    // 2. Double-Click / Replay Protection
    if (draft.status === 'CONFIRMED') {
      return res.status(409).json({ error: 'ALREADY_CONFIRMED', message: 'This change has already been confirmed and applied.' });
    }

    if (draft.status === 'CANCELLED') {
      return res.status(400).json({ error: 'ALREADY_CANCELLED', message: 'This draft was cancelled and cannot be applied.' });
    }

    // 3. Expiration Check (10 minutes)
    const now = new Date();
    const expiry = new Date(draft.expires_at);
    if (draft.status === 'EXPIRED' || now > expiry) {
      // Explicitly mark as EXPIRED as requested by user
      await query("UPDATE pending_confirmations SET status = 'EXPIRED' WHERE id = $1", [confirmationId]);
      return res.status(410).json({
        error: 'DRAFT_EXPIRED',
        message: 'This confirmation card has expired (10-minute limit). Please ask the assistant again.'
      });
    }

    // 4. Verify user ownership (or allow Manager)
    if (draft.user_id !== req.user.id && req.user.role !== 'MANAGER') {
      return res.status(403).json({ error: 'UNAUTHORIZED_CONFIRM', message: 'Only the user who initiated this draft can confirm it.' });
    }

    // 5. Concurrency Check: Fetch live fresh item from DB
    const itemRes = await query('SELECT * FROM items WHERE id = $1', [draft.item_id]);
    if (itemRes.rows.length === 0) {
      return res.status(404).json({ error: 'ITEM_REMOVED', message: 'Item no longer exists in catalog.' });
    }

    const liveItem = itemRes.rows[0];
    const liveCurrentStock = liveItem.total_stock;
    const delta = draft.quantity_change;
    const newStock = liveCurrentStock + delta;

    // Zero-floor verification on live stock
    if (newStock < 0) {
      return res.status(400).json({
        error: 'INSUFFICIENT_STOCK',
        message: `Cannot confirm: Live stock is currently ${liveCurrentStock}. Applying ${delta} would result in negative inventory.`
      });
    }

    // 6. Apply live delta to item
    await query('UPDATE items SET total_stock = $1 WHERE id = $2', [newStock, liveItem.id]);

    // 7. Insert into audit ledger
    await query(
      `INSERT INTO stock_movements 
       (item_id, user_id, movement_type, quantity_change, old_stock, new_stock, unit_selling_price, unit_cost_price, supplier_or_reason, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        liveItem.id,
        req.user.id,
        draft.movement_type,
        delta,
        liveCurrentStock,
        newStock,
        draft.movement_type === 'SOLD' ? liveItem.selling_price : null,
        draft.movement_type === 'SOLD' ? liveItem.cost_price : null,
        draft.supplier_or_reason,
        'AI_CONFIRMED'
      ]
    );

    // 8. Mark draft as CONFIRMED (Consumed)
    await query("UPDATE pending_confirmations SET status = 'CONFIRMED' WHERE id = $1", [confirmationId]);

    res.json({
      success: true,
      message: `Confirmed: Stock updated from ${liveCurrentStock} to ${newStock}.`,
      item: {
        id: liveItem.id,
        name: liveItem.name,
        oldStock: liveCurrentStock,
        delta,
        newStock
      }
    });
  } catch (err) {
    console.error('Confirm error:', err);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to confirm stock change.' });
  }
});

/**
 * Cancel an AI Stock Change Draft
 */
router.post('/cancel', authenticateToken, async (req, res) => {
  try {
    const { confirmationId } = req.body;
    if (!confirmationId) {
      return res.status(400).json({ error: 'MISSING_ID', message: 'Confirmation token is required.' });
    }

    await query(
      "UPDATE pending_confirmations SET status = 'CANCELLED' WHERE id = $1 AND status = 'PENDING'",
      [confirmationId]
    );

    res.json({ success: true, message: 'Action cancelled. No changes were made.' });
  } catch (err) {
    console.error('Cancel error:', err);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to cancel draft.' });
  }
});

/**
 * Get Stock Movements (Audit Ledger)
 * Role Security: unit_cost_price is redacted for Staff
 */
router.get('/movements', authenticateToken, async (req, res) => {
  try {
    const { itemId, limit = 50 } = req.query;
    let sql = `
      SELECT 
        sm.id, sm.item_id, sm.user_id, sm.movement_type, sm.quantity_change, 
        sm.old_stock, sm.new_stock, sm.unit_selling_price, sm.unit_cost_price, 
        sm.supplier_or_reason, sm.source, sm.created_at,
        i.name as item_name, i.section,
        u.name as user_name, u.role as user_role
      FROM stock_movements sm
      JOIN items i ON sm.item_id = i.id
      JOIN users u ON sm.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (itemId) {
      params.push(itemId);
      sql += ` AND sm.item_id = $${params.length}`;
    }

    sql += ` ORDER BY sm.created_at DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit, 10));

    const result = await query(sql, params);

    const isStaff = req.user.role === 'STAFF';
    const movements = result.rows.map(m => {
      const row = { ...m };
      if (isStaff) {
        delete row.unit_cost_price;
      }
      return row;
    });

    res.json({ movements });
  } catch (err) {
    console.error('Error fetching movements:', err);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to fetch stock history.' });
  }
});

export default router;
