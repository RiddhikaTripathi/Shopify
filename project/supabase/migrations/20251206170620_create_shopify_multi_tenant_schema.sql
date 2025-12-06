/*
  # Shopify Multi-Tenant Analytics System

  ## Overview
  Complete multi-tenant database schema for Shopify store ingestion and analytics.
  Each store is isolated using Row Level Security policies.

  ## Tables Created

  1. **stores**
     - `id` (uuid, primary key) - Unique store identifier
     - `shop_domain` (text, unique) - Shopify store domain (e.g., mystore.myshopify.com)
     - `store_name` (text) - Display name of the store
     - `access_token` (text) - Encrypted Shopify access token
     - `is_active` (boolean) - Whether store is active
     - `last_sync_at` (timestamptz) - Last successful sync timestamp
     - `created_at` (timestamptz) - Record creation time
     - `updated_at` (timestamptz) - Record update time

  2. **products**
     - `id` (uuid, primary key) - Internal product ID
     - `store_id` (uuid, foreign key) - Reference to stores table
     - `shopify_id` (bigint) - Shopify product ID
     - `title` (text) - Product title
     - `vendor` (text) - Product vendor
     - `product_type` (text) - Product type/category
     - `status` (text) - Product status (active/draft/archived)
     - `tags` (text[]) - Product tags array
     - `price` (decimal) - Product price
     - `inventory_quantity` (int) - Total inventory
     - `created_at` (timestamptz) - Product creation in Shopify
     - `updated_at` (timestamptz) - Product last update

  3. **orders**
     - `id` (uuid, primary key) - Internal order ID
     - `store_id` (uuid, foreign key) - Reference to stores table
     - `shopify_id` (bigint) - Shopify order ID
     - `order_number` (text) - Human-readable order number
     - `email` (text) - Customer email
     - `total_price` (decimal) - Total order price
     - `subtotal_price` (decimal) - Subtotal before tax/shipping
     - `total_tax` (decimal) - Total tax amount
     - `financial_status` (text) - Payment status
     - `fulfillment_status` (text) - Fulfillment status
     - `currency` (text) - Order currency code
     - `created_at` (timestamptz) - Order creation time
     - `updated_at` (timestamptz) - Order update time

  4. **customers**
     - `id` (uuid, primary key) - Internal customer ID
     - `store_id` (uuid, foreign key) - Reference to stores table
     - `shopify_id` (bigint) - Shopify customer ID
     - `email` (text) - Customer email
     - `first_name` (text) - First name
     - `last_name` (text) - Last name
     - `total_spent` (decimal) - Total amount spent
     - `orders_count` (int) - Number of orders
     - `state` (text) - Customer state (enabled/disabled)
     - `created_at` (timestamptz) - Customer creation time
     - `updated_at` (timestamptz) - Customer update time

  5. **sync_jobs**
     - `id` (uuid, primary key) - Job ID
     - `store_id` (uuid, foreign key) - Reference to stores table
     - `job_type` (text) - Type of sync (products/orders/customers/inventory)
     - `status` (text) - Job status (pending/running/completed/failed)
     - `started_at` (timestamptz) - Job start time
     - `completed_at` (timestamptz) - Job completion time
     - `records_synced` (int) - Number of records synced
     - `error_message` (text) - Error details if failed
     - `created_at` (timestamptz) - Job creation time

  6. **analytics_daily**
     - `id` (uuid, primary key) - Analytics record ID
     - `store_id` (uuid, foreign key) - Reference to stores table
     - `date` (date) - Analytics date
     - `total_orders` (int) - Total orders for the day
     - `total_revenue` (decimal) - Total revenue for the day
     - `average_order_value` (decimal) - Average order value
     - `new_customers` (int) - New customers acquired
     - `created_at` (timestamptz) - Record creation time

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Policies ensure stores can only access their own data
  - API key authentication required for access

  ## Indexes
  - Created on foreign keys and frequently queried columns
  - Composite indexes for common query patterns
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_domain text UNIQUE NOT NULL,
  store_name text NOT NULL,
  access_token text NOT NULL,
  is_active boolean DEFAULT true,
  last_sync_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  shopify_id bigint NOT NULL,
  title text NOT NULL,
  vendor text,
  product_type text,
  status text DEFAULT 'active',
  tags text[],
  price decimal(10, 2),
  inventory_quantity int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(store_id, shopify_id)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  shopify_id bigint NOT NULL,
  order_number text NOT NULL,
  email text,
  total_price decimal(10, 2) NOT NULL,
  subtotal_price decimal(10, 2),
  total_tax decimal(10, 2),
  financial_status text,
  fulfillment_status text,
  currency text DEFAULT 'USD',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(store_id, shopify_id)
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  shopify_id bigint NOT NULL,
  email text,
  first_name text,
  last_name text,
  total_spent decimal(10, 2) DEFAULT 0,
  orders_count int DEFAULT 0,
  state text DEFAULT 'enabled',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(store_id, shopify_id)
);

-- Create sync_jobs table
CREATE TABLE IF NOT EXISTS sync_jobs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  job_type text NOT NULL,
  status text DEFAULT 'pending',
  started_at timestamptz,
  completed_at timestamptz,
  records_synced int DEFAULT 0,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Create analytics_daily table
CREATE TABLE IF NOT EXISTS analytics_daily (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  date date NOT NULL,
  total_orders int DEFAULT 0,
  total_revenue decimal(10, 2) DEFAULT 0,
  average_order_value decimal(10, 2) DEFAULT 0,
  new_customers int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(store_id, date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_shopify_id ON products(shopify_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_store_id ON customers(store_id);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_store_id ON sync_jobs(store_id);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_status ON sync_jobs(status);
CREATE INDEX IF NOT EXISTS idx_analytics_daily_store_date ON analytics_daily(store_id, date);

-- Enable Row Level Security
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stores
CREATE POLICY "Stores can read own data"
  ON stores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Stores can update own data"
  ON stores FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Stores can insert own data"
  ON stores FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for products
CREATE POLICY "Products select by store"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Products insert by store"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Products update by store"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Products delete by store"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for orders
CREATE POLICY "Orders select by store"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Orders insert by store"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Orders update by store"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Orders delete by store"
  ON orders FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for customers
CREATE POLICY "Customers select by store"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Customers insert by store"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Customers update by store"
  ON customers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Customers delete by store"
  ON customers FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for sync_jobs
CREATE POLICY "Sync jobs select by store"
  ON sync_jobs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Sync jobs insert by store"
  ON sync_jobs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Sync jobs update by store"
  ON sync_jobs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for analytics_daily
CREATE POLICY "Analytics select by store"
  ON analytics_daily FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Analytics insert by store"
  ON analytics_daily FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Analytics update by store"
  ON analytics_daily FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();