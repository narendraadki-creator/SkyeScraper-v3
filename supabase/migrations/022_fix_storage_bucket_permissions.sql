-- Fix storage bucket permissions for unit imports
-- First, ensure the bucket exists and is properly configured

-- Update the existing bucket to allow more file types and increase size limit
UPDATE storage.buckets 
SET 
  file_size_limit = 104857600, -- 100MB limit
  allowed_mime_types = ARRAY[
    'application/pdf', 
    'image/jpeg', 
    'image/png', 
    'image/webp', 
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
    'application/vnd.ms-excel', 
    'text/csv',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ]
WHERE id = 'project-files';

-- Drop existing policies to recreate them with better permissions
DROP POLICY IF EXISTS "Allow authenticated users to upload project files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view project files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update project files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete project files" ON storage.objects;

-- Create more permissive RLS policies for the bucket
CREATE POLICY "Allow authenticated users to upload project files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'project-files' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to view project files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'project-files' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to update project files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'project-files' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to delete project files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'project-files' 
  AND auth.role() = 'authenticated'
);

-- Add a comment
COMMENT ON TABLE storage.buckets IS 'Storage buckets for file uploads including project files and unit imports';
