-- Check if stud_pattern column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'products'
        AND column_name = 'stud_pattern'
    ) THEN
        ALTER TABLE products ADD COLUMN stud_pattern TEXT;
    END IF;
END $$;
