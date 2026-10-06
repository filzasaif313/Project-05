import express from 'express';
import { query } from '../config/db.js';
import { authenticateToken, requireManager } from '../middleware/auth.js';

const router = express.Router();

/**
 * Manager Financial Analytics Dashboard
 * Test Case 4: Any Staff call to this endpoint is blocked with 403 Forbidden
 */
router.get('/analytics', authenticateToken, requireManager, async (req, res) => {
  try {
    // 1. Total inventory valuation & count
    const itemsRes = await query(`
      SELECT 
        COUNT(*) as total_products,
        SUM(total_stock) as total_units,
        SUM(total_stock * selling_price) as retail_value,
        SUM(total_stock * cost_price) as cost_value
      FROM items
    `);
    const invStats = itemsRes.rows[0];

    // 2. Low Stock Items (At or below manager threshold)
    const lowStockRes = await query(`
      SELECT id, name, section, total_stock, low_stock_threshold, front_display, back_store_room
      FROM items
      WHERE total_stock <= low_stock_threshold
      ORDER BY total_stock ASC
    `);

    // 3. Top Selling Products (Aggregated from actual sales movements)
    const topSellersRes = await query(`
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

    // 4. Overall Sales & Gross Margin totals
    let totalRevenue = 0;
    let totalGrossProfit = 0;
    topSellersRes.rows.forEach(r => {
      totalRevenue += parseFloat(r.total_revenue || 0);
      totalGrossProfit += parseFloat(r.gross_profit || 0);
    });

    res.json({
      summary: {
        totalProducts: parseInt(invStats.total_products || 0, 10),
        totalUnits: parseInt(invStats.total_units || 0, 10),
        retailValue: parseFloat(invStats.retail_value || 0),
        costValue: parseFloat(invStats.cost_value || 0),
        totalRevenue,
        totalGrossProfit,
        grossMarginPercentage: totalRevenue > 0 ? ((totalGrossProfit / totalRevenue) * 100).toFixed(1) : 0,
        lowStockCount: lowStockRes.rows.length
      },
      lowStockItems: lowStockRes.rows,
      topSellers: topSellersRes.rows
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to calculate analytics.' });
  }
});

/**
 * Price Change History (Manager Only)
 */
router.get('/price-history', authenticateToken, requireManager, async (req, res) => {
  try {
    const historyRes = await query(`
      SELECT 
        ph.id, ph.old_selling_price, ph.new_selling_price, 
        ph.old_cost_price, ph.new_cost_price, ph.created_at,
        i.name as item_name, i.section,
        u.name as changed_by
      FROM price_history ph
      JOIN items i ON ph.item_id = i.id
      JOIN users u ON ph.changed_by_user_id = u.id
      ORDER BY ph.created_at DESC
      LIMIT 50
    `);

    res.json({ priceHistory: historyRes.rows });
  } catch (err) {
    console.error('Error fetching price history:', err);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to fetch price history.' });
  }
});

export default router;
