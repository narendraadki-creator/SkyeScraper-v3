-- migrations/002_organizations_employees.sql

-- Organizations Table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type organization_type NOT NULL,
    status organization_status DEFAULT 'pending',
    contact_email VARCHAR(255) UNIQUE NOT NULL,
    contact_phone VARCHAR(50),
    address TEXT,
    website VARCHAR(255),
    description TEXT,
    logo_url TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_email CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_url CHECK (website IS NULL OR website ~* '^https?://')
);

-- Indexes for organizations
CREATE INDEX idx_organizations_type ON organizations(type);
CREATE INDEX idx_organizations_status ON organizations(status);
CREATE INDEX idx_organizations_created_at ON organizations(created_at DESC);

-- Comments
COMMENT ON TABLE organizations IS 'Developer and agent organizations using the platform';
COMMENT ON COLUMN organizations.type IS 'developer: creates projects, agent: sells projects';

-- Employees Table
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    role user_role NOT NULL,
    status employee_status DEFAULT 'active',
    permissions JSONB DEFAULT '{}',
    department VARCHAR(100),
    position VARCHAR(100),
    profile_image TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    
    CONSTRAINT valid_employee_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes for employees
CREATE INDEX idx_employees_organization_id ON employees(organization_id);
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_role ON employees(role);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_name_search ON employees USING gin(to_tsvector('english', first_name || ' ' || last_name));

-- Comments
COMMENT ON TABLE employees IS 'Users within organizations with role-based access';
COMMENT ON COLUMN employees.permissions IS 'JSONB object for granular permissions: {"can_create_projects": true}';
