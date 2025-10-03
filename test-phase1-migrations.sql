-- Test Script for Three-Role System Phase 1 Migrations
-- Run this in a test database to validate the migration process

-- Test Setup: Create sample data
INSERT INTO organizations (id, name, type, status, contact_email, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Test Developer Co', 'developer', 'active', 'dev@test.com', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Test Agent Co', 'agent', 'active', 'agent@test.com', NOW(), NOW());

INSERT INTO employees (id, organization_id, email, role, first_name, last_name, created_at, updated_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'admin@test.com', 'admin', 'Test', 'Admin', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'dev@test.com', 'manager', 'Test', 'Developer', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'agent@test.com', 'agent', 'Test', 'Agent', NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'system.admin@test.com', 'admin', 'System', 'Admin', NOW(), NOW());

-- Show initial state
SELECT 'INITIAL STATE:' as status;
SELECT e.email, e.role, o.type as org_type FROM employees e JOIN organizations o ON e.organization_id = o.id;

-- Run Migration 031 (Preparation)
\echo 'Running Migration 031...'
\i supabase/migrations/031_three_role_system_phase1_preparation.sql

-- Check preparation results
SELECT 'AFTER MIGRATION 031:' as status;
SELECT * FROM role_migration_analysis;

-- Run Migration 032 (Data Migration)  
\echo 'Running Migration 032...'
\i supabase/migrations/032_three_role_system_phase1_data_migration.sql

-- Check migration results
SELECT 'AFTER MIGRATION 032:' as status;
SELECT e.email, e.role, e.role_new, o.type as org_type FROM employees e JOIN organizations o ON e.organization_id = o.id;

-- Run Migration 033 (Validation)
\echo 'Running Migration 033...'
\i supabase/migrations/033_three_role_system_phase1_validation.sql

-- Final validation
SELECT 'FINAL VALIDATION:' as status;
SELECT * FROM validate_three_role_migration();

-- Test rollback function
SELECT 'TESTING ROLLBACK:' as status;
SELECT rollback_role_migration();

-- Verify rollback
SELECT 'AFTER ROLLBACK:' as status;
SELECT e.email, e.role, e.role_new, o.type as org_type FROM employees e JOIN organizations o ON e.organization_id = o.id;

-- Cleanup test data
DELETE FROM employees WHERE organization_id IN ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002');
DELETE FROM organizations WHERE id IN ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002');

SELECT 'TEST COMPLETE' as status;



