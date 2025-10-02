# Create Lead Button Debug Guide

## 🚨 Issue: Create Lead Button Not Working on Project Cards

### **Current Status:**
- ✅ **Button exists** on project cards
- ✅ **Click handler** is implemented (`handleCreateLead`)
- ✅ **Modal rendering** logic is in place
- ✅ **LeadCaptureForm** component exists
- ❌ **Button click not working** (no response)

### **Debugging Steps:**

#### **Step 1: Test Button Click**
1. **Login as agent**: `agent3@skye.com` / `password@123`
2. **Navigate to**: `http://localhost:5179/agent-projects`
3. **Click "Create Lead"** button on any project card
4. **Check console** for debug logs:
   - "Create Lead button clicked for project: [project data]"
   - "Project ID: [id]"
   - "Project name: [name]"
   - "Modal state set to true"

#### **Step 2: Check Modal Rendering**
1. **After clicking button**: Check if modal appears
2. **Expected**: Dark overlay with white modal box
3. **Check console**: Should see "AgentProjectsPage render - showLeadForm: true"
4. **Check console**: Should see "LeadCaptureForm props: { projectId: [id] }"

#### **Step 3: Check for JavaScript Errors**
1. **Open browser dev tools** (F12)
2. **Go to Console tab**
3. **Click "Create Lead" button**
4. **Look for any red error messages**
5. **Check Network tab** for failed requests

### **Potential Issues & Solutions:**

#### **Issue 1: Button Click Not Registering**
**Symptoms**: No console logs when clicking button
**Possible Causes**:
- Button is disabled
- Click event is not bound
- JavaScript error preventing execution
- CSS overlay blocking clicks

**Solutions**:
```typescript
// Check if button is disabled
<Button 
  size="sm" 
  className="flex-1"
  onClick={() => {
    console.log('Button clicked!');
    handleCreateLead(project);
  }}
  disabled={false} // Ensure not disabled
>
  <Plus className="w-4 h-4 mr-1" />
  Create Lead
</Button>
```

#### **Issue 2: Modal Not Appearing**
**Symptoms**: Console logs show but no modal
**Possible Causes**:
- CSS z-index issues
- Modal HTML not rendering
- State not updating properly

**Solutions**:
```typescript
// Add visible debugging
{showLeadForm && selectedProject && (
  <div 
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    style={{ zIndex: 9999 }} // Force high z-index
  >
    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-4">
        <h2>DEBUG: Modal is visible!</h2>
        <p>Project: {selectedProject.name}</p>
        <p>Project ID: {selectedProject.id}</p>
        {/* Rest of modal content */}
      </div>
    </div>
  </div>
)}
```

#### **Issue 3: Form Not Loading**
**Symptoms**: Modal appears but form is broken
**Possible Causes**:
- LeadCaptureForm component error
- Missing imports
- TypeScript compilation errors

**Solutions**:
```typescript
// Add error boundary
{showLeadForm && selectedProject && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-4">
        <h2>Create Lead for {selectedProject.name}</h2>
        <ErrorBoundary fallback={<div>Error loading form</div>}>
          <LeadCaptureForm
            projectId={selectedProject.id}
            onSuccess={handleLeadSuccess}
            onCancel={() => {
              setShowLeadForm(false);
              setSelectedProject(null);
            }}
          />
        </ErrorBoundary>
      </div>
    </div>
  </div>
)}
```

### **Quick Fixes:**

#### **Fix 1: Add Alert for Testing**
```typescript
const handleCreateLead = (project: Project) => {
  alert(`Creating lead for: ${project.name}`);
  console.log('Create Lead button clicked for project:', project);
  setSelectedProject(project);
  setShowLeadForm(true);
};
```

#### **Fix 2: Force Modal Visibility**
```typescript
// Temporarily force modal to show
const [showLeadForm, setShowLeadForm] = useState(true); // Force true for testing
const [selectedProject, setSelectedProject] = useState({
  id: 'test-id',
  name: 'Test Project'
}); // Force test data
```

#### **Fix 3: Check Button Rendering**
```typescript
// Add visible debugging to button
<Button 
  size="sm" 
  className="flex-1 bg-red-500" // Make button very visible
  onClick={() => {
    console.log('BUTTON CLICKED!');
    alert('Button clicked!');
    handleCreateLead(project);
  }}
>
  <Plus className="w-4 h-4 mr-1" />
  Create Lead (DEBUG)
</Button>
```

### **Testing Checklist:**

- [ ] **Button Visible**: "Create Lead" button is visible on project cards
- [ ] **Button Clickable**: Button responds to clicks
- [ ] **Console Logs**: Debug logs appear in console
- [ ] **Modal Appears**: Dark overlay with white modal box
- [ ] **Form Loads**: LeadCaptureForm renders correctly
- [ ] **Project ID**: Form receives correct project ID
- [ ] **No Errors**: No JavaScript errors in console

### **Debug Console Commands:**

#### **Check Button Element:**
```javascript
// In browser console
const buttons = document.querySelectorAll('button');
const createLeadButtons = Array.from(buttons).filter(btn => 
  btn.textContent.includes('Create Lead')
);
console.log('Create Lead buttons found:', createLeadButtons);
```

#### **Check Modal Element:**
```javascript
// Check if modal is in DOM
const modal = document.querySelector('.fixed.inset-0');
console.log('Modal element:', modal);
console.log('Modal visible:', modal ? modal.style.display : 'not found');
```

#### **Check State Values:**
```javascript
// Check React state (if accessible)
console.log('showLeadForm:', showLeadForm);
console.log('selectedProject:', selectedProject);
```

### **Next Steps:**

1. **Test button click** with debug logs
2. **Check console** for any errors
3. **Verify modal rendering** with debugging
4. **Test form loading** with error boundary
5. **Fix any issues** found during debugging
6. **Remove debug code** once working

**The Create Lead button should work once these debugging steps are completed!** 🚀