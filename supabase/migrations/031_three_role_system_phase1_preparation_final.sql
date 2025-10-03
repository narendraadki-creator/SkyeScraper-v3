-- Migration 031: Three-Role System Phase 1 - Preparation (FINAL FIX)
-- This migration prepares for the three-role system transition
-- PHASE 1: Add new role enum and temporary column for safe migration

-- Step 1: Create new user_role enum with three roles
CREATE TYPE user_role_new AS ENUM ('admin', 'developer', 'agent');

-- Step 2: Add temporary column to employees table for new role system
ALTER TABLE employees ADD COLUMN role_new user_role_new;

-- Step 3: Create index on new role column for performance
CREATE INDEX idx_employees_role_new ON employees(role_new);

-- Step 4: Add comments for documentation
COMMENT ON TYPE user_role_new IS 'New three-role system: admin (system admin), developer (project creator), agent (lead manager)';
COMMENT ON COLUMN employees.role_new IS 'New role system - will replace role column after migration';

-- Step 5: Create function to help with role migration
CREATE OR REPLACE FUNCTION migrate_user_roles()
RETURNS TABLE(
    employee_id UUID,
    old_role TEXT,
    org_type TEXT,
    suggested_new_role TEXT,
    migration_notes TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.id::UUID as employee_id,
        e.role::TEXT as old_role,
        o.type::TEXT as org_type,
        CASE 
            -- System admins: Keep as admin (manual identification needed)
            WHEN e.role = 'admin' AND e.email LIKE '%admin%' THEN 'admin'
            -- Developer organization users with admin role -> developer
            WHEN e.role = 'admin' AND o.type = 'developer' THEN 'developer'
            -- Agent organization users -> agent
            WHEN e.role = 'agent' AND o.type = 'agent' THEN 'agent'
            -- Fallback cases
            WHEN e.role = 'manager' AND o.type = 'developer' THEN 'developer'
            WHEN e.role = 'staff' AND o.type = 'developer' THEN 'developer'
            WHEN e.role = 'manager' AND o.type = 'agent' THEN 'agent'
            WHEN e.role = 'staff' AND o.type = 'agent' THEN 'agent'
            ELSE 'developer' -- Default fallback
        END::TEXT as suggested_new_role,
        CASE 
            WHEN e.role = 'admin' AND e.email LIKE '%admin%' THEN 'Potential system admin - verify manually'
            WHEN e.role = 'admin' AND o.type = 'developer' THEN 'Developer org admin -> developer role'
            WHEN e.role = 'agent' AND o.type = 'agent' THEN 'Agent org user -> agent role'
            WHEN e.role IN ('manager', 'staff') THEN 'Legacy role -> mapped to org type'
            ELSE 'Default mapping applied'
        END::TEXT as migration_notes
    FROM employees e
    JOIN organizations o ON e.organization_id = o.id
    ORDER BY o.type, e.role, e.created_at;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create view to analyze current role distribution
CREATE OR REPLACE VIEW role_migration_analysis AS
SELECT 
    o.type::TEXT as organization_type,
    e.role::TEXT as old_role,
    COUNT(*) as user_count,
    ARRAY_AGG(e.email ORDER BY e.created_at) as sample_emails
FROM employees e
JOIN organizations o ON e.organization_id = o.id
GROUP BY o.type, e.role
ORDER BY o.type, e.role;

-- Step 7: Log migration start
INSERT INTO activity_logs (
    organization_id,
    user_id,
    action,
    entity_type,
    entity_id,
    details,
    created_at
) VALUES (
    NULL, -- System action
    NULL, -- System action
    'migration_start',
    'system',
    NULL,
    json_build_object(
        'migration', '031_three_role_system_phase1',
        'phase', 'preparation',
        'timestamp', NOW()
    )::jsonb,
    NOW()
);

-- Step 8: Create backup of current employee roles
CREATE TABLE employees_role_backup AS 
SELECT id, role, organization_id, email, created_at, updated_at
FROM employees;

COMMENT ON TABLE employees_role_backup IS 'Backup of employee roles before three-role system migration';

-- Output migration analysis
SELECT 'MIGRATION 031 PREPARATION COMPLETE' as status;
SELECT 'Run: SELECT * FROM role_migration_analysis; to see current role distribution' as next_step;
SELECT 'Run: SELECT * FROM migrate_user_roles(); to see suggested role mappings' as analysis_step;

