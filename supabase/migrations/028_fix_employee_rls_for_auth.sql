-- Fix employee RLS policies to allow authentication context to work

-- Drop existing employee policies
DROP POLICY IF EXISTS "emp_view_own" ON employees;
DROP POLICY IF EXISTS "emp_manage_own" ON employees;
DROP POLICY IF EXISTS "emp_insert_registration" ON employees;

-- Create new policies that allow authentication context to work
CREATE POLICY "emp_view_own" ON employees FOR SELECT USING (
    user_id = auth.uid()
);

CREATE POLICY "emp_manage_own" ON employees FOR ALL USING (
    user_id = auth.uid()
);

-- Allow registration to create employee records
CREATE POLICY "emp_insert_registration" ON employees FOR INSERT WITH CHECK (true);

-- Also ensure organizations can be viewed by their employees
DROP POLICY IF EXISTS "org_view_own" ON organizations;

CREATE POLICY "org_view_own" ON organizations FOR SELECT USING (
    id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid())
);
