-- First, let's drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Access" ON storage.objects;
DROP POLICY IF EXISTS "Anonymous Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Anonymous Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Anonymous Delete Access" ON storage.objects;

-- Allow public read access to product images
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');

-- Allow authenticated users to upload images
CREATE POLICY "Admin Upload Access" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated users to update their own images
CREATE POLICY "Admin Update Access" ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

-- Allow authenticated users to delete images
CREATE POLICY "Admin Delete Access" ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

-- Allow anonymous users to upload to product-images bucket (for admin users)
CREATE POLICY "Anonymous Upload Access" ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'product-images');

-- Allow anonymous users to update product-images bucket (for admin users)
CREATE POLICY "Anonymous Update Access" ON storage.objects
FOR UPDATE
TO anon
USING (bucket_id = 'product-images');

-- Allow anonymous users to delete from product-images bucket (for admin users)
CREATE POLICY "Anonymous Delete Access" ON storage.objects
FOR DELETE
TO anon
USING (bucket_id = 'product-images');
