-- migrations/015_disable_rls_temporarily.sql
-- Temporarily disable RLS to allow registration, then re-enable with proper policies

-- Disable RLS temporarily to allow registration
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "org_insert_any" ON organizations;
DROP POLICY IF EXISTS "org_view_own" ON organizations;
DROP POLICY IF EXISTS "org_update_own" ON organizations;
DROP POLICY IF EXISTS "emp_insert_any" ON employees;
DROP POLICY IF EXISTS "emp_view_own" ON employees;
DROP POLICY IF EXISTS "emp_update_own" ON employees;

-- Re-enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create working policies
CREATE POLICY "org_insert_any" ON organizations FOR INSERT WITH CHECK (true);
CREATE POLICY "org_view_own" ON organizations FOR SELECT USING (created_by = auth.uid());
CREATE POLICY "org_update_own" ON organizations FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "emp_insert_any" ON employees FOR INSERT WITH CHECK (true);
CREATE POLICY "emp_view_own" ON employees FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "emp_update_own" ON employees FOR UPDATE USING (user_id = auth.uid());
