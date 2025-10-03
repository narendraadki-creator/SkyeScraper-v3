-- migrations/038_add_developer_to_user_role_enum.sql
-- Add 'developer' to the user_role enum to support the new three-role system

-- Add 'developer' to the user_role enum
ALTER TYPE user_role ADD VALUE 'developer';

-- Verify the enum values
SELECT unnest(enum_range(NULL::user_role)) as role_values;
