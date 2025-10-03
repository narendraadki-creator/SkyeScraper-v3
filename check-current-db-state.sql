-- Check Current Database State Before Phase 1 Migration
-- Run this to see what's currently in the database

-- =====================================================
-- 1. CHECK CURRENT ROLE ENUM (should be the old one)
-- =====================================================
SELECT 'CURRENT ROLE ENUM' as check_type;
SELECT 
    typname as enum_name,
    unnest(enum_range(NULL::user_role)) as current_enum_values
FROM pg_type 
WHERE typname = 'user_role';

-- =====================================================
-- 2. CHECK EMPLOYEES TABLE STRUCTURE
-- =====================================================
SELECT 'EMPLOYEES TABLE COLUMNS' as check_type;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'employees' 
ORDER BY ordinal_position;

-- =====================================================
-- 3. CHECK CURRENT ROLE DISTRIBUTION
-- =====================================================
SELECT 'CURRENT ROLE DISTRIBUTION' as check_type;
SELECT 
    role,
    COUNT(*) as count
FROM employees 
GROUP BY role
ORDER BY count DESC;

-- =====================================================
-- 4. CHECK ORGANIZATION TYPES AND EMPLOYEE ROLES
-- =====================================================
SELECT 'ORGANIZATION TYPE VS CURRENT ROLES' as check_type;
SELECT 
    o.type as organization_type,
    e.role as current_role,
    COUNT(*) as user_count
FROM employees e
JOIN organizations o ON e.organization_id = o.id
GROUP BY o.type, e.role
ORDER BY o.type, e.role;

-- =====================================================
-- 5. SAMPLE OF CURRENT USERS (for migration planning)
-- =====================================================
SELECT 'SAMPLE CURRENT USERS' as check_type;
SELECT 
    e.email,
    e.role as current_role,
    o.name as organization_name,
    o.type as organization_type,
    e.created_at
FROM employees e
JOIN organizations o ON e.organization_id = o.id
ORDER BY o.type, e.role, e.created_at
LIMIT 20;

-- =====================================================
-- 6. CHECK IF PHASE 1 MIGRATION OBJECTS EXIST
-- =====================================================
SELECT 'PHASE 1 MIGRATION STATUS' as check_type;

-- Check if new enum exists
SELECT 
    'user_role_new enum' as object_name,
    CASE WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_new') 
         THEN 'EXISTS' ELSE 'NOT EXISTS' END as status
UNION ALL

-- Check if role_new column exists
SELECT 
    'role_new column' as object_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'employees' AND column_name = 'role_new') 
         THEN 'EXISTS' ELSE 'NOT EXISTS' END as status
UNION ALL

-- Check if backup table exists
SELECT 
    'employees_role_backup table' as object_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables 
                     WHERE table_name = 'employees_role_backup') 
         THEN 'EXISTS' ELSE 'NOT EXISTS' END as status
UNION ALL

-- Check if migration functions exist
SELECT 
    'migrate_user_roles function' as object_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.routines 
                     WHERE routine_name = 'migrate_user_roles') 
         THEN 'EXISTS' ELSE 'NOT EXISTS' END as status;

-- =====================================================
-- 7. TOTAL COUNTS FOR BASELINE
-- =====================================================
SELECT 'BASELINE COUNTS' as check_type;
SELECT 
    'Total Organizations' as metric,
    COUNT(*) as count
FROM organizations
UNION ALL
SELECT 
    'Total Employees' as metric,
    COUNT(*) as count
FROM employees
UNION ALL
SELECT 
    'Developer Organizations' as metric,
    COUNT(*) as count
FROM organizations WHERE type = 'developer'
UNION ALL
SELECT 
    'Agent Organizations' as metric,
    COUNT(*) as count
FROM organizations WHERE type = 'agent';

-- =====================================================
-- READY FOR PHASE 1 MIGRATION?
-- =====================================================
SELECT 'READY FOR PHASE 1 MIGRATION?' as status;
SELECT 
    CASE 
        WHEN NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_new')
        AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'employees' AND column_name = 'role_new')
        THEN '✅ YES - Database is ready for Phase 1 migration'
        ELSE '❌ NO - Phase 1 migration already started or partially completed'
    END as migration_status;

