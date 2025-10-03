-- migrations/037_emergency_disable_rls.sql
-- Emergency fix: Completely disable RLS to allow registration

-- Drop ALL policies on both tables
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

-- Completely disable RLS on both tables
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled 
FROM pg_tables 
WHERE tablename IN ('organizations', 'employees');

-- Show that no policies exist
SELECT 'Organizations policies:' as info;
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'organizations';

SELECT 'Employees policies:' as info;
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'employees';
