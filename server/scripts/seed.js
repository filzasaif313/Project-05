import bcrypt from 'bcryptjs';
import { query, initializeDatabase } from '../config/db.js';

async function seed() {
  try {
    console.log('🌱 Starting database seeding for Nowshera Shopping Mall...');
    const isFresh = process.argv.includes('--fresh');
    if (isFresh) {
      console.log('🔄 --fresh flag provided: Re-initializing tables...');
      await query('DROP TABLE IF EXISTS pending_confirmations CASCADE');
      await query('DROP TABLE IF EXISTS price_history CASCADE');
      await query('DROP TABLE IF EXISTS stock_movements CASCADE');
      await query('DROP TABLE IF EXISTS items CASCADE');
      await query('DROP TABLE IF EXISTS users CASCADE');
    }
    await initializeDatabase();

    // 1. Seed Users (with hashed passwords)
    const salt = await bcrypt.genSalt(10);
    const managerPasswordHash = await bcrypt.hash('manager123', salt);
    const staffPasswordHash = await bcrypt.hash('staff123', salt);

    // Check existing users
    const existingUsers = await query('SELECT * FROM users');
    let managerId = null;
    let staffId = null;

    if (existingUsers.rows.length === 0) {
      console.log('👤 Seeding Demo Users (Manager Bilal & Staff Tariq)...');
      const mResult = await query(
        `INSERT INTO users (name, email, password_hash, role) 
         VALUES ($1, $2, $3, $4) RETURNING id`,
        ['Bilal Khan', 'manager@nowshera.com', managerPasswordHash, 'MANAGER']
      );
      managerId = mResult.rows[0]?.id || 1;

      const sResult = await query(
        `INSERT INTO users (name, email, password_hash, role) 
         VALUES ($1, $2, $3, $4) RETURNING id`,
        ['Tariq Mehmood', 'staff@nowshera.com', staffPasswordHash, 'STAFF']
      );
      staffId = sResult.rows[0]?.id || 2;
      console.log(`✅ Users created: Manager (ID: ${managerId}), Staff (ID: ${staffId})`);
    } else {
      managerId = existingUsers.rows.find(u => u.role === 'MANAGER')?.id || 1;
      staffId = existingUsers.rows.find(u => u.role === 'STAFF')?.id || 2;
      console.log('ℹ️ Users already exist, skipping user creation.');
    }

    // 2. Seed Items
    const existingItems = await query('SELECT COUNT(*) as count FROM items');
    const itemCount = parseInt(existingItems.rows[0]?.count || 0, 10);

    if (itemCount === 0) {
      console.log('🏬 Seeding Mall Inventory items across 4 sections...');

      const itemsToSeed = [
        {
          name: 'Type-C Fast Charging Cable',
          section: 'Electronics',
          total_stock: 15, // Test Case 2 & 1 starter!
          low_stock_threshold: 10,
          front_display: 'Shelf E1',
          back_store_room: 'Rack 2',
          selling_price: 850.00,
          cost_price: 500.00,
        },
        {
          name: "Olper's Full Cream Milk 1L",
          section: 'Grocery',
          total_stock: 4, // Below threshold 10 -> Low stock alert!
          low_stock_threshold: 10,
          front_display: 'Aisle 1 - Dairy Chiller',
          back_store_room: 'Cold Room Bay 3',
          selling_price: 280.00,
          cost_price: 230.00,
        },
        {
          name: "Men's Oxford Cotton Shirt",
          section: 'Clothing',
          total_stock: 5, // Test Case 3 starter (sell 8 when 5 left)
          low_stock_threshold: 3,
          front_display: 'Display Rack C2',
          back_store_room: 'Storage Bay 1',
          selling_price: 2400.00,
          cost_price: 1500.00,
        },
        {
          name: 'Royal Chef Non-Stick Frying Pan',
          section: 'Household',
          total_stock: 12,
          low_stock_threshold: 5,
          front_display: 'Aisle 4 - Cookware',
          back_store_room: 'Storage Bay 4',
          selling_price: 3200.00,
          cost_price: 2100.00,
        },
        {
          name: 'Basmati Super Kernel Rice 5kg',
          section: 'Grocery',
          total_stock: 35,
          low_stock_threshold: 15,
          front_display: 'Aisle 2 - Grains',
          back_store_room: 'Rack 1',
          selling_price: 1850.00,
          cost_price: 1550.00,
        },
        {
          name: 'Wireless Noise-Canceling Earbuds',
          section: 'Electronics',
          total_stock: 8,
          low_stock_threshold: 5,
          front_display: 'Glass Counter E3',
          back_store_room: 'Secure Locker 2',
          selling_price: 4500.00,
          cost_price: 3100.00,
        },
        {
          name: "Women's Embroidered Lawn Kurti",
          section: 'Clothing',
          total_stock: 18,
          low_stock_threshold: 8,
          front_display: 'Fashion Rack F1',
          back_store_room: 'Storage Bay 2',
          selling_price: 2950.00,
          cost_price: 1800.00,
        },
        {
          name: 'Ceramic Dinner Set 24pcs',
          section: 'Household',
          total_stock: 6,
          low_stock_threshold: 4,
          front_display: 'Aisle 5 - Tableware',
          back_store_room: 'Storage Bay 5',
          selling_price: 8500.00,
          cost_price: 5900.00,
        }
      ];

      for (const item of itemsToSeed) {
        const itemRes = await query(
          `INSERT INTO items 
           (name, section, total_stock, low_stock_threshold, front_display, back_store_room, selling_price, cost_price)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
          [
            item.name,
            item.section,
            item.total_stock,
            item.low_stock_threshold,
            item.front_display,
            item.back_store_room,
            item.selling_price,
            item.cost_price,
          ]
        );
        const itemId = itemRes.rows[0]?.id;

        // Record initial stock arrival in stock_movements
        await query(
          `INSERT INTO stock_movements 
           (item_id, user_id, movement_type, quantity_change, old_stock, new_stock, unit_selling_price, unit_cost_price, supplier_or_reason, source)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            itemId,
            managerId,
            'RECEIVED',
            item.total_stock,
            0,
            item.total_stock,
            item.selling_price,
            item.cost_price,
            'Initial Store Opening Stock',
            'MANUAL_FORM',
          ]
        );
      }
      console.log(`✅ Seeded ${itemsToSeed.length} mall items with initial stock movements.`);

      // 3. Seed some past week sales so "What sold most this week?" has rich data immediately
      const cableItem = (await query("SELECT id, selling_price, cost_price FROM items WHERE name LIKE '%Cable%'")).rows[0];
      const milkItem = (await query("SELECT id, selling_price, cost_price FROM items WHERE name LIKE '%Milk%'")).rows[0];
      const riceItem = (await query("SELECT id, selling_price, cost_price FROM items WHERE name LIKE '%Rice%'")).rows[0];

      if (cableItem) {
        await query(
          `INSERT INTO stock_movements 
           (item_id, user_id, movement_type, quantity_change, old_stock, new_stock, unit_selling_price, unit_cost_price, supplier_or_reason, source)
           VALUES ($1, $2, 'SOLD', -8, 23, 15, $3, $4, 'Customer counter sales batch', 'MANUAL_FORM')`,
          [cableItem.id, staffId, cableItem.selling_price, cableItem.cost_price]
        );
      }

      if (milkItem) {
        await query(
          `INSERT INTO stock_movements 
           (item_id, user_id, movement_type, quantity_change, old_stock, new_stock, unit_selling_price, unit_cost_price, supplier_or_reason, source)
           VALUES ($1, $2, 'SOLD', -16, 20, 4, $3, $4, 'Morning grocery rush sales', 'MANUAL_FORM')`,
          [milkItem.id, staffId, milkItem.selling_price, milkItem.cost_price]
        );
      }

      if (riceItem) {
        await query(
          `INSERT INTO stock_movements 
           (item_id, user_id, movement_type, quantity_change, old_stock, new_stock, unit_selling_price, unit_cost_price, supplier_or_reason, source)
           VALUES ($1, $2, 'SOLD', -5, 40, 35, $3, $4, 'Weekend bulk purchases', 'MANUAL_FORM')`,
          [riceItem.id, staffId, riceItem.selling_price, riceItem.cost_price]
        );
      }
      console.log('✅ Seeded past sales history (Milk: 16 sold, Cables: 8 sold, Rice: 5 sold).');
    } else {
      console.log(`ℹ️ Items table already has ${itemCount} items, skipping item seeding.`);
    }

    console.log('🎉 Seeding successfully completed!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
