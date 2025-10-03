-- Migration 034: Add Admin Organization Type
-- This migration adds 'admin' as a valid organization type for system administrators

-- Step 1: Add 'admin' to the organization_type enum
ALTER TYPE organization_type ADD VALUE 'admin';

-- Step 2: Create a system admin organization if it doesn't exist
INSERT INTO organizations (
    name,
    type,
    status,
    contact_email,
    description,
    created_at,
    updated_at
) VALUES (
    'SkyeScraper System Administration',
    'admin',
    'active',
    'admin@skyescraper.com',
    'System administration organization for SkyeScraper platform administrators',
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- Step 3: Update existing admin users to be in admin organization
DO $$
DECLARE
    admin_org_id UUID;
BEGIN
    -- Get the admin organization ID
    SELECT id INTO admin_org_id 
    FROM organizations 
    WHERE type = 'admin' 
    LIMIT 1;
    
    IF admin_org_id IS NOT NULL THEN
        -- Move all admin users to the admin organization
        UPDATE employees 
        SET organization_id = admin_org_id,
            updated_at = NOW()
        WHERE role_new = 'admin';
        
        RAISE NOTICE 'Moved % admin users to admin organization', 
            (SELECT COUNT(*) FROM employees WHERE role_new = 'admin');
    END IF;
END $$;

-- Step 4: Log the migration
INSERT INTO migration_log (migration_name, phase, status, details, created_at)
VALUES (
    '034_add_admin_organization_type',
    'phase2_admin_org_setup',
    'completed',
    json_build_object(
        'admin_org_created', true,
        'admin_users_moved', (SELECT COUNT(*) FROM employees WHERE role_new = 'admin'),
        'timestamp', NOW()
    )::jsonb,
    NOW()
);

-- Step 5: Verify the changes
SELECT 'ADMIN ORGANIZATION SETUP COMPLETE' as status;
SELECT 'Admin organization:' as info, name, type, contact_email 
FROM organizations WHERE type = 'admin';
SELECT 'Admin users moved:' as info, COUNT(*) as count 
FROM employees WHERE role_new = 'admin';
SELECT 'Admin users verification:' as info, 
       e.email, 
       o.name as org_name, 
       o.type as org_type 
FROM employees e 
JOIN organizations o ON e.organization_id = o.id 
WHERE e.role_new = 'admin';


