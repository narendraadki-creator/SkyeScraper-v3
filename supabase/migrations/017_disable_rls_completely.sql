-- migrations/017_disable_rls_completely.sql
-- Completely disable RLS to allow registration

-- Drop all existing policies first
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
    tablename, 
    rowsecurity as rls_enabled,
    CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as status
FROM pg_tables 
WHERE tablename IN ('organizations', 'employees')
ORDER BY tablename;

-- Show that no policies exist
SELECT 'Policies on organizations:' as info;
SELECT policyname FROM pg_policies WHERE tablename = 'organizations';

SELECT 'Policies on employees:' as info;
SELECT policyname FROM pg_policies WHERE tablename = 'employees';
