# SkyeScraper v2 - Real Estate Platform

A comprehensive real estate platform built with React, TypeScript, and Supabase, featuring unified architecture for project management, lead tracking, and agent workflows.

## 🏗️ Architecture Overview

SkyeScraper follows a **unified architecture** principle:
- Single database tables for each entity type (no separate manual/AI tables)
- Role-based access control with clear permissions
- JSONB fields for flexible, dynamic data structures
- Consistent API patterns across all modules

## 🎯 Key Features

### 🔐 Authentication & Organizations
- **Multi-organization support** with role-based access
- **Secure authentication** with Supabase Auth
- **Organization registration** for developers and agents
- **Employee management** with granular permissions

### 🏢 Project Management (Unified)
- **Manual Project Creation** - Complete form-based project setup
- **AI-Assisted Creation** - Upload brochures for automatic data extraction
- **Admin Project Creation** - Create projects on behalf of developers
- **Project Details** - Comprehensive project information and management
- **File Management** - Upload brochures, floor plans, and documents

### 🏠 Dynamic Units Module
- **Excel/PDF Import** - Import unit data from various file formats
- **Dynamic Schema** - Handle custom fields via JSONB storage
- **Version Control** - Track import history and changes
- **Smart Detection** - Automatic header and data end detection
- **Export Functionality** - CSV export with custom columns

### 🎯 Leads & Agent Workflows
- **Lead Capture** - Create leads for published projects
- **Lead Management** - Track lead pipeline and status
- **Agent Project Browsing** - View published projects from all developers
- **Lead Analytics** - Track conversion rates and performance

### 👑 Admin Dashboard
- **System Overview** - Comprehensive analytics and metrics
- **Organization Management** - Manage all developer and agent organizations
- **Project Oversight** - View and manage all projects across the system
- **Lead Monitoring** - Monitor leads from all agents
- **System Analytics** - Performance metrics and reporting

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** with custom design system
- **React Router DOM** for client-side routing
- **Lucide React** for icons

### Backend
- **Supabase** (PostgreSQL) for database and authentication
- **Row Level Security (RLS)** for data protection
- **SQL Migrations** for version-controlled schema changes
- **Supabase Storage** for file management

### Development Tools
- **TypeScript** with strict type checking
- **ESLint** and **Prettier** for code quality
- **PostCSS** with Autoprefixer
- **Git** for version control

## 📁 Project Structure

```
skyescraper/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Design system components
│   │   ├── auth/           # Authentication components
│   │   ├── projects/       # Project-related components
│   │   ├── units/          # Unit management components
│   │   ├── leads/          # Lead management components
│   │   └── files/          # File management components
│   ├── pages/              # Page components
│   │   ├── Admin*.tsx      # Admin dashboard pages
│   │   ├── Agent*.tsx      # Agent-specific pages
│   │   └── *.tsx           # General pages
│   ├── services/           # API service layers
│   ├── types/              # TypeScript type definitions
│   ├── contexts/           # React contexts
│   └── lib/                # Utility libraries
├── supabase/
│   └── migrations/         # Database migration files
├── docs/                   # Documentation and guides
└── public/                 # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/narendraadki-creator/SkyeScraper-v3.git
   cd SkyeScraper-v3
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   Update `.env` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**
   Run the migrations in order in your Supabase SQL editor:
   ```bash
   # Run migrations 001 through 030 in sequence
   supabase/migrations/001_extensions_and_types.sql
   supabase/migrations/002_organizations_employees.sql
   # ... continue through 030
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🎭 User Roles & Permissions

### 🔧 System Admin
- Manage all organizations and users
- Create/edit/delete any project
- View all leads and analytics
- System-wide oversight and control

### 🏗️ Developer (Currently using 'admin' role)
- Manage own organization and projects
- Create projects (manual/AI-assisted)
- Manage units and project files
- View leads for own projects

### 🏢 Agent
- Browse published projects from all developers
- Create and manage leads
- Export project/unit data
- No project creation/editing permissions

## 📊 Database Schema

### Core Tables
- **organizations** - Developer and agent companies
- **employees** - Users within organizations with roles
- **projects** - Unified project storage (manual/AI/admin)
- **units** - Dynamic unit data with JSONB custom fields
- **leads** - Lead capture and management
- **project_files** - File attachments and documents

### Key Features
- **Unified Schema** - Single tables, no duplication
- **JSONB Fields** - Flexible data structures
- **Row Level Security** - Organization-based data isolation
- **Audit Trails** - Created/updated timestamps and user tracking

## 🔄 Current Status

### ✅ Completed Modules
- [x] Authentication & Organizations
- [x] Project Management (Manual/AI/Admin)
- [x] Units Module with Dynamic Schema
- [x] Leads & Agent Workflows
- [x] Admin Dashboard & Oversight
- [x] File Management System

### 🚧 Planned Improvements
- [ ] Three-role system (admin/developer/agent)
- [ ] Enhanced analytics and reporting
- [ ] Mobile responsiveness improvements
- [ ] Advanced search and filtering
- [ ] Notification system

## 📚 Documentation

Comprehensive documentation is available in the `/docs` folder:

- **[Three-Role System Analysis](docs/THREE_ROLE_SYSTEM_ANALYSIS_AND_PLAN.md)** - Planned role system improvements
- **[Admin Dashboard Guide](docs/ADMIN_DASHBOARD_TEST_GUIDE.md)** - Admin functionality testing
- **[Create Admin User Guide](docs/CREATE_ADMIN_USER_GUIDE.md)** - Setting up admin users
- **[API Specification](docs/Unified%20API%20Specification%20v2.0.md)** - Complete API documentation
- **[Database Architecture](docs/Unified%20Database%20Architecture%20v2.0.md)** - Database design and schema
- **[User Requirements](docs/User%20Requirements%20Document%20(URD)%20v2.0.md)** - Functional requirements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions:
- Check the documentation in `/docs`
- Review test guides for troubleshooting
- Create an issue in the GitHub repository

---

**SkyeScraper v2** - Built with ❤️ for the real estate industry
