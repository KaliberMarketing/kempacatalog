-- Initial Kempa Catalogus schema migration

-- Dealers
CREATE TABLE IF NOT EXISTS dealers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  contact_email TEXT,
  primary_color TEXT DEFAULT '#1a1a1a',
  secondary_color TEXT DEFAULT '#ffffff',
  accent_color TEXT DEFAULT '#c8a96e',
  background_color TEXT DEFAULT '#f9f9f9',
  text_color TEXT DEFAULT '#1a1a1a',
  font_heading TEXT DEFAULT 'Syne',
  font_body TEXT DEFAULT 'DM Sans',
  logo_url TEXT,
  inquiry_email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories(id),
  sort_order INT DEFAULT 0
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id),
  material TEXT,
  finish TEXT,
  specs JSONB,
  images TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Dealer ↔ Product mapping
CREATE TABLE IF NOT EXISTS dealer_products (
  dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  show_price BOOLEAN DEFAULT false,
  price DECIMAL(10,2),
  custom_note TEXT,
  PRIMARY KEY (dealer_id, product_id)
);

-- Inquiries
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL, -- 'dealer' | 'sales'
  dealer_id UUID REFERENCES dealers(id),
  product_ids UUID[],
  name TEXT,
  company TEXT,
  email TEXT,
  message TEXT,
  sent_to TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
