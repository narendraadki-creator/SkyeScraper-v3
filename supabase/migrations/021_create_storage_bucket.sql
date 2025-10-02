-- Create storage bucket for project files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-files',
  'project-files',
  true,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv']
);

-- Create RLS policies for the bucket
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
