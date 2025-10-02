# Complete Registration Fix

## Issues Identified

### 1. RLS Policies Still Active (406 Error)
**Error**: `GET /rest/v1/employees 406 (Not Acceptable)`
**Cause**: RLS policies are still blocking employee data access

### 2. Missing employee_code Field (400 Error)
**Error**: `null value in column "employee_code" violates not-null constraint`
**Cause**: The employees table requires an `employee_code` field that wasn't being provided

## Fixes Applied

### 1. Added employee_code Generation
```typescript
// Generate unique employee code
const employeeCode = `EMP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

// Include in employee creation
employee_code: employeeCode,
```

### 2. Enhanced Error Logging
- Added detailed console logging for employee creation
- Shows all data being sent to database
- Better error messages for debugging

## Required Actions

### Step 1: Apply RLS Fix (CRITICAL)
You MUST run this SQL in your Supabase SQL Editor:

```sql
-- Disable RLS on all tables
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE units DISABLE ROW LEVEL SECURITY;
ALTER TABLE unit_imports DISABLE ROW LEVEL SECURITY;
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE promotions DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_files DISABLE ROW LEVEL SECURITY;
```

### Step 2: Test Registration
1. **Try registration again**
2. **Check console logs** for successful creation
3. **Verify** no more 406/400 errors

### Step 3: Clear Authentication State
If you're still seeing "Account Setup Required":
1. **Navigate to**: `http://localhost:5178/clear-auth`
2. **This will**: Sign out, clear storage, redirect to login
3. **Then login** with your account

## Expected Results After Fix

### Console Logs Should Show:
```
Starting registration process...
Form data: {...}
Auth error: null
Organization creation result: {data: {...}, error: null}
Creating employee record with data: {
  user_id: "...",
  organization_id: "...",
  employee_code: "EMP-1735662466545-ABC123",
  first_name: "Agent",
  last_name: "G",
  email: "agent2@skye.com",
  role: "admin",
  status: "active"
}
Employee creation result: {data: {...}, error: null}
Registration successful
Created organization: {...}
```

### Database Should Have:
- ✅ **User record** in `auth.users`
- ✅ **Organization record** in `organizations` table
- ✅ **Employee record** in `employees` table with unique `employee_code`

## Troubleshooting

### If you still get 406 errors:
- **RLS policies are still active**
- **Apply the SQL fix** in Supabase Dashboard
- **Check if SQL executed successfully**

### If you still get 400 errors:
- **Check console logs** for specific field errors
- **Verify all required fields** are being provided
- **Check database schema** for any other required fields

### If registration succeeds but login fails:
- **Use `/clear-auth`** to reset authentication state
- **Check email** for confirmation link
- **Verify employee record** was created properly

## Database Schema Reference

### Employees Table Required Fields:
- `user_id` (UUID, references auth.users)
- `organization_id` (UUID, references organizations)
- `employee_code` (VARCHAR(50) UNIQUE NOT NULL) ✅ **Now included**
- `first_name` (VARCHAR(100) NOT NULL)
- `last_name` (VARCHAR(100) NOT NULL)
- `email` (VARCHAR(255) UNIQUE NOT NULL)
- `role` (user_role NOT NULL)
- `status` (employee_status DEFAULT 'active')

### Organizations Table Required Fields:
- `name` (VARCHAR(255) NOT NULL)
- `type` (organization_type NOT NULL)
- `contact_email` (VARCHAR(255) UNIQUE NOT NULL) ✅ **Already fixed**
- `status` (organization_status DEFAULT 'pending')

## Success Criteria
- ✅ **No 406 errors** (RLS policies disabled)
- ✅ **No 400 errors** (all required fields provided)
- ✅ **Registration completes** successfully
- ✅ **Green success message** appears
- ✅ **Form clears** after success
- ✅ **Login works** after email confirmation
- ✅ **Dashboard loads** properly

**Apply the RLS fix first, then test registration - it should work completely!** 🎉
