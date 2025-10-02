-- migrations/004_units_imports.sql

-- Unit Imports (Version Control) - CREATE FIRST for FK reference
CREATE TABLE unit_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    import_type import_type NOT NULL,
    import_strategy VARCHAR(50) NOT NULL,
    source_file_name VARCHAR(255) NOT NULL,
    source_file_url TEXT,
    source_file_id UUID,
    
    -- Column Configuration (JSONB)
    detected_columns JSONB NOT NULL,
    column_mapping JSONB NOT NULL,
    custom_fields_config JSONB DEFAULT '[]',
    
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
    processing_status VARCHAR(50) DEFAULT 'pending',
    processing_started_at TIMESTAMPTZ,
    processing_completed_at TIMESTAMPTZ,
    
    CONSTRAINT valid_rows CHECK (valid_rows <= total_rows),
    UNIQUE(project_id, version_number)
);

-- Units Table
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
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
    source_file_id UUID,
    source_row_number INTEGER,
    column_mapping JSONB,
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(project_id, unit_number)
);

-- Indexes for unit_imports
CREATE INDEX idx_unit_imports_project_id ON unit_imports(project_id);
CREATE INDEX idx_unit_imports_is_active ON unit_imports(is_active) WHERE is_active = true;
CREATE INDEX idx_unit_imports_version ON unit_imports(project_id, version_number DESC);
CREATE INDEX idx_unit_imports_imported_by ON unit_imports(imported_by);

-- Indexes for units
CREATE INDEX idx_units_project_id ON units(project_id);
CREATE INDEX idx_units_status ON units(status);
CREATE INDEX idx_units_unit_type ON units(unit_type);
CREATE INDEX idx_units_floor_number ON units(floor_number);
CREATE INDEX idx_units_price ON units(price);
CREATE INDEX idx_units_import_version ON units(import_version);
CREATE INDEX idx_units_project_status ON units(project_id, status);
CREATE INDEX idx_units_custom_fields ON units USING gin(custom_fields);

-- Comments
COMMENT ON TABLE units IS 'UNIFIED units table with dynamic custom_fields for developer-specific columns - DO NOT add more columns';
COMMENT ON COLUMN units.custom_fields IS 'JSONB for ANY developer-specific fields: {"discount_20": 680000, "payment_plan": "60/40"}';
COMMENT ON TABLE unit_imports IS 'Version control for unit data imports - allows updates without data loss';
