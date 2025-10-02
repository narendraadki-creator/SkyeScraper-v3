-- migrations/024_disable_problematic_trigger.sql
-- Temporarily disable the auto_version_import trigger that's causing FK constraint violations

-- Drop the problematic trigger
DROP TRIGGER IF EXISTS auto_version_import ON unit_imports;

-- Create a simpler trigger that doesn't cause FK issues
CREATE OR REPLACE FUNCTION simple_version_import()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set version number if not already set
    IF NEW.version_number IS NULL THEN
        SELECT COALESCE(MAX(version_number), 0) + 1 
        INTO NEW.version_number
        FROM unit_imports 
        WHERE project_id = NEW.project_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the new trigger
CREATE TRIGGER simple_version_import_trigger 
    BEFORE INSERT ON unit_imports 
    FOR EACH ROW 
    EXECUTE FUNCTION simple_version_import();

-- Comment explaining the change
COMMENT ON FUNCTION simple_version_import() IS 'Simplified version trigger that only handles version numbering without FK constraint issues';
