# Registration Test Guide

## Issue Fixed
The "Create Organization" button was not working because:
1. **Missing organization creation logic** - Only user account was being created
2. **Missing RLS policies** - No INSERT policy for organizations table
3. **Incomplete registration flow** - Employee record wasn't being created

## What's Been Fixed

### 1. Complete Registration Flow
- ✅ **User account creation** via Supabase Auth
- ✅ **Organization creation** in organizations table
- ✅ **Employee record creation** linking user to organization
- ✅ **Proper error handling** with detailed error messages
- ✅ **Success feedback** with green success message

### 2. RLS Policy Fix
- ✅ **Organization INSERT policy** - Allows new organization creation
- ✅ **Employee INSERT policy** - Allows employee record creation
- ✅ **Maintains security** - Users can only see their own data

### 3. Enhanced Error Handling
- ✅ **Detailed error messages** showing specific failure reasons
- ✅ **Console logging** for debugging
- ✅ **Form validation** with real-time feedback
- ✅ **Success/error styling** - Green for success, red for errors

## Test Steps

### 1. Run the RLS Migration
First, apply the RLS policy fix:
```sql
-- Run this in Supabase SQL Editor
-- File: supabase/migrations/027_fix_organization_insert_policy.sql
```

### 2. Test Agent Registration
1. **Go to registration page** (`/register`)
2. **Fill out the form**:
   - First Name: "Agent"
   - Last Name: "Test"
   - Email: "agent@test.com"
   - Password: "password123"
   - Confirm Password: "password123"
   - Organization Name: "Test Agent Company"
   - Organization Type: "Real Estate Agent"
   - Contact Phone: "+971501234567"
   - Website: "https://testagent.com"
   - Address: "Dubai, UAE"
   - Description: "Test agent organization"
3. **Click "Create Organization"**
4. **Expected Result**: Green success message

### 3. Test Developer Registration
1. **Fill out the form** with developer details:
   - Organization Type: "Developer"
   - Organization Name: "Test Developer Company"
2. **Click "Create Organization"**
3. **Expected Result**: Green success message

### 4. Test Validation
1. **Leave Organization Name empty**
2. **Click "Create Organization"**
3. **Expected Result**: Red error "Organization name is required"

### 5. Test Email Confirmation
1. **Check email** for confirmation link
2. **Click confirmation link**
3. **Try to login** with the created account

## Troubleshooting

### Common Issues:

#### 1. "Failed to create organization" Error
- **Check**: RLS policies are applied
- **Solution**: Run the migration `027_fix_organization_insert_policy.sql`

#### 2. "Failed to create employee record" Error
- **Check**: User account was created successfully
- **Solution**: Check console logs for specific error

#### 3. "Registration failed" Error
- **Check**: Email is valid and not already used
- **Solution**: Try with a different email address

#### 4. Form Validation Errors
- **Check**: All required fields are filled
- **Solution**: Fill in Organization Name and other required fields

### Debug Steps:
1. **Open browser console** (F12)
2. **Try registration**
3. **Check console logs** for detailed error messages
4. **Check network tab** for failed requests

## Expected Database Records

After successful registration, you should see:

### 1. Organizations Table
```sql
SELECT * FROM organizations WHERE name = 'Test Agent Company';
```

### 2. Employees Table
```sql
SELECT * FROM employees WHERE email = 'agent@test.com';
```

### 3. Auth Users
```sql
SELECT * FROM auth.users WHERE email = 'agent@test.com';
```

## Success Criteria
- ✅ Form validation works
- ✅ Organization is created in database
- ✅ Employee record is created
- ✅ User can login after email confirmation
- ✅ User has correct role and organization access
- ✅ Error messages are helpful and specific

## Next Steps
After successful registration:
1. **Login** with the created account
2. **Verify dashboard** shows correct organization info
3. **Test agent workflows** (browse projects, create leads)
4. **Test developer workflows** (create projects, manage units)
