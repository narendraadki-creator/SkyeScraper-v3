# Create Lead Button Test Guide

## 🧪 **Testing the Create Lead Button**

### **Current Debug Setup:**
- ✅ **Alert added** to `handleCreateLead` function
- ✅ **Console logging** for button clicks and state changes
- ✅ **Project loading** debug logs
- ✅ **Modal state** debug logs
- ✅ **Form props** debug logs

### **Test Steps:**

#### **Step 1: Basic Button Test**
1. **Login as agent**: `agent3@skye.com` / `password@123`
2. **Navigate to**: `http://localhost:5179/agent-projects`
3. **Wait for projects to load** (check console for "Loaded projects:")
4. **Click "Create Lead" button** on any project card
5. **Expected**: Alert should show "Creating lead for: [Project Name]"

#### **Step 2: Console Logs Check**
After clicking the button, check console for:
```
Loaded projects: [array of projects]
Create Lead button clicked for project: {id: "...", name: "..."}
Project ID: [project-id]
Project name: [project-name]
Modal state set to true
AgentProjectsPage render - showLeadForm: true, selectedProject: {...}
LeadCaptureForm props: { projectId: "...", unitId: undefined, initialData: undefined }
```

#### **Step 3: Modal Visibility Test**
1. **After clicking button**: Look for dark overlay
2. **Expected**: Modal should appear with "Create Lead for [Project Name]" header
3. **Expected**: Form should be visible inside modal

### **Troubleshooting:**

#### **If Alert Doesn't Show:**
- **Button not clickable**: Check if button is disabled or overlapped
- **JavaScript error**: Check console for red error messages
- **Event not bound**: Check if onClick handler is properly attached

#### **If Alert Shows But Modal Doesn't:**
- **State not updating**: Check console for state logs
- **CSS issues**: Check if modal is hidden by CSS
- **Z-index problems**: Modal might be behind other elements

#### **If Modal Shows But Form Doesn't:**
- **Component error**: Check console for LeadCaptureForm errors
- **Props not passed**: Check if projectId is undefined
- **Import issues**: Check if LeadCaptureForm is properly imported

### **Quick Fixes:**

#### **Fix 1: Force Button Visibility**
```typescript
<Button 
  size="sm" 
  className="flex-1 bg-red-500 text-white" // Make button very visible
  onClick={() => {
    alert('BUTTON CLICKED!');
    handleCreateLead(project);
  }}
>
  <Plus className="w-4 h-4 mr-1" />
  Create Lead (TEST)
</Button>
```

#### **Fix 2: Force Modal to Show**
```typescript
// Temporarily force modal state
const [showLeadForm, setShowLeadForm] = useState(true);
const [selectedProject, setSelectedProject] = useState({
  id: 'test-id',
  name: 'Test Project'
});
```

#### **Fix 3: Add Error Boundary**
```typescript
// Wrap the modal content in error boundary
{showLeadForm && selectedProject && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-4">
        <h2>DEBUG: Modal is working!</h2>
        <p>Project: {selectedProject.name}</p>
        <p>Project ID: {selectedProject.id}</p>
        <ErrorBoundary fallback={<div>Form Error</div>}>
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

### **Expected Results:**

#### **✅ Working Button:**
- Alert shows project name
- Console logs appear
- Modal opens with form
- Form receives project ID

#### **❌ Not Working Button:**
- No alert (button not clickable)
- No console logs (event not firing)
- Modal doesn't appear (state issue)
- Form doesn't load (component error)

### **Next Steps:**

1. **Test with current debug setup**
2. **Check console logs** for any errors
3. **Try quick fixes** if issues found
4. **Report specific error messages** if any
5. **Remove debug code** once working

**The debug setup should help identify exactly where the issue is occurring!** 🔍
