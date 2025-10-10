SkyeScraper - Unified API Specification v2.1
Document Information
•	Version: 2.1
•	Date: January 2025
•	Project: SkyeScraper Real Estate Platform
•	Base URL: https://api.skyescraper.com/v1
•	Purpose: Comprehensive API for unified architecture with mobile-first design
________________________________________
Table of Contents
1.	Overview
2.	Authentication & Authorization
3.	Mobile-First Architecture
4.	Organizations API
5.	Employees API
6.	Projects API (Unified)
7.	Units API (Dynamic)
8.	Leads API
9.	Promotions API
10.	Admin API
11.	File Processing API
12.	Mobile Navigation API
13.	Data Models
14.	Error Codes
________________________________________
1. Overview
1.1 API Philosophy
This API follows a unified architecture principle with mobile-first design:
•	Single endpoint per resource type (no separate manual/AI endpoints)
•	creation_method parameter distinguishes data origin
•	JSONB fields support flexible data structures
•	Consistent response formats across all endpoints
•	Mobile-optimized navigation and role-based access control
•	Three-role system: Agent, Developer, Admin with isolated interfaces

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
    "timestamp": "2025-01-30T10:30:00Z",
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
    "timestamp": "2025-01-30T10:30:00Z",
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
2. Authentication & Authorization
2.1 Three-Role System
The system implements a three-role architecture:
•	Agent: Access to published projects, lead management, mobile interface
•	Developer: Access to own projects, unit management, project creation
•	Admin: System-wide access, analytics, organization management

2.2 Role-Based Access Control
Each API endpoint enforces role-based permissions:
•	Agents: Can view published projects, create/manage leads
•	Developers: Can manage own projects, units, and employees
•	Admins: Full system access with analytics and oversight

2.3 Organization Registration
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

2.4 Employee Login
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
      "role_new": "developer", // New three-role system
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
________________________________________
3. Mobile-First Architecture
3.1 Mobile Navigation Structure
The system implements role-based mobile navigation:

3.1.1 Agent Mobile Interface
Base Path: /mobile/agent/*
Navigation Structure:
•	Home: /mobile/agent (Agent Landing with developer listings)
•	Leads: /mobile/agent/leads (Lead management)
•	Promotions: /mobile/agent/promotion (Promotional content)
•	Settings: /mobile/agent/settings (Account settings)
•	Project Details: /mobile/agent/project/:projectId
•	Create Lead: /mobile/agent/leads/create/:projectId
•	Developer Details: /mobile/agent/developer/:developerId

3.1.2 Developer Mobile Interface
Base Path: /mobile/developer/*
Navigation Structure:
•	Home: /mobile/developer (Developer dashboard)
•	Project Details: /mobile/developer/project/:projectId
•	Project Edit: /mobile/developer/project/:id/edit
•	Units Management: /mobile/developer/project/:projectId/units

3.1.3 Admin Mobile Interface
Base Path: /mobile/admin/*
Navigation Structure:
•	Home: /mobile/admin (Admin dashboard)
•	Users: /mobile/admin/users (User management)
•	Projects: /mobile/admin/projects (Project oversight)
•	Settings: /mobile/admin/settings (System settings)

3.2 Mobile Navigation API
GET /mobile/navigation/{role}
Get navigation structure for user's role.
Response (200 OK):
{
  "success": true,
  "data": {
    "role": "agent",
    "navigation": {
      "bottom_tabs": [
        {
          "id": "home",
          "label": "Home",
          "path": "/mobile/agent",
          "icon": "home",
          "active": true
        },
        {
          "id": "leads",
          "label": "Leads",
          "path": "/mobile/agent/leads",
          "icon": "users",
          "active": false
        },
        {
          "id": "promotions",
          "label": "Promotions",
          "path": "/mobile/agent/promotion",
          "icon": "star",
          "active": false
        },
        {
          "id": "settings",
          "label": "Settings",
          "path": "/mobile/agent/settings",
          "icon": "settings",
          "active": false
        }
      ],
      "settings_sections": [
        {
          "title": "Account",
          "items": [
            {
              "id": "profile",
              "title": "Profile",
              "subtitle": "Manage your personal information",
              "path": "/mobile/profile",
              "icon": "user"
            },
            {
              "id": "security",
              "title": "Security",
              "subtitle": "Password and security settings",
              "path": "/mobile/security",
              "icon": "shield"
            }
          ]
        },
        {
          "title": "Preferences",
          "items": [
            {
              "id": "notifications",
              "title": "Notifications",
              "subtitle": "Manage notification preferences",
              "path": "/mobile/notifications",
              "icon": "bell"
            },
            {
              "id": "language",
              "title": "Language & Region",
              "subtitle": "Set your language and region",
              "path": "/mobile/language",
              "icon": "globe"
            }
          ]
        }
      ]
    }
  }
}
________________________________________
4. Organizations API
4.1 Get Organization Profile
GET /organizations/me
Get current user's organization details with mobile-optimized response.
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
    "mobile_settings": {
      "default_view": "grid",
      "notifications_enabled": true,
      "theme": "light"
    },
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-30T10:30:00Z"
  }
}

4.2 Update Organization Profile
PUT /organizations/me
Update organization details including mobile preferences.
Request Body:
{
  "name": "ABC Developers Ltd",
  "contact_phone": "+1234567891",
  "address": "456 New Business St, City",
  "description": "Premier real estate development company",
  "mobile_settings": {
    "default_view": "list",
    "notifications_enabled": false
  }
}
________________________________________
5. Employees API
5.1 List Employees
GET /organizations/me/employees
List all employees in the organization with mobile-optimized data.
Query Parameters:
•	role (optional): Filter by role (admin, manager, agent)
•	status (optional): Filter by status (active, inactive)
•	search (optional): Search by name or email
•	mobile (optional): Include mobile-specific data

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
      "role_new": "developer",
      "status": "active",
      "department": "Management",
      "mobile_profile": {
        "profile_image": "https://storage.skyescraper.com/profiles/emp_xyz789.jpg",
        "last_active": "2025-01-30T09:15:00Z",
        "mobile_app_version": "2.1.0"
      },
      "created_at": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": { /* pagination info */ }
}

5.2 Create Employee
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
  },
  "mobile_access": {
    "enabled": true,
    "default_role": "agent"
  }
}
________________________________________
6. Projects API (Unified)
6.1 Create Project (Unified Endpoint)
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
  },
  "mobile_optimized": true
}

6.2 List Projects (Role-Based)
GET /projects
List projects with role-based filtering and mobile optimization.
Query Parameters:
•	status (optional): draft, published, archived
•	type (optional): Filter by project type
•	location (optional): Filter by location
•	organization_id (optional, admin only): Filter by developer
•	search (optional): Search by name or location
•	mobile (optional): Include mobile-specific data
•	page, limit: Pagination

Role-Based Filtering:
•	Agents: Only published projects from all developers
•	Developers: Only own organization's projects
•	Admins: All projects

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
      "mobile_data": {
        "card_layout": "2x2",
        "quick_actions": ["view_details", "create_lead"],
        "availability_badge": "available"
      },
      "created_at": "2025-01-30T10:30:00Z",
      "updated_at": "2025-01-30T10:30:00Z"
    }
  ],
  "pagination": { /* pagination info */ }
}

6.3 Get Project Details (Mobile-Optimized)
GET /projects/{project_id}
Get complete project details including mobile-specific data.
Query Parameters:
•	mobile (optional): Include mobile-optimized response
•	agent_view (optional): Agent-specific data (for agent role)

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
    "mobile_navigation": {
      "tabs": ["overview", "floor_plans", "brochures", "availability", "payment_plans"],
      "quick_actions": [
        {
          "id": "create_lead",
          "label": "Create Lead",
          "path": "/mobile/agent/leads/create/proj_123abc",
          "icon": "plus"
        },
        {
          "id": "view_units",
          "label": "View Units",
          "path": "/mobile/agent/project/proj_123abc/units",
          "icon": "building"
        }
      ]
    },
    "created_by": {
      "id": "emp_xyz789",
      "name": "John Doe"
    },
    "created_at": "2025-01-30T10:30:00Z",
    "updated_at": "2025-01-30T10:30:00Z"
  }
}
________________________________________
7. Units API (Dynamic)
7.1 Import Units (Multi-Format)
POST /projects/{project_id}/units/import
Import units from Excel, PDF, or manual entry. Supports version control.
Request Body (Multipart Form Data):
file: [Excel/PDF file]
import_strategy: "replace_all" | "merge_updates" | "append_only"
auto_map_columns: true | false
mobile_optimized: true | false

Response (202 Accepted):
{
  "success": true,
  "data": {
    "import_id": "import_xyz789",
    "status": "processing",
    "project_id": "proj_123abc",
    "file_name": "units_data.xlsx",
    "processing_url": "/projects/proj_123abc/units/import/import_xyz789",
    "mobile_notification": {
      "enabled": true,
      "message": "Unit import processing started"
    }
  }
}

7.2 List Units (Mobile-Optimized)
GET /projects/{project_id}/units
List units with dynamic columns and mobile optimization.
Query Parameters:
•	status: available, held, sold, reserved
•	unit_type: Filter by type
•	floor_min, floor_max: Floor range
•	price_min, price_max: Price range
•	mobile (optional): Mobile-optimized response
•	layout (optional): grid | list (for mobile display)
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
        "mobile_display": {
          "card_layout": "compact",
          "quick_actions": ["hold", "create_lead"],
          "status_badge": "available"
        },
        "import_version": "import_xyz789",
        "created_at": "2025-01-30T10:32:15Z",
        "updated_at": "2025-01-30T10:32:15Z"
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
    "mobile_layout": {
      "preferred_view": "grid",
      "cards_per_row": 2,
      "compact_mode": true
    },
    "import_info": {
      "version_number": 2,
      "imported_at": "2025-01-30T10:32:15Z",
      "imported_by": "John Doe"
    }
  },
  "pagination": { /* pagination info */ }
}
________________________________________
8. Leads API
8.1 Create Lead (Mobile-Optimized)
POST /leads
Capture a new lead (agents only) with mobile-specific data.
Request Body:
{
  "project_id": "proj_123abc",
  "unit_id": "unit_abc123",
  "first_name": "Ahmed",
  "last_name": "Ali",
  "email": "ahmed@example.com",
  "phone": "+971501234567",
  "source": "Website Inquiry",
  "budget_min": 800000,
  "budget_max": 1200000,
  "preferred_unit_types": ["1BHK", "2BHK"],
  "preferred_location": "Business Bay",
  "requirements": "Near metro station",
  "notes": "Interested in Business Bay view units",
  "assigned_to": "emp_xyz789",
  "next_followup": "2025-02-01T10:00:00Z",
  "mobile_metadata": {
    "created_via": "mobile_app",
    "device_info": "iOS 17.2",
    "location": "Dubai, UAE"
  }
}

Response (201 Created):
{
  "success": true,
  "data": {
    "id": "lead_abc123",
    "organization_id": "org_agent456",
    "project_id": "proj_123abc",
    "unit_id": "unit_abc123",
    "first_name": "Ahmed",
    "last_name": "Ali",
    "email": "ahmed@example.com",
    "phone": "+971501234567",
    "status": "new",
    "stage": "inquiry",
    "source": "Website Inquiry",
    "budget_min": 800000,
    "budget_max": 1200000,
    "preferred_unit_types": ["1BHK", "2BHK"],
    "preferred_location": "Business Bay",
    "requirements": "Near metro station",
    "notes": "Interested in Business Bay view units",
    "assigned_to": {
      "id": "emp_xyz789",
      "name": "Jane Smith"
    },
    "project": {
      "id": "proj_123abc",
      "name": "Skyline Towers",
      "location": "Downtown Dubai"
    },
    "unit": {
      "id": "unit_abc123",
      "unit_number": "A-101",
      "unit_type": "1BHK"
    },
    "mobile_metadata": {
      "created_via": "mobile_app",
      "device_info": "iOS 17.2",
      "location": "Dubai, UAE"
    },
    "created_at": "2025-01-30T11:00:00Z"
  }
}

8.2 List Leads (Mobile-Optimized)
GET /leads
List leads with filtering and mobile optimization.
Query Parameters:
•	status: new, contacted, qualified, negotiation, won, lost
•	stage: inquiry, site_visit, proposal, negotiation, closed
•	project_id: Filter by project
•	assigned_to: Filter by agent
•	date_from, date_to: Date range
•	mobile (optional): Mobile-optimized response
•	layout (optional): grid | list

Response (200 OK):
{
  "success": true,
  "data": {
    "leads": [
      {
        "id": "lead_abc123",
        "first_name": "Ahmed",
        "last_name": "Ali",
        "email": "ahmed@example.com",
        "phone": "+971501234567",
        "status": "new",
        "stage": "inquiry",
        "source": "Website Inquiry",
        "budget_min": 800000,
        "budget_max": 1200000,
        "project": {
          "id": "proj_123abc",
          "name": "Skyline Towers",
          "location": "Downtown Dubai"
        },
        "unit": {
          "id": "unit_abc123",
          "unit_number": "A-101",
          "unit_type": "1BHK"
        },
        "assigned_to": {
          "id": "emp_xyz789",
          "name": "Jane Smith"
        },
        "mobile_display": {
          "card_layout": "compact",
          "status_badge": "new",
          "priority": "high",
          "quick_actions": ["call", "email", "edit"]
        },
        "created_at": "2025-01-30T11:00:00Z"
      }
    ],
    "mobile_layout": {
      "preferred_view": "grid",
      "cards_per_row": 2,
      "show_filters": true
    },
    "stats": {
      "total": 45,
      "new": 12,
      "contacted": 15,
      "qualified": 10,
      "this_month": 8
    }
  },
  "pagination": { /* pagination info */ }
}

8.3 Update Lead (Mobile-Optimized)
PUT /leads/{lead_id}
Update lead status and details with mobile tracking.
Request Body:
{
  "status": "qualified",
  "stage": "site_visit",
  "notes": "Scheduled site visit for Feb 5th",
  "next_followup": "2025-02-05T10:00:00Z",
  "mobile_metadata": {
    "updated_via": "mobile_app",
    "last_activity": "status_change"
  }
}
________________________________________
9. Promotions API
9.1 Create Promotion (Mobile-Optimized)
POST /promotions
Create a promotional campaign (developers only) with mobile targeting.
Request Body:
{
  "project_id": "proj_123abc",
  "title": "Early Bird Discount",
  "description": "Special discount for first 50 buyers",
  "promotion_type": "discount",
  "discount_percentage": 15,
  "start_date": "2025-02-01",
  "end_date": "2025-12-31",
  "terms_conditions": "Terms and conditions apply",
  "target_audience": ["all_agents"],
  "mobile_optimized": true,
  "mobile_notifications": {
    "enabled": true,
    "push_notification": true,
    "in_app_notification": true
  }
}

9.2 List Promotions (Mobile-Optimized)
GET /promotions
List active promotions with mobile optimization.
Query Parameters:
•	project_id: Filter by project
•	status: active, expired, upcoming
•	organization_id: Filter by developer (admin only)
•	mobile (optional): Mobile-optimized response

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": "promo_abc123",
      "project_id": "proj_123abc",
      "title": "Early Bird Discount",
      "description": "Special discount for first 50 buyers",
      "promotion_type": "discount",
      "discount_percentage": 15,
      "start_date": "2025-02-01",
      "end_date": "2025-12-31",
      "status": "active",
      "project": {
        "id": "proj_123abc",
        "name": "Skyline Towers",
        "location": "Downtown Dubai"
      },
      "mobile_display": {
        "card_layout": "featured",
        "badge": "Limited Time",
        "cta_button": "View Details"
      },
      "created_at": "2025-01-30T10:00:00Z"
    }
  ]
}
________________________________________
10. Admin API
10.1 List All Organizations (Mobile-Optimized)
GET /admin/organizations
Super admin: View all organizations with mobile analytics.
Query Parameters:
•	type: developer, agent
•	status: pending, active, suspended
•	search: Search by name or email
•	mobile (optional): Include mobile usage analytics

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": "org_abc123",
      "name": "ABC Developers",
      "type": "developer",
      "status": "active",
      "contact_email": "contact@abcdev.com",
      "employee_count": 15,
      "project_count": 8,
      "mobile_analytics": {
        "active_mobile_users": 12,
        "mobile_app_version": "2.1.0",
        "last_mobile_activity": "2025-01-30T09:15:00Z",
        "mobile_feature_usage": {
          "lead_creation": 45,
          "project_viewing": 120,
          "unit_management": 23
        }
      },
      "created_at": "2025-01-15T10:30:00Z"
    }
  ]
}

10.2 Get System Analytics (Mobile-Enhanced)
GET /admin/analytics
System-wide metrics and statistics including mobile usage.
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
      "conversion_rate": 29.2,
      "mobile_created": 8500,
      "mobile_conversion_rate": 31.5
    },
    "mobile_analytics": {
      "total_mobile_users": 2500,
      "active_mobile_users": 1800,
      "mobile_app_downloads": 3200,
      "mobile_feature_usage": {
        "lead_creation": 4500,
        "project_viewing": 12000,
        "unit_management": 2300,
        "promotion_viewing": 890
      },
      "mobile_performance": {
        "avg_session_duration": "12m 30s",
        "bounce_rate": 15.2,
        "feature_adoption_rate": 78.5
      }
    }
  }
}
________________________________________
11. File Processing API
11.1 Upload File (Mobile-Optimized)
POST /files/upload
Upload files for processing or storage with mobile optimization.
Request Body (Multipart Form Data):
file: [File to upload]
purpose: "brochure" | "floor_plan" | "unit_data" | "image" | "document"
project_id: "proj_123abc" (optional)
mobile_optimized: true | false
compress_for_mobile: true | false

Response (201 Created):
{
  "success": true,
  "data": {
    "file_id": "file_abc123",
    "file_name": "brochure.pdf",
    "file_type": "application/pdf",
    "file_size": 2456789,
    "mobile_optimized_size": 1234567,
    "purpose": "brochure",
    "url": "https://storage.skyescraper.com/files/...",
    "mobile_url": "https://storage.skyescraper.com/files/mobile/...",
    "uploaded_at": "2025-01-30T11:00:00Z"
  }
}

11.2 Process Brochure (AI) - Mobile-Enhanced
POST /files/{file_id}/process/brochure
Trigger AI processing for brochure extraction with mobile optimization.
Request Body:
{
  "mobile_optimized": true,
  "extract_mobile_data": true,
  "generate_mobile_preview": true
}

Response (202 Accepted):
{
  "success": true,
  "data": {
    "processing_id": "proc_xyz789",
    "status": "processing",
    "estimated_time": 30,
    "mobile_processing": {
      "enabled": true,
      "mobile_preview_ready": false,
      "mobile_data_extraction": true
    },
    "status_url": "/files/file_abc123/process/proc_xyz789"
  }
}
________________________________________
12. Mobile Navigation API
12.1 Get Mobile Navigation Structure
GET /mobile/navigation
Get complete mobile navigation structure for user's role.
Response (200 OK):
{
  "success": true,
  "data": {
    "user_role": "agent",
    "navigation": {
      "bottom_tabs": [
        {
          "id": "home",
          "label": "Home",
          "path": "/mobile/agent",
          "icon": "home",
          "active": true,
          "badge": null
        },
        {
          "id": "leads",
          "label": "Leads",
          "path": "/mobile/agent/leads",
          "icon": "users",
          "active": false,
          "badge": "12"
        },
        {
          "id": "promotions",
          "label": "Promotions",
          "path": "/mobile/agent/promotion",
          "icon": "star",
          "active": false,
          "badge": "3"
        },
        {
          "id": "settings",
          "label": "Settings",
          "path": "/mobile/agent/settings",
          "icon": "settings",
          "active": false,
          "badge": null
        }
      ],
      "quick_actions": [
        {
          "id": "create_lead",
          "label": "Create Lead",
          "icon": "plus",
          "path": "/mobile/agent/leads/create",
          "permissions": ["lead_creation"]
        },
        {
          "id": "scan_qr",
          "label": "Scan QR",
          "icon": "qr-code",
          "path": "/mobile/agent/scan",
          "permissions": ["qr_scanning"]
        }
      ],
      "settings_sections": [
        {
          "title": "Account",
          "items": [
            {
              "id": "profile",
              "title": "Profile",
              "subtitle": "Manage your personal information",
              "path": "/mobile/profile",
              "icon": "user"
            },
            {
              "id": "email_settings",
              "title": "Email Settings",
              "subtitle": "Update email preferences",
              "path": "/mobile/profile",
              "icon": "mail"
            },
            {
              "id": "security",
              "title": "Security",
              "subtitle": "Password and security settings",
              "path": "/mobile/security",
              "icon": "shield"
            }
          ]
        },
        {
          "title": "Preferences",
          "items": [
            {
              "id": "notifications",
              "title": "Notifications",
              "subtitle": "Manage notification preferences",
              "path": "/mobile/notifications",
              "icon": "bell"
            },
            {
              "id": "language",
              "title": "Language & Region",
              "subtitle": "Set your language and region",
              "path": "/mobile/language",
              "icon": "globe"
            }
          ]
        },
        {
          "title": "Support",
          "items": [
            {
              "id": "help_support",
              "title": "Help & Support",
              "subtitle": "Get help and contact support",
              "path": "/mobile/support",
              "icon": "help-circle",
              "action": "modal"
            }
          ]
        }
      ]
    }
  }
}

12.2 Update Mobile Navigation Preferences
PUT /mobile/navigation/preferences
Update user's mobile navigation preferences.
Request Body:
{
  "bottom_tabs_order": ["home", "leads", "promotions", "settings"],
  "quick_actions": ["create_lead", "scan_qr"],
  "settings_layout": "grouped",
  "theme": "light",
  "compact_mode": false
}
________________________________________
13. Data Models
13.1 Project Model (Mobile-Enhanced)
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
  
  // Mobile-specific data
  mobile_optimized?: boolean;
  mobile_navigation?: {
    tabs: string[];
    quick_actions: QuickAction[];
  };
  mobile_display?: {
    card_layout: 'grid' | 'list';
    cards_per_row?: number;
    compact_mode?: boolean;
  };
  
  // Metadata
  is_featured: boolean;
  views_count: number;
  leads_count: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

13.2 Lead Model (Mobile-Enhanced)
interface Lead {
  id: string;
  organization_id: string;
  project_id: string;
  unit_id?: string;
  
  // Contact information
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  
  // Lead details
  status: 'new' | 'contacted' | 'qualified' | 'negotiation' | 'won' | 'lost';
  stage: 'inquiry' | 'site_visit' | 'proposal' | 'negotiation' | 'closed';
  source: string;
  
  // Requirements
  budget_min?: number;
  budget_max?: number;
  preferred_unit_types?: string[];
  preferred_location?: string;
  requirements?: string;
  notes?: string;
  
  // Assignment and follow-up
  assigned_to?: string;
  next_followup?: string;
  
  // Mobile metadata
  mobile_metadata?: {
    created_via: 'mobile_app' | 'web_app' | 'api';
    device_info?: string;
    location?: string;
    updated_via?: string;
    last_activity?: string;
  };
  
  mobile_display?: {
    card_layout: 'grid' | 'list';
    status_badge: string;
    priority: 'low' | 'medium' | 'high';
    quick_actions: string[];
  };
  
  // Relations
  project?: Project;
  unit?: Unit;
  assigned_employee?: Employee;
  
  created_at: string;
  updated_at: string;
}

13.3 Mobile Navigation Model
interface MobileNavigation {
  user_role: 'agent' | 'developer' | 'admin';
  navigation: {
    bottom_tabs: BottomTab[];
    quick_actions: QuickAction[];
    settings_sections: SettingsSection[];
  };
  preferences: {
    bottom_tabs_order: string[];
    quick_actions: string[];
    settings_layout: 'grouped' | 'flat';
    theme: 'light' | 'dark';
    compact_mode: boolean;
  };
}

interface BottomTab {
  id: string;
  label: string;
  path: string;
  icon: string;
  active: boolean;
  badge?: string | null;
}

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  path?: string;
  action?: string;
  permissions: string[];
}

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

interface SettingsItem {
  id: string;
  title: string;
  subtitle: string;
  path?: string;
  icon: string;
  action?: string;
}
________________________________________
14. Error Codes
14.1 Authentication Errors (4xx)
•	AUTH_001: Invalid credentials
•	AUTH_002: Token expired
•	AUTH_003: Insufficient permissions
•	AUTH_004: Organization not active
•	AUTH_005: Role not authorized for mobile access

14.2 Validation Errors (4xx)
•	VAL_001: Required field missing
•	VAL_002: Invalid format
•	VAL_003: Duplicate entry
•	VAL_004: Foreign key violation
•	VAL_005: Mobile-specific validation failed

14.3 Business Logic Errors (4xx)
•	BIZ_001: Project not found
•	BIZ_002: Unit not available
•	BIZ_003: Invalid status transition
•	BIZ_004: Insufficient units for operation
•	BIZ_005: Mobile feature not available for role

14.4 Processing Errors (5xx)
•	PROC_001: AI processing failed
•	PROC_002: File parsing error
•	PROC_003: Import validation failed
•	PROC_004: Database transaction failed
•	PROC_005: Mobile optimization failed

14.5 Mobile-Specific Errors (4xx)
•	MOBILE_001: Mobile app version not supported
•	MOBILE_002: Mobile feature disabled for organization
•	MOBILE_003: Mobile navigation permission denied
•	MOBILE_004: Mobile file upload size exceeded
________________________________________
15. Rate Limiting
•	Authentication: 5 requests/minute
•	File Upload: 10 requests/hour
•	AI Processing: 20 requests/hour
•	Standard APIs: 100 requests/minute
•	Admin APIs: 200 requests/minute
•	Mobile APIs: 150 requests/minute (higher limit for mobile usage)

Rate Limit Headers:
X-RateLimit-Limit: 150
X-RateLimit-Remaining: 145
X-RateLimit-Reset: 1738252800
X-RateLimit-Mobile: true
________________________________________
16. Webhooks (Future)
Webhook events for real-time notifications:
•	project.created
•	project.published
•	unit.import.completed
•	lead.created
•	lead.status_changed
•	mobile.navigation.updated
•	mobile.user.activity
________________________________________
17. Mobile-Specific Features
17.1 Offline Support
•	Lead data caching for offline viewing
•	Project details synchronization
•	Offline lead creation with sync on connection

17.2 Push Notifications
•	New lead assignments
•	Project updates
•	Promotional campaigns
•	System announcements

17.3 Mobile Analytics
•	User engagement tracking
•	Feature usage analytics
•	Performance monitoring
•	Error tracking and reporting

17.4 Mobile Security
•	Biometric authentication support
•	Device registration and management
•	Secure data transmission
•	Session management
________________________________________
Document Revision History
•	v2.1 (Jan 2025): Mobile-first architecture implementation
  o	Added mobile navigation API
  o	Enhanced role-based access control
  o	Mobile-optimized data models
  o	Mobile-specific endpoints and features
  o	Three-role system documentation
•	v2.0 (Sep 2025): Complete rewrite for unified architecture
  o	Unified project creation endpoint
  o	Dynamic unit import with version control
  o	Consistent data models across all endpoints
  o	Comprehensive error handling
•	v1.0 (Jan 2025): Initial API specification
________________________________________
End of Document
