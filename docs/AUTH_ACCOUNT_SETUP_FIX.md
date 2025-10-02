# Fix "Account Setup Required" Issue

## Problem
After creating an agent account and logging in, you see "Account Setup Required" message instead of the dashboard.

## Root Cause
The ProtectedRoute component checks if `employeeId` and `organizationId` exist in the AuthContext. If either is missing, it shows the "Account Setup Required" message.

## Quick Fix Steps

### Step 1: Apply RLS Migration
Run this SQL in your Supabase SQL Editor:
```sql
-- File: supabase/migrations/028_fix_employee_rls_for_auth.sql
-- This fixes the RLS policies to allow authentication context to work
```

### Step 2: Check Debug Information
1. **Navigate to** `/auth-debug` (while logged in)
2. **Check the debug information** to see what's missing
3. **Look for errors** in the Employee Data or Organization Data sections

### Step 3: Verify Database Records
Check if the records were created properly:

```sql
-- Check if employee record exists
SELECT * FROM employees WHERE email = 'your-email@example.com';

-- Check if organization exists
SELECT * FROM organizations WHERE name = 'Your Organization Name';

-- Check auth user
SELECT * FROM auth.users WHERE email = 'your-email@example.com';
```

## Detailed Troubleshooting

### Scenario 1: Employee Record Missing
**Symptoms**: Employee Data shows "No employee data" or error
**Solution**: 
1. Check if registration completed successfully
2. Re-run registration with a different email
3. Manually create employee record if needed

### Scenario 2: RLS Policy Error
**Symptoms**: Employee Data shows RLS policy error
**Solution**:
1. Apply the RLS migration: `028_fix_employee_rls_for_auth.sql`
2. Check if policies are applied correctly

### Scenario 3: Organization Record Missing
**Symptoms**: Organization Data shows "No organization data"
**Solution**:
1. Check if organization was created during registration
2. Manually create organization record if needed

## Manual Fix (If Registration Failed)

If the registration didn't create the records properly, you can manually create them:

### 1. Create Organization
```sql
INSERT INTO organizations (name, type, status, contact_phone, website, address, description)
VALUES ('Your Organization Name', 'agent', 'active', '+971501234567', 'https://yourwebsite.com', 'Your Address', 'Your Description');
```

### 2. Create Employee Record
```sql
-- Get the organization ID from step 1
-- Get the user ID from auth.users table
INSERT INTO employees (user_id, organization_id, first_name, last_name, email, role, status)
VALUES ('user-id-from-auth', 'org-id-from-step1', 'Your', 'Name', 'your-email@example.com', 'admin', 'active');
```

## Debug Steps

### 1. Check Browser Console
1. **Open browser console** (F12)
2. **Look for error messages** related to employee fetch
3. **Check network tab** for failed requests

### 2. Use Debug Page
1. **Navigate to** `/auth-debug`
2. **Check all sections** for errors or missing data
3. **Click "Log to Console"** for detailed information

### 3. Check Database Directly
1. **Go to Supabase Dashboard**
2. **Check Tables**: `employees`, `organizations`, `auth.users`
3. **Verify records exist** and have correct data

## Expected Results After Fix

After applying the fix, you should see:
- ✅ **Dashboard loads** instead of "Account Setup Required"
- ✅ **Auth Context shows** employeeId, organizationId, and role
- ✅ **Debug page shows** all data correctly
- ✅ **Agent workflows** are accessible

## Prevention

To prevent this issue in the future:
1. **Always apply RLS migrations** after creating new tables
2. **Test registration flow** after any database changes
3. **Use the debug page** to verify authentication is working
4. **Check console logs** for any errors during registration

## Common Error Messages

### "Employee fetch error: new row violates row-level security policy"
**Solution**: Apply RLS migration `028_fix_employee_rls_for_auth.sql`

### "No employee data found for user"
**Solution**: Check if employee record was created during registration

### "Failed to create organization"
**Solution**: Check if RLS policies allow organization creation

## Test After Fix

1. **Logout** and **login again**
2. **Check dashboard** loads properly
3. **Navigate to** `/leads` and `/agent-projects`
4. **Verify** all agent workflows work

The issue should be resolved after applying the RLS migration! 🎉
