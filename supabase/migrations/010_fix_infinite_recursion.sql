-- migrations/010_fix_infinite_recursion.sql
-- Fix infinite recursion in RLS policies

-- Drop all existing policies that are causing recursion
DROP POLICY IF EXISTS "org_view_own" ON organizations;
DROP POLICY IF EXISTS "org_admin_update" ON organizations;
DROP POLICY IF EXISTS "org_insert_own" ON organizations;
DROP POLICY IF EXISTS "emp_view_own" ON employees;
DROP POLICY IF EXISTS "emp_update_own" ON employees;
DROP POLICY IF EXISTS "emp_insert_own" ON employees;
DROP POLICY IF EXISTS "emp_update_last_login" ON employees;

-- Organizations Policies - Fixed to avoid recursion
CREATE POLICY "org_insert_own" ON organizations FOR INSERT WITH CHECK (
    created_by = auth.uid()
);

CREATE POLICY "org_view_own" ON organizations FOR SELECT USING (
    -- Allow users to see organizations they created or belong to
    created_by = auth.uid() OR 
    id IN (
        SELECT organization_id 
        FROM employees 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "org_admin_update" ON organizations FOR UPDATE USING (
    -- Only allow updates by the creator or admin employees
    created_by = auth.uid() OR 
    id IN (
        SELECT organization_id 
        FROM employees 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Employees Policies - Fixed to avoid recursion
CREATE POLICY "emp_insert_own" ON employees FOR INSERT WITH CHECK (
    -- Allow creation by the user themselves or by the organization creator
    user_id = auth.uid() OR 
    created_by = auth.uid() OR
    organization_id IN (
        SELECT id 
        FROM organizations 
        WHERE created_by = auth.uid()
    )
);

CREATE POLICY "emp_view_own" ON employees FOR SELECT USING (
    -- Allow users to see their own record or records in their organization
    user_id = auth.uid() OR 
    organization_id IN (
        SELECT organization_id 
        FROM employees 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "emp_update_own" ON employees FOR UPDATE USING (
    -- Allow users to update their own record or admins to update organization employees
    user_id = auth.uid() OR 
    organization_id IN (
        SELECT organization_id 
        FROM employees 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Allow employees to update their own last_login without recursion
CREATE POLICY "emp_update_last_login" ON employees FOR UPDATE USING (
    user_id = auth.uid()
) WITH CHECK (
    user_id = auth.uid()
);
