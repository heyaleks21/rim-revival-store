-- Create a new table to store sold product data
CREATE TABLE IF NOT EXISTS sold_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_product_id UUID,
  title VARCHAR(255),
  brand VARCHAR(255),
  rim_size VARCHAR(50),
  price DECIMAL(10, 2),
  sold_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  category VARCHAR(50)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_sold_products_sold_at ON sold_products(sold_at);
CREATE INDEX IF NOT EXISTS idx_sold_products_category ON sold_products(category);
