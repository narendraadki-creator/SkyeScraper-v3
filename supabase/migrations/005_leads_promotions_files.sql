-- migrations/005_leads_promotions_files.sql

-- Leads Table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    
    source VARCHAR(100),
    status lead_status DEFAULT 'new',
    stage VARCHAR(50) DEFAULT 'inquiry',
    
    budget_min DECIMAL(15,2),
    budget_max DECIMAL(15,2),
    preferred_unit_types TEXT[],
    preferred_location TEXT,
    requirements TEXT,
    
    assigned_to UUID REFERENCES employees(id) ON DELETE SET NULL,
    notes TEXT,
    next_followup TIMESTAMPTZ,
    last_contacted TIMESTAMPTZ,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    
    created_by UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_email CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_budget CHECK ((budget_min IS NULL OR budget_max IS NULL) OR (budget_max >= budget_min))
);

-- Promotions Table
CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    promotion_type VARCHAR(100),
    
    discount_percentage DECIMAL(5,2) CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    discount_amount DECIMAL(15,2) CHECK (discount_amount >= 0),
    
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status promotion_status DEFAULT 'draft',
    
    terms_conditions TEXT,
    target_audience JSONB DEFAULT '[]',
    banner_image TEXT,
    
    created_by UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_dates CHECK (end_date >= start_date),
    CONSTRAINT has_discount CHECK (discount_percentage IS NOT NULL OR discount_amount IS NOT NULL)
);

-- Project Files Table
CREATE TABLE project_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_purpose file_purpose NOT NULL,
    file_size BIGINT CHECK (file_size > 0),
    mime_type VARCHAR(100),
    
    storage_bucket VARCHAR(100) NOT NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT,
    
    is_processed BOOLEAN DEFAULT FALSE,
    processing_status VARCHAR(50),
    processing_result JSONB,
    
    uploaded_by UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_storage_bucket CHECK (storage_bucket IN ('project-files', 'org-logos', 'temp-uploads'))
);

-- Indexes for leads
CREATE INDEX idx_leads_organization_id ON leads(organization_id);
CREATE INDEX idx_leads_project_id ON leads(project_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_org_status ON leads(organization_id, status);

-- Indexes for promotions
CREATE INDEX idx_promotions_organization_id ON promotions(organization_id);
CREATE INDEX idx_promotions_project_id ON promotions(project_id);
CREATE INDEX idx_promotions_status ON promotions(status);
CREATE INDEX idx_promotions_dates ON promotions(start_date, end_date);

-- Indexes for project_files
CREATE INDEX idx_project_files_project_id ON project_files(project_id);
CREATE INDEX idx_project_files_organization_id ON project_files(organization_id);
CREATE INDEX idx_project_files_purpose ON project_files(file_purpose);
