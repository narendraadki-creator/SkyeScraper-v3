-- SQL Queries to Check Phase 1 Three-Role System Changes
-- Run these queries in Supabase SQL Editor to verify migration results

-- =====================================================
-- 1. CHECK NEW ENUM TYPE CREATED
-- =====================================================
SELECT 'NEW ENUM TYPE CHECK' as check_type;
SELECT 
    typname as enum_name,
    unnest(enum_range(NULL::user_role_new)) as enum_values
FROM pg_type 
WHERE typname = 'user_role_new';

-- =====================================================
-- 2. CHECK NEW COLUMN ADDED TO EMPLOYEES TABLE
-- =====================================================
SELECT 'NEW COLUMN CHECK' as check_type;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'employees' 
AND column_name IN ('role', 'role_new')
ORDER BY column_name;

-- =====================================================
-- 3. CHECK BACKUP TABLE CREATED
-- =====================================================
SELECT 'BACKUP TABLE CHECK' as check_type;
SELECT 
    'employees_role_backup' as table_name,
    COUNT(*) as record_count,
    MIN(created_at) as oldest_record,
    MAX(created_at) as newest_record
FROM employees_role_backup;

-- =====================================================
-- 4. COMPARE ORIGINAL VS NEW ROLE ASSIGNMENTS
-- =====================================================
SELECT 'ROLE MIGRATION COMPARISON' as check_type;
SELECT 
    e.email,
    e.role as original_role,
    e.role_new as new_role,
    o.name as organization_name,
    o.type as organization_type,
    CASE 
        WHEN e.role_new = 'admin' THEN 'System Administrator'
        WHEN e.role_new = 'developer' THEN 'Project Developer'
        WHEN e.role_new = 'agent' THEN 'Real Estate Agent'
        ELSE 'Unknown'
    END as role_description
FROM employees e
JOIN organizations o ON e.organization_id = o.id
ORDER BY o.type, e.role_new, e.created_at;

-- =====================================================
-- 5. ROLE DISTRIBUTION SUMMARY
-- =====================================================
SELECT 'ROLE DISTRIBUTION SUMMARY' as check_type;
SELECT 
    role_new as new_role,
    COUNT(*) as user_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM employees), 2) as percentage
FROM employees 
WHERE role_new IS NOT NULL
GROUP BY role_new
ORDER BY user_count DESC;

-- =====================================================
-- 6. ORGANIZATION TYPE VS ROLE MAPPING
-- =====================================================
SELECT 'ORGANIZATION TYPE VS ROLE MAPPING' as check_type;
SELECT 
    o.type as organization_type,
    e.role_new as assigned_role,
    COUNT(*) as user_count
FROM employees e
JOIN organizations o ON e.organization_id = o.id
GROUP BY o.type, e.role_new
ORDER BY o.type, e.role_new;

-- =====================================================
-- 7. IDENTIFY SYSTEM ADMINISTRATORS
-- =====================================================
SELECT 'SYSTEM ADMINISTRATORS IDENTIFIED' as check_type;
SELECT 
    e.email,
    e.first_name,
    e.last_name,
    e.role as original_role,
    e.role_new,
    o.name as organization_name,
    o.type as organization_type,
    e.created_at,
    CASE 
        WHEN e.email LIKE '%admin%' THEN 'Admin by email pattern'
        WHEN e.email LIKE '%system%' THEN 'System by email pattern'
        WHEN e.role = 'admin' AND o.type = 'developer' THEN 'Developer org admin'
        ELSE 'Other criteria'
    END as admin_reason
FROM employees e
JOIN organizations o ON e.organization_id = o.id
WHERE e.role_new = 'admin'
ORDER BY e.created_at;

-- =====================================================
-- 8. CHECK FOR DATA INTEGRITY ISSUES
-- =====================================================
SELECT 'DATA INTEGRITY CHECKS' as check_type;

-- Check for NULL role_new values (should be 0)
SELECT 'NULL role_new count' as issue_type, COUNT(*) as count
FROM employees WHERE role_new IS NULL
UNION ALL

-- Check for mismatched org types and roles
SELECT 'Agent org users with non-agent roles' as issue_type, COUNT(*) as count
FROM employees e
JOIN organizations o ON e.organization_id = o.id
WHERE o.type = 'agent' AND e.role_new != 'agent'
UNION ALL

-- Check for too many system admins (should be < 10)
SELECT 'System admin count' as issue_type, COUNT(*) as count
FROM employees WHERE role_new = 'admin';

-- =====================================================
-- 9. MIGRATION ACTIVITY LOG
-- =====================================================
SELECT 'MIGRATION ACTIVITY LOG' as check_type;
SELECT 
    action,
    entity_type,
    details,
    created_at
FROM activity_logs 
WHERE action IN ('migration_start', 'role_migration', 'migration_phase_complete')
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- 10. DETAILED ROLE CHANGE ANALYSIS
-- =====================================================
SELECT 'DETAILED ROLE CHANGE ANALYSIS' as check_type;
SELECT 
    original.role as old_role,
    current.role_new as new_role,
    COUNT(*) as change_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM employees), 2) as percentage
FROM employees current
JOIN employees_role_backup original ON current.id = original.id
GROUP BY original.role, current.role_new
ORDER BY change_count DESC;

-- =====================================================
-- 11. SAMPLE USERS BY ROLE (for manual verification)
-- =====================================================
SELECT 'SAMPLE USERS BY ROLE' as check_type;
(SELECT 'admin' as role_type, email, first_name, last_name, 
 (SELECT name FROM organizations WHERE id = organization_id) as org_name
 FROM employees WHERE role_new = 'admin' LIMIT 5)
UNION ALL
(SELECT 'developer' as role_type, email, first_name, last_name,
 (SELECT name FROM organizations WHERE id = organization_id) as org_name
 FROM employees WHERE role_new = 'developer' LIMIT 5)
UNION ALL
(SELECT 'agent' as role_type, email, first_name, last_name,
 (SELECT name FROM organizations WHERE id = organization_id) as org_name
 FROM employees WHERE role_new = 'agent' LIMIT 5)
ORDER BY role_type, email;

-- =====================================================
-- 12. FUNCTIONS CREATED DURING MIGRATION
-- =====================================================
SELECT 'MIGRATION FUNCTIONS CREATED' as check_type;
SELECT 
    routine_name as function_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_name IN (
    'migrate_user_roles',
    'validate_three_role_migration',
    'show_role_mapping_details',
    'rollback_role_migration',
    'prepare_phase2_service_updates',
    'identify_potential_system_admins'
)
ORDER BY routine_name;

-- =====================================================
-- 13. INDEXES CREATED
-- =====================================================
SELECT 'INDEXES CREATED' as check_type;
SELECT 
    indexname as index_name,
    tablename as table_name,
    indexdef as index_definition
FROM pg_indexes 
WHERE indexname = 'idx_employees_role_new';

-- =====================================================
-- 14. VIEWS CREATED
-- =====================================================
SELECT 'VIEWS CREATED' as check_type;
SELECT 
    table_name as view_name,
    view_definition
FROM information_schema.views 
WHERE table_name = 'role_migration_analysis';

-- =====================================================
-- SUMMARY VALIDATION QUERY
-- =====================================================
SELECT 'FINAL VALIDATION SUMMARY' as check_type;
SELECT 
    'Total employees' as metric, 
    COUNT(*) as value,
    'Should match original count' as note
FROM employees
UNION ALL
SELECT 
    'Employees with new roles assigned' as metric,
    COUNT(*) as value,
    'Should equal total employees' as note
FROM employees WHERE role_new IS NOT NULL
UNION ALL
SELECT 
    'System admins' as metric,
    COUNT(*) as value,
    'Should be 1-5 users' as note
FROM employees WHERE role_new = 'admin'
UNION ALL
SELECT 
    'Developers' as metric,
    COUNT(*) as value,
    'Should be majority of users' as note
FROM employees WHERE role_new = 'developer'
UNION ALL
SELECT 
    'Agents' as metric,
    COUNT(*) as value,
    'Should be agent org users' as note
FROM employees WHERE role_new = 'agent';

-- =====================================================
-- READY FOR PHASE 2 CHECK
-- =====================================================
SELECT 'READY FOR PHASE 2?' as check_type;
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM employees WHERE role_new IS NULL) = 0 
        AND (SELECT COUNT(*) FROM employees WHERE role_new = 'admin') <= 5
        AND (SELECT COUNT(*) FROM employees WHERE role_new = 'admin') >= 1
        THEN 'YES - Ready for Phase 2 (Service Layer Updates)'
        ELSE 'NO - Fix issues above before proceeding'
    END as status;

