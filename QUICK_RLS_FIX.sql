-- QUICK RLS FIX - Run this in Supabase SQL Editor immediately

-- Drop all existing policies
DROP POLICY IF EXISTS "org_insert_any" ON organizations;
DROP POLICY IF EXISTS "org_view_own" ON organizations;
DROP POLICY IF EXISTS "org_update_own" ON organizations;
DROP POLICY IF EXISTS "org_insert_own" ON organizations;
DROP POLICY IF EXISTS "org_admin_update" ON organizations;
DROP POLICY IF EXISTS "org_insert_registration" ON organizations;

DROP POLICY IF EXISTS "emp_insert_any" ON employees;
DROP POLICY IF EXISTS "emp_view_own" ON employees;
DROP POLICY IF EXISTS "emp_update_own" ON employees;
DROP POLICY IF EXISTS "emp_insert_own" ON employees;
DROP POLICY IF EXISTS "emp_update_last_login" ON employees;

-- Disable RLS completely
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    tablename, 
    CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
FROM pg_tables 
WHERE tablename IN ('organizations', 'employees');
