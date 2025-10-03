# Three-Role System Phase 1 Execution Guide

## Overview
This guide provides step-by-step instructions for executing Phase 1 of the three-role system migration: **Database Schema + Data Migration**.

## ⚠️ CRITICAL SAFETY MEASURES

### Before Starting
1. **Backup Database**: Create a full database backup
2. **Test Environment**: Run migration on a copy first
3. **Rollback Plan**: Understand rollback procedures
4. **Team Notification**: Inform team of maintenance window

### Safety Features Built-In
- ✅ **Dual Column Approach**: Old `role` column preserved during migration
- ✅ **Automatic Backup**: `employees_role_backup` table created automatically
- ✅ **Rollback Function**: `rollback_role_migration()` available if needed
- ✅ **Validation Checks**: Comprehensive validation after migration
- ✅ **Activity Logging**: All changes logged for audit trail

## 📋 Phase 1 Execution Steps

### Step 1: Run Migration 031 - Preparation
**Purpose**: Set up new role enum and temporary column

```sql
-- Run in Supabase SQL Editor
-- File: supabase/migrations/031_three_role_system_phase1_preparation.sql
```

**Expected Results**:
- ✅ New `user_role_new` enum created with 3 roles
- ✅ `role_new` column added to employees table
- ✅ Migration analysis functions created
- ✅ Backup table created

**Validation**:
```sql
-- Check new enum exists
SELECT unnest(enum_range(NULL::user_role_new));

-- Check new column exists
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'employees' AND column_name = 'role_new';

-- Analyze current role distribution
SELECT * FROM role_migration_analysis;
```

### Step 2: Run Migration 032 - Data Migration
**Purpose**: Migrate existing role data to new three-role system

```sql
-- Run in Supabase SQL Editor
-- File: supabase/migrations/032_three_role_system_phase1_data_migration.sql
```

**Expected Results**:
- ✅ All employees have `role_new` assigned
- ✅ Developer org users → `developer` role
- ✅ Agent org users → `agent` role
- ✅ System admins → `admin` role (based on email patterns)
- ✅ Migration logged in activity_logs

**Validation**:
```sql
-- Check migration results
SELECT 
    role_new,
    COUNT(*) as count
FROM employees 
GROUP BY role_new;

-- Check for NULL values (should be 0)
SELECT COUNT(*) as null_count FROM employees WHERE role_new IS NULL;

-- Review potential system admins
SELECT * FROM identify_potential_system_admins();
```

### Step 3: Run Migration 033 - Validation
**Purpose**: Validate migration and prepare for Phase 2

```sql
-- Run in Supabase SQL Editor
-- File: supabase/migrations/033_three_role_system_phase1_validation.sql
```

**Expected Results**:
- ✅ All validation checks pass
- ✅ Role distribution is logical
- ✅ System admin count is reasonable
- ✅ Phase 2 preparation complete

**Validation**:
```sql
-- Run comprehensive validation
SELECT * FROM validate_three_role_migration();

-- Review detailed mapping
SELECT * FROM show_role_mapping_details();
```

## 🔍 Post-Migration Verification

### Critical Checks

#### 1. Data Integrity Check
```sql
-- Verify no data loss
SELECT 
    'Original employees' as source, COUNT(*) as count 
FROM employees_role_backup
UNION ALL
SELECT 
    'Current employees' as source, COUNT(*) as count 
FROM employees;
```

#### 2. Role Distribution Check
```sql
-- Expected distribution for typical system:
-- - Few admins (1-5)
-- - Many developers (from developer orgs)
-- - Many agents (from agent orgs)
SELECT 
    o.type as org_type,
    e.role_new,
    COUNT(*) as count
FROM employees e
JOIN organizations o ON e.organization_id = o.id
GROUP BY o.type, e.role_new
ORDER BY o.type, e.role_new;
```

#### 3. System Admin Verification
```sql
-- Review all system admins - should be legitimate
SELECT 
    e.email,
    e.role,
    e.role_new,
    o.name as organization,
    o.type as org_type,
    e.created_at
FROM employees e
JOIN organizations o ON e.organization_id = o.id
WHERE e.role_new = 'admin'
ORDER BY e.created_at;
```

## 🚨 Troubleshooting

### Issue: Too Many System Admins
**Problem**: Migration assigned too many users to `admin` role

**Solution**:
```sql
-- Manually adjust specific users
UPDATE employees 
SET role_new = 'developer' 
WHERE role_new = 'admin' 
AND email NOT IN ('admin@skyescraper.com', 'system@company.com');
```

### Issue: Wrong Role Assignment
**Problem**: Specific users have incorrect roles

**Solution**:
```sql
-- Fix individual user
UPDATE employees 
SET role_new = 'correct_role'::user_role_new 
WHERE email = 'user@example.com';
```

### Issue: Validation Failures
**Problem**: Validation checks fail

**Solution**:
1. Review validation output
2. Fix specific issues
3. Re-run validation
4. If unfixable, use rollback

## 🔄 Rollback Procedure

### When to Rollback
- Validation checks fail
- Data integrity issues
- Unexpected role assignments
- Any critical errors

### How to Rollback
```sql
-- Execute rollback function
SELECT rollback_role_migration();

-- Verify rollback
SELECT 
    'Rollback verification' as check,
    COUNT(*) as employees_restored
FROM employees e
JOIN employees_role_backup b ON e.id = b.id
WHERE e.role = b.role;

-- Clean up if rollback successful
DROP TABLE employees_role_backup;
ALTER TABLE employees DROP COLUMN role_new;
DROP TYPE user_role_new;
```

## ✅ Success Criteria

### Phase 1 Complete When:
- [ ] All 3 migrations executed successfully
- [ ] All validation checks pass
- [ ] No NULL `role_new` values
- [ ] System admin count is reasonable (1-5)
- [ ] Developer org users have `developer` or `admin` roles
- [ ] Agent org users have `agent` roles
- [ ] Activity logs show successful migration
- [ ] Backup table exists and is complete

### Ready for Phase 2 When:
- [ ] Phase 1 success criteria met
- [ ] Manual review of system admins complete
- [ ] Team approval to proceed
- [ ] Service layer update plan reviewed

## 📊 Migration Statistics

After successful migration, you should see:

```sql
-- Expected statistics (example)
SELECT 'Migration Statistics' as report;

SELECT 
    role_new,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM employees), 2) as percentage
FROM employees 
GROUP BY role_new
ORDER BY count DESC;

-- Should show something like:
-- developer: 85% (most users)
-- agent: 12% (agent org users)  
-- admin: 3% (few system admins)
```

## 🔜 Next Steps

After Phase 1 completion:

1. **Manual Review**: Verify system admin assignments
2. **Team Approval**: Get approval to proceed to Phase 2
3. **Phase 2 Preparation**: Review service layer update plan
4. **Timeline**: Schedule Phase 2 for following week

## 📞 Support

If issues arise during migration:

1. **Check validation output** for specific error details
2. **Review troubleshooting section** for common issues
3. **Use rollback procedure** if critical issues found
4. **Document any custom fixes** for future reference

---

**Remember**: This is Phase 1 of a 4-phase migration. Take time to validate thoroughly before proceeding to Phase 2.



