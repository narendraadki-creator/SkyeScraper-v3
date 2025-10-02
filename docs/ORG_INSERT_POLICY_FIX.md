# Organization Insert Policy Fix

## 🚨 **Problem Identified**

The registration is failing with:
```
new row violates row-level security policy for table "organizations"
```

This means the RLS policy is blocking organization creation during registration.

## 🔧 **Solution**

I've created a simple fix that allows organization and employee creation during registration.

### **Step 1: Run the Simple Fix Migration**

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `supabase/migrations/014_simple_org_insert_fix.sql`
5. Run the query

### **Step 2: Test Registration Again**

1. Go to `http://localhost:5173/register`
2. Fill out the registration form
3. Click "Register Organization"
4. Should now work without RLS policy violations

## 🔍 **What the Fix Does**

### **Allows Organization Creation**
- `org_insert_any`: Allows anyone to create organizations (needed for registration)
- `org_view_own`: Only creator can view their organization
- `org_update_own`: Only creator can update their organization

### **Allows Employee Creation**
- `emp_insert_any`: Allows anyone to create employees (needed for registration)
- `emp_view_own`: Only user can view their own employee record
- `emp_update_own`: Only user can update their own employee record

## 📋 **Expected Results After Fix**

### **Registration Should Work**
- ✅ No RLS policy violations
- ✅ Organization created successfully
- ✅ Employee created successfully
- ✅ Redirect to dashboard

### **Security Still Maintained**
- ✅ Users can only view their own data
- ✅ Users can only update their own data
- ✅ Registration process is protected

## 🚨 **If Still Having Issues**

### **Check Policy Status**
Run this query in Supabase SQL Editor:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('organizations', 'employees')
ORDER BY tablename, policyname;
```

### **Test Simple Insert**
```sql
-- This should work after the fix
INSERT INTO organizations (name, type, contact_email, created_by) 
VALUES ('Test Org', 'developer', 'test@example.com', auth.uid());
```

## ✅ **Success Indicators**

The fix is working when:
- ✅ Registration form submits successfully
- ✅ No RLS policy violation errors
- ✅ Organization and employee records created
- ✅ Redirect to dashboard works
- ✅ Dashboard displays data correctly

The organization insert policy issue should be completely resolved! 🚀
