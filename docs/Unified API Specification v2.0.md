SkyeScraper - Unified API Specification v2.0
Document Information
•	Version: 2.0
•	Date: September 2025
•	Project: SkyeScraper Real Estate Platform
•	Base URL: https://api.skyescraper.com/v1
•	Purpose: Comprehensive API for unified architecture
________________________________________
Table of Contents
1.	Overview
2.	Authentication
3.	Organizations API
4.	Employees API
5.	Projects API (Unified)
6.	Units API (Dynamic)
7.	Leads API
8.	Promotions API
9.	Admin API
10.	File Processing API
11.	Data Models
12.	Error Codes
________________________________________
1. Overview
1.1 API Philosophy
This API follows a unified architecture principle:
•	Single endpoint per resource type (no separate manual/AI endpoints)
•	creation_method parameter distinguishes data origin
•	JSONB fields support flexible data structures
•	Consistent response formats across all endpoints
1.2 Base URL
Production: https://api.skyescraper.com/v1
Staging: https://staging-api.skyescraper.com/v1
Development: http://localhost:3000/api/v1
1.3 Authentication
All endpoints require JWT authentication unless marked as public.
Authorization: Bearer <jwt_token>
1.4 Standard Response Format
Success Response:
{
  "success": true,
  "data": { /* response data */ },
  "meta": {
    "timestamp": "2025-09-30T10:30:00Z",
    "request_id": "req_abc123"
  }
}
Error Response:
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { /* additional error context */ }
  },
  "meta": {
    "timestamp": "2025-09-30T10:30:00Z",
    "request_id": "req_abc123"
  }
}
1.5 Pagination
List endpoints support pagination:
GET /projects?page=1&limit=20
Pagination Response:
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_items": 150,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
________________________________________
2. Authentication
2.1 Organization Registration
POST /auth/organizations/register
Register a new organization (developer or agent).
Request Body:
{
  "organization": {
    "name": "ABC Developers",
    "type": "developer",
    "contact_email": "contact@abcdev.com",
    "contact_phone": "+1234567890",
    "address": "123 Business St, City",
    "website": "https://abcdev.com"
  },
  "admin_user": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@abcdev.com",
    "password": "SecurePass123!",
    "phone": "+1234567890"
  },
  "terms_accepted": true
}
Response (201 Created):
{
  "success": true,
  "data": {
    "organization": {
      "id": "org_abc123",
      "name": "ABC Developers",
      "type": "developer",
      "status": "pending",
      "created_at": "2025-09-30T10:30:00Z"
    },
    "user": {
      "id": "emp_xyz789",
      "employee_code": "EMP001",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@abcdev.com",
      "role": "admin"
    },
    "token": "eyJhbGc...",
    "refresh_token": "refresh_..."
  }
}
2.2 Employee Login
POST /auth/login
Login for employees of organizations.
Request Body:
{
  "email": "john@abcdev.com",
  "password": "SecurePass123!"
}
Response (200 OK):
{
  "success": true,
  "data": {
    "user": {
      "id": "emp_xyz789",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@abcdev.com",
      "role": "admin",
      "organization": {
        "id": "org_abc123",
        "name": "ABC Developers",
        "type": "developer"
      }
    },
    "token": "eyJhbGc...",
    "refresh_token": "refresh_...",
    "expires_in": 3600
  }
}
2.3 Admin Login
POST /auth/admin/login
Separate endpoint for super admin access.
Request Body:
{
  "email": "admin@skyescraper.com",
  "password": "AdminSecurePass123!",
  "mfa_code": "123456"
}
________________________________________
3. Organizations API
3.1 Get Organization Profile
GET /organizations/me
Get current user's organization details.
Response (200 OK):
{
  "success": true,
  "data": {
    "id": "org_abc123",
    "name": "ABC Developers",
    "type": "developer",
    "status": "active",
    "contact_email": "contact@abcdev.com",
    "contact_phone": "+1234567890",
    "address": "123 Business St, City",
    "website": "https://abcdev.com",
    "logo_url": "https://storage.skyescraper.com/logos/org_abc123.png",
    "employee_count": 15,
    "project_count": 8,
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-09-30T10:30:00Z"
  }
}
3.2 Update Organization Profile
PUT /organizations/me
Update organization details.
Request Body:
{
  "name": "ABC Developers Ltd",
  "contact_phone": "+1234567891",
  "address": "456 New Business St, City",
  "description": "Premier real estate development company"
}
________________________________________
4. Employees API
4.1 List Employees
GET /organizations/me/employees
List all employees in the organization.
Query Parameters:
•	role (optional): Filter by role (admin, manager, agent)
•	status (optional): Filter by status (active, inactive)
•	search (optional): Search by name or email
Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": "emp_xyz789",
      "employee_code": "EMP001",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@abcdev.com",
      "role": "admin",
      "status": "active",
      "department": "Management",
      "created_at": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": { /* pagination info */ }
}
4.2 Create Employee
POST /organizations/me/employees
Add a new employee to the organization.
Request Body:
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@abcdev.com",
  "phone": "+1234567892",
  "role": "agent",
  "department": "Sales",
  "permissions": {
    "can_create_projects": false,
    "can_edit_projects": false,
    "can_manage_leads": true,
    "can_view_analytics": true
  }
}
________________________________________
5. Projects API (Unified)
5.1 Create Project (Unified Endpoint)
POST /projects
Single endpoint for all project creation methods. The creation_method determines processing path.
Request Body - Manual Creation:
{
  "creation_method": "manual",
  "name": "Skyline Towers",
  "location": "Downtown Dubai",
  "project_type": "Apartment",
  "description": "Luxury residential towers with world-class amenities",
  "developer_name": "ABC Developers",
  "address": "Sheikh Zayed Road, Dubai",
  "starting_price": 1200000,
  "total_units": 200,
  "completion_date": "2026-12-31",
  "handover_date": "2027-03-31",
  "amenities": ["Swimming Pool", "Gym", "Spa", "Parking"],
  "connectivity": ["Metro 500m", "Highway 2km"],
  "landmarks": [
    {"name": "Burj Khalifa", "distance": "5km"},
    {"name": "Dubai Mall", "distance": "3km"}
  ],
  "payment_plans": [
    {
      "name": "Construction Linked",
      "description": "Pay during construction phases",
      "terms": "20% down, 60% during construction, 20% on handover"
    }
  ],
  "custom_attributes": {
    "rera_number": "REG-2025-001",
    "developer_license": "DEV-ABC-2025"
  }
}
Request Body - AI-Assisted Creation:
{
  "creation_method": "ai_assisted",
  "brochure_file_id": "file_brochure_xyz",
  "preview": false
}
Response (201 Created):
{
  "success": true,
  "data": {
    "id": "proj_123abc",
    "organization_id": "org_abc123",
    "name": "Skyline Towers",
    "location": "Downtown Dubai",
    "project_type": "Apartment",
    "status": "draft",
    "creation_method": "manual",
    "starting_price": 1200000,
    "total_units": 200,
    "completion_date": "2026-12-31",
    "amenities": ["Swimming Pool", "Gym", "Spa", "Parking"],
    "connectivity": ["Metro 500m", "Highway 2km"],
    "landmarks": [
      {"name": "Burj Khalifa", "distance": "5km"},
      {"name": "Dubai Mall", "distance": "3km"}
    ],
    "payment_plans": [ /* ... */ ],
    "custom_attributes": { /* ... */ },
    "created_by": "emp_xyz789",
    "created_at": "2025-09-30T10:30:00Z",
    "updated_at": "2025-09-30T10:30:00Z"
  }
}
5.2 AI Project Extraction
POST /projects/ai-extract
Extract project details from brochure for preview before saving.
Request Body:
{
  "brochure_file_id": "file_brochure_xyz"
}
Response (200 OK):
{
  "success": true,
  "data": {
    "extracted_data": {
      "name": "Oasis Residences",
      "location": "Business Bay, Dubai",
      "project_type": "Apartment",
      "developer_name": "Elite Developers",
      "total_units": 250,
      "amenities": ["Pool", "Gym", "Parking"],
      "landmarks": [
        {"name": "Downtown", "distance": "2km"}
      ],
      "payment_plans": [ /* ... */ ]
    },
    "confidence_scores": {
      "name": 0.98,
      "location": 0.95,
      "project_type": 0.92,
      "total_units": 0.88,
      "amenities": 0.90
    },
    "low_confidence_fields": ["total_units"],
    "source_file": {
      "id": "file_brochure_xyz",
      "name": "oasis_brochure.pdf",
      "url": "https://storage.skyescraper.com/..."
    }
  }
}
5.3 List Projects
GET /projects
List projects with role-based filtering.
Query Parameters:
•	status (optional): draft, published, archived
•	type (optional): Filter by project type
•	location (optional): Filter by location
•	organization_id (optional, admin only): Filter by developer
•	search (optional): Search by name or location
•	page, limit: Pagination
Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": "proj_123abc",
      "name": "Skyline Towers",
      "organization": {
        "id": "org_abc123",
        "name": "ABC Developers",
        "type": "developer"
      },
      "location": "Downtown Dubai",
      "project_type": "Apartment",
      "status": "published",
      "starting_price": 1200000,
      "total_units": 200,
      "available_units": 150,
      "sold_units": 50,
      "featured_image": "https://storage.../featured.jpg",
      "created_at": "2025-09-30T10:30:00Z",
      "updated_at": "2025-09-30T10:30:00Z"
    }
  ],
  "pagination": { /* pagination info */ }
}
5.4 Get Project Details
GET /projects/{project_id}
Get complete project details including units summary.
Response (200 OK):
{
  "success": true,
  "data": {
    "id": "proj_123abc",
    "organization_id": "org_abc123",
    "name": "Skyline Towers",
    "location": "Downtown Dubai",
    "project_type": "Apartment",
    "status": "published",
    "creation_method": "manual",
    "description": "Luxury residential towers...",
    "developer_name": "ABC Developers",
    "address": "Sheikh Zayed Road, Dubai",
    "starting_price": 1200000,
    "total_units": 200,
    "completion_date": "2026-12-31",
    "handover_date": "2027-03-31",
    "amenities": ["Swimming Pool", "Gym", "Spa", "Parking"],
    "connectivity": ["Metro 500m", "Highway 2km"],
    "landmarks": [ /* ... */ ],
    "payment_plans": [ /* ... */ ],
    "custom_attributes": { /* ... */ },
    "units_summary": {
      "total": 200,
      "available": 150,
      "held": 20,
      "sold": 30,
      "by_type": {
        "Studio": 50,
        "1BHK": 80,
        "2BHK": 60,
        "3BHK": 10
      }
    },
    "media": {
      "featured_image": "https://storage.../featured.jpg",
      "gallery": [ /* image urls */ ],
      "brochure_url": "https://storage.../brochure.pdf",
      "floor_plans": [ /* floor plan urls */ ]
    },
    "created_by": {
      "id": "emp_xyz789",
      "name": "John Doe"
    },
    "created_at": "2025-09-30T10:30:00Z",
    "updated_at": "2025-09-30T10:30:00Z"
  }
}
5.5 Update Project
PUT /projects/{project_id}
Update project details (any creation method).
Request Body:
{
  "name": "Skyline Towers - Phase 2",
  "description": "Updated description",
  "starting_price": 1250000,
  "amenities": ["Swimming Pool", "Gym", "Spa", "Parking", "Kids Play Area"],
  "custom_attributes": {
    "rera_number": "REG-2025-001-V2"
  }
}
5.6 Publish Project
POST /projects/{project_id}/publish
Change project status from draft to published (visible to agents).
Response (200 OK):
{
  "success": true,
  "data": {
    "id": "proj_123abc",
    "status": "published",
    "published_at": "2025-09-30T11:00:00Z"
  }
}
________________________________________
6. Units API (Dynamic)
6.1 Import Units (Multi-Format)
POST /projects/{project_id}/units/import
Import units from Excel, PDF, or manual entry. Supports version control.
Request Body (Multipart Form Data):
file: [Excel/PDF file]
import_strategy: "replace_all" | "merge_updates" | "append_only"
auto_map_columns: true | false
Response (202 Accepted):
{
  "success": true,
  "data": {
    "import_id": "import_xyz789",
    "status": "processing",
    "project_id": "proj_123abc",
    "file_name": "units_data.xlsx",
    "processing_url": "/projects/proj_123abc/units/import/import_xyz789"
  }
}
6.2 Get Import Status
GET /projects/{project_id}/units/import/{import_id}
Check status of unit import processing.
Response (200 OK):
{
  "success": true,
  "data": {
    "import_id": "import_xyz789",
    "status": "completed",
    "project_id": "proj_123abc",
    "file_info": {
      "name": "units_data.xlsx",
      "size": 245680,
      "uploaded_at": "2025-09-30T10:30:00Z"
    },
    "detected_columns": [
      "Unit Number", "Floor", "Type", "Area (sqft)", 
      "Price (AED)", "20% Discount", "Payment Plan"
    ],
    "column_mapping": {
      "standard_fields": {
        "Unit Number": "unit_number",
        "Floor": "floor_number",
        "Type": "unit_type",
        "Area (sqft)": "area_sqft",
        "Price (AED)": "price"
      },
      "custom_fields": {
        "20% Discount": "discount_20",
        "Payment Plan": "payment_plan"
      }
    },
    "statistics": {
      "total_rows": 200,
      "valid_units": 195,
      "errors": 5,
      "units_created": 180,
      "units_updated": 15
    },
    "errors": [
      {
        "row": 45,
        "field": "price",
        "message": "Invalid price format",
        "value": "N/A"
      }
    ],
    "preview_units": [ /* first 5 units */ ],
    "version": {
      "version_number": 2,
      "replaced_version": "import_abc123"
    },
    "completed_at": "2025-09-30T10:32:15Z"
  }
}
6.3 Confirm Import
POST /projects/{project_id}/units/import/{import_id}/confirm
Confirm and save the import after review.
Request Body:
{
  "column_mapping": {
    "standard_fields": { /* adjusted mappings */ },
    "custom_fields": { /* adjusted mappings */ }
  },
  "import_strategy": "merge_updates"
}
6.4 List Units
GET /projects/{project_id}/units
List units with dynamic columns.
Query Parameters:
•	status: available, held, sold, reserved
•	unit_type: Filter by type
•	floor_min, floor_max: Floor range
•	price_min, price_max: Price range
•	page, limit: Pagination
Response (200 OK):
{
  "success": true,
  "data": {
    "units": [
      {
        "id": "unit_abc123",
        "project_id": "proj_123abc",
        "unit_number": "A-101",
        "unit_type": "1BHK",
        "floor_number": 5,
        "area_sqft": 650,
        "bedrooms": 1,
        "bathrooms": 1,
        "price": 850000,
        "status": "available",
        "custom_fields": {
          "discount_20": 680000,
          "discount_15": 722500,
          "payment_plan": "60% DC / 40% PHPP",
          "view": "Business Bay",
          "balcony": "Yes"
        },
        "import_version": "import_xyz789",
        "created_at": "2025-09-30T10:32:15Z",
        "updated_at": "2025-09-30T10:32:15Z"
      }
    ],
    "column_config": {
      "standard_columns": [
        {"key": "unit_number", "label": "Unit", "type": "text"},
        {"key": "unit_type", "label": "Type", "type": "text"},
        {"key": "floor_number", "label": "Floor", "type": "number"},
        {"key": "area_sqft", "label": "Area (sqft)", "type": "number"},
        {"key": "price", "label": "Price (AED)", "type": "currency"}
      ],
      "custom_columns": [
        {"key": "discount_20", "label": "20% Discount", "type": "currency"},
        {"key": "payment_plan", "label": "Payment Plan", "type": "text"},
        {"key": "view", "label": "View", "type": "text"}
      ]
    },
    "import_info": {
      "version_number": 2,
      "imported_at": "2025-09-30T10:32:15Z",
      "imported_by": "John Doe"
    }
  },
  "pagination": { /* pagination info */ }
}
6.5 Update Unit Status
PATCH /projects/{project_id}/units/{unit_id}
Update individual unit (status, price, custom fields).
Request Body:
{
  "status": "held",
  "price": 820000,
  "custom_fields": {
    "discount_20": 656000,
    "notes": "Special offer applied"
  }
}
6.6 Bulk Update Units
PATCH /projects/{project_id}/units/bulk
Update multiple units at once.
Request Body:
{
  "unit_ids": ["unit_abc123", "unit_def456", "unit_ghi789"],
  "updates": {
    "status": "held"
  }
}
________________________________________
7. Leads API
7.1 Create Lead
POST /leads
Capture a new lead (agents only).
Request Body:
{
  "project_id": "proj_123abc",
  "first_name": "Ahmed",
  "last_name": "Ali",
  "email": "ahmed@example.com",
  "phone": "+971501234567",
  "source": "Website Inquiry",
  "budget_min": 800000,
  "budget_max": 1200000,
  "preferred_unit_types": ["1BHK", "2BHK"],
  "notes": "Interested in Business Bay view units",
  "assigned_to": "emp_xyz789"
}
Response (201 Created):
{
  "success": true,
  "data": {
    "id": "lead_abc123",
    "organization_id": "org_agent456",
    "project_id": "proj_123abc",
    "first_name": "Ahmed",
    "last_name": "Ali",
    "email": "ahmed@example.com",
    "phone": "+971501234567",
    "status": "new",
    "stage": "inquiry",
    "source": "Website Inquiry",
    "budget_min": 800000,
    "budget_max": 1200000,
    "assigned_to": {
      "id": "emp_xyz789",
      "name": "Jane Smith"
    },
    "created_at": "2025-09-30T11:00:00Z"
  }
}
7.2 List Leads
GET /leads
List leads with filtering.
Query Parameters:
•	status: new, contacted, qualified, negotiation, won, lost
•	stage: inquiry, site_visit, proposal, negotiation, closed
•	project_id: Filter by project
•	assigned_to: Filter by agent
•	date_from, date_to: Date range
7.3 Update Lead
PUT /leads/{lead_id}
Update lead status and details.
Request Body:
{
  "status": "qualified",
  "stage": "site_visit",
  "notes": "Scheduled site visit for Oct 5th",
  "next_followup": "2025-10-05T10:00:00Z"
}
________________________________________
8. Promotions API
8.1 Create Promotion
POST /promotions
Create a promotional campaign (developers only).
Request Body:
{
  "project_id": "proj_123abc",
  "title": "Early Bird Discount",
  "description": "Special discount for first 50 buyers",
  "promotion_type": "discount",
  "discount_percentage": 15,
  "start_date": "2025-10-01",
  "end_date": "2025-12-31",
  "terms_conditions": "Terms and conditions apply",
  "target_audience": ["all_agents"]
}
8.2 List Promotions
GET /promotions
List active promotions.
Query Parameters:
•	project_id: Filter by project
•	status: active, expired, upcoming
•	organization_id: Filter by developer (admin only)
________________________________________
9. Admin API
9.1 List All Organizations
GET /admin/organizations
Super admin: View all organizations.
Query Parameters:
•	type: developer, agent
•	status: pending, active, suspended
•	search: Search by name or email
9.2 Create Project (On Behalf)
POST /admin/projects
Admin creates project for a developer.
Request Body:
{
  "organization_id": "org_abc123",
  "creation_method": "admin",
  "name": "Admin Created Project",
  /* ... other project fields ... */
}
9.3 Get System Analytics
GET /admin/analytics
System-wide metrics and statistics.
Response (200 OK):
{
  "success": true,
  "data": {
    "organizations": {
      "total": 150,
      "developers": 80,
      "agents": 70,
      "active": 140
    },
    "projects": {
      "total": 450,
      "published": 380,
      "draft": 70,
      "by_creation_method": {
        "manual": 250,
        "ai_assisted": 180,
        "admin": 20
      }
    },
    "units": {
      "total": 45000,
      "available": 28000,
      "sold": 15000,
      "held": 2000
    },
    "leads": {
      "total": 12000,
      "converted": 3500,
      "conversion_rate": 29.2
    }
  }
}
________________________________________
10. File Processing API
10.1 Upload File
POST /files/upload
Upload files for processing or storage.
Request Body (Multipart Form Data):
file: [File to upload]
purpose: "brochure" | "floor_plan" | "unit_data" | "image" | "document"
project_id: "proj_123abc" (optional)
Response (201 Created):
{
  "success": true,
  "data": {
    "file_id": "file_abc123",
    "file_name": "brochure.pdf",
    "file_type": "application/pdf",
    "file_size": 2456789,
    "purpose": "brochure",
    "url": "https://storage.skyescraper.com/files/...",
    "uploaded_at": "2025-09-30T11:00:00Z"
  }
}
10.2 Process Brochure (AI)
POST /files/{file_id}/process/brochure
Trigger AI processing for brochure extraction.
Response (202 Accepted):
{
  "success": true,
  "data": {
    "processing_id": "proc_xyz789",
    "status": "processing",
    "estimated_time": 30,
    "status_url": "/files/file_abc123/process/proc_xyz789"
  }
}
10.3 Get Processing Status
GET /files/{file_id}/process/{processing_id}
Check status of AI processing.
________________________________________
11. Data Models
11.1 Project Model
interface Project {
  id: string;
  organization_id: string;
  name: string;
  location: string;
  project_type: string;
  status: 'draft' | 'published' | 'archived';
  
  // Creation tracking
  creation_method: 'manual' | 'ai_assisted' | 'hybrid' | 'admin';
  created_by: string;
  source_file_id?: string;
  ai_confidence_score?: number;
  
  // Basic details
  description?: string;
  developer_name?: string;
  address?: string;
  starting_price?: number;
  total_units?: number;
  completion_date?: string;
  handover_date?: string;
  
  // Structured data (JSONB)
  amenities?: string[];
  connectivity?: string[];
  landmarks?: Landmark[];
  payment_plans?: PaymentPlan[];
  master_plan?: MasterPlan;
  custom_attributes?: Record<string, any>;
  
  // Media
  featured_image?: string;
  gallery_images?: string[];
  brochure_url?: string;
  floor_plan_urls?: string[];
  
  // Metadata
  is_featured: boolean;
  views_count: number;
  leads_count: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}
11.2 Unit Model
interface Unit {
  id: string;
  project_id: string;
  unit_number: string;
  
  // Standard fields
  unit_type?: string;
  floor_number?: number;
  area_sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  price?: number;
  status: 'available' | 'held' | 'sold' | 'reserved';
  
  // Dynamic data (JSONB)
  custom_fields: Record<string, any>;
  
  // Import metadata
  import_version?: string;
  source_file_id?: string;
  source_row_number?: number;
  column_mapping?: Record<string, string>;
  
  created_at: string;
  updated_at: string;
}
11.3 Unit Import Model
interface UnitImport {
  id: string;
  project_id: string;
  import_type: 'excel' | 'pdf' | 'manual' | 'api';
  
  // File info
  source_file_name: string;
  source_file_url: string;
  imported_by: string;
  
  // Column configuration
  detected_columns: string[];
  column_mapping: {
    standard_fields: Record<string, string>;
    custom_fields: Record<string, string>;
  };
  custom_fields_config: CustomFieldConfig[];
  
  // Statistics
  total_units: number;
  units_created: number;
  units_updated: number;
  errors: ImportError[];
  
  // Version control
  version_number: number;
  is_active: boolean;
  replaced_by?: string;
  
  imported_at: string;
}
________________________________________
12. Error Codes
12.1 Authentication Errors (4xx)
•	AUTH_001: Invalid credentials
•	AUTH_002: Token expired
•	AUTH_003: Insufficient permissions
•	AUTH_004: Organization not active
12.2 Validation Errors (4xx)
•	VAL_001: Required field missing
•	VAL_002: Invalid format
•	VAL_003: Duplicate entry
•	VAL_004: Foreign key violation
12.3 Business Logic Errors (4xx)
•	BIZ_001: Project not found
•	BIZ_002: Unit not available
•	BIZ_003: Invalid status transition
•	BIZ_004: Insufficient units for operation
12.4 Processing Errors (5xx)
•	PROC_001: AI processing failed
•	PROC_002: File parsing error
•	PROC_003: Import validation failed
•	PROC_004: Database transaction failed
________________________________________
13. Rate Limiting
•	Authentication: 5 requests/minute
•	File Upload: 10 requests/hour
•	AI Processing: 20 requests/hour
•	Standard APIs: 100 requests/minute
•	Admin APIs: 200 requests/minute
Rate Limit Headers:
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1696089600
________________________________________
14. Webhooks (Future)
Webhook events for real-time notifications:
•	project.created
•	project.published
•	unit.import.completed
•	lead.created
•	lead.status_changed
________________________________________
Document Revision History
•	v2.0 (Sep 2025): Complete rewrite for unified architecture
o	Unified project creation endpoint
o	Dynamic unit import with version control
o	Consistent data models across all endpoints
o	Comprehensive error handling
•	v1.0 (Jan 2025): Initial API specification
________________________________________
End of Document

