## SKYESCRAPER Website PRD (Phase 1-2)

### Document Info
- Version: 1.0
- Date: 2025-11-08
- Owners: Product + Engineering
- Status: Implemented (documentation of current functionality)

## 1. Overview
The SKYESCRAPER Website is a premium, professional web interface for real estate developers and agents. It is a separate web experience from the mobile app but shares the same Supabase database, authentication, and storage. This PRD captures the functionality implemented to date, design standards, data/security policies, and acceptance criteria.

## 2. Goals and Non-Goals
### Goals
- Deliver a premium, modern website UI using the Website Design System.
- Provide developer dashboard for project management and promotions.
- Provide a robust, user-friendly Project Details Page (PDP) with clear sections and data.
- Enable units import via Excel with header validation and store uploads in files.
- Implement promotions creation and management for developers; visible lists per role and status.
- Ensure RLS security and role-based access across Admin, Developer, Agent.

### Non-Goals
- Building a separate `/developers` public directory page (applied design to `/developer` dashboard instead).
- Mobile app redesign (website only).
- Complex analytics beyond basic promotion metrics table definitions.

## 3. Users and Roles
### Personas
- Admin: Manages global configuration, can manage any organization’s promotions/projects.
- Developer: Manages own organization’s projects, units, files, and promotions.
- Agent: Views active promotions and project details, interacts with leads and files.

### Access Control
- Implemented three-role system: admin, developer, agent.
- Role-based routing and visibility throughout the app.

## 4. Scope
### In Scope
- Design System: `styles/website-design-system.css` and system-wide premium styling.
- Authentication: Login and Registration pages restyled and aligned to premium layout.
- Developer Dashboard (`/developer`): Project list, quick actions, consistent cards and buttons.
- Project Details Page: Hero, highlights, tabs (Details, Floor Plan, Location, Units, Payment Plan, Files).
- Units Import: Excel import on PDP Units tab with header validation and stored files.
- Files: File uploads recorded in DB and visible in PDP Files tab.
- Promotions: DB schema, API services, developer list & management, actions without OS popups.
- RLS: Promotions table policies enabling correct visibility and management.

### Out of Scope
- Public `/developers` listing page (design applied to `/developer` instead).
- Complex geospatial maps or location intelligence.
- End-to-end analytics funnels beyond basic promotion metrics storage.

## 5. Design System
### Tokens and Utilities
- Colors, typography, spacing, shadows defined in `src/styles/website-design-system.css`.
- Containers: `container`, `container-narrow`, `container-wide`.
- Sections: `page-wrapper`, `page-header`, `section-content`, `section-card`.
- Components: `.card-professional`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, grid utilities.
- PDP-specific styles for hero, badges, tabs, tables, highlights, and info cards.

### Principles
- Modern, minimal, premium aesthetic; subtle shadows; generous white space; elegant typography.
- Responsive grid and consistent width alignment across screens.

## 6. Functional Requirements
### 6.1 Authentication
- Login Page:
  - Premium design aligned with developer dashboard width.
  - Uses Supabase: `signInWithPassword`, `signOut`, `getUser`.
  - Offline handling guidance; error surfaced cleanly.
- Registration Page:
  - Premium design with hero and form integrated into the page (not a floating card).
  - Uses Supabase to create user and organization record.
  - Website normalization (auto-add https:// when missing).
  - Offline guard before network calls.

### 6.2 Developer Dashboard (`/developer`)
- Project List:
  - Consistent professional cards; button sizes and share aligned (View Details / Create Promotion).
  - Stable card height irrespective of content length.
  - Sorting fix for possession date (comparator corrected).
- Quick Actions:
  - Create New Project
  - Add Team Member
  - Manage Promotions
- Navigation:
  - Project “View Details” → PDP.
  - “Create Promotion” available per project.

### 6.3 Project Details Page (PDP)
- Header/Hero:
  - Project name, location, developer.
  - Hero banner with overlay, status badge.
  - Stats row for key highlights.
- Tabs (ordered):
  - Details: Description, Amenities, Timeline.
  - Floor Plan: Renders `project.floor_plan_urls` as images.
  - Location: Address, Connectivity, Nearby Landmarks.
  - Units: Data table (see Units section), Import Units, summary.
  - Payment Plan: Renders `project.payment_plans`.
  - Files: Upload/list files associated with project.
- Buttons:
  - “Back to Dashboard” navigates to `/developer`.
  - Removed all “Manage Units” buttons (replaced with inline import in Units tab).
- Popups:
  - All destructive/important actions avoid OS-native prompts; use in-app confirmations where required.

### 6.4 Units Management (via PDP Units Tab)
- Units Table:
  - Displays units based on imported Excel. Final implementation shows data sourced from `custom_fields` (native duplicates removed).
  - Table headers generated dynamically from present unit `custom_fields`.
  - No duplicate columns; no mock data.
- Import Units:
  - File upload triggers OS file picker directly from “Import Units” button.
  - Upload stored to Supabase Storage; a DB record is created in `project_files` so the file appears in Files tab.
  - Excel processing extracts headers and rows; maps to `custom_fields`.
  - First import for a project accepts any header format.
  - From second import onward, headers are compared to last import:
    - If different, show in-app validation modal with overwrite warning (no OS-native prompts).
    - User can confirm overwrite to proceed or cancel.

### 6.5 Files (PDP Files Tab)
- Upload any project-related file; stored in Supabase Storage.
- Record inserted in `project_files` with relevant metadata (e.g., `file_purpose`).
- Brochures used for AI extraction:
  - After upload, inserted as `project_files` with `file_purpose: 'brochure'`.
  - `source_file_id` set on the project for traceability.
- Unit import files are also recorded in `project_files` and visible immediately.

### 6.6 Promotions
- DB and RLS:
  - Tables: `promotions`, `notifications`, `agent_property_interest`, `promotion_metrics`.
  - RLS policies allow:
    - Developers/Admins: manage promotions for their own organization (or all for admin).
    - Selection: developers see own organization’s promotions; agents see all active promotions.
- Developer Promotions Page:
  - Lists promotions created by the logged-in developer’s organization.
  - Status filter (e.g., Draft, Published, Paused, Completed).
  - Expandable cards to view full description and terms.
  - Actions: Publish, Pause, Complete, Duplicate, Delete.
  - All actions use application UI (no OS-native popups).
  - Project name is displayed on each card.
- Create Promotion Page:
  - Form for title, short message, description, discount fields, dates.
  - Project pre-selected when navigating from a project card; project name displayed.
  - Back button navigates to PDP or `/developer`.
  - Offline guard prevents submission while offline.
  - On save, navigates to `/developer`.

## 7. Data Models (Key)
### promotions
- id (uuid), title, short_message, description
- status (enum: draft, published, paused, completed)
- start_date, end_date
- discount_percentage, discount_amount
- organization_id (uuid), created_by (uuid), project_id (uuid)
- timestamps, indexes

### notifications
- id, user_id, organization_id, type, payload, read_at, timestamps

### agent_property_interest
- id, agent_id, project_id, interest_level, payload, timestamps

### promotion_metrics
- id, promotion_id, views, clicks, conversions, timestamps

### project_files
- id, project_id, file_url, file_name, file_purpose, uploaded_at

### units
- id, project_id, native fields, custom_fields (jsonb), timestamps

## 8. Services and APIs
- Supabase Auth: `getUser`, `signInWithPassword`, `signOut`, `signUp`
- Data: `from(table).select()`, `insert()`, `update()`, `delete()`
- Storage: `supabase.storage` for file uploads and retrieval
- Services:
  - `projectService`: create project, record brochures, prefill developer name
  - `unitService`: process Excel, upload imports, robust header handling
  - `fileService`: upload and insert `project_files` records
  - `promotionService`: list (role-aware), get, create, update, delete, getMetrics

## 9. Security and RLS
- RLS enforced on key tables (including promotions).
- Policies:
  - `promotions_select_org_or_active`: users may select promotions belonging to their org or any active promotions.
  - `promotions_manage_org_or_admin`: developers/admins may insert/update/delete promotions for their org (admins unrestricted).
- Role-aware filtering in services (developers see own org; agents see active).

## 10. UX Requirements
- Consistent width across pages; `container` for headers and `container-narrow` for main content.
- Premium, minimal UI using design system classes.
- Buttons and CTAs consistent in size and alignment.
- No OS-native confirmation dialogs for app actions; use application UI components.
- PDP: clear tab structure; only necessary content in Details (Description, Amenities, Timeline).
- Units: immediate and clear import path; errors surfaced inline via modal/dialog.

## 11. Error Handling and Offline
- Offline guard in Create Promotion and Registration; avoid failing calls with ambiguous errors.
- Network errors in file and data fetching surface as user-friendly messages.
- External extension errors (e.g., browser issues) are non-blocking to the app logic.

## 12. Acceptance Criteria
### Authentication
- Login and Register pages render with premium styles and correct widths.
- Register form is integrated in-page (not floating card).

### Developer Dashboard
- Projects render with consistent card heights; buttons aligned and consistently sized.
- Quick Actions present for Create Project and Add Team Member (and Manage Promotions if configured).
- Sorting works without runtime errors.

### Project Details Page
- Tabs: Details (Description, Amenities, Timeline), Floor Plan, Location, Units, Payment Plan, Files.
- “Back to Dashboard” navigates to `/developer`.
- No OS-native popups for actions on this page.

### Units Import and Table
- “Import Units” opens OS file picker directly.
- First import accepts any headers.
- Subsequent import with different headers shows in-app validation modal with overwrite warning.
- Imported Excel appears in Files tab as a DB record.
- Units table shows deduplicated headers sourced from `custom_fields` (no mocked data).

### Files
- Uploads appear in Files tab; brochures used for AI extraction are recorded with `file_purpose: 'brochure'`.

### Promotions
- Developers see only their organization’s promotions; agents see active promotions.
- Create Promotion shows project name if launched from a project.
- Promotions list supports Publish, Pause, Complete, Duplicate, Delete without OS-native dialogs.
- Expanded cards reveal full description and terms.

## 13. Open Items / Future Enhancements
- Public developer directory / landing pages.
- Rich location visualization (maps), richer analytics dashboards.
- Enhanced unit analytics beyond summary.
- More granular promotions targeting and performance breakdown.

## 14. Dependencies
- Supabase (Auth, Postgres, RLS, Storage).
- React, react-router-dom.
- Vite build tool.
- class-variance-authority (for styling patterns).

## 15. Release Notes (Summary)
- Premium Website Design System applied across dashboard, PDP, login, register.
- PDP with modern hero, highlights, and tabbed sections.
- Units import on PDP with header validation and files recorded.
- Promotions module with full CRUD and role-aware visibility; no OS-native prompts.
- Security via Supabase RLS for promotions; role-based routing and filtering throughout.




