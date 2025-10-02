-- migrations/007_triggers_functions.sql

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_organizations_timestamp BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_timestamp BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_timestamp BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_units_timestamp BEFORE UPDATE ON units FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_timestamp BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_promotions_timestamp BEFORE UPDATE ON promotions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_timestamp BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Log all activity
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
DECLARE
    emp_id UUID;
    org_id UUID;
    changed TEXT[];
BEGIN
    SELECT id, organization_id INTO emp_id, org_id
    FROM employees WHERE user_id = auth.uid();
    
    IF TG_OP = 'DELETE' THEN
        INSERT INTO activity_logs (table_name, record_id, action, old_values, user_id, employee_id, organization_id)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD), auth.uid(), emp_id, org_id);
        RETURN OLD;
        
    ELSIF TG_OP = 'UPDATE' THEN
        SELECT array_agg(key) INTO changed
        FROM jsonb_each(to_jsonb(NEW))
        WHERE to_jsonb(NEW)->>key IS DISTINCT FROM to_jsonb(OLD)->>key;
        
        INSERT INTO activity_logs (table_name, record_id, action, old_values, new_values, changed_fields, user_id, employee_id, organization_id)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW), changed, auth.uid(), emp_id, org_id);
        RETURN NEW;
        
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO activity_logs (table_name, record_id, action, new_values, user_id, employee_id, organization_id)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW), auth.uid(), emp_id, org_id);
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply to main tables
CREATE TRIGGER log_organizations_changes AFTER INSERT OR UPDATE OR DELETE ON organizations FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER log_projects_changes AFTER INSERT OR UPDATE OR DELETE ON projects FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER log_units_changes AFTER INSERT OR UPDATE OR DELETE ON units FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER log_leads_changes AFTER INSERT OR UPDATE OR DELETE ON leads FOR EACH ROW EXECUTE FUNCTION log_activity();

-- Function: Auto-increment import version
CREATE OR REPLACE FUNCTION increment_import_version()
RETURNS TRIGGER AS $$
BEGIN
    SELECT COALESCE(MAX(version_number), 0) + 1 
    INTO NEW.version_number
    FROM unit_imports 
    WHERE project_id = NEW.project_id;
    
    UPDATE unit_imports
    SET is_active = false, replaced_by = NEW.id
    WHERE project_id = NEW.project_id AND is_active = true AND id != NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_version_import BEFORE INSERT ON unit_imports FOR EACH ROW EXECUTE FUNCTION increment_import_version();
