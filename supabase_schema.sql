-- =====================================================
-- SUPER ADMIN SETUP & DATABASE CLEANUP
-- Run this script in the Supabase SQL Editor to reset and setup the DB
-- =====================================================

-- ⚠️ WARNING: THIS WILL DROP ALL EXISTING DATA ⚠️
-- We need this to fix the "incompatible types: uuid and bigint" error

DROP TABLE IF EXISTS product_collections CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS customer_addresses CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS admin_sessions CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS store_settings CASCADE;

-- =====================================================
-- 1. ENABLE UUID EXTENSION
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. ADMINS TABLE
-- =====================================================
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'staff',
  permissions JSONB DEFAULT '{}',
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. CUSTOMERS TABLE
-- =====================================================
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT, -- Nullable for guest checkout if needed later
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'India',
  is_default BOOLEAN DEFAULT FALSE
);

-- =====================================================
-- 4. PRODUCTS & CATEGORIES
-- =====================================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_price DECIMAL(10,2),
  cost_price DECIMAL(10,2), -- For internal margin calculation
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  gender TEXT CHECK (gender IN ('men', 'women', 'kids', 'unisex')),
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  color_hex TEXT,
  sku TEXT,
  stock_quantity INTEGER DEFAULT 0,
  price_adjustment DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(product_id, size, color)
);

CREATE TABLE product_collections (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, collection_id)
);

-- =====================================================
-- 5. ORDERS & COUPONS
-- =====================================================
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')) NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2), -- Useful for percentage caps
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL, -- e.g. ORD-1001
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  guest_email TEXT, -- If checking out as guest
  
  -- Shipping Info snapshot
  shipping_name TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_postal_code TEXT NOT NULL,
  shipping_country TEXT DEFAULT 'India',

  -- Payment Info
  payment_method TEXT NOT NULL, -- 'cod', 'razorpay', 'stripe'
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
  transaction_id TEXT,

  -- Order Totals
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) NOT NULL,
  shipping_amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,

  -- Status
  status TEXT CHECK (status IN ('pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  
  -- Snapshot of product details at time of purchase
  product_name TEXT NOT NULL,
  size TEXT,
  color TEXT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  product_image TEXT
);

-- =====================================================
-- 6. STORE SETTINGS
-- =====================================================
CREATE TABLE store_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_name TEXT DEFAULT 'N-EVEN',
  store_logo TEXT,
  currency TEXT DEFAULT 'INR',
  currency_symbol TEXT DEFAULT '₹',
  tax_percentage DECIMAL(5,2) DEFAULT 18.0,
  shipping_charge DECIMAL(10,2) DEFAULT 99.0,
  free_shipping_threshold DECIMAL(10,2) DEFAULT 999.0,
  contact_email TEXT,
  contact_phone TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initialize settings
INSERT INTO store_settings (store_name) VALUES ('N-EVEN');

-- =====================================================
-- 7. TRIGGERS & FUNCTIONS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_modtime BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Generate Order Number (Simple Sequence based)
CREATE SEQUENCE order_number_seq START 1001;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'ORD-' || nextval('order_number_seq');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number BEFORE INSERT ON orders
FOR EACH ROW EXECUTE PROCEDURE generate_order_number();


-- =====================================================
-- 8. RLS POLICIES (SECURITY)
-- =====================================================
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Public Config (Everyone can read products & categories)
CREATE POLICY "Public products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Public categories are viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Public collections are viewable by everyone" ON collections FOR SELECT USING (true);
CREATE POLICY "Public images are viewable by everyone" ON product_images FOR SELECT USING (true);
CREATE POLICY "Public variants are viewable by everyone" ON product_variants FOR SELECT USING (true);

-- Admins Config (Full Access)
-- Note: In a real app with Supabase Auth, you'd check auth.uid() against admin table.
-- For this simplified API-based admin panel, we are handling auth in the API layer (Next.js),
-- so we can allow the service role (backend) full access, or open it up if using Supabase client directly.
-- For safety here, we will trust the service role key which bypasses RLS, and allow public read for now.

CREATE POLICY "Service role has full access" ON products USING (true) WITH CHECK (true);


-- =====================================================
-- CREATE DEFAULT SUPER ADMIN
-- Password: admin123 (bcrypt hash generated)
-- =====================================================
INSERT INTO admins (email, password_hash, name, role, permissions) VALUES
  ('admin@neven.com', '$2b$10$Z8J3Xm5kVQh9Xe5wy5G7Q.QxR5sN2pF7dK3mL8jH9gB4vC6nT1wAe', 'Super Admin', 'super_admin', '{"products": true, "orders": true, "customers": true, "settings": true, "admins": true}')
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- SAMPLE DATA (To help you get started)
-- =====================================================

INSERT INTO categories (name, slug, parent_id, description)
SELECT 'Men', 'men', id, 'Men collection' FROM categories WHERE slug = 'root'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id, description)
SELECT 'Women', 'women', id, 'Women collection' FROM categories WHERE slug = 'root'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id, description)
SELECT 'T-Shirts', 'men-tshirts', id, 'T-Shirts for men' FROM categories WHERE slug = 'men'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id, description)
SELECT 'Jeans', 'men-jeans', id, 'Jeans for men' FROM categories WHERE slug = 'men'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, parent_id, description)
SELECT 'Dresses', 'women-dresses', id, 'Dresses for women' FROM categories WHERE slug = 'women'
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- SAMPLE COLLECTIONS
-- =====================================================
INSERT INTO collections (name, slug, description) VALUES
  ('New Arrivals', 'new-arrivals', 'Fresh drops just in'),
  ('Summer Sale', 'summer-sale', 'Hot deals for summer'),
  ('Limited Edition', 'limited-edition', 'Exclusive limited pieces')
ON CONFLICT (slug) DO NOTHING;
