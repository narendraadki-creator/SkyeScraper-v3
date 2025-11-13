## SKYESCRAPER Database Design Guide (Roles: Admin, Developer, Agent)

### Document Info
- Version: 1.0
- Date: 2025-11-08
- Scope: Implemented database schema, relationships, and role-based access controls used by the Website and Admin modules

## 1. Purpose
This guide documents the database entities, relationships, and Row-Level Security (RLS) model that power the SKYESCRAPER platform. It focuses on how Admin, Developer, and Agent roles interact with data for organizations, employees, projects, units, files, leads, and promotions.

## 2. Core Entities

### 2.1 organizations
- Represents companies onboarded to the platform
- Key fields (typical): `id`, `name`, `type` ('developer' | 'agent'), `status` ('active' | 'pending' | 'suspended'), `contact_email`, `contact_phone`, `address`, `created_by`, timestamps
- Relationships:
  - One-to-many with `employees` (organization has many users)
  - One-to-many with `projects` (developer organizations)
  - One-to-many with `promotions`
  - One-to-many with `project_files`

### 2.2 employees
- Represents authenticated users mapped to an organization
- Key fields (typical): `id`, `user_id` (Supabase auth UID), `organization_id`, `role` ('admin' | 'developer' | 'agent'), `email`, timestamps
- Relationships:
  - Many-to-one with `organizations`
  - One-to-many with `promotions` (created_by)

### 2.3 projects
- Real estate projects created by developers or admins
- Key fields (typical): `id`, `organization_id`, `name`, `location`, `type`, `status` ('draft' | 'published' | 'archived'), `creation_method` ('manual' | 'ai_assisted' | 'admin'), `description`, arrays: `amenities`, `connectivity`, `landmarks`, `payment_plans`, `floor_plan_urls`, timestamps
- Relationships:
  - Many-to-one with `organizations`
  - One-to-many with `units`
  - One-to-many with `project_files`
  - One-to-many with `promotions`

### 2.4 units
- Project units imported via Excel and stored as rows with flexible fields
- Key fields (typical): `id`, `project_id`, native columns (if any), `custom_fields` (jsonb), timestamps
- Relationships:
  - Many-to-one with `projects`
  - Often associated with `unit_imports` metadata

### 2.5 unit_imports
- Tracks unit import operations and header baselines for a project
- Purpose:
  - Persist last-imported header set for validation on subsequent imports
  - Track the source file used to import (and when)
- Typical fields: `id`, `project_id`, `headers` (jsonb), `file_id` or file reference, `imported_at`
- Relationships:
  - Many-to-one with `projects`
  - Optionally references `project_files` for the uploaded spreadsheet

### 2.6 project_files
- Indexed record of files stored in Supabase Storage, associated to a project
- Key fields: `id`, `project_id`, `file_url`, `file_name`, `file_purpose` (e.g., 'brochure', 'floor_plan', 'unit_import'), `uploaded_at`
- Relationships:
  - Many-to-one with `projects`
  - May be referenced by `unit_imports` or `projects.source_file_id`

### 2.7 leads
- Buyer/interest records created and managed generally by agents
- Key fields (typical): `id`, `organization_id`, `agent_id`/`created_by`, `project_id`, `status`, `source`, `budget`, contact info, timestamps
- Relationships:
  - Many-to-one with `organizations`
  - Many-to-one with `projects`
  - Often related to `employees` (agent)

### 2.8 promotions
- Marketing promotions created by developers/admins
- Key fields (implemented in 040): `id`, `organization_id`, `project_id`, `title`, `description`, `short_message`, `promotion_type`, `discount_percentage`, `discount_amount`, `start_date`, `end_date`, `status` (enum), `terms_conditions`, `target_audience` (jsonb), `banner_image`, `media_url`, `send_at`, `sent_at`, `is_scheduled`, `created_by`, timestamps
- Relationships:
  - Many-to-one with `organizations`
  - Many-to-one with `projects`
  - One-to-one with `promotion_metrics`

### 2.9 notifications
- In-app notifications
- Key fields: `id`, `organization_id`, `recipient_employee_id`, `type`, `title`, `message`, `payload` (jsonb), `is_read`, `created_at`

### 2.10 agent_property_interest
- Tracks agent interest opt-ins for project updates
- Key fields: `id`, `agent_employee_id`, `project_id`, `created_at` (unique on agent+project)

### 2.11 promotion_metrics
- Aggregated metrics per promotion
- Key fields: `id`, `promotion_id` (unique), `delivered_count`, `opened_count`, `clicked_count`, `updated_at`

## 3. Relationships Overview
- Organization 1—N Employees
- Organization 1—N Projects
- Organization 1—N Promotions
- Project 1—N Units
- Project 1—N Project Files
- Project 1—N Promotions
- Promotion 1—1 Promotion Metrics
- Employee (agent) N—N Projects via Agent Property Interest (unique pairs)
- Leads link Agents → Projects and also the Agent’s Organization

## 4. Role Model and Access

### 4.1 Roles
- Admin (`admin`): System-wide oversight. Can manage organizations (where applicable), view/manage all projects and related data, and bypass org-scoped restrictions in services.
- Developer (`developer`): Full management of own organization’s data (projects, units, files, promotions, leads scoped to their org).
- Agent (`agent`): View only published projects; manage own leads; can opt-in to project interests; view active promotions.

### 4.2 Role Resolution
- On login, application resolves `employees` row for `auth.uid()` to retrieve `organization_id` and `role`.
- All service-layer queries apply role-aware filters; RLS enforces hard boundaries at DB level.

## 5. RLS (Row-Level Security) Model
RLS is enabled across core tables. Policies ensure:
- Admins can perform necessary actions globally (either by explicit admin checks or by service logic using admin pathways).
- Developers are scoped to their `organization_id`.
- Agents can only see appropriate public (published/active) data and manage their own leads.

Summary of implemented policy patterns (representative highlights):

### 5.1 organizations (see migrations 015/016)
- Select/Update typically restricted to creator or own org context.
- Admin-level actions are handled via service logic and/or additional policies when required.

### 5.2 employees (see migrations 015/016)
- Users can select/update their own `employees` row (user-level scope).

### 5.3 projects (see migration 008)
- Developer view: can select projects where `projects.organization_id = employee.organization_id`.
- Agent view: can select projects if `status = 'published'` (public) or belongs to same org (for internal use cases).
- Developer manage: can insert/update/delete for own organization’s projects.

### 5.4 units (see migration 008)
- Select: tied to existing projects; agents rely on published visibility through UI; developers/admins can view/manage per their org/admin permissions.
- Manage: developers can manage units for projects in their organization.

### 5.5 leads (see migration 008)
- Select/Manage: scoped to the organization (agents manage their org’s leads; developers/admins see within their scope). Admins can use service/admin pathways for oversight.

### 5.6 project_files
- Enabled for RLS (see migration 008); records are visible to project owners; uploads performed by developers/admins result in indexed DB rows used by the Files tab.

### 5.7 promotions (see migrations 040, 041)
- Select:
  - Developers/Admins: can select their organization’s promotions (or admin bypass via role check).
  - Agents/Anyone: may select if `status = 'active'` (policy: `promotions_select_org_or_active`).
- Manage (insert/update/delete): Developers/Admins for their organization (policy: `promotions_manage_org_or_admin`).

### 5.8 unit_imports
- Scoped to project and therefore to owning organization. Used to persist header baselines per project for validation during subsequent imports.

## 6. Data Flows (Selected)

### 6.1 Registration
- Creates `organizations` row and `employees` row tied to `auth.uid()`.
- Role assignment per org type (developer → developer, agent → agent). System admins are created/managed outside normal registration.
- RLS for organizations/employees enabled with minimal “own-row” visibility to facilitate onboarding.

### 6.2 Developer Project Lifecycle
- Create project (manual/AI/admin created): stored in `projects`. If brochure used for AI extraction, an indexed `project_files` row is added (`file_purpose: 'brochure'`), and `projects.source_file_id` may be set.
- Manage project files: `project_files` visible in Files tab; all uploads create DB records.
- Import units: Upload Excel → storage; create `project_files` record (purpose: `unit_import`). `unit_imports` stores header baseline for future validations; units parsed into `units.custom_fields`.

### 6.3 Units Import Validation
- First import: accept any header set and persist as baseline in `unit_imports` for that project.
- Subsequent import: headers compared to baseline; if mismatch, application shows in-app confirmation to overwrite/update baseline before persisting.

### 6.4 Promotions
- Developers create promotions scoped to their organization/project; admin can manage across orgs.
- Agents can discover active promotions (status-based access).
- Metrics are aggregated in `promotion_metrics` per promotion row.

## 7. Indexes and Performance
- Promotions: `idx_promotions_send_at`, `idx_promotions_org_status` for scheduling and filtered lookups.
- Notifications: indexes on recipient and org/time for fast inbox/feeds.
- Agent interests: indexes on agent and project for quick membership checks.
- Promotion metrics: unique index on `promotion_id`.
- Projects/Units/Files: consider indexing `organization_id`, `project_id`, and common filters (`status`, created times) based on traffic patterns.

## 8. Role-by-Table Access Matrix (Conceptual)
- Admin
  - organizations/employees: read/write as required (via admin flows)
  - projects/units/files: read/write across all orgs
  - leads: read across all orgs; manage per admin operations
  - promotions: read/write across all orgs
- Developer
  - organizations: read own org (and update via allowed workflows)
  - employees: read own row
  - projects/units/files: read/write for own org
  - leads: read own org
  - promotions: read/write for own org
- Agent
  - organizations: read own org (own row in employees)
  - projects: read published projects (platform-wide)
  - units: read as surfaced through published project UIs
  - leads: read/write own org’s leads
  - promotions: can read active promotions

Note: Exact enforcement is through a combination of RLS policies and service-layer role checks (e.g., admins bypass org filters via admin flows, agents see published only via queries).

## 9. Adding New Tables: RLS Template
When introducing a new table `X` related to an organization or project:
1. Enable RLS: `ALTER TABLE X ENABLE ROW LEVEL SECURITY;`
2. Define read policy:
   - Developers: `organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid())`
   - Agents: Add public visibility if applicable (e.g., `status = 'published'`)
   - Admins: allow via broader policy or rely on admin-specific operations
3. Define write policies (insert/update/delete) for developers/admins scoped by `organization_id`.
4. Add necessary indexes to support expected filters.

## 10. Known Migrations (Key References)
- 008_rls_policies.sql: Baseline RLS enablement and policies across core tables (organizations, employees, projects, units, unit_imports, leads, promotions, project_files).
- 015_disable_rls_temporarily.sql: Temporary adjustments to facilitate registration, re-enabling minimal working policies for orgs/employees.
- 016_final_rls_solution.sql: Cleanup and re-application of simplified org/employee policies (foundation for later granular policies).
- 040_promotions_mvp.sql: Schema for promotions, notifications, agent_project_interest, promotion_metrics + indexes.
- 041_promotions_rls_policies.sql: Dedicated RLS policies for promotions (org-scope + active visibility).

## 11. Best Practices
- Keep role checks duplicated at both service layer and DB policies (defense in depth).
- Record all storage uploads in `project_files` to ensure visibility in Files tab.
- Use `custom_fields` (jsonb) in `units` to accommodate variable Excel import schemas.
- Maintain `unit_imports` header baselines to avoid data drift across imports.
- Prefer explicit role enums (`admin`, `developer`, `agent`) and avoid conflating org type with user role.

## 12. Future Enhancements
- Centralized audit log table for admin review of mutations.
- RLS consolidation pass to ensure final policies reflect the current three-role model everywhere.
- Optional read replicas and partitioning for very large `units` and `leads` datasets.
- Additional indexes guided by query plans as usage grows.




