-- Create function to increment project leads count
CREATE OR REPLACE FUNCTION increment_project_leads_count(project_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE projects 
  SET leads_count = leads_count + 1,
      updated_at = NOW()
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to decrement project leads count (for when leads are deleted)
CREATE OR REPLACE FUNCTION decrement_project_leads_count(project_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE projects 
  SET leads_count = GREATEST(leads_count - 1, 0),
      updated_at = NOW()
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to recalculate project leads count (for data consistency)
CREATE OR REPLACE FUNCTION recalculate_project_leads_count(project_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE projects 
  SET leads_count = (
    SELECT COUNT(*) 
    FROM leads 
    WHERE leads.project_id = projects.id
  ),
  updated_at = NOW()
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql;
