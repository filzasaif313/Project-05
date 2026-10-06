import { query } from '../config/db.js';

async function verify() {
  try {
    console.log('🔍 Querying Supabase PostgreSQL instance directly...\n');

    // 1. Check version
    const versionRes = await query('SELECT version()');
    console.log('PostgreSQL Version:', versionRes.rows[0].version.split(',')[0]);

    // 2. Check 5 tables
    const tablesRes = await query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    console.log('\nVerified Public Tables in Supabase:');
    tablesRes.rows.forEach(r => console.log(` • ${r.table_name}`));

    // 3. Count rows in each table
    const [users, items, movements, prices, pending] = await Promise.all([
      query('SELECT COUNT(*) as count FROM users'),
      query('SELECT COUNT(*) as count FROM items'),
      query('SELECT COUNT(*) as count FROM stock_movements'),
      query('SELECT COUNT(*) as count FROM price_history'),
      query('SELECT COUNT(*) as count FROM pending_confirmations'),
    ]);

    console.log('\nRow Counts in Real Database:');
    console.log(` • users: ${users.rows[0].count}`);
    console.log(` • items: ${items.rows[0].count}`);
    console.log(` • stock_movements: ${movements.rows[0].count}`);
    console.log(` • price_history: ${prices.rows[0].count}`);
    console.log(` • pending_confirmations: ${pending.rows[0].count}`);

    console.log('\n🎉 ALL 5 TABLES VERIFIED ON SUPABASE POSTGRESQL!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  }
}

verify();
