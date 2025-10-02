-- migrations/008_rls_policies.sql

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;

-- Organizations Policies
CREATE POLICY "org_view_own" ON organizations FOR SELECT USING (
    id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid())
);

CREATE POLICY "org_admin_update" ON organizations FOR UPDATE USING (
    id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid() AND role = 'admin')
);

-- Projects Policies
CREATE POLICY "dev_view_own_projects" ON projects FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid())
);

CREATE POLICY "agent_view_published" ON projects FOR SELECT USING (
    status = 'published' OR organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid())
);

CREATE POLICY "dev_manage_projects" ON projects FOR ALL USING (
    organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid())
);

-- Units Policies
CREATE POLICY "view_project_units" ON units FOR SELECT USING (
    project_id IN (SELECT id FROM projects)
);

CREATE POLICY "dev_manage_units" ON units FOR ALL USING (
    project_id IN (
        SELECT p.id FROM projects p
        JOIN employees e ON p.organization_id = e.organization_id
        WHERE e.user_id = auth.uid()
    )
);

-- Leads Policies
CREATE POLICY "org_view_leads" ON leads FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid())
);

CREATE POLICY "agent_manage_leads" ON leads FOR ALL USING (
    organization_id IN (SELECT organization_id FROM employees WHERE user_id = auth.uid())
);
