# Leads & Agent Workflows - Test Guide

## Overview
This guide covers testing the complete Leads & Agent Workflows functionality, including lead capture, management, and agent project browsing.

## Prerequisites
1. Database migrations are applied (leads table exists)
2. At least one organization with role 'agent' exists
3. At least one organization with role 'developer' exists
4. At least one published project exists

## Test Scenarios

### 1. Agent Project Browsing
**URL**: `/agent-projects`

**Test Steps**:
1. Login as an agent user
2. Navigate to "Browse Projects" from dashboard
3. Verify you can see projects from all developers
4. Test search functionality
5. Test filters (location, type, price range)
6. Test sorting options
7. Click "View Details" on a project
8. Click "Create Lead" on a project

**Expected Results**:
- ✅ Agent can see all published projects
- ✅ Search works by project name, location, developer
- ✅ Filters work correctly
- ✅ Sorting works (newest, price, popularity)
- ✅ Project details are accessible
- ✅ Lead creation form opens with project pre-selected

### 2. Lead Capture Form
**URL**: `/leads` (Create Lead button)

**Test Steps**:
1. Click "Create Lead" from dashboard or project browsing
2. Fill out the lead capture form:
   - First Name: "Ahmed"
   - Last Name: "Ali"
   - Phone: "+971501234567"
   - Email: "ahmed@example.com"
   - Source: "Website Inquiry"
   - Budget Min: 800000
   - Budget Max: 1200000
   - Preferred Unit Types: Select "2 BHK", "3 BHK"
   - Preferred Location: "Downtown Dubai"
   - Requirements: "Looking for modern apartment with good amenities"
   - Next Follow-up: Set to tomorrow
3. Click "Create Lead"

**Expected Results**:
- ✅ Form validation works (required fields)
- ✅ Lead is created successfully
- ✅ User is redirected to lead dashboard
- ✅ New lead appears in the list

### 3. Lead Dashboard
**URL**: `/leads`

**Test Steps**:
1. Navigate to Leads page
2. Verify stats cards show correct data
3. Test filters:
   - Filter by status (new, contacted, qualified, etc.)
   - Filter by stage (inquiry, site_visit, etc.)
   - Filter by date range
4. Test search functionality
5. Click on a lead to view details
6. Test pagination (if more than 20 leads)

**Expected Results**:
- ✅ Stats cards show accurate counts
- ✅ Filters work correctly
- ✅ Search finds leads by name, email, phone
- ✅ Lead details open when clicked
- ✅ Pagination works if needed

### 4. Lead Detail View
**URL**: `/leads` (click on lead)

**Test Steps**:
1. Click on a lead from the dashboard
2. Verify all lead information is displayed correctly
3. Click "Edit" button
4. Update lead information:
   - Change status to "contacted"
   - Change stage to "site_visit"
   - Add notes: "Called client, scheduled site visit"
   - Update next follow-up date
5. Click "Save"
6. Verify changes are saved

**Expected Results**:
- ✅ All lead information displays correctly
- ✅ Edit mode works
- ✅ Status and stage updates work
- ✅ Notes and follow-up dates save
- ✅ Changes are reflected immediately

### 5. Lead Status Updates
**Test Steps**:
1. Create a new lead
2. Update status through the pipeline:
   - new → contacted → qualified → negotiation → won
3. Update stage through the pipeline:
   - inquiry → site_visit → proposal → negotiation → closed
4. Add notes at each stage
5. Set follow-up dates

**Expected Results**:
- ✅ Status updates work correctly
- ✅ Stage updates work correctly
- ✅ Notes are preserved
- ✅ Follow-up dates are tracked
- ✅ Timeline shows all changes

### 6. RLS (Row Level Security) Testing
**Test Steps**:
1. Create leads as Agent A
2. Login as Agent B (different organization)
3. Verify Agent B cannot see Agent A's leads
4. Login as Developer
5. Verify Developer cannot see agent leads
6. Login as Admin
7. Verify Admin can see all leads (if implemented)

**Expected Results**:
- ✅ Agents only see their organization's leads
- ✅ Developers cannot access lead management
- ✅ Proper data isolation between organizations

### 7. Team Member Assignment
**Test Steps**:
1. Create multiple team members in agent organization
2. Create a lead and assign to specific team member
3. Filter leads by assigned team member
4. Verify assignment works correctly

**Expected Results**:
- ✅ Team members can be assigned to leads
- ✅ Filtering by assigned member works
- ✅ Assignment is displayed in lead details

## Error Scenarios

### 1. Form Validation
- Try submitting empty required fields
- Try invalid email format
- Try budget min > budget max
- Verify error messages appear

### 2. Network Errors
- Test with network disconnected
- Verify error handling and user feedback

### 3. Permission Errors
- Try accessing leads without authentication
- Try accessing other organization's leads
- Verify proper error messages

## Performance Testing

### 1. Large Dataset
- Create 100+ leads
- Test pagination performance
- Test search performance
- Test filter performance

### 2. Concurrent Users
- Multiple agents creating leads simultaneously
- Verify no data conflicts

## Browser Compatibility
Test in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Mobile Responsiveness
- Test on mobile devices
- Verify forms are usable on small screens
- Test touch interactions

## Data Integrity
1. Verify lead data is saved correctly
2. Check database constraints
3. Verify foreign key relationships
4. Test data updates and deletions

## Success Criteria
- ✅ All test scenarios pass
- ✅ No console errors
- ✅ Proper error handling
- ✅ Good user experience
- ✅ Data security maintained
- ✅ Performance is acceptable

## Troubleshooting

### Common Issues:
1. **Leads not loading**: Check RLS policies
2. **Form validation errors**: Check field requirements
3. **Permission denied**: Check user role and organization
4. **Search not working**: Check search implementation
5. **Filters not working**: Check filter logic

### Debug Steps:
1. Check browser console for errors
2. Check network tab for failed requests
3. Verify database permissions
4. Check user authentication status
5. Verify organization membership

## Test Data
Use this test data for consistent testing:

**Agent Organization**:
- Name: "Premium Real Estate"
- Type: "agent"
- Admin: agent@premium.com

**Developer Organization**:
- Name: "Emaar Properties"
- Type: "developer"
- Admin: admin@emaar.com

**Test Projects**:
- "Downtown Residences" - Downtown Dubai
- "Marina Views" - Dubai Marina
- "Business Bay Towers" - Business Bay

**Test Leads**:
- Ahmed Ali - +971501234567
- Sarah Johnson - +971502345678
- Mohammed Hassan - +971503456789
