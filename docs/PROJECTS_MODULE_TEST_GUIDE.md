# Projects Module Test Guide

## 🎯 **Testing the Complete Projects Module**

The Projects module has been implemented following the unified architecture with:
- ✅ Single endpoint for ALL creation methods
- ✅ Single Project type (no separate ManualProject/AIProject)
- ✅ creation_method field distinguishes source
- ✅ JSONB fields for AI-extracted data
- ✅ Same database table for all methods

## 🧪 **Test Checklist**

### **1. Test Manual Project Creation**

#### **Step 1: Navigate to Create Project**
1. Go to `http://localhost:5174/dashboard`
2. Click "Create New Project" in Quick Actions
3. Should redirect to `/projects/create`

#### **Step 2: Select Manual Creation**
1. Should see method selection page
2. Click "Create Manually" card
3. Should show manual creation form

#### **Step 3: Fill Out Manual Form**
1. **Basic Information**:
   - Project Name: "Test Manual Project"
   - Location: "Mumbai, Maharashtra"
   - Project Type: "Residential"
   - Developer Name: "Test Developer"
   - Description: "A test residential project"
   - Address: "123 Test Street, Mumbai"

2. **Project Details**:
   - Starting Price: 5000000
   - Total Units: 100
   - Completion Date: 2025-12-31
   - Handover Date: 2026-03-31

3. **Add Amenities**:
   - Click "Add amenity" and add: "Swimming Pool"
   - Add: "Gymnasium"
   - Add: "Parking"

4. **Add Connectivity**:
   - Add: "Metro Station - 500m"
   - Add: "Airport - 15km"

5. **Add Landmarks**:
   - Add: "Shopping Mall - 1km"
   - Add: "Hospital - 2km"

6. **Add Payment Plans**:
   - Plan Name: "Construction Linked"
   - Description: "Pay as construction progresses"
   - Percentage: 20
   - Timeline: "On booking"
   - Click "Add Payment Plan"

#### **Step 4: Submit Manual Project**
1. Click "Create Project"
2. Should show success message
3. Should redirect to projects list
4. **Verify in Database**: Check `creation_method = 'manual'`

### **2. Test AI Project Creation**

#### **Step 1: Navigate to Create Project**
1. Go to `http://localhost:5174/projects/create`
2. Click "Create with AI" card
3. Should show AI creation interface

#### **Step 2: Upload Brochure**
1. **Project Name**: "Test AI Project"
2. **Project Location**: "Delhi, NCR"
3. **Upload File**: Create a dummy PDF file or use any PDF
4. Click "Process with AI"

#### **Step 3: Review AI Extraction**
1. Should show "Processing file with AI..." loading
2. After processing, should show extracted data:
   - Amenities: Swimming Pool, Gymnasium, Parking, Security, Garden, Club House
   - Connectivity: Metro Station - 500m, Bus Stop - 200m, Airport - 15km
   - Landmarks: Shopping Mall - 1km, Hospital - 2km, School - 800m
   - Payment Plans: Construction Linked Plan, Possession Linked Plan
   - Master Plan: Total area, building count, floor count, unit types
   - Custom Attributes: RERA number, possession date, floor rise

#### **Step 4: Confirm AI Project**
1. Review all extracted data
2. Click "Create Project"
3. Should show success message
4. Should redirect to projects list
5. **Verify in Database**: Check `creation_method = 'ai_assisted'` and `ai_confidence_score = 0.85`

### **3. Verify Unified Architecture**

#### **Step 1: Check Projects List**
1. Go to `http://localhost:5174/projects`
2. Should see both projects in the same list
3. Should show different badges for creation methods:
   - Manual project: Blue badge with "manual"
   - AI project: Green badge with "ai assisted"

#### **Step 2: Check Project Details**
1. Click on manual project
2. Should show all manually entered data
3. Go back and click on AI project
4. Should show all AI-extracted data
5. Should show AI confidence score

#### **Step 3: Verify Database**
Run these queries in Supabase SQL Editor:

```sql
-- Check both projects exist in same table
SELECT id, name, creation_method, ai_confidence_score, created_at 
FROM projects 
ORDER BY created_at DESC;

-- Verify manual project
SELECT name, creation_method, amenities, connectivity, landmarks 
FROM projects 
WHERE creation_method = 'manual';

-- Verify AI project
SELECT name, creation_method, ai_confidence_score, amenities, connectivity, landmarks 
FROM projects 
WHERE creation_method = 'ai_assisted';
```

### **4. Test Project Management**

#### **Step 1: Test Project List Features**
1. **Search**: Search for "Test" - should find both projects
2. **Filter by Status**: Filter by "draft" - should show both
3. **Filter by Method**: Filter by "manual" - should show only manual project
4. **Filter by Method**: Filter by "ai_assisted" - should show only AI project

#### **Step 2: Test Project Actions**
1. **View Details**: Click eye icon on any project
2. **Edit Project**: Click edit icon (should navigate to edit page)
3. **Delete Project**: Click delete icon and confirm

#### **Step 3: Test Statistics**
1. Check stats cards show correct counts:
   - Total Projects: 2
   - Published Projects: 0 (both are draft)
   - AI Projects: 1
   - Manual Projects: 1

## ✅ **Success Criteria**

### **Manual Project Creation**
- ✅ Form submits successfully
- ✅ All data saved correctly
- ✅ creation_method = 'manual'
- ✅ No ai_confidence_score
- ✅ Redirects to projects list

### **AI Project Creation**
- ✅ File uploads successfully
- ✅ AI processing completes
- ✅ Extracted data displays correctly
- ✅ creation_method = 'ai_assisted'
- ✅ ai_confidence_score = 0.85
- ✅ Redirects to projects list

### **Unified Architecture**
- ✅ Both projects in same table
- ✅ Same list view for both
- ✅ Same detail view for both
- ✅ Different creation method badges
- ✅ No column mismatch errors
- ✅ All JSONB fields working

### **Project Management**
- ✅ Search works for both projects
- ✅ Filters work correctly
- ✅ Statistics show correct counts
- ✅ View/Edit/Delete actions work

## 🚨 **Common Issues & Solutions**

### **Issue: Manual form validation errors**
**Solution**: Ensure all required fields are filled (name, location)

### **Issue: AI processing fails**
**Solution**: Check console for errors, ensure file is PDF

### **Issue: Projects not showing in list**
**Solution**: Check RLS policies, ensure user has access

### **Issue: Database errors**
**Solution**: Verify all migrations are run, check table structure

## 🎯 **Final Verification**

After completing all tests:

1. **Database Check**: Both projects exist in same `projects` table
2. **Creation Methods**: One with `manual`, one with `ai_assisted`
3. **Data Integrity**: All form data and AI data saved correctly
4. **UI Consistency**: Same interface for both creation methods
5. **No Errors**: No console errors or database errors

The Projects module is working correctly when all tests pass! 🚀
