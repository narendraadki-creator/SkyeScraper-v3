SkyeScraper - Unified Database Architecture v2.0
Document Information
•	Version: 2.0
•	Date: September 2025
•	Database: PostgreSQL 15+ (Supabase)
•	Purpose: Unified schema eliminating manual/AI separation
•	Architecture: Organization-centric with JSONB flexibility
________________________________________
Table of Contents
1.	Architecture Overview
2.	Core Design Principles
3.	Database Schema
4.	Indexes and Performance
5.	Row Level Security (RLS)
6.	Triggers and Functions
7.	Supabase Storage
8.	Migration Strategy
9.	Data Integrity
10.	Performance Optimization
________________________________________
1. Architecture Overview
1.1 Key Architectural Decisions
? UNIFIED SCHEMA: Single table per entity type eliminates column mismatch issues
•	Projects: One table for manual, AI, hybrid, and admin-created projects
•	Units: One table with JSONB custom_fields for developer-specific columns
•	Version Control: Separate import tracking table for unit updates
? JSONB FLEXIBILITY: Use PostgreSQL JSONB for dynamic data
•	Stores AI-extracted structured data (amenities, landmarks, payment plans)
•	Handles developer-specific unit columns (discounts, views, features)
•	Indexed for fast queries while maintaining flexibility
? ORGANIZATION-CENTRIC: All data scoped to organizations
•	Row Level Security (RLS) enforces data isolation
•	Cross-organization sharing for specific features (promotions)
•	Admin has global access via separate policies
? AUDIT TRAIL: Complete activity logging
•	All INSERT/UPDATE/DELETE operations tracked
•	User identification via auth.uid()
•	Timestamps and change history
1.2 Database Diagram
+-----------------+
¦  Organizations  ¦ (Developer, Agent)
+-----------------+
         ¦ 1:N
         ¦
    +----?--------+
    ¦  Employees  ¦ (Admin, Manager, Agent)
    +-------------+
         ¦ 1:N (created_by)
         ¦
    +----?--------+
    ¦  Projects   ¦ (UNIFIED: manual + AI)
    +-------------+
         ¦ 1:N
         ¦
    +----?--------+
    ¦    Units    ¦ (UNIFIED: dynamic columns)
    +-------------+
         ¦ N:1
         ¦
    +----?------------+
    ¦  Unit Imports   ¦ (Version Control)
    +-----------------+

+--------------+
¦    Leads     ¦ (Agent-captured)
+--------------+

+--------------+
¦  Promotions  ¦ (Cross-org sharing)
+--------------+

+--------------+
¦ Project Files¦ (Supabase Storage refs)
+--------------+

+--------------+
¦Activity Logs ¦ (Audit trail)
+--------------+
________________________________________
2. Core Design Principles
2.1 Single Source of Truth
Problem (Previous Implementation):
-- ? WRONG: Separate tables cause column mismatch
CREATE TABLE projects_manual (...);
CREATE TABLE projects_ai (...);
-- Result: Schema drift, duplicate logic, integration issues
Solution (Current Implementation):
-- ? CORRECT: Single table with creation_method field
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    creation_method VARCHAR(50) NOT NULL,
    -- All fields unified
);
2.2 JSONB for Flexibility
Use JSONB for:
•	Structured data that varies by source (AI-extracted)
•	Developer-specific columns (custom unit fields)
•	Arrays and nested objects (amenities, landmarks)
•	Extendable schemas without migrations
Don't use JSONB for:
•	Frequently queried scalar values (use regular columns)
•	Foreign keys and relationships
•	Data requiring strict validation
2.3 Version Control Pattern
Unit updates must be trackable:
•	unit_imports table tracks each import
•	version_number increments with each update
•	replaced_by links old imports to new ones
•	Rollback capability by switching is_active
________________________________________
3. Database Schema
3.1 Custom Types
-- User roles within organizations
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'agent', 'staff');

-- Organization types
CREATE TYPE organization_type AS ENUM ('developer', 'agent');

-- Organization status
CREATE TYPE organization_status AS ENUM ('pending', 'active', 'suspended', 'inactive');

-- Employee status
CREATE TYPE employee_status AS ENUM ('active', 'inactive', 'suspended');

-- Project status
CREATE TYPE project_status AS ENUM ('draft', 'published', 'archived');

-- Project creation method (CRITICAL FOR UNIFIED SCHEMA)
CREATE TYPE creation_method AS ENUM ('manual', 'ai_assisted', 'hybrid', 'admin');

-- Unit status
CREATE TYPE unit_status AS ENUM ('available', 'held', 'sold', 'reserved');

-- Unit import type
CREATE TYPE import_type AS ENUM ('excel', 'pdf', 'csv', 'manual', 'api');

-- Lead status
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'negotiation', 'won', 'lost');

-- Promotion status
CREATE TYPE promotion_status AS ENUM ('draft', 'active', 'paused', 'completed', 'cancelled');

-- File purpose
CREATE TYPE file_purpose AS ENUM ('brochure', 'floor_plan', 'unit_data', 'image', 'document', 'logo');
3.2 Organizations Table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Information
    name VARCHAR(255) NOT NULL,
    type organization_type NOT NULL,
    status organization_status DEFAULT 'pending',
    
    -- Contact Details
    contact_email VARCHAR(255) UNIQUE NOT NULL,
    contact_phone VARCHAR(50),
    address TEXT,
    website VARCHAR(255),
    
    -- Additional Info
    description TEXT,
    logo_url TEXT,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_email CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_url CHECK (website IS NULL OR website ~* '^https?://')
);

-- Indexes
CREATE INDEX idx_organizations_type ON organizations(type);
CREATE INDEX idx_organizations_status ON organizations(status);
CREATE INDEX idx_organizations_created_at ON organizations(created_at DESC);

-- Comments
COMMENT ON TABLE organizations IS 'Developer and agent organizations using the platform';
COMMENT ON COLUMN organizations.type IS 'developer: creates projects, agent: sells projects';
3.3 Employees Table
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Organization Link
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Auth Integration
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Employee Details
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    
    -- Role and Permissions
    role user_role NOT NULL,
    status employee_status DEFAULT 'active',
    permissions JSONB DEFAULT '{}',
    
    -- Additional Info
    department VARCHAR(100),
    position VARCHAR(100),
    profile_image TEXT,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT valid_employee_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes
CREATE INDEX idx_employees_organization_id ON employees(organization_id);
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_role ON employees(role);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_email ON employees(email);

-- Full-text search on name
CREATE INDEX idx_employees_name_search ON employees 
    USING gin(to_tsvector('english', first_name || ' ' || last_name));

-- Comments
COMMENT ON TABLE employees IS 'Users within organizations with role-based access';
COMMENT ON COLUMN employees.permissions IS 'JSONB object for granular permissions: {"can_create_projects": true}';
3.4 Projects Table (UNIFIED SCHEMA)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Organization & Ownership (REQUIRED)
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Basic Details (REQUIRED)
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    
    -- Project Type & Status
    project_type VARCHAR(100),
    status project_status DEFAULT 'draft',
    
    -- CRITICAL: Creation Tracking
    creation_method creation_method NOT NULL,
    created_by UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    source_file_id UUID REFERENCES project_files(id) ON DELETE SET NULL,
    ai_confidence_score DECIMAL(3,2) CHECK (ai_confidence_score >= 0 AND ai_confidence_score <= 1),
    
    -- Standard Details (NULLABLE)
    description TEXT,
    developer_name VARCHAR(255),
    address TEXT,
    starting_price DECIMAL(15,2),
    total_units INTEGER CHECK (total_units >= 0),
    completion_date DATE,
    handover_date DATE,
    
    -- AI-Extracted Structured Data (JSONB)
    amenities JSONB DEFAULT '[]',
    connectivity JSONB DEFAULT '[]',
    landmarks JSONB DEFAULT '[]',
    payment_plans JSONB DEFAULT '[]',
    master_plan JSONB,
    custom_attributes JSONB DEFAULT '{}',
    
    -- Media
    featured_image TEXT,
    gallery_images TEXT[] DEFAULT '{}',
    brochure_url TEXT,
    floor_plan_urls TEXT[] DEFAULT '{}',
    
    -- Engagement Metrics
    is_featured BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    leads_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT valid_dates CHECK (
        (completion_date IS NULL OR handover_date IS NULL) OR 
        (handover_date >= completion_date)
    ),
    CONSTRAINT valid_price CHECK (starting_price IS NULL OR starting_price > 0)
);

-- Indexes
CREATE INDEX idx_projects_organization_id ON projects(organization_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_creation_method ON projects(creation_method);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_projects_is_featured ON projects(is_featured) WHERE is_featured = true;
CREATE INDEX idx_projects_published_at ON projects(published_at DESC NULLS LAST);

-- Composite indexes for common queries
CREATE INDEX idx_projects_org_status ON projects(organization_id, status);
CREATE INDEX idx_projects_status_published ON projects(status, published_at DESC) 
    WHERE status = 'published';

-- JSONB indexes for fast queries
CREATE INDEX idx_projects_amenities ON projects USING gin(amenities);
CREATE INDEX idx_projects_landmarks ON projects USING gin(landmarks);
CREATE INDEX idx_projects_custom_attributes ON projects USING gin(custom_attributes);

-- Full-text search
CREATE INDEX idx_projects_search ON projects 
    USING gin(to_tsvector('english', name || ' ' || COALESCE(location, '') || ' ' || COALESCE(description, '')));

-- Comments
COMMENT ON TABLE projects IS 'Unified project table for all creation methods (manual, AI, hybrid, admin)';
COMMENT ON COLUMN projects.creation_method IS 'Tracks how project was created - critical for unified schema';
COMMENT ON COLUMN projects.ai_confidence_score IS 'AI extraction confidence (0.00-1.00) for ai_assisted and hybrid';
COMMENT ON COLUMN projects.amenities IS 'Array of amenities: ["Pool", "Gym", "Parking"]';
COMMENT ON COLUMN projects.landmarks IS 'Array of objects: [{"name": "Airport", "distance": "15km"}]';
COMMENT ON COLUMN projects.payment_plans IS 'Array of payment plan objects with name, terms, description';
COMMENT ON COLUMN projects.custom_attributes IS 'Developer-specific attributes: {"rera_number": "REG-123"}';
3.5 Units Table (DYNAMIC SCHEMA)
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Project Link
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Core Identity (REQUIRED)
    unit_number VARCHAR(50) NOT NULL,
    
    -- Standard Fields (NULLABLE)
    unit_type VARCHAR(100),
    floor_number INTEGER,
    area_sqft DECIMAL(10,2) CHECK (area_sqft > 0),
    bedrooms INTEGER CHECK (bedrooms >= 0),
    bathrooms INTEGER CHECK (bathrooms >= 0),
    price DECIMAL(15,2) CHECK (price >= 0),
    status unit_status DEFAULT 'available',
    
    -- CRITICAL: Dynamic/Custom Fields (JSONB)
    custom_fields JSONB DEFAULT '{}',
    
    -- Import Metadata
    import_version UUID REFERENCES unit_imports(id) ON DELETE SET NULL,
    source_file_id UUID REFERENCES project_files(id) ON DELETE SET NULL,
    source_row_number INTEGER,
    column_mapping JSONB,
    
    -- Notes and Additional Info
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(project_id, unit_number)
);

-- Indexes
CREATE INDEX idx_units_project_id ON units(project_id);
CREATE INDEX idx_units_status ON units(status);
CREATE INDEX idx_units_unit_type ON units(unit_type);
CREATE INDEX idx_units_floor_number ON units(floor_number);
CREATE INDEX idx_units_price ON units(price);
CREATE INDEX idx_units_import_version ON units(import_version);

-- Composite indexes
CREATE INDEX idx_units_project_status ON units(project_id, status);
CREATE INDEX idx_units_project_type ON units(project_id, unit_type);

-- JSONB index for custom fields
CREATE INDEX idx_units_custom_fields ON units USING gin(custom_fields);

-- Comments
COMMENT ON TABLE units IS 'Unified units table with dynamic custom_fields for developer-specific columns';
COMMENT ON COLUMN units.custom_fields IS 'JSONB for developer-specific fields: {"discount_20": 680000, "payment_plan": "60/40"}';
COMMENT ON COLUMN units.import_version IS 'Links to unit_imports for version control';
COMMENT ON COLUMN units.column_mapping IS 'Maps source file columns to fields: {"Unit Number": "unit_number"}';
3.6 Unit Imports Table (VERSION CONTROL)
CREATE TABLE unit_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Project Link
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Import Details
    import_type import_type NOT NULL,
    import_strategy VARCHAR(50) NOT NULL, -- 'replace_all', 'merge_updates', 'append_only'
    
    -- Source File Info
    source_file_name VARCHAR(255) NOT NULL,
    source_file_url TEXT,
    source_file_id UUID REFERENCES project_files(id) ON DELETE SET NULL,
    
    -- Column Configuration (JSONB)
    detected_columns JSONB NOT NULL, -- Original column names from file
    column_mapping JSONB NOT NULL, -- How columns map to standard/custom fields
    custom_fields_config JSONB DEFAULT '[]', -- UI rendering config for custom fields
    
    -- Statistics
    total_rows INTEGER NOT NULL CHECK (total_rows >= 0),
    valid_rows INTEGER NOT NULL CHECK (valid_rows >= 0),
    units_created INTEGER DEFAULT 0 CHECK (units_created >= 0),
    units_updated INTEGER DEFAULT 0 CHECK (units_updated >= 0),
    errors JSONB DEFAULT '[]',
    
    -- Version Control
    version_number INTEGER NOT NULL CHECK (version_number > 0),
    is_active BOOLEAN DEFAULT TRUE,
    replaced_by UUID REFERENCES unit_imports(id) ON DELETE SET NULL,
    
    -- Metadata
    imported_by UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    imported_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Status
    processing_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    processing_started_at TIMESTAMPTZ,
    processing_completed_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT valid_rows CHECK (valid_rows <= total_rows),
    UNIQUE(project_id, version_number)
);

-- Indexes
CREATE INDEX idx_unit_imports_project_id ON unit_imports(project_id);
CREATE INDEX idx_unit_imports_is_active ON unit_imports(is_active) WHERE is_active = true;
CREATE INDEX idx_unit_imports_version ON unit_imports(project_id, version_number DESC);
CREATE INDEX idx_unit_imports_imported_by ON unit_imports(imported_by);
CREATE INDEX idx_unit_imports_imported_at ON unit_imports(imported_at DESC);

-- Comments
COMMENT ON TABLE unit_imports IS 'Version control for unit data imports, tracks all updates';
COMMENT ON COLUMN unit_imports.column_mapping IS 'Maps source columns to fields: {"standard_fields": {...}, "custom_fields": {...}}';
COMMENT ON COLUMN unit_imports.custom_fields_config IS 'UI config: [{"key": "discount_20", "label": "20% Discount", "type": "currency"}]';
COMMENT ON COLUMN unit_imports.version_number IS 'Increments with each import, allows rollback to previous versions';
3.7 Leads Table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Organization & Project Links
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    
    -- Lead Contact Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    
    -- Lead Details
    source VARCHAR(100),
    status lead_status DEFAULT 'new',
    stage VARCHAR(50) DEFAULT 'inquiry',
    
    -- Budget and Requirements
    budget_min DECIMAL(15,2),
    budget_max DECIMAL(15,2),
    preferred_unit_types TEXT[],
    preferred_location TEXT,
    requirements TEXT,
    
    -- Assignment
    assigned_to UUID REFERENCES employees(id) ON DELETE SET NULL,
    
    -- Tracking
    notes TEXT,
    next_followup TIMESTAMPTZ,
    last_contacted TIMESTAMPTZ,
    
    -- Lead Scoring
    score INTEGER CHECK (score >= 0 AND score <= 100),
    
    -- Metadata
    created_by UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_budget CHECK (
        (budget_min IS NULL OR budget_max IS NULL) OR 
        (budget_max >= budget_min)
    )
);

-- Indexes
CREATE INDEX idx_leads_organization_id ON leads(organization_id);
CREATE INDEX idx_leads_project_id ON leads(project_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_next_followup ON leads(next_followup) WHERE next_followup IS NOT NULL;

-- Composite indexes
CREATE INDEX idx_leads_org_status ON leads(organization_id, status);
CREATE INDEX idx_leads_org_project ON leads(organization_id, project_id);

-- Full-text search
CREATE INDEX idx_leads_search ON leads 
    USING gin(to_tsvector('english', first_name || ' ' || last_name || ' ' || COALESCE(email, '') || ' ' || phone));

-- Comments
COMMENT ON TABLE leads IS 'Sales leads captured by agent organizations';
COMMENT ON COLUMN leads.stage IS 'inquiry, site_visit, proposal, negotiation, closed';
3.8 Promotions Table
CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Organization & Project Links
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Promotion Details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    promotion_type VARCHAR(100),
    
    -- Discount Details
    discount_percentage DECIMAL(5,2) CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    discount_amount DECIMAL(15,2) CHECK (discount_amount >= 0),
    
    -- Validity Period
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status promotion_status DEFAULT 'draft',
    
    -- Additional Info
    terms_conditions TEXT,
    target_audience JSONB DEFAULT '[]', -- ["all_agents"] or specific org IDs
    
    -- Media
    banner_image TEXT,
    
    -- Metadata
    created_by UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_dates CHECK (end_date >= start_date),
    CONSTRAINT has_discount CHECK (
        discount_percentage IS NOT NULL OR discount_amount IS NOT NULL
    )
);

-- Indexes
CREATE INDEX idx_promotions_organization_id ON promotions(organization_id);
CREATE INDEX idx_promotions_project_id ON promotions(project_id);
CREATE INDEX idx_promotions_status ON promotions(status);
CREATE INDEX idx_promotions_dates ON promotions(start_date, end_date);
CREATE INDEX idx_promotions_active ON promotions(status, start_date, end_date) 
    WHERE status = 'active';

-- Comments
COMMENT ON TABLE promotions IS 'Marketing campaigns created by developers, shared with agents';
COMMENT ON COLUMN promotions.target_audience IS 'Array of organization IDs or ["all_agents"] for all';
3.9 Project Files Table
CREATE TABLE project_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Project Link (nullable for org-level files like logos)
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- File Details
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_purpose file_purpose NOT NULL,
    file_size BIGINT CHECK (file_size > 0),
    mime_type VARCHAR(100),
    
    -- Storage Info (Supabase)
    storage_bucket VARCHAR(100) NOT NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT,
    
    -- Processing Status (for AI processing)
    is_processed BOOLEAN DEFAULT FALSE,
    processing_status VARCHAR(50),
    processing_result JSONB,
    
    -- Metadata
    uploaded_by UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_storage_bucket CHECK (storage_bucket IN ('project-files', 'org-logos', 'temp-uploads'))
);

-- Indexes
CREATE INDEX idx_project_files_project_id ON project_files(project_id);
CREATE INDEX idx_project_files_organization_id ON project_files(organization_id);
CREATE INDEX idx_project_files_purpose ON project_files(file_purpose);
CREATE INDEX idx_project_files_uploaded_by ON project_files(uploaded_by);
CREATE INDEX idx_project_files_uploaded_at ON project_files(uploaded_at DESC);

-- Comments
COMMENT ON TABLE project_files IS 'References to files stored in Supabase Storage';
COMMENT ON COLUMN project_files.file_purpose IS 'brochure, floor_plan, unit_data, image, document, logo';
3.10 Activity Logs Table
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Target Record Info
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    
    -- Change Data
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[], -- Array of field names that changed
    
    -- User and Context
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_action CHECK (action IN ('INSERT', 'UPDATE', 'DELETE'))
);

-- Indexes
CREATE INDEX idx_activity_logs_table_record ON activity_logs(table_name, record_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_employee_id ON activity_logs(employee_id);
CREATE INDEX idx_activity_logs_organization_id ON activity_logs(organization_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);

-- Composite index for common queries
CREATE INDEX idx_activity_logs_table_record_time ON activity_logs(table_name, record_id, created_at DESC);

-- Comments
COMMENT ON TABLE activity_logs IS 'Audit trail for all database changes';
COMMENT ON COLUMN activity_logs.changed_fields IS 'Array of field names that were modified in UPDATE operations';
3.11 System Settings Table
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Setting Key (unique)
    key VARCHAR(100) UNIQUE NOT NULL,
    
    -- Setting Value (JSONB for flexibility)
    value JSONB NOT NULL,
    
    -- Metadata
    description TEXT,
    category VARCHAR(50), -- 'general', 'security', 'ai', 'notifications'
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_category CHECK (category IN ('general', 'security', 'ai', 'notifications', 'features'))
);

-- Indexes
CREATE INDEX idx_system_settings_category ON system_settings(category);
CREATE INDEX idx_system_settings_is_public ON system_settings(is_public) WHERE is_public = true;

-- Comments
COMMENT ON TABLE system_settings IS 'Application-wide configuration settings';
COMMENT ON COLUMN system_settings.is_public IS 'Whether setting can be read by non-admin users';
________________________________________
4. Indexes and Performance
4.1 Index Strategy
B-tree Indexes (default):
•	Foreign keys (automatic for REFERENCES)
•	Status fields (enum types)
•	Timestamp fields with DESC for recent-first queries
•	Numeric fields for range queries
GIN Indexes (for JSONB and arrays):
•	JSONB fields that are queried frequently
•	Text arrays (amenities, gallery_images)
•	Full-text search columns
Composite Indexes:
•	Common filter combinations (org_id + status)
•	Foreign key + frequently joined field
4.2 Query Optimization
Avoid:
-- ? Don't use LIKE with leading wildcard
SELECT * FROM projects WHERE name LIKE '%Tower%';

-- ? Don't query JSONB without GIN index
SELECT * FROM projects WHERE amenities @> '["Pool"]';
Instead:
-- ? Use full-text search
SELECT * FROM projects 
WHERE to_tsvector('english', name) @@ to_tsquery('english', 'Tower');

-- ? Ensure GIN index exists
CREATE INDEX idx_projects_amenities ON projects USING gin(amenities);
SELECT * FROM projects WHERE amenities @> '["Pool"]';
4.3 Partitioning (Future)
For tables growing beyond 10M rows, consider partitioning:
-- Partition activity_logs by month
CREATE TABLE activity_logs_2025_10 PARTITION OF activity_logs
FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');
________________________________________
5. Row Level Security (RLS)
5.1 Enable RLS
-- Enable RLS on all main tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
5.2 Organizations Policies
-- Organizations can view their own data
CREATE POLICY "org_view_own" ON organizations
FOR SELECT
USING (
    id IN (
        SELECT organization_id FROM employees WHERE user_id = auth.uid()
    )
);

-- Organization admins can update their organization
CREATE POLICY "org_admin_update" ON organizations
FOR UPDATE
USING (
    id IN (
        SELECT organization_id FROM employees 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Super admins see all
CREATE POLICY "admin_view_all_orgs" ON organizations
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND raw_user_meta_data->>'is_super_admin' = 'true'
    )
);
5.3 Projects Policies
-- Developers see their own projects
CREATE POLICY "dev_view_own_projects" ON projects
FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM employees 
        WHERE user_id = auth.uid()
    )
);

-- Agents see published projects from all developers
CREATE POLICY "agent_view_published" ON projects
FOR SELECT
USING (
    status = 'published' OR
    organization_id IN (
        SELECT organization_id FROM employees WHERE user_id = auth.uid()
    )
);

-- Developers can manage their own projects
CREATE POLICY "dev_manage_projects" ON projects
FOR ALL
USING (
    organization_id IN (
        SELECT organization_id FROM employees WHERE user_id = auth.uid()
    )
);

-- Super admins can do anything
CREATE POLICY "admin_manage_all_projects" ON projects
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND raw_user_meta_data->>'is_super_admin' = 'true'
    )
);
5.4 Units Policies
-- Users see units from projects they can see
CREATE POLICY "view_project_units" ON units
FOR SELECT
USING (
    project_id IN (SELECT id FROM projects) -- Uses project RLS
);

-- Developers manage their project units
CREATE POLICY "dev_manage_units" ON units
FOR ALL
USING (
    project_id IN (
        SELECT p.id FROM projects p
        JOIN employees e ON p.organization_id = e.organization_id
        WHERE e.user_id = auth.uid()
    )
);
5.5 Leads Policies
-- Agent organizations see their leads
CREATE POLICY "org_view_leads" ON leads
FOR SELECT
USING (
    organization_id IN (
        SELECT organization_id FROM employees WHERE user_id = auth.uid()
    )
);

-- Developers see leads for their projects
CREATE POLICY "dev_view_project_leads" ON leads
FOR SELECT
USING (
    project_id IN (
        SELECT p.id FROM projects p
        JOIN employees e ON p.organization_id = e.organization_id
        WHERE e.user_id = auth.uid()
    )
);

-- Agents can manage leads in their org
CREATE POLICY "agent_manage_leads" ON leads
FOR ALL
USING (
    organization_id IN (
        SELECT organization_id FROM employees WHERE user_id = auth.uid()
    )
);
________________________________________
6. Triggers and Functions
6.1 Updated At Trigger
-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_organizations_timestamp 
BEFORE UPDATE ON organizations 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_timestamp 
BEFORE UPDATE ON employees 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_timestamp 
BEFORE UPDATE ON projects 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_units_timestamp 
BEFORE UPDATE ON units 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_timestamp 
BEFORE UPDATE ON leads 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promotions_timestamp 
BEFORE UPDATE ON promotions 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_timestamp 
BEFORE UPDATE ON system_settings 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
6.2 Activity Logging Trigger
-- Function to log all changes
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
DECLARE
    emp_id UUID;
    org_id UUID;
    changed TEXT[];
BEGIN
    -- Get employee and organization IDs
    SELECT id, organization_id INTO emp_id, org_id
    FROM employees WHERE user_id = auth.uid();
    
    IF TG_OP = 'DELETE' THEN
        INSERT INTO activity_logs (
            table_name, record_id, action, old_values,
            user_id, employee_id, organization_id
        ) VALUES (
            TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD),
            auth.uid(), emp_id, org_id
        );
        RETURN OLD;
        
    ELSIF TG_OP = 'UPDATE' THEN
        -- Detect changed fields
        SELECT array_agg(key) INTO changed
        FROM jsonb_each(to_jsonb(NEW))
        WHERE to_jsonb(NEW)->>key IS DISTINCT FROM to_jsonb(OLD)->>key;
        
        INSERT INTO activity_logs (
            table_name, record_id, action, old_values, new_values, changed_fields,
            user_id, employee_id, organization_id
        ) VALUES (
            TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW), changed,
            auth.uid(), emp_id, org_id
        );
        RETURN NEW;
        
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO activity_logs (
            table_name, record_id, action, new_values,
            user_id, employee_id, organization_id
        ) VALUES (
            TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW),
            auth.uid(), emp_id, org_id
        );
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply to main tables
CREATE TRIGGER log_organizations_changes 
AFTER INSERT OR UPDATE OR DELETE ON organizations 
FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_projects_changes 
AFTER INSERT OR UPDATE OR DELETE ON projects 
FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_units_changes 
AFTER INSERT OR UPDATE OR DELETE ON units 
FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_leads_changes 
AFTER INSERT OR UPDATE OR DELETE ON leads 
FOR EACH ROW EXECUTE FUNCTION log_activity();
6.3 Unit Version Control Trigger
-- Function to increment version on new import
CREATE OR REPLACE FUNCTION increment_import_version()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-increment version number
    SELECT COALESCE(MAX(version_number), 0) + 1 
    INTO NEW.version_number
    FROM unit_imports 
    WHERE project_id = NEW.project_id;
    
    -- Mark previous active import as replaced
    UPDATE unit_imports
    SET is_active = false, replaced_by = NEW.id
    WHERE project_id = NEW.project_id 
    AND is_active = true 
    AND id != NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_version_import 
BEFORE INSERT ON unit_imports 
FOR EACH ROW EXECUTE FUNCTION increment_import_version();
6.4 Project Statistics Update
-- Function to update project stats when units change
CREATE OR REPLACE FUNCTION update_project_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update project total_units
    UPDATE projects
    SET total_units = (
        SELECT COUNT(*) FROM units WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
    )
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_unit_count 
AFTER INSERT OR UPDATE OR DELETE ON units 
FOR EACH ROW EXECUTE FUNCTION update_project_stats();
________________________________________
7. Supabase Storage
7.1 Storage Buckets
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
('project-files', 'project-files', false),
('org-logos', 'org-logos', true),
('temp-uploads', 'temp-uploads', false);
7.2 Storage Policies
-- Users can upload to their organization's folder
CREATE POLICY "org_upload_files" ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'project-files' AND
    (storage.foldername(name))[1] IN (
        SELECT id::text FROM organizations o
        JOIN employees e ON o.id = e.organization_id
        WHERE e.user_id = auth.uid()
    )
);

-- Users can view their organization's files
CREATE POLICY "org_view_files" ON storage.objects
FOR SELECT
USING (
    bucket_id = 'project-files' AND
    (storage.foldername(name))[1] IN (
        SELECT id::text FROM organizations o
        JOIN employees e ON o.id = e.organization_id
        WHERE e.user_id = auth.uid()
    )
);

-- Organization logos are public
CREATE POLICY "public_view_logos" ON storage.objects
FOR SELECT
USING (bucket_id = 'org-logos');
7.3 Storage Structure
project-files/
  {organization_id}/
    {project_id}/
      brochures/
        {filename}.pdf
      floor-plans/
        {filename}.pdf
      unit-data/
        {filename}.xlsx
      images/
        {filename}.jpg
      documents/
        {filename}.pdf

org-logos/
  {organization_id}.png

temp-uploads/
  {user_id}/
    {filename}
________________________________________
8. Migration Strategy
8.1 Fresh Installation
For new deployments, run migrations in this order:
1.	Extensions and Types
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create all ENUM types (from section 3.1)
2.	Core Tables
-- Organizations ? Employees ? Projects ? Units
-- Create in dependency order
3.	Supporting Tables
-- Leads, Promotions, Project Files, Activity Logs
4.	Indexes
-- All indexes from section 4
5.	RLS Policies
-- All RLS policies from section 5
6.	Triggers and Functions
-- All triggers from section 6
8.2 Migration from Previous Version
If migrating from a split manual/AI schema:
-- Step 1: Create unified projects table (new schema)
CREATE TABLE projects_v2 AS SELECT * FROM projects_manual LIMIT 0;

-- Step 2: Migrate manual projects
INSERT INTO projects_v2 (
    id, organization_id, name, location, creation_method, ...
)
SELECT 
    id, organization_id, name, location, 'manual' as creation_method, ...
FROM projects_manual;

-- Step 3: Migrate AI projects
INSERT INTO projects_v2 (
    id, organization_id, name, location, creation_method, ...
)
SELECT 
    id, organization_id, name, location, 'ai_assisted' as creation_method, ...
FROM projects_ai;

-- Step 4: Rename tables
ALTER TABLE projects_manual RENAME TO projects_manual_old;
ALTER TABLE projects_ai RENAME TO projects_ai_old;
ALTER TABLE projects_v2 RENAME TO projects;

-- Step 5: Recreate foreign keys and indexes
-- ... (create all constraints and indexes)

-- Step 6: Verify data
SELECT creation_method, COUNT(*) FROM projects GROUP BY creation_method;

-- Step 7: Drop old tables (after verification)
DROP TABLE projects_manual_old;
DROP TABLE projects_ai_old;
________________________________________
9. Data Integrity
9.1 Referential Integrity
All foreign keys use appropriate ON DELETE actions:
•	CASCADE: Child records deleted when parent deleted
o	employees.organization_id ? organizations.id
o	projects.organization_id ? organizations.id
o	units.project_id ? projects.id
•	SET NULL: Reference cleared when parent deleted
o	projects.source_file_id ? project_files.id
o	leads.assigned_to ? employees.id
•	RESTRICT: Prevent deletion if children exist
o	projects.created_by ? employees.id
o	unit_imports.imported_by ? employees.id
9.2 Data Validation
CHECK Constraints:
•	Numeric ranges (prices > 0, scores 0-100)
•	Date logic (handover >= completion)
•	Email format validation
•	JSONB structure validation (future enhancement)
NOT NULL Constraints:
•	Required fields enforced at database level
•	Prevents incomplete records
9.3 JSONB Schema Validation (Future)
-- Example: Validate amenities array structure
ALTER TABLE projects ADD CONSTRAINT valid_amenities_structure
CHECK (
    jsonb_typeof(amenities) = 'array' AND
    (
        amenities = '[]'::jsonb OR
        (SELECT bool_and(jsonb_typeof(value) = 'string') 
         FROM jsonb_array_elements(amenities))
    )
);
________________________________________
10. Performance Optimization
10.1 Query Performance Tips
Use EXPLAIN ANALYZE:
EXPLAIN ANALYZE
SELECT * FROM projects 
WHERE organization_id = '...' AND status = 'published';
Optimize JSONB Queries:
-- Fast: Uses GIN index
SELECT * FROM projects WHERE amenities @> '["Pool"]';

-- Slow: Full table scan
SELECT * FROM projects WHERE amenities::text LIKE '%Pool%';
Pagination with Keyset:
-- Better than OFFSET for large datasets
SELECT * FROM projects 
WHERE (created_at, id) < ('2025-09-30', 'last_id')
ORDER BY created_at DESC, id DESC
LIMIT 20;
10.2 Connection Pooling
Use PgBouncer or Supabase connection pooler:
•	Transaction mode for short queries
•	Session mode for complex operations
•	Max connections: 100 per region
10.3 Monitoring
Track these metrics:
•	Query execution time (> 1s alerts)
•	Cache hit ratio (> 90% target)
•	Index usage (unused indexes = waste)
•	Table bloat (vacuum regularly)
•	Connection pool utilization
________________________________________
Appendix: Sample Queries
Common Queries
1. Get all published projects for agents:
SELECT p.*, o.name as developer_name
FROM projects p
JOIN organizations o ON p.organization_id = o.id
WHERE p.status = 'published'
ORDER BY p.published_at DESC
LIMIT 20;
2. Get units with custom fields:
SELECT 
    u.*,
    u.custom_fields->>'discount_20' as discount_20,
    u.custom_fields->>'payment_plan' as payment_plan
FROM units u
WHERE u.project_id = 'proj_123'
AND u.status = 'available'
ORDER BY u.price;
3. Get project with unit statistics:
SELECT 
    p.*,
    COUNT(u.id) as total_units,
    COUNT(CASE WHEN u.status = 'available' THEN 1 END) as available,
    COUNT(CASE WHEN u.status = 'sold' THEN 1 END) as sold
FROM projects p
LEFT JOIN units u ON p.id = u.project_id
WHERE p.id = 'proj_123'
GROUP BY p.id;
4. Get latest unit import for project:
SELECT * FROM unit_imports
WHERE project_id = 'proj_123'
AND is_active = true
ORDER BY version_number DESC
LIMIT 1;
5. Full-text search projects:
SELECT * FROM projects
WHERE to_tsvector('english', name || ' ' || location || ' ' || description) 
      @@ to_tsquery('english', 'Dubai & luxury');
________________________________________
End of Document

