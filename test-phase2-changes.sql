-- Quick Test Script for Phase 2 Changes
-- Run this to verify the current state before testing

-- =====================================================
-- 1. CHECK ROLE DISTRIBUTION AFTER PHASE 1
-- =====================================================
SELECT 'CURRENT ROLE DISTRIBUTION' as check_type;
SELECT 
    role_new as new_role,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM employees), 2) as percentage
FROM employees 
GROUP BY role_new
ORDER BY count DESC;

-- =====================================================
-- 2. CHECK SAMPLE USERS AND THEIR ROLES
-- =====================================================
SELECT 'SAMPLE USER ROLES' as check_type;
SELECT 
    email,
    role as old_role,
    role_new,
    (SELECT name FROM organizations WHERE id = organization_id) as org_name,
    (SELECT type FROM organizations WHERE id = organization_id) as org_type,
    created_at
FROM employees 
ORDER BY role_new, created_at DESC
LIMIT 15;

-- =====================================================
-- 3. CHECK ORGANIZATION TYPES
-- =====================================================
SELECT 'ORGANIZATION BREAKDOWN' as check_type;
SELECT 
    type as org_type,
    COUNT(*) as org_count,
    (SELECT COUNT(*) FROM employees WHERE organization_id IN 
     (SELECT id FROM organizations o2 WHERE o2.type = o.type)) as employee_count
FROM organizations o
GROUP BY type
ORDER BY org_count DESC;

-- =====================================================
-- 4. CHECK FOR POTENTIAL ISSUES
-- =====================================================
SELECT 'POTENTIAL ISSUES CHECK' as check_type;

-- Users without role_new (should be 0 after Phase 1)
SELECT 'Users without role_new' as issue, COUNT(*) as count
FROM employees WHERE role_new IS NULL
UNION ALL

-- Agent org users with non-agent roles
SELECT 'Agent org users with wrong role' as issue, COUNT(*) as count
FROM employees e
JOIN organizations o ON e.organization_id = o.id
WHERE o.type = 'agent' AND e.role_new != 'agent'
UNION ALL

-- Developer org users with agent roles
SELECT 'Developer org users with agent role' as issue, COUNT(*) as count
FROM employees e
JOIN organizations o ON e.organization_id = o.id
WHERE o.type = 'developer' AND e.role_new = 'agent'
UNION ALL

-- Too many system admins (should be < 10)
SELECT 'System admin count' as issue, COUNT(*) as count
FROM employees WHERE role_new = 'admin';

-- =====================================================
-- 5. CHECK PROJECTS FOR TESTING
-- =====================================================
SELECT 'PROJECTS FOR TESTING' as check_type;
SELECT 
    name,
    status,
    (SELECT name FROM organizations WHERE id = organization_id) as developer_org,
    (SELECT type FROM organizations WHERE id = organization_id) as org_type,
    created_at
FROM projects 
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- 6. READY FOR PHASE 2 TESTING?
-- =====================================================
SELECT 'PHASE 2 TESTING READINESS' as check_type;
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM employees WHERE role_new IS NULL) = 0
        AND (SELECT COUNT(*) FROM employees WHERE role_new = 'admin') BETWEEN 1 AND 10
        AND (SELECT COUNT(*) FROM employees WHERE role_new IN ('developer', 'agent')) > 0
        THEN '✅ READY - Proceed with Phase 2 testing'
        ELSE '❌ NOT READY - Fix role assignment issues first'
    END as status;

-- =====================================================
-- 7. TEST USER RECOMMENDATIONS
-- =====================================================
SELECT 'TEST USER RECOMMENDATIONS' as check_type;

-- Recommend a developer user for testing
SELECT 
    'DEVELOPER TEST USER' as user_type,
    email,
    (SELECT name FROM organizations WHERE id = organization_id) as org_name
FROM employees e
JOIN organizations o ON e.organization_id = o.id
WHERE e.role_new = 'developer' AND o.type = 'developer'
ORDER BY e.created_at DESC
LIMIT 1;

-- Recommend an agent user for testing
SELECT 
    'AGENT TEST USER' as user_type,
    email,
    (SELECT name FROM organizations WHERE id = organization_id) as org_name
FROM employees e
JOIN organizations o ON e.organization_id = o.id
WHERE e.role_new = 'agent' AND o.type = 'agent'
ORDER BY e.created_at DESC
LIMIT 1;

-- Recommend an admin user for testing (if any)
SELECT 
    'ADMIN TEST USER' as user_type,
    email,
    (SELECT name FROM organizations WHERE id = organization_id) as org_name
FROM employees e
WHERE e.role_new = 'admin'
ORDER BY e.created_at ASC
LIMIT 1;


