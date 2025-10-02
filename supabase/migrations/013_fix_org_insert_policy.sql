-- migrations/013_fix_org_insert_policy.sql
-- Fix organization insert policy to allow registration

-- Drop the existing insert policy
DROP POLICY IF EXISTS "org_insert_own" ON organizations;

-- Create a new insert policy that allows organization creation during registration
CREATE POLICY "org_insert_own" ON organizations FOR INSERT WITH CHECK (
    -- Allow if the user is creating the organization (created_by = auth.uid())
    -- OR if there's no authenticated user (for initial registration)
    created_by = auth.uid() OR auth.uid() IS NULL
);

-- Also create a policy that allows anyone to insert during registration
-- This is needed because during signup, the user might not be fully authenticated yet
CREATE POLICY "org_insert_registration" ON organizations FOR INSERT WITH CHECK (
    -- Allow organization creation during registration process
    true
);

-- Drop the registration policy and create a more specific one
DROP POLICY IF EXISTS "org_insert_registration" ON organizations;

-- Create a policy that allows organization creation with proper validation
CREATE POLICY "org_insert_registration" ON organizations FOR INSERT WITH CHECK (
    -- Allow if the organization has a valid email and the user is authenticated
    contact_email IS NOT NULL AND 
    contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
    (created_by = auth.uid() OR auth.uid() IS NOT NULL)
);
