-- migrations/036_fix_registration_rls.sql
-- Fix RLS policies to allow registration and proper access

-- Drop all existing policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on organizations table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'organizations') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON organizations';
    END LOOP;
    
    -- Drop all policies on employees table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'employees') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON employees';
    END LOOP;
END $$;

-- Disable RLS temporarily to allow registration
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for registration and basic access
-- Organizations: Allow anyone to insert (for registration), view own, update own
CREATE POLICY "org_insert_any" ON organizations FOR INSERT WITH CHECK (true);
CREATE POLICY "org_view_own" ON organizations FOR SELECT USING (
    created_by = auth.uid() OR 
    id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid())
);
CREATE POLICY "org_update_own" ON organizations FOR UPDATE USING (
    created_by = auth.uid() OR 
    id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid() AND role IN ('admin', 'manager'))
);

-- Employees: Allow anyone to insert (for registration), view own and org members, update own
CREATE POLICY "emp_insert_any" ON employees FOR INSERT WITH CHECK (true);
CREATE POLICY "emp_view_own" ON employees FOR SELECT USING (
    user_id = auth.uid() OR 
    organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid())
);
CREATE POLICY "emp_update_own" ON employees FOR UPDATE USING (
    user_id = auth.uid() OR 
    (organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid() AND role IN ('admin', 'manager')))
);

-- Allow employees to update their own last_login
CREATE POLICY "emp_update_last_login" ON employees FOR UPDATE USING (
    user_id = auth.uid()
) WITH CHECK (
    user_id = auth.uid()
);

-- Verify policies were created
SELECT 'Organizations policies:' as info;
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'organizations';

SELECT 'Employees policies:' as info;
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'employees';
