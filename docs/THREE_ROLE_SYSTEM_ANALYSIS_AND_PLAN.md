# Three-Role System Analysis and Implementation Plan

## Current State Analysis

### 🔍 **Current Role Implementation Issues**

#### **1. Database Schema Confusion**
- **Database ENUM**: `user_role AS ENUM ('admin', 'manager', 'agent', 'staff')` - 4 roles defined
- **TypeScript Types**: `'admin' | 'manager' | 'agent' | 'staff'` - 4 roles in types
- **Actual Usage**: Only `'admin'` and `'agent'` are used in the codebase
- **Organization Types**: `'developer'` and `'agent'` - creating confusion between user roles and org types

#### **2. Role Assignment Logic Problems**
```typescript
// In RegisterPage.tsx - PROBLEMATIC LOGIC
const employeeRole = formData.organizationType === 'developer' ? 'admin' : 'agent';
```
**Issues**:
- Developer organizations get `admin` role (should be `developer` role)
- Agent organizations get `agent` role (correct)
- No clear distinction between system admin and developer admin

#### **3. Permission Logic Inconsistencies**
```typescript
// Current logic throughout codebase
if (role === 'agent') {
  // Agent permissions
} else {
  // Everything else (admin + developers) - PROBLEMATIC
}
```

#### **4. Organization Type vs User Role Confusion**
- `organization.type` = 'developer' | 'agent' (what the organization does)
- `employee.role` = 'admin' | 'agent' (what the user can do)
- **Problem**: Developer organizations have users with 'admin' role, creating confusion

## Proposed Three-Role System

### 🎯 **Clear Role Definitions**

#### **1. System Admin (`admin`)**
**Purpose**: Super-user with system-wide oversight and management capabilities

**Permissions**:
- ✅ **View all organizations** (developers and agents)
- ✅ **Manage all organizations** (create, edit, suspend, delete)
- ✅ **View all projects** from all developers
- ✅ **Create projects** on behalf of any developer
- ✅ **Edit/delete any project** in the system
- ✅ **View all leads** from all agents
- ✅ **Manage system settings** and configurations
- ✅ **Access system analytics** and reports
- ✅ **Manage users** across all organizations

**Navigation**:
- Admin Dashboard (`/admin`)
- Organization Management (`/admin/organizations`)
- Project Oversight (`/admin/projects`)
- Lead Monitoring (`/admin/leads`)
- System Analytics (`/admin/analytics`)

#### **2. Developer (`developer`)**
**Purpose**: Real estate developer who creates and manages their own projects

**Permissions**:
- ✅ **Manage own organization** (edit details, add team members)
- ✅ **Create projects** (manual, AI-assisted)
- ✅ **View/edit/delete own projects** only
- ✅ **Manage units** for own projects
- ✅ **Upload project files** (brochures, floor plans, etc.)
- ✅ **View leads** for own projects only
- ✅ **Publish/unpublish projects** for agent visibility
- ❌ **Cannot see other developers' projects**
- ❌ **Cannot access admin functions**

**Navigation**:
- Developer Dashboard (`/dashboard`)
- My Projects (`/projects`)
- Create Project (`/projects/create`)
- Project Management (units, files, etc.)

#### **3. Agent (`agent`)**
**Purpose**: Real estate agent who browses projects and manages leads

**Permissions**:
- ✅ **Browse published projects** from all developers
- ✅ **View project details** and units
- ✅ **Create leads** for any published project
- ✅ **Manage own leads** and pipeline
- ✅ **Export project/unit data** for client presentations
- ❌ **Cannot create/edit projects**
- ❌ **Cannot manage units**
- ❌ **Cannot see draft/unpublished projects**
- ❌ **Cannot access admin functions**

**Navigation**:
- Agent Dashboard (`/dashboard`)
- Browse Projects (`/agent-projects`)
- Manage Leads (`/leads`)
- Lead Creation (`/leads/create/:projectId`)

## Implementation Plan

### 📋 **Phase 1: Database Schema Updates**

#### **1.1 Update ENUM Types**
```sql
-- Update user_role enum to have clear three roles
ALTER TYPE user_role RENAME TO user_role_old;
CREATE TYPE user_role AS ENUM ('admin', 'developer', 'agent');

-- Update existing data
UPDATE employees SET role = 'developer' WHERE role = 'admin' AND organization_id IN (
  SELECT id FROM organizations WHERE type = 'developer'
);
-- Keep 'agent' role as is
-- Keep actual system admins as 'admin'

-- Drop old enum
DROP TYPE user_role_old;
```

#### **1.2 Data Migration Strategy**
```sql
-- Step 1: Identify current role assignments
SELECT 
  e.role as current_role,
  o.type as org_type,
  COUNT(*) as count
FROM employees e
JOIN organizations o ON e.organization_id = o.id
GROUP BY e.role, o.type;

-- Step 2: Update developer organization users
UPDATE employees 
SET role = 'developer' 
WHERE role = 'admin' 
AND organization_id IN (
  SELECT id FROM organizations WHERE type = 'developer'
);

-- Step 3: Create actual system admin (manual)
-- This would be done separately to create the first system admin
```

### 📋 **Phase 2: TypeScript Type Updates**

#### **2.1 Update Type Definitions**
```typescript
// src/lib/supabase.ts
export interface Employee {
  // ... other fields
  role: 'admin' | 'developer' | 'agent'; // Updated
  // ... other fields
}

// Update all Database types
role: 'admin' | 'developer' | 'agent';
```

#### **2.2 Update Auth Context**
```typescript
// src/contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  employeeId: string | null;
  organizationId: string | null;
  role: 'admin' | 'developer' | 'agent' | null; // Updated
  loading: boolean;
}
```

### 📋 **Phase 3: Service Layer Updates**

#### **3.1 Update Project Service**
```typescript
// src/services/projectService.ts
async listProjects(filters?: { status?: string; search?: string }) {
  // ... auth checks
  
  let query = supabase.from('projects').select('*');

  // NEW: Clear three-role logic
  if (employee.role === 'agent') {
    // Agents: only published projects from all developers
    query = query.eq('status', 'published');
  } else if (employee.role === 'developer') {
    // Developers: only their own organization's projects
    query = query.eq('organization_id', employee.organization_id);
  } else if (employee.role === 'admin') {
    // Admins: all projects from all organizations
    // No filter needed
  }
  
  // ... rest of method
}
```

#### **3.2 Update Admin Service**
```typescript
// src/services/adminService.ts
// Add role checks for all admin methods
private async verifyAdminRole() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: employee } = await supabase
    .from('employees')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (employee?.role !== 'admin') {
    throw new Error('Access denied: System admin role required');
  }
}
```

### 📋 **Phase 4: UI Component Updates**

#### **4.1 Update Dashboard Navigation**
```typescript
// src/pages/DashboardPage.tsx
{role === 'admin' && (
  <>
    <Button onClick={() => navigate('/admin')}>Admin Dashboard</Button>
    <Button onClick={() => navigate('/admin/organizations')}>Manage Organizations</Button>
    // ... other admin buttons
  </>
)}

{role === 'developer' && (
  <>
    <Button onClick={() => navigate('/projects/create')}>Create Project</Button>
    <Button onClick={() => navigate('/projects')}>My Projects</Button>
    // ... other developer buttons
  </>
)}

{role === 'agent' && (
  <>
    <Button onClick={() => navigate('/agent-projects')}>Browse Projects</Button>
    <Button onClick={() => navigate('/leads')}>Manage Leads</Button>
    // ... other agent buttons
  </>
)}
```

#### **4.2 Update Project Details Page**
```typescript
// src/pages/ProjectDetailsPage.tsx
// Show management buttons for developers and admins only
{(role === 'developer' || role === 'admin') && (
  <div className="flex gap-2">
    <Button onClick={() => navigate(`/projects/${project.id}/units`)}>
      Manage Units
    </Button>
    <Button onClick={() => navigate(`/projects/${project.id}/edit`)}>
      Edit
    </Button>
    <Button onClick={handleDeleteProject}>
      Delete
    </Button>
  </div>
)}
```

### 📋 **Phase 5: Registration Flow Updates**

#### **5.1 Update Registration Logic**
```typescript
// src/pages/RegisterPage.tsx
const handleSubmit = async (e: React.FormEvent) => {
  // ... existing logic

  // NEW: Clear role assignment
  let employeeRole: 'developer' | 'agent';
  if (formData.organizationType === 'developer') {
    employeeRole = 'developer'; // Changed from 'admin'
  } else {
    employeeRole = 'agent';
  }

  // ... rest of registration
};
```

#### **5.2 System Admin Creation**
```typescript
// Separate admin creation process (not through registration)
// This would be a special process or SQL script to create system admins
```

### 📋 **Phase 6: Route Protection Updates**

#### **6.1 Update Protected Routes**
```typescript
// src/components/auth/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'developer' | 'agent';
  allowedRoles?: ('admin' | 'developer' | 'agent')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  allowedRoles 
}) => {
  const { role } = useAuth();
  
  if (requiredRole && role !== requiredRole) {
    return <AccessDenied />;
  }
  
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <AccessDenied />;
  }
  
  return <>{children}</>;
};
```

#### **6.2 Update Route Definitions**
```typescript
// src/App.tsx
// Admin-only routes
<Route path="/admin/*" element={
  <ProtectedRoute requiredRole="admin">
    <AdminRoutes />
  </ProtectedRoute>
} />

// Developer routes
<Route path="/projects/create" element={
  <ProtectedRoute allowedRoles={['developer', 'admin']}>
    <CreateProjectPage />
  </ProtectedRoute>
} />

// Agent routes
<Route path="/agent-projects" element={
  <ProtectedRoute requiredRole="agent">
    <AgentProjectsPage />
  </ProtectedRoute>
} />
```

## Impact Analysis

### 🚨 **Critical Areas Affected**

#### **1. Authentication & Authorization**
- **Files**: `AuthContext.tsx`, `ProtectedRoute.tsx`, `authService.ts`
- **Impact**: Role checks throughout the application
- **Risk**: High - affects all user access

#### **2. Project Management**
- **Files**: `projectService.ts`, `ProjectDetailsPage.tsx`, `ProjectsPage.tsx`
- **Impact**: Who can create/edit/view projects
- **Risk**: High - core functionality

#### **3. Dashboard Navigation**
- **Files**: `DashboardPage.tsx`, all navigation components
- **Impact**: What buttons/options users see
- **Risk**: Medium - UI changes

#### **4. Registration Flow**
- **Files**: `RegisterPage.tsx`
- **Impact**: How new users are assigned roles
- **Risk**: High - affects new user onboarding

#### **5. Database Queries**
- **Files**: All service files with role-based queries
- **Impact**: Data access patterns
- **Risk**: High - data security

### 🛡️ **Risk Mitigation Strategies**

#### **1. Backward Compatibility**
```sql
-- Create migration that preserves existing functionality
-- during transition period
ALTER TABLE employees ADD COLUMN role_new user_role;

-- Update new column while keeping old one
UPDATE employees SET role_new = 'developer' WHERE role = 'admin' AND ...;
UPDATE employees SET role_new = 'agent' WHERE role = 'agent';

-- Test thoroughly before dropping old column
```

#### **2. Gradual Rollout**
1. **Phase 1**: Database schema update with dual columns
2. **Phase 2**: Update services to use new role logic
3. **Phase 3**: Update UI components
4. **Phase 4**: Remove old role column

#### **3. Testing Strategy**
- **Unit Tests**: Test each role's permissions
- **Integration Tests**: Test role transitions
- **E2E Tests**: Test complete user workflows
- **Manual Testing**: Test all role combinations

## Migration Steps

### 🔄 **Step-by-Step Migration Process**

#### **Step 1: Database Preparation**
1. Create new migration file
2. Add new role enum
3. Add temporary column for new roles
4. Migrate existing data
5. Test data integrity

#### **Step 2: TypeScript Updates**
1. Update type definitions
2. Update interfaces
3. Fix TypeScript errors
4. Update tests

#### **Step 3: Service Layer**
1. Update authentication logic
2. Update permission checks
3. Update data access patterns
4. Test service methods

#### **Step 4: UI Components**
1. Update role-based rendering
2. Update navigation logic
3. Update form validation
4. Test user interfaces

#### **Step 5: Integration Testing**
1. Test all role combinations
2. Test permission boundaries
3. Test data access
4. Test user workflows

#### **Step 6: Deployment**
1. Deploy database changes
2. Deploy application changes
3. Monitor for issues
4. Rollback plan ready

## Recommended Approach

### ✅ **Recommended: Phased Implementation**

1. **Week 1**: Database schema updates and data migration
2. **Week 2**: Service layer updates and testing
3. **Week 3**: UI component updates
4. **Week 4**: Integration testing and deployment

### ⚠️ **Alternative: Big Bang Approach**
- **Pros**: Clean cut, no dual-state complexity
- **Cons**: High risk, potential downtime, harder to rollback
- **Recommendation**: Only if system is not in production

## Success Criteria

### ✅ **Functional Requirements**
- [ ] System admins can manage all organizations and projects
- [ ] Developers can only manage their own projects
- [ ] Agents can only browse published projects and manage leads
- [ ] Role-based navigation works correctly
- [ ] Registration assigns correct roles

### ✅ **Technical Requirements**
- [ ] No data loss during migration
- [ ] All existing functionality preserved
- [ ] Performance not degraded
- [ ] Security boundaries maintained
- [ ] TypeScript compilation successful

### ✅ **User Experience Requirements**
- [ ] Clear role differentiation in UI
- [ ] Intuitive navigation for each role
- [ ] Proper error messages for access denied
- [ ] Consistent role-based theming

## Conclusion

The three-role system is essential for proper access control and user experience. While the migration is complex and risky, it's necessary for the long-term success of the platform. 

**Recommendation**: Proceed with the phased implementation approach, starting with database schema updates and thorough testing at each phase.

**Timeline**: 4-6 weeks for complete implementation and testing.

**Risk Level**: High, but manageable with proper planning and testing.
