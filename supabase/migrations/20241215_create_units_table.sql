-- Add new columns to existing units table for smart unit processing
-- These columns will store additional data from smart schema inference

-- Add new columns to support smart unit processing
ALTER TABLE units ADD COLUMN IF NOT EXISTS unit_code VARCHAR(200);
ALTER TABLE units ADD COLUMN IF NOT EXISTS area_total DECIMAL(10,2);
ALTER TABLE units ADD COLUMN IF NOT EXISTS area_suite DECIMAL(10,2);
ALTER TABLE units ADD COLUMN IF NOT EXISTS area_balcony DECIMAL(10,2);
ALTER TABLE units ADD COLUMN IF NOT EXISTS unit_view TEXT;
ALTER TABLE units ADD COLUMN IF NOT EXISTS tower VARCHAR(200);
ALTER TABLE units ADD COLUMN IF NOT EXISTS raw_data JSONB;

-- Update status enum to include new statuses
-- First, let's check if the unit_status enum exists and add new values
DO $$
BEGIN
    -- Add new status values to the existing unit_status enum if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'blocked' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'unit_status')) THEN
        ALTER TYPE unit_status ADD VALUE 'blocked';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'unknown' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'unit_status')) THEN
        ALTER TYPE unit_status ADD VALUE 'unknown';
    END IF;
END $$;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_units_unit_code ON units(unit_code);
CREATE INDEX IF NOT EXISTS idx_units_area_total ON units(area_total);
CREATE INDEX IF NOT EXISTS idx_units_tower ON units(tower);
CREATE INDEX IF NOT EXISTS idx_units_raw_data ON units USING gin(raw_data);

-- Add RLS policies
ALTER TABLE units ENABLE ROW LEVEL SECURITY;

-- Policy for developers to manage units in their projects
CREATE POLICY "Developers can manage units in their projects" ON units
FOR ALL USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN employees e ON e.organization_id = p.organization_id
    WHERE e.user_id = auth.uid() AND e.role = 'developer'
  )
);

-- Policy for agents to view units in projects from their organization
CREATE POLICY "Agents can view units in their organization projects" ON units
FOR SELECT USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN employees e ON e.organization_id = p.organization_id
    WHERE e.user_id = auth.uid() AND e.role = 'agent'
  )
);

-- Add unit_summary column to projects table if it doesn't exist
ALTER TABLE projects ADD COLUMN IF NOT EXISTS unit_summary JSONB;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_units_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_units_updated_at ON units;
CREATE TRIGGER trigger_update_units_updated_at
  BEFORE UPDATE ON units
  FOR EACH ROW
  EXECUTE FUNCTION update_units_updated_at();
