-- Migration 033: Three-Role System Phase 1 - Validation and Testing (FINAL)
-- This migration validates the role migration and prepares for the next phase
-- PHASE 1: Validation, testing, and preparation for service layer updates

-- Step 1: Drop existing functions that might have different signatures
DROP FUNCTION IF EXISTS show_role_mapping_details();
DROP FUNCTION IF EXISTS validate_three_role_migration();
DROP FUNCTION IF EXISTS rollback_role_migration();
DROP FUNCTION IF EXISTS prepare_phase2_service_updates();

-- Step 2: Create comprehensive validation function
CREATE OR REPLACE FUNCTION validate_three_role_migration()
RETURNS TABLE(
    validation_check TEXT,
    status TEXT,
    count_value INTEGER,
    details TEXT
) AS $$
BEGIN
    -- Check 1: No NULL role_new values
    RETURN QUERY
    SELECT 
        'NULL role_new check'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        COUNT(*)::INTEGER,
        'All employees must have role_new assigned'::TEXT
    FROM employees WHERE role_new IS NULL;
    
    -- Check 2: Developer org users have developer or admin role_new
    RETURN QUERY
    SELECT 
        'Developer org role check'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        COUNT(*)::INTEGER,
        'Developer org users should have developer or admin role_new'::TEXT
    FROM employees e
    JOIN organizations o ON e.organization_id = o.id
    WHERE o.type = 'developer' AND e.role_new NOT IN ('developer', 'admin');
    
    -- Check 3: Agent org users have agent role_new
    RETURN QUERY
    SELECT 
        'Agent org role check'::TEXT,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::TEXT,
        COUNT(*)::INTEGER,
        'Agent org users should have agent role_new'::TEXT
    FROM employees e
    JOIN organizations o ON e.organization_id = o.id
    WHERE o.type = 'agent' AND e.role_new != 'agent';
    
    -- Check 4: System admin count is reasonable (not too many)
    RETURN QUERY
    SELECT 
        'System admin count check'::TEXT,
        CASE WHEN COUNT(*) <= 5 THEN 'PASS' ELSE 'REVIEW' END::TEXT,
        COUNT(*)::INTEGER,
        'Should have few system admins - review if more than 5'::TEXT
    FROM employees WHERE role_new = 'admin';
    
    -- Check 5: Role distribution makes sense
    RETURN QUERY
    SELECT 
        'Role distribution check'::TEXT,
        'INFO'::TEXT,
        COUNT(*)::INTEGER,
        'Total employees in system'::TEXT
    FROM employees;
    
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create function to show role mapping details
CREATE OR REPLACE FUNCTION show_role_mapping_details()
RETURNS TABLE(
    organization_name TEXT,
    organization_type TEXT,
    employee_email TEXT,
    old_role TEXT,
    new_role TEXT,
    mapping_reason TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.name::TEXT,
        o.type::TEXT,
        e.email::TEXT,
        e.role::TEXT,
        e.role_new::TEXT,
        CASE 
            WHEN e.role_new = 'admin' AND (e.email LIKE '%admin%' OR e.email LIKE '%system%') THEN 'System admin by email pattern'
            WHEN e.role_new = 'admin' THEN 'System admin (manual review needed)'
            WHEN e.role_new = 'developer' AND o.type = 'developer' THEN 'Developer org user'
            WHEN e.role_new = 'agent' AND o.type = 'agent' THEN 'Agent org user'
            WHEN e.role_new = 'developer' AND e.role IN ('manager', 'staff') THEN 'Legacy role mapped to developer'
            ELSE 'Default mapping applied'
        END::TEXT
    FROM employees e
    JOIN organizations o ON e.organization_id = o.id
    ORDER BY o.type, e.role_new, e.created_at;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create rollback function (safety measure)
CREATE OR REPLACE FUNCTION rollback_role_migration()
RETURNS TEXT AS $$
DECLARE
    rollback_count INTEGER;
BEGIN
    -- Restore original roles from backup
    UPDATE employees 
    SET role = backup.role
    FROM employees_role_backup backup
    WHERE employees.id = backup.id;
    
    GET DIAGNOSTICS rollback_count = ROW_COUNT;
    
    -- Clear role_new column
    UPDATE employees SET role_new = NULL;
    
    RETURN 'Rollback completed: ' || rollback_count || ' employee roles restored';
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create function to prepare for Phase 2 (service layer updates)
CREATE OR REPLACE FUNCTION prepare_phase2_service_updates()
RETURNS TABLE(
    service_file TEXT,
    current_logic TEXT,
    required_change TEXT,
    priority TEXT
) AS $$
BEGIN
    RETURN QUERY VALUES
    ('projectService.ts', 'role !== ''agent''', 'role === ''developer'' || role === ''admin''', 'HIGH'),
    ('adminService.ts', 'role === ''admin''', 'role === ''admin'' (system admin only)', 'HIGH'),
    ('AuthContext.tsx', 'role: string', 'role: ''admin'' | ''developer'' | ''agent''', 'HIGH'),
    ('DashboardPage.tsx', 'role !== ''agent''', 'role-specific navigation blocks', 'MEDIUM'),
    ('ProjectDetailsPage.tsx', 'role !== ''agent''', 'role === ''developer'' || role === ''admin''', 'MEDIUM'),
    ('RegisterPage.tsx', 'organizationType === ''developer'' ? ''admin'' : ''agent''', 'organizationType === ''developer'' ? ''developer'' : ''agent''', 'HIGH'),
    ('unitService.ts', 'role !== ''agent''', 'role === ''developer'' || role === ''admin''', 'MEDIUM'),
    ('ProtectedRoute.tsx', 'Basic auth check', 'Role-based route protection', 'HIGH');
END;
$$ LANGUAGE plpgsql;

-- Step 6: Run validation
SELECT 'RUNNING VALIDATION CHECKS...' as status;
SELECT * FROM validate_three_role_migration();

-- Step 7: Show detailed mapping for review (limit to 20 for readability)
SELECT 'ROLE MAPPING DETAILS (Sample):' as info;
SELECT * FROM show_role_mapping_details() LIMIT 20;

-- Step 8: Log phase 1 completion
INSERT INTO migration_log (migration_name, phase, status, details, created_at)
VALUES (
    '033_three_role_system_phase1',
    'validation_and_completion',
    'completed',
    json_build_object(
        'phase', 'phase1_database_migration',
        'migration_files', ARRAY['031', '032', '033'],
        'employees_migrated', (SELECT COUNT(*) FROM employees),
        'admin_count', (SELECT COUNT(*) FROM employees WHERE role_new = 'admin'),
        'developer_count', (SELECT COUNT(*) FROM employees WHERE role_new = 'developer'),
        'agent_count', (SELECT COUNT(*) FROM employees WHERE role_new = 'agent'),
        'completion_timestamp', NOW()
    )::jsonb,
    NOW()
);

-- Step 9: Output next steps
SELECT 'PHASE 1 COMPLETE - NEXT STEPS:' as status;
SELECT '1. Review validation results above' as step;
SELECT '2. Manually verify system admin assignments' as step;
SELECT '3. If validation passes, proceed to Phase 2 (Service Layer Updates)' as step;
SELECT '4. If issues found, run SELECT rollback_role_migration(); to revert' as step;

-- Step 10: Show service update preparation
SELECT 'PHASE 2 PREPARATION - SERVICE FILES TO UPDATE:' as info;
SELECT * FROM prepare_phase2_service_updates();

-- Step 11: Final summary
SELECT 'FINAL PHASE 1 SUMMARY:' as summary_type;
SELECT 
    role_new as new_role,
    COUNT(*) as user_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM employees), 2) as percentage
FROM employees 
GROUP BY role_new
ORDER BY user_count DESC;

-- Step 12: Show system admins for manual review
SELECT 'SYSTEM ADMINS FOR MANUAL REVIEW:' as admin_review;
SELECT 
    email,
    first_name,
    last_name,
    (SELECT name FROM organizations WHERE id = organization_id) as organization_name,
    created_at
FROM employees 
WHERE role_new = 'admin'
ORDER BY created_at;


