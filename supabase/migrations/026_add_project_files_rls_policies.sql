-- Add RLS policies for project_files table

-- View policy - users can view files from their organization's projects
CREATE POLICY "view_project_files" ON project_files FOR SELECT USING (
    organization_id IN (
        SELECT organization_id FROM employees WHERE user_id = auth.uid()
    )
);

-- Insert policy - users can upload files to their organization's projects
CREATE POLICY "upload_project_files" ON project_files FOR INSERT WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM employees WHERE user_id = auth.uid()
    )
);

-- Update policy - users can update files from their organization's projects
CREATE POLICY "update_project_files" ON project_files FOR UPDATE USING (
    organization_id IN (
        SELECT organization_id FROM employees WHERE user_id = auth.uid()
    )
);

-- Delete policy - users can delete files from their organization's projects
CREATE POLICY "delete_project_files" ON project_files FOR DELETE USING (
    organization_id IN (
        SELECT organization_id FROM employees WHERE user_id = auth.uid()
    )
);
