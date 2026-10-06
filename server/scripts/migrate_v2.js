import { query } from '../config/db.js';

async function migrate() {
  console.log('🚀 Running StockSense V2 Schema Migration...');

  // 1. Modify pending_confirmations
  await query(`
    ALTER TABLE pending_confirmations ALTER COLUMN item_id DROP NOT NULL;
    ALTER TABLE pending_confirmations ALTER COLUMN quantity_change DROP NOT NULL;
    ALTER TABLE pending_confirmations ADD COLUMN IF NOT EXISTS action_type VARCHAR(30) DEFAULT 'STOCK_MOVEMENT';
    ALTER TABLE pending_confirmations ADD COLUMN IF NOT EXISTS payload JSONB DEFAULT '{}';
  `);
  console.log('✅ pending_confirmations columns updated.');

  // Update check constraint on movement_type
  await query(`
    ALTER TABLE pending_confirmations DROP CONSTRAINT IF EXISTS pending_confirmations_movement_type_check;
    ALTER TABLE pending_confirmations ADD CONSTRAINT pending_confirmations_movement_type_check 
      CHECK (movement_type IN ('RECEIVED', 'SOLD', 'DAMAGED', 'CORRECTION', 'CUSTOMER_RETURN', 'CREATE_ITEM', 'UPDATE_ITEM', 'DELETE_ITEM'));
  `);
  console.log('✅ pending_confirmations movement_type constraint updated.');

  // 2. Create chat_conversations table
  await query(`
    CREATE TABLE IF NOT EXISTS chat_conversations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL DEFAULT 'New Conversation',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);
  console.log('✅ chat_conversations table ensured.');

  // 3. Create chat_messages table
  await query(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
      sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'ai')),
      text TEXT NOT NULL,
      card JSONB DEFAULT NULL,
      chart JSONB DEFAULT NULL,
      is_unavailable BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);
  console.log('✅ chat_messages table ensured.');

  // 4. Create performance indexes
  await query(`
    CREATE INDEX IF NOT EXISTS idx_chat_conversations_user ON chat_conversations(user_id, updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON chat_messages(conversation_id, created_at ASC);
  `);
  console.log('✅ chat indexes created.');

  console.log('✨ All migrations completed successfully.');
  process.exit(0);
}

migrate().catch(err => {
  console.error('❌ Migration error:', err);
  process.exit(1);
});
