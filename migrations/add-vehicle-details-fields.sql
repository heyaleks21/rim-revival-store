-- Add vehicle details fields to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS vehicle_year TEXT,
ADD COLUMN IF NOT EXISTS vehicle_brand TEXT,
ADD COLUMN IF NOT EXISTS vehicle_model TEXT,
ADD COLUMN IF NOT EXISTS rim_size TEXT,
ADD COLUMN IF NOT EXISTS tyre_size TEXT,
ADD COLUMN IF NOT EXISTS tyre_condition TEXT,
ADD COLUMN IF NOT EXISTS paint_condition TEXT,
ADD COLUMN IF NOT EXISTS rim_quantity TEXT;
