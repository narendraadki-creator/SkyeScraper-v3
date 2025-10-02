# RLS Policy Fix Guide

## Current Issue
The registration is failing due to RLS (Row Level Security) policies blocking employee data creation and retrieval.

## Quick Fix Options

### Option 1: Disable RLS Temporarily (Recommended for Testing)
Run this SQL in your Supabase SQL Editor:
```sql
-- File: supabase/migrations/030_disable_rls_for_testing.sql
-- This disables RLS on all tables to allow registration to work
```

### Option 2: Comprehensive RLS Fix
Run this SQL in your Supabase SQL Editor:
```sql
-- File: supabase/migrations/029_comprehensive_rls_fix.sql
-- This creates clean, working RLS policies
```

## Step-by-Step Fix

### Step 1: Apply RLS Fix
1. **Go to Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste** the content from `030_disable_rls_for_testing.sql`
4. **Run the SQL**

### Step 2: Test Registration
1. **Try registration again**
2. **Check console logs** for successful creation
3. **Verify** organization and employee records are created

### Step 3: Test Login
1. **Check email** for confirmation link
2. **Click confirmation link**
3. **Login** with the created account
4. **Verify dashboard loads** properly

## Expected Results After Fix

### Console Logs Should Show:
```
Starting registration process...
Form data: {...}
Auth error: null
Organization creation result: {data: {...}, error: null}
Creating employee record with data: {...}
Employee creation result: {data: {...}, error: null}
Registration successful
Created organization: {...}
```

### Database Should Have:
- ✅ **User record** in `auth.users`
- ✅ **Organization record** in `organizations` table
- ✅ **Employee record** in `employees` table

## Troubleshooting

### If you still get errors:

1. **Check Supabase Dashboard**:
   - Go to Authentication > Users
   - Check if user was created
   - Go to Table Editor > organizations
   - Check if organization was created
   - Go to Table Editor > employees
   - Check if employee record was created

2. **Check Console Logs**:
   - Look for specific error messages
   - Check network tab for failed requests

3. **Manual Database Check**:
   ```sql
   -- Check if user exists
   SELECT * FROM auth.users WHERE email = 'your-email@example.com';
   
   -- Check if organization exists
   SELECT * FROM organizations WHERE contact_email = 'your-email@example.com';
   
   -- Check if employee exists
   SELECT * FROM employees WHERE email = 'your-email@example.com';
   ```

## Re-enabling RLS (For Production)

After testing is complete, you can re-enable RLS with proper policies:

```sql
-- Re-enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Add proper policies (use migration 029_comprehensive_rls_fix.sql)
```

## Why This Happens

RLS policies can be complex and sometimes conflict with each other. The temporary disable approach allows us to:
1. **Test the registration flow** without RLS interference
2. **Verify the data is created correctly**
3. **Then implement proper RLS policies** once everything works

The registration should work immediately after applying the RLS fix! 🎉
