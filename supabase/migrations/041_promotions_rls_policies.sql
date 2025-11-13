-- RLS policies for promotions to allow developers/admins to manage their org's promotions

-- Ensure RLS is enabled (safe to run if already enabled)
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Allow developers/admins of the same organization to select their promotions
-- Also allow agents (or anyone) to select active promotions
CREATE POLICY promotions_select_org_or_active ON promotions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM employees e
    WHERE e.user_id = auth.uid()
      AND (e.organization_id = promotions.organization_id OR e.role = 'admin')
  )
  OR status = 'active'
);

-- Allow developers/admins of the org to manage (insert/update/delete) their promotions
CREATE POLICY promotions_manage_org_or_admin ON promotions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM employees e
    WHERE e.user_id = auth.uid()
      AND (e.organization_id = promotions.organization_id OR e.role = 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM employees e
    WHERE e.user_id = auth.uid()
      AND (e.organization_id = promotions.organization_id OR e.role = 'admin')
  )
);






