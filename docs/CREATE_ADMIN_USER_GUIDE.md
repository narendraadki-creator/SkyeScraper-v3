# Create Admin User Guide

## Overview
This guide shows how to create an admin user in the SkyeScraper database to access the admin dashboard.

## Prerequisites
- Access to Supabase SQL Editor or database client
- RLS should be disabled for testing (migration 030 applied)
- Understanding of the database schema

## Method 1: Direct SQL Insert (Recommended for Testing)

### Step 1: Create Organization for Admin
```sql
-- Insert admin organization
INSERT INTO organizations (
    id,
    name,
    type,
    status,
    contact_email,
    contact_phone,
    address,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'SkyeScraper Admin',
    'developer', -- Admin users are typically under developer type
    'active',
    'admin@skyescraper.com',
    '+971-50-123-4567',
    'Dubai, UAE',
    NOW(),
    NOW()
);
```

### Step 2: Get the Organization ID
```sql
-- Get the organization ID we just created
SELECT id, name FROM organizations WHERE name = 'SkyeScraper Admin';
```

### Step 3: Create Admin User in Supabase Auth
Go to Supabase Dashboard > Authentication > Users and create a new user:
- Email: `admin@skyescraper.com`
- Password: `AdminPass123!` (or your preferred password)
- Email Confirmed: ✅ (check this box)

**OR** use SQL to create auth user:
```sql
-- This requires admin access to auth schema
-- Usually done through Supabase Dashboard instead
```

### Step 4: Get the Auth User ID
After creating the user in Supabase Auth, get the user ID:
```sql
-- Check auth.users table (may require admin privileges)
SELECT id, email FROM auth.users WHERE email = 'admin@skyescraper.com';
```

### Step 5: Create Employee Record with Admin Role
```sql
-- Replace 'YOUR_ORG_ID' with the organization ID from Step 2
-- Replace 'YOUR_AUTH_USER_ID' with the auth user ID from Step 4
INSERT INTO employees (
    id,
    user_id,
    organization_id,
    employee_code,
    first_name,
    last_name,
    email,
    role,
    status,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'YOUR_AUTH_USER_ID', -- Replace with actual auth user ID
    'YOUR_ORG_ID', -- Replace with actual organization ID
    'ADMIN001',
    'System',
    'Administrator',
    'admin@skyescraper.com',
    'admin', -- This is the key: role must be 'admin'
    'active',
    NOW(),
    NOW()
);
```

## Method 2: Complete SQL Script (All in One)

Here's a complete script that creates everything at once:

```sql
-- Step 1: Create admin organization
WITH new_org AS (
    INSERT INTO organizations (
        id,
        name,
        type,
        status,
        contact_email,
        contact_phone,
        address,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        'SkyeScraper Admin',
        'developer',
        'active',
        'admin@skyescraper.com',
        '+971-50-123-4567',
        'Dubai, UAE',
        NOW(),
        NOW()
    ) RETURNING id
)
-- Step 2: Create employee record (you'll need to update user_id after creating auth user)
INSERT INTO employees (
    id,
    user_id,
    organization_id,
    employee_code,
    first_name,
    last_name,
    email,
    role,
    status,
    created_at,
    updated_at
) 
SELECT 
    gen_random_uuid(),
    'PLACEHOLDER_USER_ID', -- You'll need to update this after creating auth user
    new_org.id,
    'ADMIN001',
    'System',
    'Administrator',
    'admin@skyescraper.com',
    'admin',
    'active',
    NOW(),
    NOW()
FROM new_org;
```

Then update the user_id after creating the auth user:
```sql
-- Update with actual auth user ID
UPDATE employees 
SET user_id = 'YOUR_ACTUAL_AUTH_USER_ID'
WHERE email = 'admin@skyescraper.com' AND role = 'admin';
```

## Method 3: Using Registration Flow (If Working)

If your registration system is working properly:

1. Go to `/register`
2. Fill out the form:
   - Organization Name: `SkyeScraper Admin`
   - Organization Type: `Developer`
   - First Name: `System`
   - Last Name: `Administrator`
   - Email: `admin@skyescraper.com`
   - Password: `AdminPass123!`
3. After registration, manually update the role in the database:

```sql
UPDATE employees 
SET role = 'admin' 
WHERE email = 'admin@skyescraper.com';
```

## Method 4: Quick Test Setup

For quick testing, you can promote an existing user to admin:

```sql
-- Find existing user
SELECT e.id, e.email, e.role, e.user_id 
FROM employees e 
WHERE e.email = 'your-existing-email@example.com';

-- Promote to admin
UPDATE employees 
SET role = 'admin' 
WHERE email = 'your-existing-email@example.com';
```

## Verification Steps

After creating the admin user, verify everything is set up correctly:

### Step 1: Check Organization
```sql
SELECT * FROM organizations WHERE name = 'SkyeScraper Admin';
```

### Step 2: Check Employee Record
```sql
SELECT 
    e.id,
    e.user_id,
    e.email,
    e.role,
    e.status,
    o.name as organization_name
FROM employees e
JOIN organizations o ON e.organization_id = o.id
WHERE e.role = 'admin';
```

### Step 3: Check Auth User
```sql
-- This may require admin access
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'admin@skyescraper.com';
```

### Step 4: Test Login
1. Go to `/login`
2. Login with admin credentials
3. Check that you're redirected to `/dashboard`
4. Verify admin quick actions appear in dashboard
5. Try navigating to `/admin`

## Troubleshooting

### Issue: "Access Denied" when accessing /admin

**Solution**: Check the employee role:
```sql
SELECT e.email, e.role, e.user_id 
FROM employees e 
WHERE e.email = 'admin@skyescraper.com';
```

Make sure `role = 'admin'` exactly.

### Issue: Login fails

**Solutions**:
1. Check if email is confirmed in Supabase Auth
2. Verify password is correct
3. Check if user exists in auth.users table

### Issue: Employee record not found

**Solution**: Check the user_id matches between auth.users and employees:
```sql
-- Check auth user
SELECT id, email FROM auth.users WHERE email = 'admin@skyescraper.com';

-- Check employee record
SELECT user_id, email FROM employees WHERE email = 'admin@skyescraper.com';
```

The `user_id` in employees table must match the `id` in auth.users table.

### Issue: RLS blocking access

**Solution**: Ensure RLS is disabled for testing:
```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('organizations', 'employees');

-- If RLS is enabled, disable it temporarily
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **Use Strong Passwords**: Admin accounts should have strong, unique passwords
2. **Enable Email Confirmation**: Ensure admin email is confirmed
3. **Limit Admin Users**: Only create admin users when necessary
4. **Monitor Admin Activity**: Keep track of admin actions
5. **Re-enable RLS**: After testing, re-enable RLS for production

## Quick Commands Summary

```sql
-- 1. Create organization and get ID
INSERT INTO organizations (id, name, type, status, contact_email) 
VALUES (gen_random_uuid(), 'SkyeScraper Admin', 'developer', 'active', 'admin@skyescraper.com') 
RETURNING id;

-- 2. Create auth user in Supabase Dashboard UI

-- 3. Create employee with admin role
INSERT INTO employees (id, user_id, organization_id, employee_code, first_name, last_name, email, role, status) 
VALUES (gen_random_uuid(), 'AUTH_USER_ID', 'ORG_ID', 'ADMIN001', 'System', 'Administrator', 'admin@skyescraper.com', 'admin', 'active');

-- 4. Verify setup
SELECT e.email, e.role, o.name 
FROM employees e 
JOIN organizations o ON e.organization_id = o.id 
WHERE e.role = 'admin';
```

## Test Credentials

After setup, you can login with:
- **Email**: `admin@skyescraper.com`
- **Password**: `AdminPass123!` (or whatever you set)
- **Role**: `admin`
- **Access**: Full admin dashboard at `/admin`
