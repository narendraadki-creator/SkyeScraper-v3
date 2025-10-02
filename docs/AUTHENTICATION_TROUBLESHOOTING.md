# Authentication Troubleshooting Guide

## 🚨 **Current Issues & Solutions**

### **Issue 1: 401 Unauthorized on Organizations Table**

**Error**: `POST https://tnqcujrojfgeinvkovce.supabase.co/rest/v1/organizations?select=* 401 (Unauthorized)`

**Cause**: Missing RLS INSERT policy for organizations table

**Solution**: Run the new migration file `009_fix_rls_policies.sql` in Supabase SQL editor

### **Issue 2: 403 Forbidden on Admin User Deletion**

**Error**: `DELETE https://tnqcujrojfgeinvkovce.supabase.co/auth/v1/admin/users/... 403 (Forbidden)`

**Cause**: Trying to use admin functions without service role key

**Solution**: Removed admin user deletion from auth service (fixed in code)

## 🔧 **Step-by-Step Fix**

### **Step 1: Run the RLS Fix Migration**

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `supabase/migrations/009_fix_rls_policies.sql`
5. Run the query

### **Step 2: Verify Environment Variables**

1. Check that your `.env` file exists and has correct values:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. Restart the development server:
   ```bash
   npm run dev
   ```

### **Step 3: Test the Fix**

1. Go to `http://localhost:5173/auth-test`
2. Click "Run Authentication Tests"
3. Check the results for any remaining issues

### **Step 4: Test Registration**

1. Go to `http://localhost:5173/register`
2. Try registering a new organization
3. Check browser console for any errors

## 🧪 **Testing Checklist**

### **Before Testing**
- [ ] RLS fix migration has been run
- [ ] Environment variables are configured
- [ ] Development server is running
- [ ] No console errors on page load

### **Test Registration**
- [ ] Go to `/register`
- [ ] Fill out the form completely
- [ ] Submit registration
- [ ] Should redirect to dashboard
- [ ] Check browser console for errors

### **Test Login**
- [ ] Go to `/login`
- [ ] Use the credentials from registration
- [ ] Should redirect to dashboard
- [ ] Check browser console for errors

### **Test Dashboard**
- [ ] Should see organization information
- [ ] Should see user information
- [ ] Should see role-based theming
- [ ] Debug section should show all data

## 🔍 **Debug Information**

### **Check Supabase Dashboard**

1. **Organizations Table**:
   - Go to Table Editor > organizations
   - Should see your registered organization
   - Check that RLS is enabled

2. **Employees Table**:
   - Go to Table Editor > employees
   - Should see your employee record
   - Check that user_id matches auth user

3. **Auth Users**:
   - Go to Authentication > Users
   - Should see your registered user
   - Check that email matches

### **Check Browser Console**

1. **Registration Process**:
   ```
   Starting sign up process for: your-email@example.com
   User created successfully: user-id
   Creating organization: Organization Name
   Creating employee record for user: user-id
   Registration completed successfully
   ```

2. **No Errors**:
   - Should not see 401 or 403 errors
   - Should not see RLS policy errors
   - Should not see network errors

### **Check Local Storage**

1. Open DevTools > Application > Local Storage
2. Look for Supabase auth tokens
3. Should see `sb-<project>-auth-token`

## 🚨 **Common Issues & Solutions**

### **Issue: Still Getting 401 Errors**

**Solution**: 
1. Verify the RLS migration was run successfully
2. Check that the policies were created:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'organizations';
   ```

### **Issue: Environment Variables Not Loading**

**Solution**:
1. Make sure `.env` file is in the root directory
2. Restart the development server
3. Check that variables start with `VITE_`

### **Issue: Registration Succeeds But Login Fails**

**Solution**:
1. Check that employee record was created
2. Verify user_id matches in employees table
3. Check that employee status is 'active'

### **Issue: Dashboard Shows No Data**

**Solution**:
1. Check that all three records exist (user, employee, organization)
2. Verify foreign key relationships
3. Check RLS policies allow reading the data

## 📋 **Verification Queries**

Run these in Supabase SQL Editor to verify everything is working:

### **Check Organizations**
```sql
SELECT id, name, type, status, created_by, created_at 
FROM organizations 
ORDER BY created_at DESC 
LIMIT 5;
```

### **Check Employees**
```sql
SELECT id, organization_id, user_id, first_name, last_name, role, status 
FROM employees 
ORDER BY created_at DESC 
LIMIT 5;
```

### **Check RLS Policies**
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('organizations', 'employees')
ORDER BY tablename, policyname;
```

## ✅ **Success Indicators**

The authentication system is working correctly when:

- ✅ Registration creates all three records (user, organization, employee)
- ✅ Login loads all user data correctly
- ✅ Dashboard displays organization and user information
- ✅ No 401 or 403 errors in console
- ✅ JWT token is stored in localStorage
- ✅ RLS policies are working (blocking unauthorized access)
- ✅ Role-based theming displays correctly

## 🆘 **Still Having Issues?**

If you're still experiencing problems:

1. **Check the Auth Test Page**: Go to `/auth-test` and run the diagnostic tests
2. **Verify Database Schema**: Make sure all 8 migrations were run successfully
3. **Check Supabase Project Status**: Ensure your project is active and not paused
4. **Review Console Logs**: Look for any error messages or warnings
5. **Test with Simple Data**: Try with minimal form data first

The authentication system should work correctly after applying these fixes! 🚀
