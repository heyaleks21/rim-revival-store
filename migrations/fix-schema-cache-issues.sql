-- Ensure all columns exist and refresh schema cache
DO $$
BEGIN
    -- Check if vehicle_year column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'vehicle_year') THEN
        ALTER TABLE products ADD COLUMN vehicle_year TEXT;
    END IF;
    
    -- Check if is_staggered_tyres column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_staggered_tyres') THEN
        ALTER TABLE products ADD COLUMN is_staggered_tyres BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Check if has_staggered_tyres column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'has_staggered_tyres') THEN
        ALTER TABLE products ADD COLUMN has_staggered_tyres BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Force a schema refresh
    NOTIFY pgrst, 'reload schema';
END $$;

-- Output confirmation
SELECT 'Schema cache refresh completed' as result;
