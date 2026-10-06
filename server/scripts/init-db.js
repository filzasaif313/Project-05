import { initializeDatabase } from '../config/db.js';

async function run() {
  try {
    console.log('🚀 Initializing StockSense Database Tables...');
    await initializeDatabase();
    console.log('✨ Database initialization finished.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Database initialization failed:', err);
    process.exit(1);
  }
}

run();
