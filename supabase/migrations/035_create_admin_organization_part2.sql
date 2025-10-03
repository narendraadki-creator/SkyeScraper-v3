-- Migration 035 Part 2: Create Admin Organization and Move Users
-- This migration creates the admin organization and moves admin users
-- MUST be run AFTER migration 034 Part 1

-- Step 1: Create a system admin organization
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

-- Step 2: Update existing admin users to be in admin organization
DO $$
DECLARE
    admin_org_id UUID;
    moved_count INTEGER;
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
        
        GET DIAGNOSTICS moved_count = ROW_COUNT;
        
        RAISE NOTICE 'Moved % admin users to admin organization with ID %', moved_count, admin_org_id;
    ELSE
        RAISE EXCEPTION 'Admin organization not found! Run migration 034 Part 1 first.';
    END IF;
END $$;

-- Step 3: Log the migration
INSERT INTO migration_log (migration_name, phase, status, details, created_at)
VALUES (
    '035_create_admin_organization_part2',
    'phase2_admin_org_setup',
    'completed',
    json_build_object(
        'admin_org_created', true,
        'admin_users_moved', (SELECT COUNT(*) FROM employees WHERE role_new = 'admin'),
        'admin_org_id', (SELECT id FROM organizations WHERE type = 'admin' LIMIT 1),
        'timestamp', NOW()
    )::jsonb,
    NOW()
);

-- Step 4: Verify the changes
SELECT 'ADMIN ORGANIZATION SETUP COMPLETE' as status;

SELECT 'Admin organization created:' as info, 
       id, name, type, contact_email, status
FROM organizations WHERE type = 'admin';

SELECT 'Admin users moved:' as info, COUNT(*) as count 
FROM employees WHERE role_new = 'admin';

SELECT 'Admin users verification:' as info, 
       e.email, 
       e.role_new,
       o.name as org_name, 
       o.type as org_type 
FROM employees e 
JOIN organizations o ON e.organization_id = o.id 
WHERE e.role_new = 'admin'
ORDER BY e.email;

