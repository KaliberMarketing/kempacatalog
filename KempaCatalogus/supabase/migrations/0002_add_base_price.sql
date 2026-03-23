-- Add base_price to products (Kempa sales price)
ALTER TABLE products ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2);
