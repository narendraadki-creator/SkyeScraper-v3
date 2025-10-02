-- migrations/012_final_rls_fix.sql
-- Final fix for RLS policies with proper organization access

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "org_view_own" ON organizations;
DROP POLICY IF EXISTS "org_admin_update" ON organizations;
DROP POLICY IF EXISTS "org_insert_own" ON organizations;
DROP POLICY IF EXISTS "emp_view_own" ON employees;
DROP POLICY IF EXISTS "emp_update_own" ON employees;
DROP POLICY IF EXISTS "emp_insert_own" ON employees;
DROP POLICY IF EXISTS "emp_update_last_login" ON employees;

-- Organizations Policies
CREATE POLICY "org_insert_own" ON organizations FOR INSERT WITH CHECK (
    created_by = auth.uid()
);

CREATE POLICY "org_view_own" ON organizations FOR SELECT USING (
    created_by = auth.uid()
);

CREATE POLICY "org_admin_update" ON organizations FOR UPDATE USING (
    created_by = auth.uid()
);

-- Employees Policies
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

-- Add a function to get organization for a user (to avoid recursion)
CREATE OR REPLACE FUNCTION get_user_organization_id(user_uuid UUID)
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT organization_id 
    FROM employees 
    WHERE user_id = user_uuid 
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a more comprehensive policy for employees to see organization data
CREATE POLICY "emp_view_org_employees" ON employees FOR SELECT USING (
  organization_id = get_user_organization_id(auth.uid())
);

-- Create a policy for organizations to be viewed by their employees
CREATE POLICY "org_view_by_employees" ON organizations FOR SELECT USING (
  id = get_user_organization_id(auth.uid())
);
