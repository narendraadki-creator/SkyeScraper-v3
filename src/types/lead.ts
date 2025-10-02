export interface Lead {
  id: string;
  organization_id: string;
  project_id?: string;
  unit_id?: string;
  
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  
  source?: string;
  status: LeadStatus;
  stage: LeadStage;
  
  budget_min?: number;
  budget_max?: number;
  preferred_unit_types?: string[];
  preferred_location?: string;
  requirements?: string;
  
  assigned_to?: string;
  notes?: string;
  next_followup?: string;
  last_contacted?: string;
  score?: number;
  
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'negotiation' | 'won' | 'lost';
export type LeadStage = 'inquiry' | 'site_visit' | 'proposal' | 'negotiation' | 'closed';

export interface CreateLeadData {
  project_id?: string;
  unit_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  source?: string;
  budget_min?: number;
  budget_max?: number;
  preferred_unit_types?: string[];
  preferred_location?: string;
  requirements?: string;
  assigned_to?: string;
  notes?: string;
  next_followup?: string;
}

export interface UpdateLeadData {
  status?: LeadStatus;
  stage?: LeadStage;
  notes?: string;
  next_followup?: string;
  last_contacted?: string;
  score?: number;
  assigned_to?: string;
  budget_min?: number;
  budget_max?: number;
  preferred_unit_types?: string[];
  preferred_location?: string;
  requirements?: string;
}

export interface LeadFilters {
  status?: LeadStatus;
  stage?: LeadStage;
  project_id?: string;
  assigned_to?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface LeadListResponse {
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
}

export interface LeadServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

// Lead status and stage configurations
export const LEAD_STATUS_CONFIG = {
  new: { label: 'New', color: 'blue', icon: '🆕' },
  contacted: { label: 'Contacted', color: 'yellow', icon: '📞' },
  qualified: { label: 'Qualified', color: 'green', icon: '✅' },
  negotiation: { label: 'Negotiation', color: 'orange', icon: '🤝' },
  won: { label: 'Won', color: 'green', icon: '🎉' },
  lost: { label: 'Lost', color: 'red', icon: '❌' },
};

export const LEAD_STAGE_CONFIG = {
  inquiry: { label: 'Inquiry', color: 'blue', icon: '❓' },
  site_visit: { label: 'Site Visit', color: 'purple', icon: '🏠' },
  proposal: { label: 'Proposal', color: 'orange', icon: '📋' },
  negotiation: { label: 'Negotiation', color: 'yellow', icon: '💬' },
  closed: { label: 'Closed', color: 'gray', icon: '🔒' },
};

// Lead sources
export const LEAD_SOURCES = [
  'Website Inquiry',
  'Phone Call',
  'Walk-in',
  'Referral',
  'Social Media',
  'Advertisement',
  'Cold Call',
  'Email Campaign',
  'Event',
  'Other'
];

// Unit types for preferences
export const UNIT_TYPES = [
  'Studio',
  '1 BHK',
  '1 BR',
  '2 BHK',
  '2 BR',
  '3 BHK',
  '3 BR',
  '4 BHK',
  '4 BR',
  '5 BHK',
  '5 BR',
  'Villa',
  'Townhouse',
  'Penthouse',
  'Duplex'
];
