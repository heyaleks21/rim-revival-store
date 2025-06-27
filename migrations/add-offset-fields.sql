-- Add offset fields to products table if they don't exist
DO $$
BEGIN
    -- Check if offset column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'offset') THEN
        ALTER TABLE products ADD COLUMN offset TEXT;
    END IF;

    -- Check if front_offset column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'front_offset') THEN
        ALTER TABLE products ADD COLUMN front_offset TEXT;
    END IF;

    -- Check if rear_offset column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'rear_offset') THEN
        ALTER TABLE products ADD COLUMN rear_offset TEXT;
    END IF;
END
$$;
