// Admin Types and Interfaces

export interface SystemAnalytics {
  organizations: {
    total: number;
    developers: number;
    agents: number;
    active: number;
    pending: number;
    suspended: number;
  };
  projects: {
    total: number;
    published: number;
    draft: number;
    by_creation_method: {
      manual: number;
      ai_assisted: number;
      admin: number;
    };
  };
  units: {
    total: number;
    available: number;
    sold: number;
    held: number;
  };
  leads: {
    total: number;
    converted: number;
    conversion_rate: number;
    by_status: {
      new: number;
      contacted: number;
      qualified: number;
      proposal: number;
      negotiation: number;
      closed_won: number;
      closed_lost: number;
    };
  };
  performance: {
    avg_response_time: number;
    top_performing_agents: Array<{
      agent_id: string;
      agent_name: string;
      leads_count: number;
      conversion_rate: number;
    }>;
    top_projects: Array<{
      project_id: string;
      project_name: string;
      leads_count: number;
      views_count: number;
    }>;
  };
}

export interface AdminOrganization {
  id: string;
  name: string;
  type: 'developer' | 'agent';
  status: 'pending' | 'active' | 'suspended';
  contact_email: string;
  contact_phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
  employee_count: number;
  project_count: number;
  lead_count: number;
}

export interface AdminProject {
  id: string;
  name: string;
  organization_id: string;
  organization_name: string;
  organization_type: 'developer' | 'agent';
  creation_method: 'manual' | 'ai_assisted' | 'admin';
  status: 'draft' | 'published' | 'archived';
  location: string;
  project_type: string;
  starting_price?: number;
  completion_date?: string;
  created_at: string;
  updated_at: string;
  views_count: number;
  leads_count: number;
  units_count: number;
}

export interface AdminLead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  project_id: string;
  project_name: string;
  organization_id: string;
  organization_name: string;
  agent_id: string;
  agent_name: string;
  status: string;
  source: string;
  budget_min?: number;
  budget_max?: number;
  created_at: string;
  updated_at: string;
  last_contact_date?: string;
}

export interface AdminFilters {
  organization_type?: 'developer' | 'agent';
  status?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface AdminProjectFilters extends AdminFilters {
  creation_method?: 'manual' | 'ai_assisted' | 'admin';
  project_status?: 'draft' | 'published' | 'archived';
}

export interface AdminLeadFilters extends AdminFilters {
  lead_status?: string;
  source?: string;
  project_id?: string;
  agent_id?: string;
}

export interface CreateProjectOnBehalfData {
  organization_id: string;
  creation_method: 'admin';
  name: string;
  location: string;
  project_type: string;
  description?: string;
  starting_price?: number;
  completion_date?: string;
  amenities?: string[];
  connectivity?: string[];
  landmarks?: string[];
  payment_plans?: string[];
  custom_attributes?: Record<string, any>;
}

export interface AdminDashboardStats {
  total_organizations: number;
  total_projects: number;
  total_leads: number;
  total_units: number;
  active_developers: number;
  active_agents: number;
  published_projects: number;
  converted_leads: number;
  system_health: {
    uptime: number;
    response_time: number;
    error_rate: number;
  };
}
