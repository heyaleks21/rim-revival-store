-- Add new fields for staggered rim sets
ALTER TABLE products
ADD COLUMN IF NOT EXISTS custom_center_bore TEXT,
ADD COLUMN IF NOT EXISTS is_staggered BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS front_rim_width TEXT;
