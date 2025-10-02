# Admin Dashboard Test Guide

## Overview
This guide provides comprehensive testing instructions for the Admin Dashboard functionality in SkyeScraper.

## Prerequisites
1. **Admin User Setup**: You need a user with `role = 'admin'` in the `employees` table
2. **Test Data**: Ensure there are organizations, projects, and leads in the database
3. **Authentication**: Admin user must be logged in

## Test Scenarios

### 1. Admin Dashboard Access Control

#### Test 1.1: Admin Access
- **Steps**:
  1. Login as an admin user
  2. Navigate to `/admin`
  3. Verify admin dashboard loads successfully
- **Expected**: Dashboard displays with system overview, analytics, and quick actions

#### Test 1.2: Non-Admin Access Denied
- **Steps**:
  1. Login as a developer or agent user
  2. Try to navigate to `/admin`
  3. Verify access is denied
- **Expected**: Redirected to `/dashboard` with access denied message

### 2. Admin Dashboard Overview

#### Test 2.1: System Health Metrics
- **Steps**:
  1. Access admin dashboard
  2. Check system health section
- **Expected**: 
  - Uptime: 99.9%
  - Response Time: 150ms
  - Error Rate: 0.1%

#### Test 2.2: Key Performance Indicators
- **Steps**:
  1. View KPI cards at the top
- **Expected**: 
  - Total Organizations count
  - Total Projects count
  - Total Leads count
  - Conversion Rate percentage
  - All with trend indicators

#### Test 2.3: Organization Breakdown
- **Steps**:
  1. Check Organizations Overview card
- **Expected**: 
  - Developers count
  - Agents count
  - Active organizations
  - Pending organizations
  - Suspended organizations

#### Test 2.4: Project Breakdown
- **Steps**:
  1. Check Projects Overview card
- **Expected**: 
  - Published projects
  - Draft projects
  - Manual creation count
  - AI assisted count
  - Admin created count

### 3. Organization Management

#### Test 3.1: View All Organizations
- **Steps**:
  1. Navigate to `/admin/organizations`
  2. Verify organizations list loads
- **Expected**: 
  - All organizations displayed in cards
  - Organization type badges (developer/agent)
  - Status badges (active/pending/suspended)
  - Employee, project, and lead counts

#### Test 3.2: Filter Organizations
- **Steps**:
  1. Use organization type filter
  2. Use status filter
  3. Use search functionality
- **Expected**: 
  - Filters work correctly
  - Results update in real-time
  - Search finds organizations by name/email

#### Test 3.3: Organization Status Management
- **Steps**:
  1. Find an active organization
  2. Click "Suspend" button
  3. Verify status changes
  4. Click "Activate" button
  5. Verify status reverts
- **Expected**: 
  - Status updates successfully
  - UI reflects changes immediately
  - Database updates correctly

### 4. Project Oversight

#### Test 4.1: View All Projects
- **Steps**:
  1. Navigate to `/admin/projects`
  2. Verify projects list loads
- **Expected**: 
  - All projects from all organizations
  - Creation method badges (manual/ai_assisted/admin)
  - Status badges (draft/published/archived)
  - Organization information
  - Views, leads, and units counts

#### Test 4.2: Filter Projects
- **Steps**:
  1. Use organization type filter
  2. Use creation method filter
  3. Use project status filter
  4. Use search functionality
- **Expected**: 
  - Filters work correctly
  - Results update appropriately
  - Search finds projects by name/location

#### Test 4.3: Project Actions
- **Steps**:
  1. Click "View" on a project
  2. Click "Edit" on a project
  3. Click "Delete" on a project (with confirmation)
- **Expected**: 
  - View navigates to project details
  - Edit navigates to edit page
  - Delete shows confirmation and removes project

### 5. Lead Monitoring

#### Test 5.1: View All Leads
- **Steps**:
  1. Navigate to `/admin/leads`
  2. Verify leads list loads
- **Expected**: 
  - All leads from all agents
  - Lead status badges
  - Source badges
  - Project and organization information
  - Agent information
  - Budget information

#### Test 5.2: Filter Leads
- **Steps**:
  1. Use lead status filter
  2. Use source filter
  3. Use organization type filter
  4. Use search functionality
- **Expected**: 
  - Filters work correctly
  - Results update appropriately
  - Search finds leads by name/email

#### Test 5.3: Lead Actions
- **Steps**:
  1. Click "View Details" on a lead
  2. Click "Edit Lead" on a lead
- **Expected**: 
  - View navigates to lead details
  - Edit navigates to lead edit page

### 6. System Analytics

#### Test 6.1: Analytics Overview
- **Steps**:
  1. Navigate to `/admin/analytics`
  2. Verify analytics page loads
- **Expected**: 
  - Key performance indicators
  - Organization distribution charts
  - Project creation method charts
  - Lead status distribution
  - Performance metrics

#### Test 6.2: Progress Bars
- **Steps**:
  1. Check organization distribution progress bars
  2. Check project creation method progress bars
  3. Check lead status progress bars
- **Expected**: 
  - Progress bars show correct percentages
  - Colors match status types
  - Values are accurate

#### Test 6.3: Top Performers
- **Steps**:
  1. Check top performing agents section
  2. Check top projects by engagement section
- **Expected**: 
  - Agents ranked by performance
  - Projects ranked by engagement
  - Data is accurate and up-to-date

### 7. Navigation and User Experience

#### Test 7.1: Admin Navigation
- **Steps**:
  1. From admin dashboard, navigate to each section
  2. Use back buttons to return to dashboard
  3. Use quick action buttons
- **Expected**: 
  - All navigation works correctly
  - Back buttons return to previous page
  - Quick actions navigate to correct pages

#### Test 7.2: Role-Based Navigation
- **Steps**:
  1. Login as admin user
  2. Check dashboard quick actions
  3. Verify admin-specific buttons appear
- **Expected**: 
  - Admin dashboard button visible
  - Manage organizations button visible
  - Project oversight button visible
  - Lead monitoring button visible
  - System analytics button visible

### 8. Error Handling

#### Test 8.1: Network Errors
- **Steps**:
  1. Disconnect internet
  2. Try to load admin pages
  3. Reconnect and retry
- **Expected**: 
  - Error messages display appropriately
  - Retry functionality works
  - Data loads after reconnection

#### Test 8.2: Permission Errors
- **Steps**:
  1. Try to access admin pages as non-admin
  2. Check error messages
- **Expected**: 
  - Access denied messages
  - Redirect to appropriate page
  - Clear error communication

## Test Data Requirements

### Organizations
- At least 3 organizations (mix of developers and agents)
- Different statuses (active, pending, suspended)
- Various employee, project, and lead counts

### Projects
- Projects from different organizations
- Different creation methods (manual, ai_assisted, admin)
- Different statuses (draft, published, archived)
- Various engagement metrics

### Leads
- Leads from different agents
- Different statuses and sources
- Various budget ranges
- Different projects and organizations

## Performance Testing

### Load Testing
- Test with large datasets (100+ organizations, 1000+ projects, 10000+ leads)
- Verify page load times remain acceptable
- Check filter and search performance

### Responsive Design
- Test on different screen sizes
- Verify mobile responsiveness
- Check tablet compatibility

## Security Testing

### Access Control
- Verify admin-only access to all admin pages
- Test role-based restrictions
- Check for privilege escalation vulnerabilities

### Data Protection
- Verify sensitive data is properly protected
- Check for data leakage in error messages
- Test input validation and sanitization

## Success Criteria

✅ **All admin pages load without errors**
✅ **Role-based access control works correctly**
✅ **All filters and search functionality work**
✅ **Data displays accurately and updates in real-time**
✅ **Navigation between admin sections is smooth**
✅ **Error handling is appropriate and user-friendly**
✅ **Performance is acceptable with realistic data volumes**
✅ **Security controls prevent unauthorized access**

## Troubleshooting

### Common Issues

1. **"Access Denied" for Admin Users**
   - Check `employees` table for correct `role = 'admin'`
   - Verify user authentication is working
   - Check RLS policies

2. **Empty Data in Analytics**
   - Ensure test data exists in database
   - Check database queries in adminService
   - Verify data relationships are correct

3. **Filters Not Working**
   - Check filter state management
   - Verify API calls include filter parameters
   - Check database query construction

4. **Navigation Issues**
   - Verify all routes are defined in App.tsx
   - Check component imports
   - Verify role-based navigation logic

### Debug Steps

1. Check browser console for errors
2. Verify network requests in DevTools
3. Check database queries and results
4. Verify authentication state
5. Check role assignment in database
