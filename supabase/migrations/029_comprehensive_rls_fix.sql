-- Comprehensive RLS fix for registration and authentication

-- Temporarily disable RLS to clear any conflicting policies
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "emp_view_own" ON employees;
DROP POLICY IF EXISTS "emp_manage_own" ON employees;
DROP POLICY IF EXISTS "emp_insert_registration" ON employees;
DROP POLICY IF EXISTS "org_view_own" ON organizations;
DROP POLICY IF EXISTS "org_admin_update" ON organizations;
DROP POLICY IF EXISTS "org_insert_registration" ON organizations;

-- Re-enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Create clean, working policies for employees
CREATE POLICY "emp_select_own" ON employees FOR SELECT USING (
    user_id = auth.uid()
);

CREATE POLICY "emp_insert_own" ON employees FOR INSERT WITH CHECK (
    user_id = auth.uid()
);

CREATE POLICY "emp_update_own" ON employees FOR UPDATE USING (
    user_id = auth.uid()
);

CREATE POLICY "emp_delete_own" ON employees FOR DELETE USING (
    user_id = auth.uid()
);

-- Create clean, working policies for organizations
CREATE POLICY "org_select_own" ON organizations FOR SELECT USING (
    id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid())
);

CREATE POLICY "org_insert_any" ON organizations FOR INSERT WITH CHECK (true);

CREATE POLICY "org_update_own" ON organizations FOR UPDATE USING (
    id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid() AND role = 'admin')
);

-- Allow employees to be created during registration (bypass RLS temporarily)
CREATE POLICY "emp_insert_registration" ON employees FOR INSERT WITH CHECK (true);
