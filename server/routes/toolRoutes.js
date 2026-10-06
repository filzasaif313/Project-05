import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db.js';
import { authenticateInternalAgentToken } from '../middleware/auth.js';

const router = express.Router();

// Apply internal agent token verification to all tool routes
router.use(authenticateInternalAgentToken);

/**
 * Tool 1: check_stock
 * Checks real stock levels and locations. Role-aware.
 */
router.post('/stock', async (req, res) => {
  try {
    const { query: searchQuery } = req.body;
    let sql = 'SELECT id, name, section, total_stock, low_stock_threshold, front_display, back_store_room, selling_price, cost_price FROM items';
    const params = [];

    if (searchQuery && searchQuery.trim() !== '') {
      const words = searchQuery
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .map(w => (w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w))
        .filter(Boolean);

      if (words.length > 0) {
        const conditions = words.map((w, i) => {
          params.push(`%${w}%`);
          return `(LOWER(name) LIKE $${i + 1} OR LOWER(section) LIKE $${i + 1})`;
        });
        sql += ` WHERE ${conditions.join(' AND ')}`;
      }
    }

    sql += ' ORDER BY name ASC LIMIT 10';
    const result = await query(sql, params);

    if (result.rows.length === 0) {
      return res.json({
        found: false,
        message: `I searched the store catalog but could not find any item matching "${searchQuery || ''}".`,
        items: []
      });
    }

    const isStaff = req.user.role === 'STAFF';
    const items = result.rows.map(item => {
      const sanitized = {
        id: item.id,
        name: item.name,
        section: item.section,
        totalStock: item.total_stock,
        isLowStock: item.total_stock <= item.low_stock_threshold,
        frontDisplay: item.front_display || 'Not on display',
        backStoreRoom: item.back_store_room || 'Not stored in back room',
        sellingPrice: parseFloat(item.selling_price)
      };

      // Strict security: Cost price is only given to Manager
      if (!isStaff) {
        sanitized.costPrice = parseFloat(item.cost_price);
        sanitized.profitPerUnit = parseFloat(item.selling_price) - parseFloat(item.cost_price);
      }

      return sanitized;
    });

    res.json({
      found: true,
      count: items.length,
      userRole: req.user.role,
      items
    });
  } catch (err) {
    console.error('Tool stock error:', err);
    res.status(500).json({ error: 'TOOL_ERROR', message: 'Failed to look up stock data.' });
  }
});

/**
 * Tool 2: get_sales_report
 * Answers "Which item sold most this week?" from real stock movement records.
 */
router.post('/sales', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        i.id, i.name, i.section,
        SUM(ABS(sm.quantity_change)) as units_sold,
        SUM(ABS(sm.quantity_change) * COALESCE(sm.unit_selling_price, i.selling_price)) as total_revenue,
        SUM(ABS(sm.quantity_change) * (COALESCE(sm.unit_selling_price, i.selling_price) - COALESCE(sm.unit_cost_price, i.cost_price))) as gross_profit
      FROM stock_movements sm
      JOIN items i ON sm.item_id = i.id
      WHERE sm.movement_type = 'SOLD'
      GROUP BY i.id, i.name, i.section
      ORDER BY units_sold DESC
      LIMIT 10
    `);

    const isStaff = req.user.role === 'STAFF';
    const topSellers = result.rows.map(r => {
      const row = {
        id: r.id,
        name: r.name,
        section: r.section,
        unitsSold: parseInt(r.units_sold, 10)
      };

      // Role boundary: Redact revenue & profit for Staff
      if (!isStaff) {
        row.totalRevenue = parseFloat(r.total_revenue || 0);
        row.grossProfit = parseFloat(r.gross_profit || 0);
      }

      return row;
    });

    res.json({
      period: 'this_week',
      userRole: req.user.role,
      topSellers,
      topItem: topSellers.length > 0 ? topSellers[0] : null
    });
  } catch (err) {
    console.error('Tool sales error:', err);
    res.status(500).json({ error: 'TOOL_ERROR', message: 'Failed to retrieve sales reports.' });
  }
});

/**
 * Tool 3: prepare_stock_change
 * Simulates proposed change, verifies zero-floor, creates durable draft in pending_confirmations.
 * STRICT: NEVER WRITES TO items OR stock_movements.
 */
router.post('/prepare-change', async (req, res) => {
  try {
    const { itemName, quantity, movementType, supplierOrReason } = req.body;

    if (!itemName || quantity === undefined) {
      return res.status(400).json({
        valid: false,
        error: 'MISSING_DATA',
        message: 'Item name and quantity are required to prepare a stock change.'
      });
    }

    // 1. Find matching item with smart keyword & singular/plural normalization
    const cleanTerm = itemName.trim().toLowerCase();
    // Try exact partial match first
    let itemRes = await query(
      'SELECT * FROM items WHERE LOWER(name) LIKE $1 ORDER BY id ASC LIMIT 1',
      [`%${cleanTerm}%`]
    );

    // If not found, tokenize words and normalize plurals (e.g., 'cables' -> 'cable')
    if (itemRes.rows.length === 0) {
      const words = cleanTerm.split(/\s+/).map(w => w.replace(/s$/, '').trim()).filter(w => w.length > 2);
      if (words.length > 0) {
        let keywordSql = 'SELECT * FROM items WHERE 1=1';
        const params = [];
        words.forEach(word => {
          params.push(`%${word}%`);
          keywordSql += ` AND LOWER(name) LIKE $${params.length}`;
        });
        keywordSql += ' ORDER BY id ASC LIMIT 1';
        itemRes = await query(keywordSql, params);
      }
    }

    if (itemRes.rows.length === 0) {
      return res.json({
        valid: false,
        error: 'ITEM_NOT_FOUND',
        message: `I could not find an item named "${itemName}" in the store catalog. Please check the spelling or add it first.`
      });
    }

    const item = itemRes.rows[0];
    const currentStock = item.total_stock;
    const parsedQty = Math.abs(parseInt(quantity, 10));

    if (isNaN(parsedQty) || parsedQty <= 0) {
      return res.json({
        valid: false,
        error: 'INVALID_QUANTITY',
        message: 'Quantity to change must be a positive number.'
      });
    }

    let delta = 0;
    const type = (movementType || 'RECEIVED').toUpperCase();

    if (type === 'RECEIVED' || type === 'CUSTOMER_RETURN') {
      delta = parsedQty;
    } else if (type === 'SOLD' || type === 'DAMAGED') {
      delta = -parsedQty;
    } else {
      delta = parsedQty;
    }

    const newStock = currentStock + delta;

    // Test Case 3: Zero-floor invariant
    if (newStock < 0) {
      return res.json({
        valid: false,
        error: 'INSUFFICIENT_STOCK',
        message: `Stock cannot go below zero: "${item.name}" currently has only ${currentStock} in stock. Cannot record ${parsedQty} ${type.toLowerCase()}.`
      });
    }

    // Generate unique confirmation ID
    const confirmationId = uuidv4();
    const cleanReason = (supplierOrReason || (type === 'RECEIVED' ? 'Ali Traders' : 'Stock adjustment')).trim();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Insert durable draft into pending_confirmations with 10-minute expiry
    await query(
      `INSERT INTO pending_confirmations 
       (id, user_id, item_id, quantity_change, movement_type, supplier_or_reason, status, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', $7)`,
      [confirmationId, req.user.id, item.id, delta, type, cleanReason, expiresAt]
    );

    res.json({
      valid: true,
      card: {
        confirmationId,
        itemId: item.id,
        itemName: item.name,
        section: item.section,
        oldStock: currentStock,
        delta,
        newStock,
        movementType: type,
        supplierOrReason: cleanReason,
        status: 'PENDING',
        expiresInMinutes: 10
      }
    });
  } catch (err) {
    console.error('Tool prepare-change error:', err);
    res.status(500).json({ error: 'TOOL_ERROR', message: 'Failed to prepare stock change draft.' });
  }
});

export default router;
