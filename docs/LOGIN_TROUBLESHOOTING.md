# Login Troubleshooting Guide

## 🚨 **Current Issue**

Registration worked successfully, but login is failing with:
```
POST https://tnqcujrojfgeinvkovce.supabase.co/auth/v1/token?grant_type=password 400 (Bad Request)
```

## 🔍 **Possible Causes**

### **1. Email Confirmation Required**
Supabase might require email confirmation before allowing login.

### **2. User Account Not Created Properly**
The registration might have succeeded partially but failed to create the auth user.

### **3. Wrong Credentials**
The email/password combination might be incorrect.

### **4. Supabase Auth Settings**
Email confirmation might be enabled in Supabase settings.

## 🔧 **Step-by-Step Troubleshooting**

### **Step 1: Check Supabase Auth Settings**

1. Go to your Supabase project dashboard
2. Navigate to **Authentication > Settings**
3. Check **"Enable email confirmations"** setting
4. If it's enabled, you need to either:
   - Disable it for testing, OR
   - Check your email for confirmation link

### **Step 2: Check if User Was Created**

Run this query in Supabase SQL Editor:
```sql
-- Check if the user exists in auth.users
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'your-email@example.com';
```

### **Step 3: Check Employee Record**

```sql
-- Check if employee record exists
SELECT id, user_id, first_name, last_name, email, status 
FROM employees 
WHERE email = 'your-email@example.com';
```

### **Step 4: Test Login with Debug Logging**

1. Go to `http://localhost:5173/login`
2. Try logging in with your registered credentials
3. Check browser console for debug messages:
   ```
   Starting sign in process for: your-email@example.com
   Auth signin error: [error details]
   ```

## 🚀 **Quick Fixes**

### **Fix 1: Disable Email Confirmation (For Testing)**

1. Go to Supabase Dashboard > Authentication > Settings
2. Turn OFF "Enable email confirmations"
3. Try login again

### **Fix 2: Check Email for Confirmation Link**

1. Check your email inbox
2. Look for Supabase confirmation email
3. Click the confirmation link
4. Try login again

### **Fix 3: Verify Registration Data**

Run this query to check what was actually created:
```sql
-- Check organizations
SELECT id, name, type, contact_email, created_by, created_at 
FROM organizations 
ORDER BY created_at DESC 
LIMIT 5;

-- Check employees
SELECT id, organization_id, user_id, first_name, last_name, email, status 
FROM employees 
ORDER BY created_at DESC 
LIMIT 5;

-- Check auth users
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;
```

## 📋 **Expected Results**

### **If Email Confirmation is Disabled:**
- ✅ Login should work immediately
- ✅ Should redirect to dashboard
- ✅ Dashboard should display data

### **If Email Confirmation is Enabled:**
- ✅ Check email for confirmation link
- ✅ Click confirmation link
- ✅ Then login should work

## 🔍 **Debug Information**

### **Check Browser Console**
Look for these messages during login:
```
Starting sign in process for: your-email@example.com
Auth signin error: [specific error message]
```

### **Check Network Tab**
Look at the failed request to see the exact error response.

### **Check Supabase Logs**
1. Go to Supabase Dashboard > Logs
2. Look for authentication errors
3. Check for any failed login attempts

## ✅ **Success Indicators**

Login is working when:
- ✅ No 400 Bad Request errors
- ✅ Console shows "User authenticated successfully"
- ✅ Console shows "Employee record found"
- ✅ Redirect to dashboard
- ✅ Dashboard displays organization and user data

## 🆘 **If Still Having Issues**

### **Alternative: Test with Simple Credentials**

Try registering with a simple email like:
- **Email**: `test@example.com`
- **Password**: `password123`

### **Check Supabase Project Status**

1. Go to Supabase Dashboard
2. Check if project is active (not paused)
3. Verify you're using the correct project URL and keys

The login issue should be resolved once you identify whether email confirmation is required! 🚀
