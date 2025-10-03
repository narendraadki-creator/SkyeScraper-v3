-- Migration 032: Three-Role System Phase 1 - Data Migration (FIXED)
-- This migration performs the actual role data migration
-- PHASE 1: Migrate existing role data to new three-role system

-- Step 1: Update role_new column based on organization type and current role
UPDATE employees 
SET role_new = CASE 
    -- System admins: Manual identification needed - for now, keep specific admin emails as admin
    WHEN role = 'admin' AND (
        email LIKE '%admin@%' OR 
        email LIKE '%system@%' OR
        email LIKE '%superuser@%' OR
        email = 'admin@skyescraper.com'
    ) THEN 'admin'::user_role_new
    
    -- Developer organization users with admin role -> developer
    WHEN role = 'admin' AND organization_id IN (
        SELECT id FROM organizations WHERE type = 'developer'
    ) THEN 'developer'::user_role_new
    
    -- Agent organization users -> agent (regardless of current role)
    WHEN organization_id IN (
        SELECT id FROM organizations WHERE type = 'agent'
    ) THEN 'agent'::user_role_new
    
    -- Legacy roles in developer organizations -> developer
    WHEN role IN ('manager', 'staff') AND organization_id IN (
        SELECT id FROM organizations WHERE type = 'developer'
    ) THEN 'developer'::user_role_new
    
    -- Default fallback for any remaining cases -> developer
    ELSE 'developer'::user_role_new
END;

-- Step 2: Verify no NULL values in role_new
UPDATE employees 
SET role_new = 'developer'::user_role_new 
WHERE role_new IS NULL;

-- Step 3: Log the migration results in our simple migration_log table
INSERT INTO migration_log (migration_name, phase, status, details, created_at)
VALUES (
    '032_three_role_system_phase1',
    'data_migration',
    'completed',
    json_build_object(
        'employees_migrated', (SELECT COUNT(*) FROM employees),
        'admin_count', (SELECT COUNT(*) FROM employees WHERE role_new = 'admin'),
        'developer_count', (SELECT COUNT(*) FROM employees WHERE role_new = 'developer'),
        'agent_count', (SELECT COUNT(*) FROM employees WHERE role_new = 'agent'),
        'migration_timestamp', NOW()
    )::jsonb,
    NOW()
);

-- Step 4: Create summary of migration results
CREATE TEMPORARY TABLE migration_summary AS
SELECT 
    o.type as org_type,
    e.role as old_role,
    e.role_new as new_role,
    COUNT(*) as count
FROM employees e
JOIN organizations o ON e.organization_id = o.id
GROUP BY o.type, e.role, e.role_new
ORDER BY o.type, e.role, e.role_new;

-- Step 5: Validate migration results
DO $$
DECLARE
    null_count INTEGER;
    total_count INTEGER;
BEGIN
    -- Check for any NULL role_new values
    SELECT COUNT(*) INTO null_count FROM employees WHERE role_new IS NULL;
    SELECT COUNT(*) INTO total_count FROM employees;
    
    IF null_count > 0 THEN
        RAISE EXCEPTION 'Migration failed: % employees have NULL role_new values', null_count;
    END IF;
    
    RAISE NOTICE 'Migration successful: % employees migrated, % NULL values', total_count, null_count;
END $$;

-- Step 6: Create function to identify potential system admins that need manual review
CREATE OR REPLACE FUNCTION identify_potential_system_admins()
RETURNS TABLE(
    employee_id UUID,
    email TEXT,
    old_role TEXT,
    new_role TEXT,
    organization_name TEXT,
    created_at TIMESTAMPTZ,
    recommendation TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id::UUID,
        e.email::TEXT,
        e.role::TEXT,
        e.role_new::TEXT,
        o.name::TEXT,
        e.created_at,
        CASE 
            WHEN e.role_new = 'admin' THEN 'Confirmed system admin'
            WHEN e.role = 'admin' AND o.type = 'developer' AND e.created_at < (NOW() - INTERVAL '30 days') THEN 'Potential system admin - review manually'
            WHEN e.email LIKE '%admin%' OR e.email LIKE '%system%' THEN 'Email suggests admin role - review manually'
            ELSE 'Standard user migration'
        END::TEXT
    FROM employees e
    JOIN organizations o ON e.organization_id = o.id
    WHERE e.role = 'admin' OR e.role_new = 'admin'
    ORDER BY e.role_new DESC, e.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Output migration results
SELECT 'MIGRATION 032 DATA MIGRATION COMPLETE' as status;

-- Show migration summary
SELECT 'MIGRATION SUMMARY:' as info;
SELECT * FROM migration_summary;

-- Show potential system admins for manual review
SELECT 'POTENTIAL SYSTEM ADMINS FOR REVIEW:' as info;
SELECT * FROM identify_potential_system_admins();

-- Step 8: Create validation queries for manual verification
SELECT 'VALIDATION QUERIES:' as info;
SELECT 'Total employees migrated:' as metric, COUNT(*) as value FROM employees;
SELECT 'Employees with admin role_new:' as metric, COUNT(*) as value FROM employees WHERE role_new = 'admin';
SELECT 'Employees with developer role_new:' as metric, COUNT(*) as value FROM employees WHERE role_new = 'developer';
SELECT 'Employees with agent role_new:' as metric, COUNT(*) as value FROM employees WHERE role_new = 'agent';
SELECT 'Employees with NULL role_new:' as metric, COUNT(*) as value FROM employees WHERE role_new IS NULL;

