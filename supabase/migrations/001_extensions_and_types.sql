-- migrations/001_extensions_and_types.sql

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User roles within organizations
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'agent', 'staff');

-- Organization types
CREATE TYPE organization_type AS ENUM ('developer', 'agent');

-- Organization status
CREATE TYPE organization_status AS ENUM ('pending', 'active', 'suspended', 'inactive');

-- Employee status
CREATE TYPE employee_status AS ENUM ('active', 'inactive', 'suspended');

-- Project status
CREATE TYPE project_status AS ENUM ('draft', 'published', 'archived');

-- CRITICAL: Creation method for unified project schema
CREATE TYPE creation_method AS ENUM ('manual', 'ai_assisted', 'hybrid', 'admin');

-- Unit status
CREATE TYPE unit_status AS ENUM ('available', 'held', 'sold', 'reserved');

-- Unit import type
CREATE TYPE import_type AS ENUM ('excel', 'pdf', 'csv', 'manual', 'api');

-- Lead status
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'negotiation', 'won', 'lost');

-- Promotion status
CREATE TYPE promotion_status AS ENUM ('draft', 'active', 'paused', 'completed', 'cancelled');

-- File purpose
CREATE TYPE file_purpose AS ENUM ('brochure', 'floor_plan', 'unit_data', 'image', 'document', 'logo');
