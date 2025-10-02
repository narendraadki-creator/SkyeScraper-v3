-- migrations/016_final_rls_solution.sql
-- Final solution for RLS policies

-- First, let's check what policies exist and drop them all
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

-- Disable RLS temporarily
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create simple, working policies
CREATE POLICY "org_insert_any" ON organizations FOR INSERT WITH CHECK (true);
CREATE POLICY "org_view_own" ON organizations FOR SELECT USING (created_by = auth.uid());
CREATE POLICY "org_update_own" ON organizations FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "emp_insert_any" ON employees FOR INSERT WITH CHECK (true);
CREATE POLICY "emp_view_own" ON employees FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "emp_update_own" ON employees FOR UPDATE USING (user_id = auth.uid());

-- Verify policies were created
SELECT 'Organizations policies:' as info;
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'organizations';

SELECT 'Employees policies:' as info;
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'employees';
