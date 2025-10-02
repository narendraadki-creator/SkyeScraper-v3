-- migrations/003_projects.sql

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- REQUIRED FIELDS
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    
    -- Type and Status
    project_type VARCHAR(100),
    status project_status DEFAULT 'draft',
    
    -- CRITICAL: Creation tracking (enables unified schema)
    creation_method creation_method NOT NULL,
    created_by UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    source_file_id UUID,
    ai_confidence_score DECIMAL(3,2) CHECK (ai_confidence_score >= 0 AND ai_confidence_score <= 1),
    
    -- Standard Details (NULLABLE)
    description TEXT,
    developer_name VARCHAR(255),
    address TEXT,
    starting_price DECIMAL(15,2),
    total_units INTEGER CHECK (total_units >= 0),
    completion_date DATE,
    handover_date DATE,
    
    -- AI-Extracted Structured Data (JSONB for flexibility)
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
    
    -- Engagement
    is_featured BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    leads_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    
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
CREATE INDEX idx_projects_org_status ON projects(organization_id, status);
CREATE INDEX idx_projects_status_published ON projects(status, published_at DESC) WHERE status = 'published';

-- JSONB indexes
CREATE INDEX idx_projects_amenities ON projects USING gin(amenities);
CREATE INDEX idx_projects_landmarks ON projects USING gin(landmarks);
CREATE INDEX idx_projects_custom_attributes ON projects USING gin(custom_attributes);

-- Full-text search
CREATE INDEX idx_projects_search ON projects USING gin(
    to_tsvector('english', name || ' ' || COALESCE(location, '') || ' ' || COALESCE(description, ''))
);

-- Comments
COMMENT ON TABLE projects IS 'UNIFIED project table for ALL creation methods (manual, AI, hybrid, admin) - DO NOT CREATE SEPARATE TABLES';
COMMENT ON COLUMN projects.creation_method IS 'Tracks how project was created - CRITICAL for unified schema';
COMMENT ON COLUMN projects.ai_confidence_score IS 'AI extraction confidence (0.00-1.00) for ai_assisted and hybrid methods';
COMMENT ON COLUMN projects.custom_attributes IS 'Developer-specific attributes stored as JSONB: {"rera_number": "REG-123"}';
