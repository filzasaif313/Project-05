import express from 'express';
import { query } from '../config/db.js';
import { authenticateToken, requireManager } from '../middleware/auth.js';

const router = express.Router();

/**
 * Fetch all items (with optional search and section filters)
 * Role Security: cost_price is strictly redacted for STAFF
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, section } = req.query;
    let sql = 'SELECT * FROM items WHERE 1=1';
    const params = [];

    if (section && section !== 'All') {
      params.push(section);
      sql += ` AND section = $${params.length}`;
    }

    if (search && search.trim() !== '') {
      params.push(`%${search.trim().toLowerCase()}%`);
      sql += ` AND (LOWER(name) LIKE $${params.length} OR LOWER(front_display) LIKE $${params.length} OR LOWER(back_store_room) LIKE $${params.length})`;
    }

    sql += ' ORDER BY id ASC';
    const result = await query(sql, params);

    // Apply strict role redaction for Staff
    const isStaff = req.user.role === 'STAFF';
    const items = result.rows.map(item => {
      const sanitized = { ...item };
      if (isStaff) {
        delete sanitized.cost_price;
      }
      return sanitized;
    });

    res.json({ items });
  } catch (err) {
    console.error('Error fetching items:', err);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to load inventory items.' });
  }
});

/**
 * Fetch single item by ID
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM items WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Item not found in catalog.' });
    }

    const item = { ...result.rows[0] };
    if (req.user.role === 'STAFF') {
      delete item.cost_price;
    }

    res.json({ item });
  } catch (err) {
    console.error('Error fetching item:', err);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to fetch item details.' });
  }
});

/**
 * Update item price - Manager Only!
 * Test Case 4: Any Staff call directly to this endpoint is blocked with 403 Forbidden
 */
router.put('/:id/price', authenticateToken, requireManager, async (req, res) => {
  try {
    const { id } = req.params;
    const { selling_price, cost_price } = req.body;

    if (selling_price === undefined && cost_price === undefined) {
      return res.status(400).json({ error: 'INVALID_INPUT', message: 'At least one price field is required.' });
    }

    // Get current prices
    const itemRes = await query('SELECT * FROM items WHERE id = $1', [id]);
    if (itemRes.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Item not found in catalog.' });
    }

    const currentItem = itemRes.rows[0];
    const newSelling = selling_price !== undefined ? parseFloat(selling_price) : currentItem.selling_price;
    const newCost = cost_price !== undefined ? parseFloat(cost_price) : currentItem.cost_price;

    if (isNaN(newSelling) || isNaN(newCost) || newSelling < 0 || newCost < 0) {
      return res.status(400).json({ error: 'INVALID_PRICE', message: 'Prices must be non-negative numbers.' });
    }

    // Update item
    await query(
      'UPDATE items SET selling_price = $1, cost_price = $2 WHERE id = $3',
      [newSelling, newCost, id]
    );

    // Record in price_history
    await query(
      `INSERT INTO price_history 
       (item_id, old_selling_price, new_selling_price, old_cost_price, new_cost_price, changed_by_user_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, currentItem.selling_price, newSelling, currentItem.cost_price, newCost, req.user.id]
    );

    res.json({
      message: 'Item prices updated successfully.',
      item: {
        id: currentItem.id,
        name: currentItem.name,
        selling_price: newSelling,
        cost_price: newCost
      }
    });
  } catch (err) {
    console.error('Error updating price:', err);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to update item price.' });
  }
});

/**
 * Update item location / threshold (Manager Only)
 */
router.put('/:id', authenticateToken, requireManager, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, section, low_stock_threshold, front_display, back_store_room } = req.body;

    const itemRes = await query('SELECT * FROM items WHERE id = $1', [id]);
    if (itemRes.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Item not found in catalog.' });
    }

    const cur = itemRes.rows[0];
    await query(
      `UPDATE items SET 
        name = $1, 
        section = $2, 
        low_stock_threshold = $3, 
        front_display = $4, 
        back_store_room = $5 
       WHERE id = $6`,
      [
        name || cur.name,
        section || cur.section,
        low_stock_threshold !== undefined ? parseInt(low_stock_threshold, 10) : cur.low_stock_threshold,
        front_display !== undefined ? front_display : cur.front_display,
        back_store_room !== undefined ? back_store_room : cur.back_store_room,
        id
      ]
    );

    res.json({ message: 'Item details updated successfully.' });
  } catch (err) {
    console.error('Error updating item:', err);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to update item details.' });
  }
});

export default router;
