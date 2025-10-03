# Phase 2 Testing Guide - Three-Role System Service Layer

## Overview
This guide helps you test the Phase 2 service layer updates to ensure the new three-role system is working correctly.

## 🎯 **What We're Testing**

### **Core Changes Made:**
1. ✅ **AuthContext**: New role types and helper properties
2. ✅ **RegisterPage**: Correct role assignment (developer/agent)
3. ✅ **ProjectService**: Role-based project access and permissions

### **Expected Behavior:**
- **Agents**: See published projects from all developers, cannot create/edit projects
- **Developers**: See only their own projects, can create/edit/delete their projects
- **Admins**: See all projects system-wide, full project management access

---

## 📋 **Testing Steps**

### **Step 1: Check Current Database State**

First, let's verify the role migration worked correctly:

```sql
-- Check role distribution
SELECT 
    role_new as new_role,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM employees), 2) as percentage
FROM employees 
GROUP BY role_new
ORDER BY count DESC;

-- Check specific users and their roles
SELECT 
    email,
    role as old_role,
    role_new,
    (SELECT name FROM organizations WHERE id = organization_id) as org_name,
    (SELECT type FROM organizations WHERE id = organization_id) as org_type
FROM employees 
ORDER BY role_new, email
LIMIT 20;
```

**Expected Results:**
- Most users should have `role_new` assigned
- Developer org users should have `developer` role
- Agent org users should have `agent` role
- Few users (1-5) should have `admin` role

---

### **Step 2: Test New User Registration**

#### **2.1 Test Developer Organization Registration**
1. **Navigate to**: `/register`
2. **Fill out form**:
   - Organization Type: **Developer**
   - Organization Name: "Test Developer Co"
   - Admin details: Your test email
3. **Submit registration**
4. **Check database**:
   ```sql
   -- Check the new user's role
   SELECT 
       email, 
       role, 
       role_new,
       (SELECT name FROM organizations WHERE id = organization_id) as org_name
   FROM employees 
   WHERE email = 'your-test-email@example.com';
   ```

**Expected Result:**
- `role` = `developer`
- `role_new` = `developer`
- Organization type = `developer`

#### **2.2 Test Agent Organization Registration**
1. **Use different email** for agent registration
2. **Organization Type**: **Real Estate Agent**
3. **Submit and verify**:
   ```sql
   -- Check agent user role
   SELECT 
       email, 
       role, 
       role_new,
       (SELECT type FROM organizations WHERE id = organization_id) as org_type
   FROM employees 
   WHERE email = 'your-agent-email@example.com';
   ```

**Expected Result:**
- `role` = `agent`
- `role_new` = `agent`
- Organization type = `agent`

---

### **Step 3: Test Authentication Context**

#### **3.1 Check AuthContext Properties**
1. **Login as developer user**
2. **Open browser console**
3. **Check auth context** (add this temporarily to any page):
   ```javascript
   // Add this to any component temporarily for testing
   const { role, isAdmin, isDeveloper, isAgent, canManageProjects, canViewAllProjects } = useAuth();
   console.log('Auth Context:', {
     role,
     isAdmin,
     isDeveloper, 
     isAgent,
     canManageProjects,
     canViewAllProjects
   });
   ```

**Expected Results for Developer:**
- `role`: `"developer"`
- `isAdmin`: `false`
- `isDeveloper`: `true`
- `isAgent`: `false`
- `canManageProjects`: `true`
- `canViewAllProjects`: `false`

**Expected Results for Agent:**
- `role`: `"agent"`
- `isAdmin`: `false`
- `isDeveloper`: `false`
- `isAgent`: `true`
- `canManageProjects`: `false`
- `canViewAllProjects`: `false`

---

### **Step 4: Test Project Service Access Control**

#### **4.1 Test as Developer User**
1. **Login as developer**
2. **Navigate to**: `/projects`
3. **Verify**:
   - ✅ Can see "Create Project" button
   - ✅ Can see only own organization's projects
   - ✅ Can edit/delete own projects
4. **Create a test project**:
   - Fill out project form
   - Set status to "Published"
   - Verify project appears in list

#### **4.2 Test as Agent User**
1. **Login as agent**
2. **Navigate to**: `/projects` or `/agent-projects`
3. **Verify**:
   - ❌ Cannot see "Create Project" button
   - ✅ Can see published projects from ALL developers
   - ❌ Cannot see edit/delete buttons on projects
   - ✅ Can view project details
4. **Try to access project creation**:
   - Navigate directly to `/create-project`
   - Should be redirected or show access denied

#### **4.3 Test Project API Calls**
Open browser console and test API calls:

```javascript
// Test as developer - should work
fetch('/api/projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test Project',
    location: 'Test Location',
    description: 'Test Description'
  })
});

// Test as agent - should fail
// (Same API call when logged in as agent should return error)
```

---

### **Step 5: Test Role-Based UI Elements**

#### **5.1 Dashboard Navigation**
1. **Login as each role type**
2. **Check dashboard navigation**:

**Developer should see:**
- Projects (with create/edit options)
- Units (with import/manage options)
- Files
- Settings

**Agent should see:**
- Agent Projects (browse only)
- Leads (create/manage)
- Settings

**Admin should see:**
- All developer features
- Admin Dashboard
- Organization Management
- System Analytics

#### **5.2 Project Details Page**
1. **Navigate to any project details**
2. **Verify role-based buttons**:

**Developer (own project):**
- ✅ Edit Project
- ✅ Delete Project
- ✅ Manage Units
- ✅ Add Documents

**Agent:**
- ❌ No edit/delete buttons
- ✅ View project info
- ✅ Create Lead button

**Admin:**
- ✅ All buttons available
- ✅ Can edit any project

---

### **Step 6: Test Error Handling**

#### **6.1 Test Permission Errors**
1. **As agent, try to**:
   - Access `/create-project` directly
   - Make API calls to create/update projects
   - Access developer-only endpoints

**Expected**: Proper error messages, not crashes

#### **6.2 Test Role Fallbacks**
1. **Check console for warnings** about unknown roles
2. **Verify graceful degradation** if role data is missing

---

### **Step 7: Test Backward Compatibility**

#### **7.1 Test Legacy Users**
If you have users with only `role` (no `role_new`):

```sql
-- Simulate legacy user
UPDATE employees 
SET role_new = NULL 
WHERE email = 'test-legacy@example.com';
```

1. **Login as legacy user**
2. **Verify**:
   - System still works
   - Role is determined from `role` column
   - No crashes or errors

#### **7.2 Test Role Migration**
```sql
-- Check if any users still need migration
SELECT 
    COUNT(*) as users_without_role_new,
    COUNT(CASE WHEN role_new IS NOT NULL THEN 1 END) as users_with_role_new
FROM employees;
```

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: TypeScript Errors**
**Problem**: Import errors for `UserRole` type
**Solution**: 
```typescript
import type { UserRole } from '../contexts/AuthContext';
```

### **Issue 2: Role Not Updating**
**Problem**: User role doesn't change after login
**Solution**: 
1. Clear browser localStorage
2. Check if `role_new` is set in database
3. Verify AuthContext is fetching both `role` and `role_new`

### **Issue 3: Permission Denied Errors**
**Problem**: Legitimate users getting access denied
**Solution**:
1. Check RLS policies are not interfering
2. Verify user has correct `organization_id`
3. Check role assignment logic

### **Issue 4: Agent Seeing Wrong Projects**
**Problem**: Agent sees draft projects or no projects
**Solution**:
1. Ensure test projects are set to "Published" status
2. Check project service filtering logic
3. Verify agent organization type

---

## ✅ **Success Criteria**

Phase 2 is successful when:

- [ ] **Registration**: New users get correct roles (developer/agent)
- [ ] **Authentication**: AuthContext provides correct role properties
- [ ] **Project Access**: Role-based project visibility works
- [ ] **Permissions**: Create/edit/delete permissions work correctly
- [ ] **UI Elements**: Role-based buttons show/hide properly
- [ ] **Error Handling**: Graceful errors for permission violations
- [ ] **Backward Compatibility**: Legacy users still work
- [ ] **No Crashes**: System remains stable with new role logic

---

## 📞 **If Issues Found**

1. **Document the specific issue** (screenshots, error messages)
2. **Check browser console** for JavaScript errors
3. **Check database state** with provided SQL queries
4. **Note which role/scenario** causes the problem
5. **Test rollback** if needed:
   ```sql
   -- Emergency rollback to old role system
   UPDATE employees SET role_new = NULL;
   ```

---

## 🔜 **After Testing**

Once Phase 2 testing passes:
1. **Document any issues found and fixed**
2. **Proceed to Phase 3**: UI Component Updates
3. **Plan Phase 4**: Final testing and deployment

**Ready to test!** Start with Step 1 and work through systematically. 🚀


