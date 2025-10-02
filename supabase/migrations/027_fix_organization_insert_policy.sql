-- Fix organization insert policy for registration

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "org_view_own" ON organizations;
DROP POLICY IF EXISTS "org_admin_update" ON organizations;

-- Create new policies that allow registration
CREATE POLICY "org_insert_registration" ON organizations FOR INSERT WITH CHECK (true);

CREATE POLICY "org_view_own" ON organizations FOR SELECT USING (
    id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid())
);

CREATE POLICY "org_admin_update" ON organizations FOR UPDATE USING (
    id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid() AND role = 'admin')
);

-- Also fix employee insert policy for registration
DROP POLICY IF EXISTS "emp_view_own" ON employees;
DROP POLICY IF EXISTS "emp_manage_own" ON employees;

CREATE POLICY "emp_insert_registration" ON employees FOR INSERT WITH CHECK (true);

CREATE POLICY "emp_view_own" ON employees FOR SELECT USING (
    user_id = auth.uid() OR organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid())
);

CREATE POLICY "emp_manage_own" ON employees FOR ALL USING (
    user_id = auth.uid() OR organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid() AND role = 'admin')
);
