# Units Display Fix - Agent Role Issue

## 🎯 Problem Identified

**Issue**: Agents could not see units from published projects because the `unitService.getUnits()` method was filtering by `organization_id`, restricting agents to only see units from their own organization.

**Console Logs Showed**:
- `Retrieved units from database: []` - Empty array returned
- `DisplayConfig items with source: []` - No display config because no units

## 🔧 Root Cause

The `unitService.getUnits()` method had this problematic logic:
```typescript
// OLD CODE - PROBLEMATIC
.eq('projects.organization_id', employee.organization_id);
```

This meant:
- **Developers**: Could see units from their own organization ✅
- **Agents**: Could only see units from their own organization ❌ (Should see published projects from ALL developers)

## ✅ Solution Applied

### Fixed `getUnits()` Method (`src/services/unitService.ts`)

```typescript
// NEW CODE - ROLE-BASED FILTERING
let query = supabase
  .from('units')
  .select(`
    *,
    projects!inner(organization_id, status)
  `)
  .eq('project_id', projectId);

// Filter based on role:
// - Developers: can only see units from their own organization's projects
// - Agents: can see units from published projects from any organization
if (employee.role === 'agent') {
  query = query.eq('projects.status', 'published');
} else {
  query = query.eq('projects.organization_id', employee.organization_id);
}
```

### Fixed `getUnit()` Method (Single Unit View)

Applied the same role-based filtering logic to the single unit retrieval method.

## 🎯 Expected Results

### For Agents:
- ✅ **Can see units** from published projects from ALL developers
- ✅ **Cannot see units** from draft/unpublished projects
- ✅ **Cannot see units** from their own organization's unpublished projects

### For Developers:
- ✅ **Can see units** from their own organization's projects (any status)
- ✅ **Cannot see units** from other organizations' projects
- ✅ **Full access** to their own project units

## 🧪 Testing Steps

### Test Agent Access:
1. **Login as agent** (`agent3@skye.com`)
2. **Navigate to a published project** with units
3. **Go to Units tab** - should now show units
4. **Verify units are displayed** with proper data

### Test Developer Access:
1. **Login as developer** (any developer account)
2. **Navigate to their own project** with units
3. **Go to Units tab** - should show units (unchanged behavior)
4. **Verify full access** to unit management

## 📋 Database Requirements

For agents to see units, the project must be:
- ✅ **Status**: `published` (not `draft` or `archived`)
- ✅ **Has units**: Units exist in the `units` table for that project
- ✅ **Proper relationship**: Units linked to project via `project_id`

## 🔍 Debug Information

If units still don't show, check:
1. **Project status**: Must be `published` for agents
2. **Units exist**: Check `units` table for the project
3. **Console logs**: Should show `Retrieved units from database: [array with data]`
4. **Role**: User must have `role: 'agent'` in employees table

**The fix ensures agents can now see units from published projects from all developers!** 🎉
