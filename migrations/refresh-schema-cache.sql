-- Ensure the center_bore column exists
ALTER TABLE products ADD COLUMN IF NOT EXISTS center_bore TEXT;

-- Force a schema refresh
NOTIFY pgrst, 'reload schema';
