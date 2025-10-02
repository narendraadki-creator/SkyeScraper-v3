# Create Lead Form Debug Guide

## 🚨 Issue: Create Lead Button Not Working in Form

### **Current Status:**
- ✅ **Form renders** correctly
- ✅ **Submit handler** is implemented
- ✅ **Validation** logic exists
- ✅ **leadService** is implemented
- ✅ **Database table** exists
- ✅ **RLS policies** are configured

### **Debugging Steps:**

#### **Step 1: Test Form Access**
1. **Login as agent**: `agent3@skye.com` / `password@123`
2. **Navigate to**: `http://localhost:5179/agent-projects`
3. **Click "Create Lead"** button on any project
4. **Expected**: Modal should open with form
5. **Check**: Form should have "Test Form" button

#### **Step 2: Test Form Data**
1. **Fill required fields**:
   - First Name: "John"
   - Last Name: "Doe"
   - Phone: "+971501234567"
2. **Click "Test Form"** button
3. **Check console**: Should see form data and validation result
4. **Expected**: Validation should pass with required fields

#### **Step 3: Test Form Submission**
1. **Click "Create Lead"** button
2. **Check console**: Should see debug logs:
   - "Form submitted with data: [form data]"
   - "Form validation passed, creating lead..."
   - "leadService.createLead called with: [data]"
   - "User authenticated: [user id]"
   - "Employee found: [employee data]"
   - "Lead created successfully: [lead data]"

#### **Step 4: Check for Errors**
1. **Look for error messages** in console
2. **Check for validation errors** in form
3. **Check for network errors** in browser dev tools
4. **Check for database errors** in Supabase logs

### **Common Issues & Solutions:**

#### **Issue 1: Form Validation Fails**
**Symptoms**: "Form validation failed" in console
**Solutions**:
- Check required fields are filled
- Check email format if provided
- Check budget range logic
- Check phone number format

#### **Issue 2: Authentication Error**
**Symptoms**: "Not authenticated" error
**Solutions**:
- Check if user is logged in
- Check if session is valid
- Try refreshing the page
- Check browser localStorage for auth tokens

#### **Issue 3: Employee Not Found**
**Symptoms**: "Employee not found" error
**Solutions**:
- Check if employee record exists in database
- Check RLS policies on employees table
- Verify user_id matches in employees table
- Check if organization_id is set

#### **Issue 4: Database Insert Error**
**Symptoms**: "Lead creation error" in console
**Solutions**:
- Check leads table structure
- Check RLS policies on leads table
- Check required fields in database
- Check data types match database schema

### **Debug Console Commands:**

#### **Check Authentication:**
```javascript
// Check current user
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);

// Check session
const { data: { session } } = await supabase.auth.getSession();
console.log('Current session:', session);
```

#### **Check Employee Record:**
```javascript
// Check employee record
const { data: employee, error } = await supabase
  .from('employees')
  .select('*')
  .eq('user_id', user.id)
  .single();
console.log('Employee record:', { employee, error });
```

#### **Test Lead Creation Directly:**
```javascript
// Test lead creation with minimal data
const testLead = {
  first_name: 'Test',
  last_name: 'User',
  phone: '+971501234567',
  source: 'Website Inquiry'
};

const { data, error } = await supabase
  .from('leads')
  .insert({
    ...testLead,
    organization_id: employee.organization_id,
    created_by: employee.id,
    status: 'new',
    stage: 'inquiry'
  })
  .select()
  .single();

console.log('Direct lead creation test:', { data, error });
```

#### **Check Database Schema:**
```javascript
// Check leads table structure
const { data, error } = await supabase
  .from('leads')
  .select('*')
  .limit(1);

console.log('Leads table structure:', { data, error });
```

### **Form Data Structure:**

#### **Required Fields:**
- `first_name`: string
- `last_name`: string
- `phone`: string

#### **Optional Fields:**
- `email`: string (validated if provided)
- `source`: string (defaults to 'Website Inquiry')
- `project_id`: string (from props)
- `unit_id`: string (from props)
- `budget_min`: number
- `budget_max`: number
- `preferred_unit_types`: string[]
- `preferred_location`: string
- `requirements`: string
- `notes`: string
- `assigned_to`: string
- `next_followup`: string

#### **Auto-Generated Fields:**
- `organization_id`: from employee record
- `created_by`: from employee record
- `status`: 'new'
- `stage`: 'inquiry'

### **Testing Checklist:**

- [ ] **Form Opens**: Modal appears with form
- [ ] **Form Fields**: All fields are visible and editable
- [ ] **Test Button**: "Test Form" button works
- [ ] **Validation**: Required fields are validated
- [ ] **Form Data**: Data is properly structured
- [ ] **Authentication**: User is authenticated
- [ ] **Employee**: Employee record exists
- [ ] **Database**: Lead is created successfully
- [ ] **Modal Closes**: Modal closes after success
- [ ] **Success Callback**: onSuccess is called

### **Quick Fixes:**

#### **Fix 1: Add Error Display**
```typescript
// Add error display in form
{errors.submit && (
  <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
    {errors.submit}
  </div>
)}
```

#### **Fix 2: Add Loading State**
```typescript
// Add loading state to form
{loading && (
  <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-600 text-sm">
    Creating lead...
  </div>
)}
```

#### **Fix 3: Add Success Message**
```typescript
// Add success message
const [success, setSuccess] = useState(false);

// In handleSubmit after success
setSuccess(true);
setTimeout(() => {
  setSuccess(false);
  onSuccess(lead);
}, 2000);
```

### **Next Steps:**

1. **Test the form** with the debug buttons
2. **Check console logs** for any errors
3. **Verify authentication** and employee records
4. **Test database insertion** directly
5. **Fix any issues** found during debugging
6. **Remove debug code** once working

**The Create Lead form should work once these debugging steps are completed!** 🚀
