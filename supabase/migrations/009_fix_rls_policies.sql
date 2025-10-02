-- migrations/009_fix_rls_policies.sql
-- Fix RLS policies to allow registration and proper access

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "org_view_own" ON organizations;
DROP POLICY IF EXISTS "org_admin_update" ON organizations;

-- Organizations Policies - Allow registration and proper access
CREATE POLICY "org_insert_own" ON organizations FOR INSERT WITH CHECK (
    created_by = auth.uid()
);

CREATE POLICY "org_view_own" ON organizations FOR SELECT USING (
    id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid())
);

CREATE POLICY "org_admin_update" ON organizations FOR UPDATE USING (
    id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid() AND role = 'admin')
);

-- Employees Policies - Allow registration and proper access
CREATE POLICY "emp_insert_own" ON employees FOR INSERT WITH CHECK (
    created_by = auth.uid() OR user_id = auth.uid()
);

CREATE POLICY "emp_view_own" ON employees FOR SELECT USING (
    user_id = auth.uid() OR organization_id IN (
        SELECT organization_id FROM employees WHERE user_id = auth.uid()
    )
);

CREATE POLICY "emp_update_own" ON employees FOR UPDATE USING (
    user_id = auth.uid() OR organization_id IN (
        SELECT organization_id FROM employees WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Allow employees to update their own last_login
CREATE POLICY "emp_update_last_login" ON employees FOR UPDATE USING (
    user_id = auth.uid()
) WITH CHECK (
    user_id = auth.uid()
);
