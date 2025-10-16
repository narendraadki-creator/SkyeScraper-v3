-- Test script to verify the migration will work
-- This simulates the migration without actually running it

-- Check if units table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'units';

-- Check current units table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'units' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if unit_status enum exists
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'unit_status')
ORDER BY enumsortorder;

-- Check if new columns already exist
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'units' 
AND table_schema = 'public'
AND column_name IN ('unit_code', 'area_total', 'area_suite', 'area_balcony', 'unit_view', 'tower', 'raw_data');


