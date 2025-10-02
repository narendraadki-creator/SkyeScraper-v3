-- migrations/014_simple_org_insert_fix.sql
-- Simple fix for organization insert policy

-- Drop all existing organization policies
DROP POLICY IF EXISTS "org_insert_own" ON organizations;
DROP POLICY IF EXISTS "org_insert_registration" ON organizations;
DROP POLICY IF EXISTS "org_view_own" ON organizations;
DROP POLICY IF EXISTS "org_admin_update" ON organizations;

-- Create simple, working policies
CREATE POLICY "org_insert_any" ON organizations FOR INSERT WITH CHECK (true);

CREATE POLICY "org_view_own" ON organizations FOR SELECT USING (
    created_by = auth.uid()
);

CREATE POLICY "org_update_own" ON organizations FOR UPDATE USING (
    created_by = auth.uid()
);

-- Also fix employee policies to be simpler
DROP POLICY IF EXISTS "emp_insert_own" ON employees;
DROP POLICY IF EXISTS "emp_view_own" ON employees;
DROP POLICY IF EXISTS "emp_update_own" ON employees;
DROP POLICY IF EXISTS "emp_update_last_login" ON employees;

CREATE POLICY "emp_insert_any" ON employees FOR INSERT WITH CHECK (true);

CREATE POLICY "emp_view_own" ON employees FOR SELECT USING (
    user_id = auth.uid()
);

CREATE POLICY "emp_update_own" ON employees FOR UPDATE USING (
    user_id = auth.uid()
);
