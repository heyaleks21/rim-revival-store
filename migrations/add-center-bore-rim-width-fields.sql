-- Add center_bore and rim_width columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS center_bore TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS rim_width TEXT;
