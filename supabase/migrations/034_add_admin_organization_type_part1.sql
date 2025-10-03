-- Migration 034 Part 1: Add Admin Organization Type Enum Value
-- This migration adds 'admin' as a valid organization type
-- MUST be run separately before Part 2

-- Step 1: Add 'admin' to the organization_type enum
ALTER TYPE organization_type ADD VALUE 'admin';

-- Step 2: Log the migration
INSERT INTO migration_log (migration_name, phase, status, details, created_at)
VALUES (
    '034_add_admin_organization_type_part1',
    'phase2_admin_org_setup',
    'completed',
    json_build_object(
        'enum_value_added', 'admin',
        'timestamp', NOW()
    )::jsonb,
    NOW()
);

-- Step 3: Verify the enum value was added
SELECT 'ENUM VALUE ADDED' as status;
SELECT unnest(enum_range(NULL::organization_type)) as organization_types;





