-- Fix Existing Admin Users Script
-- Run this after migration 034 to fix the current admin users in your database

-- Step 1: First run migration 034 to add admin organization type
-- (Copy and paste the content of supabase/migrations/034_add_admin_organization_type.sql)

-- Step 2: Verify admin organization exists
SELECT 'ADMIN ORGANIZATION CHECK' as check_type;
SELECT id, name, type, status FROM organizations WHERE type = 'admin';

-- Step 3: If no admin org exists, create one manually
INSERT INTO organizations (
    name,
    type,
    status,
    contact_email,
    description,
    created_at,
    updated_at
) 
SELECT 
    'SkyeScraper System Administration',
    'admin',
    'active',
    'admin@skyescraper.com',
    'System administration organization for SkyeScraper platform administrators',
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE type = 'admin');

-- Step 4: Move existing admin users to admin organization
UPDATE employees 
SET organization_id = (SELECT id FROM organizations WHERE type = 'admin' LIMIT 1),
    updated_at = NOW()
WHERE role_new = 'admin';

-- Step 5: Verify the fix
SELECT 'ADMIN USERS AFTER FIX' as check_type;
SELECT 
    e.email,
    e.role,
    e.role_new,
    o.name as org_name,
    o.type as org_type
FROM employees e
JOIN organizations o ON e.organization_id = o.id
WHERE e.role_new = 'admin'
ORDER BY e.email;

-- Step 6: Check all role distributions
SELECT 'FINAL ROLE DISTRIBUTION' as check_type;
SELECT 
    e.role_new,
    o.type as org_type,
    COUNT(*) as user_count
FROM employees e
JOIN organizations o ON e.organization_id = o.id
GROUP BY e.role_new, o.type
ORDER BY e.role_new, o.type;





