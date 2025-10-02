# Create Lead Validation Debug Guide

## 🚨 Issue: Form Validation Failing

### **Current Problem:**
- ✅ **Form data is being submitted** correctly
- ✅ **Required fields are filled** (first_name, last_name, phone)
- ❌ **Validation is failing** for unknown reason
- ❌ **project_id is undefined** in form data

### **Debugging Steps:**

#### **Step 1: Test Form with Debug Logs**
1. **Login as agent**: `agent3@skye.com` / `password@123`
2. **Navigate to**: `http://localhost:5179/agent-projects`
3. **Click "Create Lead"** button on any project
4. **Fill required fields**:
   - First Name: "Lead1"
   - Last Name: "A"
   - Phone: "+9199999999"
5. **Click "Test Form"** button
6. **Check console** for validation logs

#### **Step 2: Check Project ID Issue**
1. **Look for console log**: "LeadCaptureForm props: { projectId: ... }"
2. **Expected**: `projectId` should not be `undefined`
3. **If undefined**: Check if `selectedProject` is properly set

#### **Step 3: Check Validation Logic**
1. **Look for console log**: "Validating form data: { ... }"
2. **Check validation errors**: Should be empty object `{}`
3. **Check form validity**: Should be `true`

### **Potential Issues & Solutions:**

#### **Issue 1: Project ID is Undefined**
**Symptoms**: `project_id: undefined` in form data
**Root Cause**: `selectedProject` is not properly set when modal opens
**Solutions**:
```typescript
// Check if selectedProject is properly set
console.log('selectedProject:', selectedProject);
console.log('selectedProject.id:', selectedProject?.id);

// Ensure project is selected before opening modal
const handleCreateLead = (project: Project) => {
  console.log('Creating lead for project:', project);
  if (!project || !project.id) {
    console.error('Invalid project:', project);
    return;
  }
  setSelectedProject(project);
  setShowLeadForm(true);
};
```

#### **Issue 2: Form Data Not Updating**
**Symptoms**: Form data shows old values
**Root Cause**: Form state not updating when props change
**Solutions**:
```typescript
// Add useEffect to update form data
useEffect(() => {
  setFormData(prev => ({
    ...prev,
    project_id: projectId,
    unit_id: unitId,
  }));
}, [projectId, unitId]);
```

#### **Issue 3: Validation Logic Error**
**Symptoms**: Validation fails even with valid data
**Root Cause**: Validation logic has bugs
**Solutions**:
```typescript
// Add detailed validation logging
const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};
  
  console.log('Validating form data:', formData);
  
  // Check each field individually
  if (!formData.first_name?.trim()) {
    newErrors.first_name = 'First name is required';
    console.log('First name validation failed:', formData.first_name);
  }
  
  if (!formData.last_name?.trim()) {
    newErrors.last_name = 'Last name is required';
    console.log('Last name validation failed:', formData.last_name);
  }
  
  if (!formData.phone?.trim()) {
    newErrors.phone = 'Phone number is required';
    console.log('Phone validation failed:', formData.phone);
  }
  
  console.log('Validation errors:', newErrors);
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### **Quick Fixes:**

#### **Fix 1: Ensure Project ID is Set**
```typescript
// In AgentProjectsPage.tsx
const handleCreateLead = (project: Project) => {
  console.log('Creating lead for project:', project);
  if (!project?.id) {
    console.error('Project ID is missing:', project);
    return;
  }
  setSelectedProject(project);
  setShowLeadForm(true);
};
```

#### **Fix 2: Add Project ID Validation**
```typescript
// In LeadCaptureForm.tsx
const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};

  // Add project ID validation
  if (!formData.project_id) {
    newErrors.project_id = 'Project ID is required';
  }

  // ... rest of validation
};
```

#### **Fix 3: Force Form Data Update**
```typescript
// In LeadCaptureForm.tsx
useEffect(() => {
  console.log('Project ID changed:', projectId);
  setFormData(prev => {
    const updated = {
      ...prev,
      project_id: projectId,
      unit_id: unitId,
    };
    console.log('Updated form data:', updated);
    return updated;
  });
}, [projectId, unitId]);
```

### **Testing Checklist:**

- [ ] **Project Selection**: `selectedProject` is not null
- [ ] **Project ID**: `selectedProject.id` is not undefined
- [ ] **Form Props**: `projectId` prop is passed correctly
- [ ] **Form Data**: `formData.project_id` is set
- [ ] **Validation**: All required fields pass validation
- [ ] **Form Submission**: Form submits successfully

### **Debug Console Commands:**

#### **Check Project Selection:**
```javascript
// In browser console
console.log('selectedProject:', selectedProject);
console.log('showLeadForm:', showLeadForm);
```

#### **Check Form Data:**
```javascript
// In form component
console.log('Form data:', formData);
console.log('Project ID:', formData.project_id);
```

#### **Test Validation:**
```javascript
// Test validation manually
const testData = {
  first_name: 'Test',
  last_name: 'User',
  phone: '+971501234567',
  project_id: 'some-project-id'
};

// Check if validation passes
const errors = {};
if (!testData.first_name?.trim()) errors.first_name = 'Required';
if (!testData.last_name?.trim()) errors.last_name = 'Required';
if (!testData.phone?.trim()) errors.phone = 'Required';
if (!testData.project_id) errors.project_id = 'Required';

console.log('Test validation errors:', errors);
console.log('Test validation passed:', Object.keys(errors).length === 0);
```

### **Next Steps:**

1. **Check console logs** for project ID issue
2. **Verify selectedProject** is properly set
3. **Test form data** with debug logs
4. **Fix project ID** issue if found
5. **Test validation** with corrected data
6. **Submit form** and verify success

**The validation should pass once the project ID issue is resolved!** 🚀
