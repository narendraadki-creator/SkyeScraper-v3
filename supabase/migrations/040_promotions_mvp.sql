-- 040_promotions_mvp.sql
-- Extend promotions and add supporting tables for MVP

-- Safety: table may already exist from earlier migration
DO $$ BEGIN
  ALTER TABLE promotions
    ADD COLUMN IF NOT EXISTS short_message VARCHAR(160),
    ADD COLUMN IF NOT EXISTS media_url TEXT,
    ADD COLUMN IF NOT EXISTS send_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS is_scheduled BOOLEAN DEFAULT FALSE;
EXCEPTION WHEN undefined_table THEN
  -- if promotions table is missing in this environment, create a minimal one
  CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    short_message VARCHAR(160),
    promotion_type VARCHAR(100),
    discount_percentage DECIMAL(5,2) CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    discount_amount DECIMAL(15,2) CHECK (discount_amount >= 0),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status promotion_status DEFAULT 'draft',
    terms_conditions TEXT,
    target_audience JSONB DEFAULT '[]',
    banner_image TEXT,
    media_url TEXT,
    send_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    is_scheduled BOOLEAN DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_dates CHECK (end_date >= start_date)
  );
END $$;

-- Indexes for promotions scheduling/lookup
CREATE INDEX IF NOT EXISTS idx_promotions_send_at ON promotions(send_at);
CREATE INDEX IF NOT EXISTS idx_promotions_org_status ON promotions(organization_id, status);

-- Notifications table (in-app notifications)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  recipient_employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- e.g., 'promotion'
  title TEXT,
  message TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_employee_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_org_created ON notifications(organization_id, created_at DESC);

-- Agent opt-in interests for projects
CREATE TABLE IF NOT EXISTS agent_property_interest (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_employee_id, project_id)
);

CREATE INDEX IF NOT EXISTS idx_interest_agent ON agent_property_interest(agent_employee_id);
CREATE INDEX IF NOT EXISTS idx_interest_project ON agent_property_interest(project_id);

-- Aggregated promotion metrics
CREATE TABLE IF NOT EXISTS promotion_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_promotion_metrics_unique ON promotion_metrics(promotion_id);






