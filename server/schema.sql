-- StockSense: Nowshera Shopping Mall Schema (PostgreSQL)

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('MANAGER', 'STAFF')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Items Table
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    section VARCHAR(50) NOT NULL CHECK (section IN ('Grocery', 'Clothing', 'Electronics', 'Household')),
    total_stock INTEGER NOT NULL DEFAULT 0 CHECK (total_stock >= 0),
    low_stock_threshold INTEGER NOT NULL DEFAULT 5,
    front_display VARCHAR(100),
    back_store_room VARCHAR(100),
    selling_price NUMERIC(10, 2) NOT NULL,
    cost_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Stock Movements Table (Single Audit Ledger)
CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    movement_type VARCHAR(30) NOT NULL CHECK (movement_type IN ('RECEIVED', 'SOLD', 'DAMAGED', 'CORRECTION', 'CUSTOMER_RETURN')),
    quantity_change INTEGER NOT NULL,
    old_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    unit_selling_price NUMERIC(10, 2),
    unit_cost_price NUMERIC(10, 2),
    supplier_or_reason VARCHAR(255) NOT NULL,
    source VARCHAR(30) NOT NULL CHECK (source IN ('MANUAL_FORM', 'AI_CONFIRMED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Price History Table
CREATE TABLE IF NOT EXISTS price_history (
    id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    old_selling_price NUMERIC(10, 2) NOT NULL,
    new_selling_price NUMERIC(10, 2) NOT NULL,
    old_cost_price NUMERIC(10, 2) NOT NULL,
    new_cost_price NUMERIC(10, 2) NOT NULL,
    changed_by_user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Pending Confirmations Table (Durable AI Drafts)
CREATE TABLE IF NOT EXISTS pending_confirmations (
    id UUID PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    quantity_change INTEGER NOT NULL,
    movement_type VARCHAR(30) NOT NULL CHECK (movement_type IN ('RECEIVED', 'SOLD', 'DAMAGED', 'CORRECTION', 'CUSTOMER_RETURN')),
    supplier_or_reason VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_items_section ON items(section);
CREATE INDEX IF NOT EXISTS idx_movements_item ON stock_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_movements_created ON stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_pending_user_status ON pending_confirmations(user_id, status);
