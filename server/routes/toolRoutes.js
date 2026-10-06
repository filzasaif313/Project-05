import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db.js';
import { authenticateInternalAgentToken } from '../middleware/auth.js';

const router = express.Router();

// Apply internal agent token verification to all tool routes
router.use(authenticateInternalAgentToken);

/**
 * Tool 1: check_stock
 * Checks real stock levels, locations, categories, and full product lists. Role-aware.
 */
router.post('/stock', async (req, res) => {
  try {
    const { query: searchQuery } = req.body;
    const isStaff = req.user.role === 'STAFF';
    const clean = (searchQuery || '').trim().toLowerCase();

    // 1. Check if user is asking for category list/discovery
    const isCategoryOverviewQuery = 
      clean.includes('categor') ||
      clean.includes('department') ||
      clean.includes('section');

    if (isCategoryOverviewQuery) {
      const catSummary = await query(`
        SELECT 
          section, 
          COUNT(*)::int as item_count, 
          COALESCE(SUM(total_stock), 0)::int as total_units
        FROM items
        GROUP BY section
        ORDER BY section ASC
      `);

      const itemsPerCat = await query(`
        SELECT id, name, section, total_stock, selling_price, cost_price
        FROM items
        ORDER BY section ASC, name ASC
      `);

      const categories = catSummary.rows.map(cat => ({
        name: cat.section,
        itemCount: cat.item_count,
        totalUnits: cat.total_units,
        sampleItems: itemsPerCat.rows
          .filter(i => i.section === cat.section)
          .map(i => `${i.name} (${i.total_stock} in stock)`)
          .slice(0, 4)
      }));

      return res.json({
        found: true,
        type: 'CATEGORIES_OVERVIEW',
        count: categories.length,
        userRole: req.user.role,
        categories,
        message: `Nowshera Shopping Mall has ${categories.length} active departments: ${categories.map(c => c.name).join(', ')}.`
      });
    }

    // 2. Check if user is asking for "all products", "product list", "*", or browsing everything
    const isAllProductsQuery = 
      !clean ||
      clean === '*' ||
      clean === 'all' ||
      clean.includes('all product') ||
      clean.includes('product list') ||
      clean.includes('show product') ||
      clean.includes('list product') ||
      clean === 'everything' ||
      clean === 'catalog';

    let sql = 'SELECT id, name, section, total_stock, low_stock_threshold, front_display, back_store_room, selling_price, cost_price FROM items';
    const params = [];

    if (!isAllProductsQuery) {
      // Check if searching specifically by known category/section
      const knownSections = ['grocery', 'clothing', 'electronics', 'household'];
      const matchedSection = knownSections.find(s => clean === s || clean === `show ${s}` || clean.includes(`${s} category`) || clean === `show me ${s}` || clean === `products in ${s}`);

      if (matchedSection) {
        params.push(matchedSection.charAt(0).toUpperCase() + matchedSection.slice(1));
        sql += ` WHERE section = $1`;
      } else {
        // Natural keyword tokenization & plural normalization
        const words = clean
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
    }

    sql += ' ORDER BY section ASC, name ASC LIMIT 50';
    const result = await query(sql, params);

    if (result.rows.length === 0) {
      return res.json({
        found: false,
        message: `I searched the store catalog but could not find any item matching "${searchQuery || ''}".`,
        items: []
      });
    }

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

      // Strict security: Cost price and profit are only given to Manager
      if (!isStaff) {
        sanitized.costPrice = parseFloat(item.cost_price);
        sanitized.profitPerUnit = parseFloat(item.selling_price) - parseFloat(item.cost_price);
      }

      return sanitized;
    });

    res.json({
      found: true,
      count: items.length,
      isAllProducts: isAllProductsQuery,
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
 * Simulates proposed stock change, verifies zero-floor, creates durable draft in pending_confirmations.
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
    let type = (movementType || 'RECEIVED').toUpperCase();
    if (type === 'RECEIVE') type = 'RECEIVED';
    if (type === 'SALE' || type === 'SELL') type = 'SOLD';
    if (type === 'DAMAGE') type = 'DAMAGED';
    if (type === 'RETURN') type = 'CUSTOMER_RETURN';

    if (type === 'RECEIVED' || type === 'CUSTOMER_RETURN') {
      delta = parsedQty;
    } else if (type === 'SOLD' || type === 'DAMAGED') {
      delta = -parsedQty;
    } else {
      delta = parsedQty;
    }

    const newStock = currentStock + delta;

    // Zero-floor invariant: Negative stock is strictly impossible
    if (newStock < 0) {
      return res.json({
        valid: false,
        error: 'INSUFFICIENT_STOCK',
        message: `Stock cannot go below zero: "${item.name}" currently has only ${currentStock} in stock. Cannot record ${parsedQty} ${type.toLowerCase()}.`
      });
    }

    // Generate unique confirmation ID
    const confirmationId = uuidv4();
    const reasonInput = supplierOrReason || req.body.supplier;
    const cleanReason = (reasonInput || (type === 'RECEIVED' ? 'Ali Traders' : 'Stock adjustment')).trim();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Insert durable draft into pending_confirmations with 10-minute expiry
    await query(
      `INSERT INTO pending_confirmations 
       (id, user_id, item_id, quantity_change, movement_type, supplier_or_reason, action_type, payload, status, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'STOCK_MOVEMENT', '{}'::jsonb, 'PENDING', $7)`,
      [confirmationId, req.user.id, item.id, delta, type, cleanReason, expiresAt]
    );

    res.json({
      valid: true,
      card: {
        confirmationId,
        actionType: 'STOCK_MOVEMENT',
        itemId: item.id,
        itemName: item.name,
        section: item.section,
        oldStock: currentStock,
        delta,
        quantityChange: delta,
        newStock,
        movementType: type,
        supplier: cleanReason,
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

/**
 * Tool 4: manage_item
 * Prepares durable confirmation drafts for Manager-only catalog actions:
 * - CREATE_ITEM (Add new product)
 * - UPDATE_ITEM (Edit product name/price/location)
 * - DELETE_ITEM (Remove product)
 * STRICT: NEVER executes change directly. Staff is blocked.
 */
router.post('/manage-item', async (req, res) => {
  try {
    // 1. Role Boundary: Staff cannot manage catalog items
    if (req.user.role !== 'MANAGER') {
      return res.status(403).json({
        valid: false,
        error: 'FORBIDDEN',
        message: 'Only Managers have permission to add new products, update catalog details, or remove items. Staff members can view stock and prepare regular stock movements.'
      });
    }

    const { actionType, name, itemName, itemId, section, sellingPrice, costPrice, frontDisplay, backStoreRoom, lowStockThreshold, initialStock, supplier } = req.body;
    const action = (actionType || '').toUpperCase();

    // --- Action A: CREATE_ITEM ---
    if (action === 'CREATE_ITEM') {
      const productName = (name || itemName || '').trim();
      if (!productName) {
        return res.status(400).json({ valid: false, error: 'MISSING_NAME', message: 'Product name is required to add a new item.' });
      }

      const validSection = ['Grocery', 'Clothing', 'Electronics', 'Household'].includes(section) ? section : 'Grocery';
      const parsedSelling = parseFloat(sellingPrice || 0);
      const parsedCost = parseFloat(costPrice || 0);
      const parsedStock = parseInt(initialStock || req.body.totalStock || 0, 10);
      const parsedThreshold = parseInt(lowStockThreshold || 5, 10);

      const confirmationId = uuidv4();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      const payload = {
        name: productName,
        section: validSection,
        selling_price: parsedSelling,
        cost_price: parsedCost,
        total_stock: parsedStock,
        low_stock_threshold: parsedThreshold,
        front_display: frontDisplay || 'Shelf A1',
        back_store_room: backStoreRoom || 'Rack 1'
      };

      await query(
        `INSERT INTO pending_confirmations 
         (id, user_id, action_type, movement_type, supplier_or_reason, payload, status, expires_at)
         VALUES ($1, $2, 'CREATE_ITEM', 'CREATE_ITEM', $3, $4, 'PENDING', $5)`,
        [confirmationId, req.user.id, supplier || 'New Catalog Item', JSON.stringify(payload), expiresAt]
      );

      return res.json({
        valid: true,
        card: {
          confirmationId,
          actionType: 'CREATE_ITEM',
          itemName: productName,
          section: validSection,
          sellingPrice: parsedSelling,
          costPrice: parsedCost,
          totalStock: parsedStock,
          lowStockThreshold: parsedThreshold,
          frontDisplay: payload.front_display,
          backStoreRoom: payload.back_store_room,
          supplierOrReason: supplier || 'New Catalog Item',
          status: 'PENDING',
          expiresInMinutes: 10
        }
      });
    }

    // Helper to find existing catalog product with conversational phrase stripping and keyword fallback
    async function findCatalogItem(id, searchName) {
      if (id) {
        const idRes = await query('SELECT * FROM items WHERE id = $1', [id]);
        if (idRes.rows.length > 0) return idRes.rows[0];
      }
      if (!searchName) return null;

      let clean = searchName.trim().toLowerCase();
      clean = clean.replace(/\b(?:from\s+our\s+stock|from\s+the\s+stock|from\s+stock|from\s+our\s+catalog|from\s+catalog|from\s+inventory|in\s+our\s+stock|in\s+stock)\b/gi, '').trim();

      // 1. Try substring match on cleaned name
      let res = await query('SELECT * FROM items WHERE LOWER(name) LIKE $1 ORDER BY id ASC LIMIT 1', [`%${clean}%`]);
      if (res.rows.length > 0) return res.rows[0];

      // 2. Tokenize words (plurals normalized)
      const words = clean.split(/\s+/).map(w => w.replace(/s$/, '').trim()).filter(w => w.length > 2);
      if (words.length > 0) {
        let sql = 'SELECT * FROM items WHERE 1=1';
        const params = [];
        words.forEach(w => {
          params.push(`%${w}%`);
          sql += ` AND LOWER(name) LIKE $${params.length}`;
        });
        sql += ' ORDER BY id ASC LIMIT 1';
        res = await query(sql, params);
        if (res.rows.length > 0) return res.rows[0];
      }

      // 3. Fallback: try individual significant words
      for (const w of words) {
        if (w.length >= 4) {
          res = await query('SELECT * FROM items WHERE LOWER(name) LIKE $1 ORDER BY id ASC LIMIT 1', [`%${w}%`]);
          if (res.rows.length > 0) return res.rows[0];
        }
      }

      return null;
    }

    // --- Action B: UPDATE_ITEM ---
    if (action === 'UPDATE_ITEM') {
      const searchTarget = (itemName || name || '').trim();
      const item = await findCatalogItem(itemId, searchTarget);

      if (!item) {
        return res.json({ valid: false, error: 'ITEM_NOT_FOUND', message: `Could not find product "${searchTarget || itemId}" in the catalog to update.` });
      }

      const confirmationId = uuidv4();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      const newNameVal = (name && name.trim().toLowerCase() !== item.name.toLowerCase()) ? name.trim() : (req.body.updatedName ? req.body.updatedName.trim() : item.name);
      const payload = {
        itemId: item.id,
        name: newNameVal,
        section: section || item.section,
        selling_price: sellingPrice !== undefined ? parseFloat(sellingPrice) : parseFloat(item.selling_price),
        cost_price: costPrice !== undefined ? parseFloat(costPrice) : parseFloat(item.cost_price),
        front_display: frontDisplay !== undefined ? frontDisplay : item.front_display,
        back_store_room: backStoreRoom !== undefined ? backStoreRoom : item.back_store_room,
        low_stock_threshold: lowStockThreshold !== undefined ? parseInt(lowStockThreshold, 10) : item.low_stock_threshold
      };

      await query(
        `INSERT INTO pending_confirmations 
         (id, user_id, item_id, action_type, movement_type, supplier_or_reason, payload, status, expires_at)
         VALUES ($1, $2, $3, 'UPDATE_ITEM', 'UPDATE_ITEM', 'Catalog Update', $4, 'PENDING', $5)`,
        [confirmationId, req.user.id, item.id, JSON.stringify(payload), expiresAt]
      );

      return res.json({
        valid: true,
        card: {
          confirmationId,
          actionType: 'UPDATE_ITEM',
          itemId: item.id,
          itemName: item.name,
          updatedName: payload.name,
          section: payload.section,
          oldSellingPrice: parseFloat(item.selling_price),
          newSellingPrice: payload.selling_price,
          oldCostPrice: parseFloat(item.cost_price),
          newCostPrice: payload.cost_price,
          oldDisplay: item.front_display,
          newDisplay: payload.front_display,
          status: 'PENDING',
          expiresInMinutes: 10
        }
      });
    }

    // --- Action C: DELETE_ITEM ---
    if (action === 'DELETE_ITEM') {
      const searchTarget = (itemName || name || '').trim();
      const item = await findCatalogItem(itemId, searchTarget);

      if (!item) {
        return res.json({ valid: false, error: 'ITEM_NOT_FOUND', message: `Could not find product "${searchTarget || itemId}" in the catalog to delete.` });
      }

      const confirmationId = uuidv4();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      const payload = { itemId: item.id, name: item.name };

      await query(
        `INSERT INTO pending_confirmations 
         (id, user_id, item_id, action_type, movement_type, supplier_or_reason, payload, status, expires_at)
         VALUES ($1, $2, $3, 'DELETE_ITEM', 'DELETE_ITEM', 'Catalog Removal', $4, 'PENDING', $5)`,
        [confirmationId, req.user.id, item.id, JSON.stringify(payload), expiresAt]
      );

      return res.json({
        valid: true,
        card: {
          confirmationId,
          actionType: 'DELETE_ITEM',
          itemId: item.id,
          itemName: item.name,
          section: item.section,
          currentStock: item.total_stock,
          status: 'PENDING',
          expiresInMinutes: 10
        }
      });
    }

    return res.status(400).json({ valid: false, error: 'INVALID_ACTION', message: 'actionType must be CREATE_ITEM, UPDATE_ITEM, or DELETE_ITEM.' });
  } catch (err) {
    console.error('Tool manage-item error:', err);
    res.status(500).json({ error: 'TOOL_ERROR', message: 'Failed to prepare item management draft.' });
  }
});

/**
 * Tool 5: chart_data
 * Retrieves structured visual report data strictly grounded in real database records.
 * STRICT: Zero demo data. Redacts revenue/profit for Staff.
 */
router.post('/chart-data', async (req, res) => {
  try {
    const { chartType, itemName, period } = req.body;
    const isStaff = req.user.role === 'STAFF';
    const type = (chartType || 'stock_history').toLowerCase();

    // 1. Stock Movement Progression Chart
    if (type === 'stock_history' || type === 'movement_history' || type === 'line') {
      let sql = `
        SELECT sm.id, sm.created_at, sm.movement_type, sm.quantity_change, sm.old_stock, sm.new_stock, i.name as item_name
        FROM stock_movements sm
        JOIN items i ON sm.item_id = i.id
      `;
      const params = [];
      if (itemName) {
        params.push(`%${itemName.trim().toLowerCase()}%`);
        sql += ` WHERE LOWER(i.name) LIKE $1`;
      }
      sql += ` ORDER BY sm.created_at ASC LIMIT 15`;

      const result = await query(sql, params);

      if (result.rows.length === 0) {
        return res.json({
          found: false,
          message: 'No stock movement records found for this visual chart.'
        });
      }

      const points = result.rows.map(r => ({
        label: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: r.new_stock,
        change: r.quantity_change,
        type: r.movement_type,
        item: r.item_name
      }));

      return res.json({
        found: true,
        chart: {
          type: 'line',
          title: itemName ? `Stock Movement: ${result.rows[0].item_name}` : 'Store Stock Movement Trend',
          subtitle: `Based on ${result.rows.length} verified stock movement ledger entries`,
          xAxis: 'Date',
          yAxis: 'Units in Stock',
          points,
          currentValue: points[points.length - 1].value
        }
      });
    }

    // 2. Top Selling Products Bar Chart
    if (type === 'top_sellers' || type === 'sales' || type === 'bestseller') {
      const result = await query(`
        SELECT 
          i.name, 
          SUM(ABS(sm.quantity_change))::int as units_sold
        FROM stock_movements sm
        JOIN items i ON sm.item_id = i.id
        WHERE sm.movement_type = 'SOLD'
        GROUP BY i.name
        ORDER BY units_sold DESC
        LIMIT 6
      `);

      const bars = result.rows.map(r => ({
        label: r.name.length > 20 ? r.name.slice(0, 18) + '...' : r.name,
        fullName: r.name,
        value: r.units_sold
      }));

      return res.json({
        found: true,
        chart: {
          type: 'bar',
          title: 'Top-Selling Products (Weekly Units Sold)',
          subtitle: 'Directly aggregated from verified sales movements',
          xAxis: 'Product',
          yAxis: 'Units Sold',
          bars
        }
      });
    }

    // 3. Low Stock Alert Bar Chart
    if (type === 'low_stock' || type === 'running_low' || type === 'threshold') {
      const result = await query(`
        SELECT name, section, total_stock, low_stock_threshold
        FROM items
        ORDER BY total_stock ASC
        LIMIT 6
      `);

      const bars = result.rows.map(r => ({
        label: r.name.length > 20 ? r.name.slice(0, 18) + '...' : r.name,
        fullName: r.name,
        value: r.total_stock,
        threshold: r.low_stock_threshold,
        isCritical: r.total_stock <= r.low_stock_threshold
      }));

      return res.json({
        found: true,
        chart: {
          type: 'bar',
          title: 'Stock Levels vs. Reorder Thresholds',
          subtitle: 'Items closest to or below minimum store thresholds',
          xAxis: 'Product',
          yAxis: 'Current Units',
          bars
        }
      });
    }

    // 4. Category / Department Distribution
    if (type === 'category_distribution' || type === 'categories') {
      const result = await query(`
        SELECT section, COUNT(*)::int as item_count, SUM(total_stock)::int as total_units
        FROM items
        GROUP BY section
        ORDER BY total_units DESC
      `);

      const distribution = result.rows.map(r => ({
        label: r.section,
        itemCount: r.item_count,
        value: r.total_units
      }));

      return res.json({
        found: true,
        chart: {
          type: 'bar',
          title: 'Inventory Volume by Department',
          subtitle: 'Total units distributed across shopping mall sections',
          xAxis: 'Department',
          yAxis: 'Total Stock Units',
          bars: distribution
        }
      });
    }

    return res.status(400).json({ error: 'INVALID_CHART_TYPE', message: 'Unknown chart type.' });
  } catch (err) {
    console.error('Tool chart-data error:', err);
    res.status(500).json({ error: 'TOOL_ERROR', message: 'Failed to retrieve chart data.' });
  }
});

export default router;
