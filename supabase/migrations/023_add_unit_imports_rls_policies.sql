-- migrations/023_add_unit_imports_rls_policies.sql

-- Add RLS policies for unit_imports table
CREATE POLICY "view_unit_imports" ON unit_imports FOR SELECT USING (
    project_id IN (
        SELECT p.id FROM projects p
        JOIN employees e ON p.organization_id = e.organization_id
        WHERE e.user_id = auth.uid()
    )
);

CREATE POLICY "manage_unit_imports" ON unit_imports FOR ALL USING (
    project_id IN (
        SELECT p.id FROM projects p
        JOIN employees e ON p.organization_id = e.organization_id
        WHERE e.user_id = auth.uid()
    )
);
