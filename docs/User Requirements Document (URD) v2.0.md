SkyeScraper - Enhanced User Requirements Document (URD) v2.0
Document Information
•	Version: 2.0
•	Date: September 2025
•	Project: SkyeScraper Real Estate Platform
•	Purpose: Comprehensive requirements for unified rebuild
•	Author: System Architect
________________________________________
1. Executive Summary
1.1 Project Vision
SkyeScraper is a unified real estate management platform connecting Developers (supply), Agents (demand), and system oversight through a cohesive, organization-centric architecture. The platform emphasizes seamless data flow, flexible inventory management, and AI-assisted workflows while maintaining design consistency.
1.2 Critical Success Factors
•	Unified Data Model: Single source of truth for manual and AI-created projects
•	Dynamic Inventory: Flexible unit management supporting multiple import formats
•	Role Integration: Consistent UX across Developer, Agent, and Admin interfaces
•	Design Preservation: Maintain original UI aesthetic throughout implementation
•	Easy Updates: Simple inventory refresh process for Excel/PDF files
1.3 Lessons Learned from Previous Implementation
•	? Avoided: Separate schemas for manual vs AI project creation
•	? Avoided: Column mismatches between different data entry methods
•	? Avoided: UI redesign during backend integration
•	? Implemented: Single unified project schema with creation_method flag
•	? Implemented: JSONB custom_fields for dynamic unit columns
•	? Implemented: Version control for inventory updates
•	? Implemented: Design system preservation through implementation
________________________________________
2. System Architecture Overview
2.1 Three-Tier User Model
+-----------------------------------------------------+
¦           SYSTEM ADMIN (Super User)                  ¦
¦     - Manages all organizations and employees        ¦
¦     - Creates projects on behalf of developers       ¦
¦     - System oversight and conflict resolution       ¦
+-----------------------------------------------------+
                           ¦
        +-------------------------------------+
        ¦                                     ¦
+-------?----------+              +----------?---------+
¦   DEVELOPER ORG  ¦              ¦    AGENT ORG       ¦
¦   (Supply Side)  ¦              ¦  (Demand Side)     ¦
+------------------¦              +--------------------¦
¦ • Create Projects¦?------------?¦ • Browse Projects  ¦
¦ • Manage Units   ¦  Shared Data ¦ • Capture Leads    ¦
¦ • Upload Files   ¦              ¦ • Track Conversions¦
¦ • Track Sales    ¦              ¦ • View Promotions  ¦
+------------------+              +--------------------+
2.2 Data Flow Architecture
Developer Creates Project
    ¦
    +--? Manual Entry --+
    ¦                    +--? UNIFIED PROJECT TABLE
    +--? AI Processing -+     (creation_method flag)
                ¦
                +--? Standard Fields (always present)
                +--? AI-Extracted Fields (JSONB when from AI)
                +--? Custom Fields (JSONB for flexibility)

Project Units
    ¦
    +--? Excel Import --+
    +--? PDF Import ----¦
    +--? Manual Entry -----? UNIFIED UNITS TABLE
                              ¦
                              +--? Core Fields (standardized)
                              +--? Custom Fields (JSONB)
                              +--? Column Mapping (version controlled)

Agents Access
    ¦
    +--? Read Projects ? View Units ? Capture Leads
________________________________________
3. Core Entities and Relationships
3.1 Organizations (Top-Level Entity)
Purpose: Companies that use the platform
Types:
•	Developer Organization: Creates and manages property projects
•	Agent Organization: Sells properties and manages leads
Key Attributes:
•	Organization profile (name, type, contact, branding)
•	Status (pending, active, suspended)
•	Multiple employees with role-based access
•	Organization-scoped data isolation
3.2 Employees (Within Organizations)
Purpose: Individual users working within organizations
Roles:
•	Organization Admin: Full organization management
•	Manager/Team Lead: Team oversight and reporting
•	Agent/Staff: Operational tasks and lead management
Key Attributes:
•	Employee profile linked to organization
•	Role-based permissions (JSONB)
•	Activity tracking and performance metrics
3.3 Projects (Unified Schema)
Purpose: Real estate developments with flexible creation methods
Creation Methods:
1.	Manual Entry: Developer enters all details via form
2.	AI-Assisted: Upload brochure PDF, AI extracts details
3.	Hybrid: AI extraction + manual review/editing
4.	Admin-Created: Super admin creates on behalf of developer
Unified Schema Design:
-- CRITICAL: Single table for all creation methods
CREATE TABLE projects (
    -- Core Identity (ALWAYS REQUIRED)
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,  -- Developer who owns this
    name VARCHAR(255) NOT NULL,
    
    -- Basic Details (ALWAYS REQUIRED)
    location VARCHAR(255) NOT NULL,
    project_type VARCHAR(100),  -- Apartment, Villa, Commercial
    starting_price DECIMAL(15,2),
    status project_status DEFAULT 'draft',
    
    -- Creation Metadata (TRACKING)
    creation_method VARCHAR(50) NOT NULL,  -- 'manual', 'ai_assisted', 'hybrid', 'admin'
    created_by UUID NOT NULL,  -- Employee or Admin
    source_file_id UUID,  -- Reference to uploaded file
    ai_confidence_score DECIMAL(3,2),  -- 0.00 to 1.00 for AI extractions
    
    -- Standard Project Details (NULLABLE)
    description TEXT,
    developer_name VARCHAR(255),
    address TEXT,
    total_units INTEGER,
    completion_date DATE,
    handover_date DATE,
    
    -- AI-Extracted Structured Data (JSONB)
    amenities JSONB DEFAULT '[]',  -- ["Pool", "Gym", "Parking"]
    connectivity JSONB DEFAULT '[]',  -- ["Highway 5km", "Metro 2km"]
    landmarks JSONB DEFAULT '[]',  -- [{"name": "Airport", "distance": "15km"}]
    payment_plans JSONB DEFAULT '[]',  -- [{"name": "Plan A", "terms": "..."}]
    
    -- Additional Flexible Data (JSONB)
    master_plan JSONB,  -- Layout, zoning, tower info
    custom_attributes JSONB,  -- Developer-specific fields
    
    -- Media and Documents
    featured_image TEXT,
    gallery_images TEXT[],
    brochure_url TEXT,
    floor_plan_urls TEXT[],
    
    -- Status and Tracking
    is_featured BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    leads_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);
Key Design Principles:
•	? Single table eliminates column mismatch issues
•	? creation_method field tracks data origin
•	? JSONB fields provide flexibility without schema changes
•	? All methods use same validation and business logic
•	? Easy to extend with new fields without breaking existing data
3.4 Units (Dynamic Schema with Version Control)
Purpose: Individual property units with flexible column structure
Import Sources:
1.	Excel Files: Most common, varies by developer
2.	PDF Tables: Extracted via OCR and table detection
3.	Manual Entry: Individual unit creation
4.	Bulk Updates: Replace existing units with new data
Unified Schema Design:
-- Core table with standard + dynamic fields
CREATE TABLE units (
    -- Core Identity
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL,
    unit_number VARCHAR(50) NOT NULL,
    
    -- Standard Fields (ALWAYS PRESENT)
    unit_type VARCHAR(100),  -- Studio, 1BHK, 2BHK, etc.
    floor_number INTEGER,
    area_sqft DECIMAL(10,2),
    bedrooms INTEGER,
    bathrooms INTEGER,
    price DECIMAL(15,2),
    status unit_status DEFAULT 'available',  -- available, held, sold, reserved
    
    -- Dynamic/Custom Fields (VARIES BY DEVELOPER)
    custom_fields JSONB DEFAULT '{}',  -- Store any additional columns
    
    -- Import Metadata
    import_version UUID,  -- Links to imports table
    source_file_id UUID,
    source_row_number INTEGER,
    column_mapping JSONB,  -- Maps source columns to fields
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(project_id, unit_number)
);

-- Track import versions for updates
CREATE TABLE unit_imports (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL,
    import_type VARCHAR(50),  -- 'excel', 'pdf', 'manual', 'api'
    source_file_name VARCHAR(255),
    source_file_url TEXT,
    imported_by UUID,  -- Employee who did the import
    
    -- Column Configuration
    detected_columns JSONB,  -- Original column names from file
    column_mapping JSONB,  -- How columns map to standard fields
    custom_fields_config JSONB,  -- Config for rendering custom fields
    
    -- Statistics
    total_units INTEGER,
    units_created INTEGER,
    units_updated INTEGER,
    errors JSONB,
    
    -- Version Control
    version_number INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    replaced_by UUID,  -- Points to newer import
    
    imported_at TIMESTAMPTZ DEFAULT NOW()
);
Dynamic Column Handling:
// Example: Oasis Residences has discount columns
{
  "unit_id": "OA-101",
  "unit_type": "Studio",
  "floor_number": 5,
  "area_sqft": 450,
  "price": 850000,
  "custom_fields": {
    "phpp_price": 850000,
    "discount_20": 680000,
    "discount_15": 722500,
    "discount_10": 765000,
    "payment_plan": "60% DC / 40% PHPP",
    "view": "Business Bay",
    "balcony": "Yes",
    "dld_fee": 42500
  }
}

// Column mapping stored in unit_imports
{
  "source_to_standard": {
    "Unit Number": "unit_number",
    "BRs": "unit_type",
    "Floor": "floor_number",
    "Total Size": "area_sqft",
    "PHPP PRICE": "price"
  },
  "source_to_custom": {
    "20% Discount": "discount_20",
    "15% Discounts": "discount_15",
    "10% Discounts": "discount_10",
    "5% Discount": "discount_5",
    "PAYMENT PLAN": "payment_plan",
    "Unit View": "view",
    "Balcony": "balcony",
    "DLD Registration Fees 5% paid by client": "dld_fee"
  }
}
3.5 Leads (Agent-Captured)
Purpose: Track potential customers interested in properties
Key Attributes:
•	Lead contact information
•	Associated project and organization
•	Assigned agent (employee)
•	Lead stage and status
•	Communication history
•	Conversion tracking
Multi-Organization Visibility:
•	Agent organization sees their leads
•	Developer organization sees leads for their projects
•	Admin sees all leads across platform
3.6 Promotions (Cross-Organization Sharing)
Purpose: Marketing campaigns shared between developers and agents
Key Features:
•	Developer creates promotion for their projects
•	Agents access promotions to drive sales
•	Time-bound offers with expiration
•	Performance tracking across organizations
________________________________________
4. Functional Requirements (Unified Flows)
4.1 Project Creation (Unified Flow)
REQ-PROJ-001: Single Project Creation Flow
All project creation methods follow the same workflow with different data sources:
Step 1: Initiate Creation
+-- Manual: Developer opens "Create Project" form
+-- AI-Assisted: Developer uploads brochure PDF
+-- Hybrid: Upload + manual review
+-- Admin: Super admin creates on behalf of developer

Step 2: Data Input/Extraction
+-- Manual: Fill form fields ? Validate ? Save
+-- AI: Process file ? Extract data ? Preview ? Confirm/Edit ? Save
+-- All methods write to SAME database table

Step 3: Post-Creation
+-- Status: 'draft' (editable)
+-- Add Units: Import Excel/PDF or manual entry
+-- Upload Documents: Brochures, floor plans, images
+-- Publish: Status ? 'published' (visible to agents)
Validation Rules (Apply to ALL methods):
•	Required: name, location, organization_id, creation_method
•	Optional but recommended: description, starting_price, completion_date
•	JSONB fields: Validate structure but allow flexibility
•	Status transitions: draft ? published ? archived (no backwards)
REQ-PROJ-002: AI-Assisted Project Creation
Enhanced AI processing with confidence scoring:
1. File Upload
   - Accept: PDF, images (JPG, PNG)
   - Max size: 20MB
   - Store: Supabase Storage with unique path

2. AI Processing (OpenAI Vision API)
   - Extract: Project details, amenities, landmarks, payment plans
   - Confidence: 0-1 score per field
   - Low confidence (< 0.7): Flag for manual review

3. Preview & Confirmation
   - Show extracted data with confidence indicators
   - Highlight low-confidence fields in yellow
   - Allow editing before saving
   - User confirms: "Save Project"

4. Save to Database
   - Write to projects table
   - Set creation_method = 'ai_assisted'
   - Store confidence scores
   - Link source file
REQ-PROJ-003: Project Editing
Unified editing regardless of creation method:
•	Edit form pre-populated with current values
•	JSONB fields rendered as structured forms
•	Version history tracking (audit log)
•	Real-time validation
•	Save triggers updated_at timestamp
4.2 Unit Management (Dynamic Import System)
REQ-UNIT-001: Multi-Format Unit Import
Support Excel, PDF, and manual entry with version control:
Import Workflow:
1. File Upload
   +-- Excel: Parse with SheetJS/ExcelJS
   +-- PDF: Extract tables with pdf-parse + OCR
   +-- Manual: Individual unit entry form

2. Column Detection (AI-Powered)
   +-- Identify headers: "Unit Number", "Type", "Floor", etc.
   +-- Detect data types: text, number, currency, date
   +-- Map to standard fields: unit_number, unit_type, floor, etc.
   +-- Identify custom fields: discounts, payment plans, views

3. Mapping Configuration
   +-- Auto-map common columns (90% accuracy)
   +-- Show unmapped columns for review
   +-- Developer confirms/adjusts mapping
   +-- Save mapping for reuse

4. Preview & Validate
   +-- Show sample rows (first 5)
   +-- Highlight potential issues
   +-- Display statistics: X units, Y custom fields
   +-- Confirm: "Import Units"

5. Save to Database
   +-- Create unit_imports record (version control)
   +-- Insert/update units with custom_fields JSONB
   +-- Mark previous import as replaced
   +-- Notify: "Successfully imported X units"
REQ-UNIT-002: Update Existing Units
Handle inventory updates gracefully:
Update Strategies:
1. Replace All
   - Delete existing units for project
   - Import new units from file
   - Use when: Complete refresh needed

2. Merge Updates
   - Match by unit_number
   - Update existing, add new
   - Preserve: held/sold status
   - Use when: Partial updates

3. Manual Updates
   - Edit individual units
   - Bulk status changes
   - Use when: Small corrections
REQ-UNIT-003: Dynamic Column Rendering
Display units with developer-specific columns:
// Table dynamically renders based on custom_fields
<UnitsTable>
  {/* Standard Columns (Always Shown) */}
  <Column field="unit_number" label="Unit" />
  <Column field="unit_type" label="Type" />
  <Column field="floor_number" label="Floor" />
  <Column field="area_sqft" label="Area" />
  <Column field="price" label="Price" />
  <Column field="status" label="Status" />
  
  {/* Dynamic Columns (From custom_fields) */}
  {customFieldsConfig.map(field => (
    <Column 
      field={`custom_fields.${field.key}`} 
      label={field.label}
      format={field.format}
    />
  ))}
</UnitsTable>
4.3 Agent Workflows
REQ-AGENT-001: Browse Projects
Agents view all published projects from developers:
•	Filter: location, type, price range, developer
•	Sort: newest, price, popularity
•	View: project details, units, promotions
•	Save: favorites/bookmarks
REQ-AGENT-002: Capture Leads
Agents create leads for projects:
•	Lead form: buyer name, contact, requirements
•	Associate: project, unit (optional)
•	Assign: to self or team member
•	Track: status, stage, communication history
REQ-AGENT-003: Lead Management
Organize and track leads through sales funnel:
•	Pipeline view: drag-and-drop stages
•	Filters: status, project, date, agent
•	Actions: call, email, schedule meeting
•	Convert: mark as won/lost
4.4 Admin Functions
REQ-ADMIN-001: Organization Management
Super admin oversees all organizations:
•	View: list of developers and agents
•	Create: new organizations (approval workflow)
•	Edit: organization details
•	Suspend: temporarily disable account
•	Delete: remove organization and data
REQ-ADMIN-002: Project Oversight
Admin can create/edit projects for developers:
•	Create on behalf: select developer, enter details
•	Edit any project: full access regardless of owner
•	View analytics: projects by developer, status, performance
•	Resolve conflicts: reassign, merge, correct data
REQ-ADMIN-003: Lead Monitoring
System-wide lead visibility:
•	Dashboard: total leads, by organization, by project
•	Filters: developer, agent, project, status
•	Interventions: reassign lead, resolve disputes
•	Analytics: conversion rates, response times
________________________________________
5. Non-Functional Requirements
5.1 Design Consistency (CRITICAL)
REQ-DESIGN-001: Preserve Original UI
Reference design: https://skye-scraper-bz2z.vercel.app/
Design System Elements:
•	Typography: Montserrat font family
•	Colors: Professional palette with role-specific accents 
o	Developer: Blue theme
o	Agent: Green theme
o	Admin: Red theme
•	Layout: Consistent spacing, card-based design
•	Navigation: Bottom nav (mobile), sidebar (desktop)
•	Components: Reusable button, input, card, modal components
Implementation Rules:
1.	? Do NOT redesign during backend integration
2.	? Create design system component library first
3.	? Backend changes should not affect UI structure
4.	? Use CSS modules or Tailwind with design tokens
5.	? Regular UI reviews against reference design
5.2 Performance
REQ-PERF-001: Response Times
•	Page load: < 2 seconds (first paint)
•	AI processing: < 30 seconds (with progress indicator)
•	API calls: < 500ms (database queries)
•	File uploads: Progress indicator, chunked for large files
REQ-PERF-002: Scalability
•	Support: 100+ concurrent users
•	Projects: 1000+ per organization
•	Units: 10,000+ per project
•	Database: Optimized indexes, query caching
5.3 Security
REQ-SEC-001: Authentication & Authorization
•	JWT tokens with secure storage
•	Role-based access control (RBAC)
•	Organization-scoped data isolation (RLS)
•	Password requirements: min 8 chars, complexity rules
REQ-SEC-002: Data Protection
•	Encryption: At rest and in transit (TLS 1.3)
•	Input validation: All user inputs sanitized
•	SQL injection: Use parameterized queries
•	XSS prevention: Content security policy
5.4 Reliability
REQ-REL-001: Error Handling
•	Graceful degradation: AI fails ? manual entry option
•	User-friendly errors: Clear messages, suggested actions
•	Retry mechanisms: Failed API calls, file uploads
•	Logging: All errors logged with context
REQ-REL-002: Data Integrity
•	Transactions: Atomic operations for multi-table updates
•	Validation: Client-side + server-side
•	Audit trail: All changes logged with user and timestamp
•	Backups: Daily automated backups with retention
________________________________________
6. Technical Architecture
6.1 Technology Stack
Frontend:
•	React 18 + TypeScript
•	Vite (build tool)
•	Tailwind CSS (styling)
•	React Router (routing)
•	Zustand (state management)
•	React Query (API client)
Backend:
•	Supabase (PostgreSQL + Auth + Storage)
•	Row Level Security (RLS) for data isolation
•	Database triggers for audit logging
•	Supabase Edge Functions (serverless)
AI Integration:
•	OpenAI API (GPT-4 Vision for brochure processing)
•	Custom prompts for structured extraction
•	Fallback to manual entry on errors
File Processing:
•	SheetJS (Excel parsing)
•	pdf-parse (PDF text extraction)
•	Tesseract.js (OCR for images)
•	Sharp (image processing)
6.2 Database Architecture Principles
Unified Schema Design:
1.	Single table per entity type (no splits by creation method)
2.	JSONB for flexible/dynamic data
3.	Metadata fields track data origin and quality
4.	Version control for updateable data (units)
5.	Audit logs for all mutations
Relationship Hierarchy:
Organizations (Root)
+-- Employees (N:1)
    +-- Projects (N:1, creator)
    ¦   +-- Units (N:1)
    ¦   ¦   +-- Unit Imports (N:1, version control)
    ¦   +-- Project Files (N:1)
    +-- Leads (N:1, assignee)
        +-- Lead Activities (N:1)

Promotions (N:1 with Organization, N:1 with Project)
Activity Logs (N:1 with User, polymorphic with any table)
________________________________________
7. Implementation Phases
Phase 1: Foundation (Week 1-2)
•	[ ] Database schema creation (unified tables)
•	[ ] Authentication system (Supabase Auth)
•	[ ] Design system component library
•	[ ] Basic routing and navigation
•	[ ] RLS policies for data isolation
Phase 2: Core Features (Week 3-4)
•	[ ] Organization and employee management
•	[ ] Manual project creation (full workflow)
•	[ ] Unit manual entry and listing
•	[ ] Agent project browsing
•	[ ] Basic lead capture
Phase 3: AI Integration (Week 5-6)
•	[ ] Brochure upload and AI extraction
•	[ ] Preview and confirmation UI
•	[ ] Excel/PDF unit import
•	[ ] Column mapping and validation
•	[ ] AI confidence indicators
Phase 4: Advanced Features (Week 7-8)
•	[ ] Unit import version control
•	[ ] Promotion creation and sharing
•	[ ] Lead pipeline management
•	[ ] Admin oversight features
•	[ ] Analytics dashboards
Phase 5: Polish & Testing (Week 9-10)
•	[ ] UI/UX refinements
•	[ ] Performance optimization
•	[ ] Security audit
•	[ ] Integration testing
•	[ ] User acceptance testing
________________________________________
8. Success Criteria
8.1 Technical Success
•	? Zero column mismatch errors between creation methods
•	? Single unified schema for projects and units
•	? AI extraction accuracy > 90% for standard fields
•	? Unit import success rate > 95% for Excel/PDF
•	? Design matches reference site > 95% similarity
8.2 Functional Success
•	? Developers can create projects manually or via AI
•	? Units import successfully from Excel/PDF with custom columns
•	? Agents browse projects and capture leads seamlessly
•	? Admin has full oversight and intervention capabilities
•	? Updates to units don't break existing data
8.3 User Experience Success
•	? Intuitive workflows with < 5 clicks to complete tasks
•	? Consistent UI across all user roles
•	? Fast page loads (< 2s) and responsive interactions
•	? Clear error messages and recovery paths
•	? Mobile-friendly responsive design
________________________________________
9. Risk Mitigation
9.1 Technical Risks
Risk: AI extraction fails or is inaccurate
•	Mitigation: Always provide manual entry option, show confidence scores, allow editing
Risk: Column mapping confusion during unit import
•	Mitigation: AI-powered detection, preview step, save mapping for reuse
Risk: Database performance with large datasets
•	Mitigation: Proper indexes, pagination, query optimization, materialized views
9.2 Implementation Risks
Risk: UI divergence during backend integration (happened before)
•	Mitigation: Design system first, component library, regular reviews against reference
Risk: Column mismatch between creation methods (happened before)
•	Mitigation: Single unified schema, shared validation logic, comprehensive testing
Risk: Scope creep and feature additions
•	Mitigation: Strict adherence to this URD, phase-gated development, MVP first
________________________________________
10. Appendices
10.1 Data Model Summary
Core Tables:
1.	organizations - Developer and agent companies
2.	employees - Users within organizations
3.	projects - Real estate projects (unified schema)
4.	units - Property units (dynamic columns)
5.	unit_imports - Version control for unit updates
6.	leads - Sales leads captured by agents
7.	promotions - Marketing campaigns
8.	project_files - Documents and media
9.	activity_logs - Audit trail
10.2 Key Design Patterns
Unified Entity Pattern:
•	Single table for entity regardless of creation method
•	creation_method field tracks data origin
•	JSONB fields for method-specific data
•	Shared validation and business logic
Version Control Pattern:
•	Main table: Current active data
•	Imports/versions table: Historical changes
•	replaced_by foreign key for version chain
•	Rollback capability
Dynamic Schema Pattern:
•	Standard fields: Always present, validated
•	Custom fields: JSONB, flexible structure
•	Column mapping: Configuration-driven rendering
•	Type safety: Runtime validation
10.3 Integration Points
Supabase Services:
•	Database: PostgreSQL with RLS
•	Auth: User authentication and sessions
•	Storage: File uploads (brochures, Excel, images)
•	Edge Functions: Serverless compute for AI processing
External APIs:
•	OpenAI API: Brochure and document processing
•	(Future) Email service for notifications
•	(Future) SMS service for lead alerts
10.4 Glossary
•	Organization: Company using the platform (developer or agent)
•	Employee: User account within an organization
•	Project: Real estate development
•	Unit: Individual property within a project
•	Lead: Potential customer captured by agent
•	Promotion: Marketing campaign for a project
•	Creation Method: How data entered system (manual, AI, hybrid, admin)
•	Custom Fields: Developer-specific data columns stored in JSONB
•	Column Mapping: Configuration linking source file columns to database fields
•	Unit Import: Version-controlled upload of unit data
________________________________________
Document Revision History
•	v2.0 (Sep 2025): Complete rewrite addressing architectural issues
o	Unified project creation schema
o	Dynamic unit management with JSONB
o	Version control for updates
o	Design preservation requirements
o	Clear implementation phases
•	v1.0 (Jan 2025): Initial requirements document
________________________________________
End of Document

