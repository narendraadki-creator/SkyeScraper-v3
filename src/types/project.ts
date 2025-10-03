// Project types following unified architecture
// Single Project type for ALL creation methods (manual, AI, hybrid, admin)

export type CreationMethod = 'manual' | 'ai_assisted' | 'hybrid' | 'admin';
export type ProjectStatus = 'draft' | 'published' | 'archived';

// Unified Project interface - used for ALL creation methods
export interface Project {
  id: string;
  organization_id: string;
  name: string;
  location: string;
  project_type?: string;
  status: ProjectStatus;
  
  // CRITICAL: Creation tracking
  creation_method: CreationMethod;
  created_by: string;
  source_file_id?: string;
  ai_confidence_score?: number;
  
  // Standard details (nullable)
  description?: string;
  developer_name?: string;
  address?: string;
  starting_price?: number;
  total_units?: number;
  completion_date?: string;
  handover_date?: string;
  
  // AI-Extracted structured data (JSONB)
  amenities: string[];
  connectivity: string[];
  landmarks: Landmark[];
  payment_plans: PaymentPlan[];
  master_plan?: any;
  custom_attributes: Record<string, any>;
  
  // Media
  featured_image?: string;
  gallery_images: string[];
  brochure_url?: string;
  floor_plan_urls: string[];
  
  // Engagement metrics
  is_featured: boolean;
  views_count: number;
  leads_count: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  published_at?: string;
}

// Supporting types for JSONB fields
export interface Landmark {
  name: string;
  distance: string;
  type?: string;
}

export interface PaymentPlan {
  name: string;
  description: string;
  terms: string;
  percentage?: number;
}

// Create project data - unified for all methods
export interface CreateProjectData {
  // CRITICAL: Always specify creation method
  creation_method: CreationMethod;
  
  // Basic details (required for manual)
  name: string;
  location: string;
  project_type?: string;
  status?: ProjectStatus;
  description?: string;
  developer_name?: string;
  address?: string;
  starting_price?: number;
  total_units?: number;
  completion_date?: string;
  handover_date?: string;
  
  // AI-extracted data (JSONB)
  amenities?: string[];
  connectivity?: string[];
  landmarks?: Landmark[];
  payment_plans?: PaymentPlan[];
  custom_attributes?: Record<string, any>;
  
  // Media
  featured_image?: string;
  gallery_images?: string[];
  brochure_url?: string;
  floor_plan_urls?: string[];
  
  // AI-specific fields
  source_file_id?: string;
  ai_confidence_score?: number;
  
  // Engagement
  is_featured?: boolean;
}

// Update project data
export interface UpdateProjectData {
  name?: string;
  location?: string;
  project_type?: string;
  status?: ProjectStatus;
  description?: string;
  developer_name?: string;
  address?: string;
  starting_price?: number;
  total_units?: number;
  completion_date?: string;
  handover_date?: string;
  amenities?: string[];
  connectivity?: string[];
  landmarks?: Landmark[];
  payment_plans?: PaymentPlan[];
  custom_attributes?: Record<string, any>;
  featured_image?: string;
  gallery_images?: string[];
  brochure_url?: string;
  floor_plan_urls?: string[];
  is_featured?: boolean;
}

// Project filters for listing
export interface ProjectFilters {
  status?: ProjectStatus;
  project_type?: string;
  location?: string;
  creation_method?: CreationMethod;
  search?: string;
  page?: number;
  limit?: number;
}

// Project list response
export interface ProjectListResponse {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Service response wrapper
export interface ProjectServiceResponse<T> {
  data?: T;
  error?: {
    message: string;
    details?: any;
  };
}

// AI extraction result (for AI-assisted creation)
export interface AIExtractionResult {
  name: string;
  location: string;
  project_type?: string;
  description?: string;
  developer_name?: string;
  address?: string;
  starting_price?: number;
  total_units?: number;
  completion_date?: string;
  handover_date?: string;
  amenities: string[];
  connectivity: string[];
  landmarks: Landmark[];
  payment_plans: PaymentPlan[];
  custom_attributes: Record<string, any>;
  confidence_score: number;
  extracted_fields: string[];
  missing_fields: string[];
}

// File upload data
export interface FileUploadData {
  file: File;
  purpose: 'brochure' | 'floor_plan' | 'image' | 'document';
  project_id?: string;
}

// Project statistics
export interface ProjectStats {
  total_projects: number;
  draft_projects: number;
  published_projects: number;
  archived_projects: number;
  manual_projects: number;
  ai_assisted_projects: number;
  hybrid_projects: number;
  admin_projects: number;
  total_units: number;
  total_leads: number;
  total_views: number;
}
