-- Migration 034: Add Admin to Organization Type Enum (MINIMAL)
-- This migration ONLY adds the enum value, nothing else

ALTER TYPE organization_type ADD VALUE 'admin';

