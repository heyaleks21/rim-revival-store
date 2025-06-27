-- Add new fields for staggered tyre sizes
ALTER TABLE products
ADD COLUMN IF NOT EXISTS front_tyre_size TEXT,
ADD COLUMN IF NOT EXISTS rear_tyre_size TEXT;
