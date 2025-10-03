-- Fix lead counts for all projects by recalculating them
UPDATE projects 
SET leads_count = (
  SELECT COUNT(*) 
  FROM leads 
  WHERE leads.project_id = projects.id
),
updated_at = NOW();
