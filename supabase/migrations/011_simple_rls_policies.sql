-- migrations/011_simple_rls_policies.sql
-- Simple RLS policies to avoid infinite recursion

-- Drop all existing policies
DROP POLICY IF EXISTS "org_view_own" ON organizations;
DROP POLICY IF EXISTS "org_admin_update" ON organizations;
DROP POLICY IF EXISTS "org_insert_own" ON organizations;
DROP POLICY IF EXISTS "emp_view_own" ON employees;
DROP POLICY IF EXISTS "emp_update_own" ON employees;
DROP POLICY IF EXISTS "emp_insert_own" ON employees;
DROP POLICY IF EXISTS "emp_update_last_login" ON employees;

-- Organizations Policies - Simple and direct
CREATE POLICY "org_insert_own" ON organizations FOR INSERT WITH CHECK (
    created_by = auth.uid()
);

CREATE POLICY "org_view_own" ON organizations FOR SELECT USING (
    created_by = auth.uid()
);

CREATE POLICY "org_admin_update" ON organizations FOR UPDATE USING (
    created_by = auth.uid()
);

-- Employees Policies - Simple and direct
CREATE POLICY "emp_insert_own" ON employees FOR INSERT WITH CHECK (
    user_id = auth.uid() OR created_by = auth.uid()
);

CREATE POLICY "emp_view_own" ON employees FOR SELECT USING (
    user_id = auth.uid()
);

CREATE POLICY "emp_update_own" ON employees FOR UPDATE USING (
    user_id = auth.uid()
);

-- Allow employees to update their own last_login
CREATE POLICY "emp_update_last_login" ON employees FOR UPDATE USING (
    user_id = auth.uid()
) WITH CHECK (
    user_id = auth.uid()
);
