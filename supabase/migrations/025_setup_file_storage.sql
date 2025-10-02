-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', true)
ON CONFLICT DO NOTHING;

-- Upload policy
CREATE POLICY "org_upload_files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'project-files' AND
  (storage.foldername(name))[1] IN (
    SELECT o.id::text FROM organizations o
    JOIN employees e ON o.id = e.organization_id
    WHERE e.user_id = auth.uid()
  )
);

-- View policy
CREATE POLICY "org_view_files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'project-files' AND
  (storage.foldername(name))[1] IN (
    SELECT o.id::text FROM organizations o
    JOIN employees e ON o.id = e.organization_id
    WHERE e.user_id = auth.uid()
  )
);

-- Delete policy
CREATE POLICY "org_delete_files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'project-files' AND
  (storage.foldername(name))[1] IN (
    SELECT o.id::text FROM organizations o
    JOIN employees e ON o.id = e.organization_id
    WHERE e.user_id = auth.uid()
  )
);
