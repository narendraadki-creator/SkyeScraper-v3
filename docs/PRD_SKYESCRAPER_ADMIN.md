## SKYESCRAPER Admin Module PRD (Phase 1-2)

### Document Info
- Version: 1.0
- Date: 2025-11-08
- Owners: Product + Engineering
- Status: Implemented (documentation of current functionality)

## 1. Overview
The Admin Module provides system-wide oversight and management features for SKYESCRAPER. Admins can manage organizations, oversee all projects and leads, create/edit projects on behalf of developers, and view analytics. This PRD documents implemented behavior, data, security, and acceptance criteria.

## 2. Goals and Non-Goals
### Goals
- Provide a dedicated admin experience with clear navigation and role-gated access.
- Manage organizations (view, filter, status changes, edit).
- Oversight of all projects (list, filter, view, create, edit, delete).
- View and filter all leads across agents and organizations.
- System analytics overview (KPIs, distributions, top performers).
- Ensure security via role-based routing and RLS.

### Non-Goals
- Agent/developer workflow ownership (covered in their modules).
- Advanced BI/analytics beyond basic KPIs and distributions.
- Public marketing pages.

## 3. Users and Roles
- System Admin (`admin`): Full system-wide access.
- Developer (`developer`): Own organization only. No access to admin routes.
- Agent (`agent`): Published projects and own leads only. No access to admin routes.

Access control aligns with the three-role system plan and execution guides.

## 4. Scope
### In Scope
- Admin Dashboard (`/admin`): System overview, quick actions.
- Organization Management (`/admin/organizations`, details, edit).
- Project Oversight (`/admin/projects`, create, edit, view, delete).
- Lead Monitoring (`/admin/leads`): Browse/filter all leads.
- System Analytics (`/admin/analytics`): KPIs and distributions.
- Role-protected routes and UI; RLS-compliant data access.
- Admin creation of projects “on behalf of” developer organizations.

### Out of Scope
- Managing billing/subscriptions.
- Advanced report builders.
- Complex workflow automation.

## 5. Design and UX
- Uses website design system (`src/styles/website-design-system.css`).
- Consistent containers and spacing across admin pages.
- Clear badges: org type/status, project status/creation method, lead status/source.
- Avoid OS-native popups; use application confirmations where needed.
- Role-based UI: Admin-only navigation buttons and actions.

## 6. Functional Requirements

### 6.1 Admin Dashboard (`/admin`)
- Access: Only `admin` role.
- Content:
  - KPIs: organizations, projects, leads, conversion, trends.
  - System health (uptime, response time, error rate).
  - Breakdown cards: organizations (developer/agent, active/pending/suspended), projects (draft/published/archived, manual/ai_assisted/admin).
  - Quick actions: Manage Organizations, Project Oversight, Lead Monitoring, Analytics.
- Behavior: Non-admins redirected with access denied.

### 6.2 Organization Management
- Routes:
  - List: `/admin/organizations`
  - Details: `/admin/organizations/:organizationId`
  - Edit: `/admin/organizations/:organizationId/edit`
- List:
  - View all organizations with filters (type, status, search by name/email).
  - Cards show counts (employees, projects, leads) and badges.
- Details:
  - Full organization info: contact, address, type, status, timestamps, stats.
  - Actions: Activate/Suspend with immediate UI feedback.
  - Quick links to view projects/leads; edit organization.
- Edit:
  - Form edit for name, type, status, contact email/phone, address.
  - Validation; Save/Cancel flows; error handling.
- Service:
  - `adminService.updateOrganization(...)` for updates.
- Security:
  - Admin-only pages and actions.

### 6.3 Project Oversight
- Routes:
  - List: `/admin/projects`
  - Create: `/admin/projects/create`
  - Edit: `/admin/projects/:projectId/edit`
  - View: Reuses shared PDP at `/projects/:projectId`
- List:
  - All projects from all orgs with filters (organization type, creation method, status, search by name/location).
  - Badges: `draft`, `published`, `archived`; `manual`, `ai_assisted`, `admin`.
  - Shows organization info and engagement metrics (views/leads/units count when available).
- Create (on behalf of developer):
  - Developer organization selection (required).
  - Full project form (name, location, type, starting price, completion date, description).
  - Dynamic arrays: amenities, connectivity, landmarks, payment plans.
  - Validation and navigation. Sets `creation_method: 'admin'`.
- Edit:
  - Full edit with pre-populated data.
  - Manage dynamic arrays, validate, save/cancel.
- View:
  - Admin uses shared `ProjectDetailsPage`; admin sees management buttons.
- Service:
  - `adminService.createProjectOnBehalf(...)`
  - `projectService` respects admin privileges: list/edit/delete any project.
- Security:
  - Admin-only routes and actions at UI and service layers.

### 6.4 Lead Monitoring
- Route: `/admin/leads`
- Features:
  - View all leads across agents/organizations.
  - Filters: lead status, source, org type, search by name/email.
  - Actions: View details, edit lead (as per implemented admin permissions).
- UX:
  - Clear status and source badges; project/organization/agent context visible.

### 6.5 System Analytics
- Route: `/admin/analytics`
- Features:
  - KPIs: orgs, projects, leads, performance.
  - Distribution charts (organization types, project creation methods, lead statuses).
  - Progress bars for distributions (colors per status).
  - Top performers: agents, projects by engagement.

## 7. Data Models (Admin-Relevant)
- `organizations`: id, name, type (`developer`|`agent`), status (`active`|`pending`|`suspended`), contacts, address, timestamps.
- `employees`: id, user_id, organization_id, role (`admin`|`developer`|`agent`).
- `projects`: id, organization_id, name, location, type, status, creation_method (`manual`|`ai_assisted`|`admin`), arrays (amenities, connectivity, landmarks, payment_plans), timestamps.
- `leads`: id, agent_id, project_id, status, source, budget, contact details, timestamps.
- `project_files`: standard file recording for Brochures/Floor Plans/etc.

Note: Promotions data is documented in the Website PRD; admins have system-wide oversight through role and RLS but management UI is primarily in the developer module.

## 8. Services and APIs
- Admin services:
  - `updateOrganization(organizationId, updates)`
  - `createProjectOnBehalf(organizationId, projectInput)`
  - Listing endpoints for organizations/projects/leads (no org filter; admin can see all).
- Project services:
  - Admin bypasses org scoping (can list/edit/delete any project).
  - Creation method stamped `admin` for admin-created projects.
- Auth:
  - Supabase Auth: `getUser`, role retrieval from `employees`.
- Data:
  - Supabase PostgREST queries scoped by role logic in services.

## 9. Routing and Protection
- Admin-only routes:
  - `/admin`, `/admin/organizations`, `/admin/organizations/:id`, `/admin/organizations/:id/edit`
  - `/admin/projects`, `/admin/projects/create`, `/admin/projects/:projectId/edit`
  - `/admin/leads`, `/admin/analytics`
- Protection:
  - `ProtectedRoute` supports `requiredRole="admin"` checks.
  - Non-admins are redirected with clear access-denied UI.

## 10. Security and RLS
- Role checks at UI and service layers.
- RLS:
  - Admins can read/write across organizations as required by admin functionality.
  - Developers scoped to their organization.
  - Agents limited to published/project-specific data.
- Error messaging avoids data leakage.

## 11. Error Handling and Offline
- Network errors present user-friendly messages and allow retry.
- Permission errors display access-denied and redirect appropriately.
- Admin forms have validation states and submission error handling.

## 12. Acceptance Criteria
- Admin Dashboard:
  - Loads for admin; non-admins denied and redirected.
  - KPIs and breakdown cards display accurate, timely data.
- Organization Management:
  - List filters (type/status/search) function correctly.
  - Details show full info and stats; status changes reflect immediately.
  - Edit form validates and saves; navigation flows correct.
- Project Oversight:
  - List shows all projects with filters and badges.
  - Create Project on behalf sets `creation_method: 'admin'` and associates org.
  - Edit updates fields correctly; dynamic arrays managed successfully.
  - View uses shared PDP with admin management buttons visible.
- Lead Monitoring:
  - Lists all leads with functional filters and search.
  - View/Edit actions work where implemented.
- Analytics:
  - Displays KPIs, distributions, progress bars, top performers.
- Security:
  - Admin-only access is enforced across routes and services.
  - RLS boundaries prevent unauthorized access.

## 13. Non-Functional Requirements
- Performance:
  - Lists handle large datasets (100+ orgs, 1000+ projects, 10k+ leads) with acceptable latency.
  - Filters/search respond quickly.
- Reliability:
  - Robust error handling; no crashes on empty/edge cases.
- Maintainability:
  - Shared components leveraged (PDP, services), minimal duplication.
- Accessibility:
  - Semantic headings, discernible labels, keyboard navigable actions.

## 14. Open Items / Future Enhancements
- Bulk organization/project actions.
- Advanced BI dashboards, exportable analytics.
- Audit log viewer UI.
- Admin moderation for promotions.

## 15. Release Notes (Admin)
- Admin Dashboard with KPIs and system health.
- Organization Management with view/edit and status control.
- Project Oversight: full list, create on behalf, edit, delete, view with shared PDP.
- Lead Monitoring: list and filters for all leads.
- System Analytics: KPIs, distributions, progress bars, top performers.
- Strict role gating with RLS-aligned services and routes.