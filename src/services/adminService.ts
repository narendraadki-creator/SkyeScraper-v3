import { supabase } from '../lib/supabase';
import type { UserRole } from '../contexts/AuthContext';
import type {
  SystemAnalytics,
  AdminOrganization,
  AdminProject,
  AdminLead,
  AdminFilters,
  AdminProjectFilters,
  AdminLeadFilters,
  CreateProjectOnBehalfData,
  AdminDashboardStats
} from '../types/admin';

// Helper function to get user role with three-role system
const getUserRole = (employee: { role: string }): UserRole => {
  // Use the role from the database
  const role = employee.role;
  
  // Validate and return typed role
  if (role === 'admin' || role === 'developer' || role === 'agent') {
    return role as UserRole;
  }
  
  // Legacy role mapping for backward compatibility
  if (role === 'manager' || role === 'staff') {
    return 'developer'; // Legacy roles become developers
  }
  
  console.warn('Unknown role:', role, 'defaulting to developer');
  return 'developer'; // Safe fallback
};

class AdminService {
  // System Analytics
  async getSystemAnalytics(): Promise<SystemAnalytics> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check if user is admin (NEW THREE-ROLE SYSTEM)
    const { data: employee } = await supabase
      .from('employees')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    const userRole = getUserRole(employee);
    if (userRole !== 'admin') {
      throw new Error('Access denied: System admin role required');
    }

    // Get organization stats
    const { data: orgStats } = await supabase
      .from('organizations')
      .select('type, status');

    const organizations = {
      total: orgStats?.length || 0,
      developers: orgStats?.filter(org => org.type === 'developer').length || 0,
      agents: orgStats?.filter(org => org.type === 'agent').length || 0,
      active: orgStats?.filter(org => org.status === 'active').length || 0,
      pending: orgStats?.filter(org => org.status === 'pending').length || 0,
      suspended: orgStats?.filter(org => org.status === 'suspended').length || 0,
    };

    // Get project stats
    const { data: projectStats } = await supabase
      .from('projects')
      .select('status, creation_method');

    const projects = {
      total: projectStats?.length || 0,
      published: projectStats?.filter(p => p.status === 'published').length || 0,
      draft: projectStats?.filter(p => p.status === 'draft').length || 0,
      by_creation_method: {
        manual: projectStats?.filter(p => p.creation_method === 'manual').length || 0,
        ai_assisted: projectStats?.filter(p => p.creation_method === 'ai_assisted').length || 0,
        admin: projectStats?.filter(p => p.creation_method === 'admin').length || 0,
      },
    };

    // Get unit stats
    const { data: unitStats } = await supabase
      .from('units')
      .select('status');

    const units = {
      total: unitStats?.length || 0,
      available: unitStats?.filter(u => u.status === 'available').length || 0,
      sold: unitStats?.filter(u => u.status === 'sold').length || 0,
      held: unitStats?.filter(u => u.status === 'held').length || 0,
    };

    // Get lead stats
    const { data: leadStats } = await supabase
      .from('leads')
      .select('status');

    const totalLeads = leadStats?.length || 0;
    const convertedLeads = leadStats?.filter(l => l.status === 'closed_won').length || 0;

    const leads = {
      total: totalLeads,
      converted: convertedLeads,
      conversion_rate: totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0,
      by_status: {
        new: leadStats?.filter(l => l.status === 'new').length || 0,
        contacted: leadStats?.filter(l => l.status === 'contacted').length || 0,
        qualified: leadStats?.filter(l => l.status === 'qualified').length || 0,
        proposal: leadStats?.filter(l => l.status === 'proposal').length || 0,
        negotiation: leadStats?.filter(l => l.status === 'negotiation').length || 0,
        closed_won: leadStats?.filter(l => l.status === 'closed_won').length || 0,
        closed_lost: leadStats?.filter(l => l.status === 'closed_lost').length || 0,
      },
    };

    // Get performance data
    const { data: topAgents } = await supabase
      .from('leads')
      .select(`
        assigned_to,
        status,
        employees!leads_assigned_to_fkey(first_name, last_name)
      `);

    const { data: topProjects } = await supabase
      .from('projects')
      .select('id, name')
      .limit(5);

    const performance = {
      avg_response_time: 2.5, // Mock data - would need actual calculation
      top_performing_agents: topAgents?.slice(0, 5).map(agent => {
        const employee = Array.isArray(agent.employees) ? agent.employees[0] : agent.employees;
        return {
          agent_id: agent.assigned_to,
          agent_name: employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown',
          leads_count: 0, // Would need actual calculation
          conversion_rate: 0, // Would need actual calculation
        };
      }) || [],
      top_projects: topProjects?.map(project => ({
        project_id: project.id,
        project_name: project.name,
        leads_count: 0, // Would need actual calculation
        views_count: 0, // Would need actual calculation
      })) || [],
    };

    return {
      organizations,
      projects,
      units,
      leads,
      performance,
    };
  }

  // Organization Management
  async getAllOrganizations(filters?: AdminFilters): Promise<AdminOrganization[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check if user is admin (NEW THREE-ROLE SYSTEM)
    const { data: employee } = await supabase
      .from('employees')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    const userRole = getUserRole(employee);
    if (userRole !== 'admin') {
      throw new Error('Access denied: System admin role required');
    }

    let query = supabase
      .from('organizations')
      .select(`
        *,
        employees(count),
        projects(count),
        leads(count)
      `);

    if (filters?.organization_type) {
      query = query.eq('type', filters.organization_type);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,contact_email.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(org => ({
      id: org.id,
      name: org.name,
      type: org.type,
      status: org.status,
      contact_email: org.contact_email,
      contact_phone: org.contact_phone,
      address: org.address,
      created_at: org.created_at,
      updated_at: org.updated_at,
      employee_count: org.employees?.[0]?.count || 0,
      project_count: org.projects?.[0]?.count || 0,
      lead_count: org.leads?.[0]?.count || 0,
    })) || [];
  }

  // Project Oversight
  async getAllProjects(filters?: AdminProjectFilters): Promise<AdminProject[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check if user is admin (NEW THREE-ROLE SYSTEM)
    const { data: employee } = await supabase
      .from('employees')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    const userRole = getUserRole(employee);
    if (userRole !== 'admin') {
      throw new Error('Access denied: System admin role required');
    }

    let query = supabase
      .from('projects')
      .select(`
        *,
        organizations!inner(name, type),
        units(count),
        leads(count)
      `);

    if (filters?.organization_type) {
      query = query.eq('organizations.type', filters.organization_type);
    }

    if (filters?.creation_method) {
      query = query.eq('creation_method', filters.creation_method);
    }

    if (filters?.project_status) {
      query = query.eq('status', filters.project_status);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(project => ({
      id: project.id,
      name: project.name,
      organization_id: project.organization_id,
      organization_name: project.organizations?.name || '',
      organization_type: project.organizations?.type || 'developer',
      creation_method: project.creation_method,
      status: project.status,
      location: project.location,
      project_type: project.project_type,
      starting_price: project.starting_price,
      completion_date: project.completion_date,
      created_at: project.created_at,
      updated_at: project.updated_at,
      views_count: project.views_count || 0,
      leads_count: project.leads?.[0]?.count || 0,
      units_count: project.units?.[0]?.count || 0,
    })) || [];
  }

  // Lead Monitoring
  async getAllLeads(filters?: AdminLeadFilters): Promise<AdminLead[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check if user is admin (NEW THREE-ROLE SYSTEM)
    const { data: employee } = await supabase
      .from('employees')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    const userRole = getUserRole(employee);
    if (userRole !== 'admin') {
      throw new Error('Access denied: System admin role required');
    }

    let query = supabase
      .from('leads')
      .select(`
        *,
        projects(name, location),
        assigned_employee:employees!leads_assigned_to_fkey(first_name, last_name)
      `);

    if (filters?.lead_status) {
      query = query.eq('status', filters.lead_status);
    }

    if (filters?.source) {
      query = query.eq('source', filters.source);
    }

    if (filters?.project_id) {
      query = query.eq('project_id', filters.project_id);
    }

    if (filters?.agent_id) {
      query = query.eq('assigned_to', filters.agent_id);
    }

    if (filters?.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(lead => ({
      id: lead.id,
      first_name: lead.first_name,
      last_name: lead.last_name,
      email: lead.email,
      phone: lead.phone,
      project_id: lead.project_id,
      project_name: lead.projects?.name || '',
      organization_id: lead.projects?.organization_id || '',
      organization_name: lead.projects?.organizations?.name || '',
      agent_id: lead.assigned_to,
      agent_name: `${lead.employees?.first_name} ${lead.employees?.last_name}`,
      status: lead.status,
      source: lead.source,
      budget_min: lead.budget_min,
      budget_max: lead.budget_max,
      created_at: lead.created_at,
      updated_at: lead.updated_at,
      last_contact_date: lead.last_contact_date,
    })) || [];
  }

  // Create Project on Behalf
  async createProjectOnBehalf(data: CreateProjectOnBehalfData): Promise<AdminProject> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check if user is admin (NEW THREE-ROLE SYSTEM)
    const { data: employee } = await supabase
      .from('employees')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    const userRole = getUserRole(employee);
    if (userRole !== 'admin') {
      throw new Error('Access denied: System admin role required');
    }

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        ...data,
        created_by: employee.id, // Use employee ID, not user ID
      })
      .select(`
        *,
        organizations!inner(name, type)
      `)
      .single();

    if (error) throw error;

    return {
      id: project.id,
      name: project.name,
      organization_id: project.organization_id,
      organization_name: project.organizations?.name || '',
      organization_type: project.organizations?.type || 'developer',
      creation_method: project.creation_method,
      status: project.status,
      location: project.location,
      project_type: project.project_type,
      starting_price: project.starting_price,
      completion_date: project.completion_date,
      created_at: project.created_at,
      updated_at: project.updated_at,
      views_count: project.views_count || 0,
      leads_count: 0,
      units_count: 0,
    };
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const analytics = await this.getSystemAnalytics();

    return {
      total_organizations: analytics.organizations.total,
      total_projects: analytics.projects.total,
      total_leads: analytics.leads.total,
      total_units: analytics.units.total,
      active_developers: analytics.organizations.developers,
      active_agents: analytics.organizations.agents,
      published_projects: analytics.projects.published,
      converted_leads: analytics.leads.converted,
      system_health: {
        uptime: 99.9, // Mock data
        response_time: 150, // Mock data
        error_rate: 0.1, // Mock data
      },
    };
  }

  // Update Organization Status
  async updateOrganizationStatus(organizationId: string, status: 'active' | 'suspended'): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check if user is admin (NEW THREE-ROLE SYSTEM)
    const { data: employee } = await supabase
      .from('employees')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    const userRole = getUserRole(employee);
    if (userRole !== 'admin') {
      throw new Error('Access denied: System admin role required');
    }

    const { error } = await supabase
      .from('organizations')
      .update({ status })
      .eq('id', organizationId);

    if (error) throw error;
  }

  // Update Organization Details
  async updateOrganization(organizationId: string, updates: {
    name?: string;
    type?: 'developer' | 'agent';
    status?: 'active' | 'pending' | 'suspended';
    contact_email?: string;
    contact_phone?: string;
    address?: string;
  }): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check if user is admin (NEW THREE-ROLE SYSTEM)
    const { data: employee } = await supabase
      .from('employees')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    const userRole = getUserRole(employee);
    if (userRole !== 'admin') {
      throw new Error('Access denied: System admin role required');
    }

    const { error } = await supabase
      .from('organizations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', organizationId);

    if (error) throw error;
  }

  // Helper method to check admin role
  private async checkAdminRole(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: employee } = await supabase
      .from('employees')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    const userRole = getUserRole(employee);
    if (userRole !== 'admin') {
      throw new Error('Access denied: System admin role required');
    }
  }

  // AI Project Creation on Behalf
  async processFileWithAIOnBehalf(file: File, organizationId: string): Promise<any> {
    await this.checkAdminRole();

    // Verify the organization exists and is a developer
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id, type')
      .eq('id', organizationId)
      .eq('type', 'developer')
      .single();

    if (orgError || !organization) {
      throw new Error('Invalid developer organization');
    }

    // Simulate AI processing delay (same as developer version)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate more realistic data based on file name (same logic as developer version)
    const fileName = file.name.toLowerCase();
    const timestamp = new Date().getTime();
    
    // Extract some info from filename if possible
    const isDubai = fileName.includes('dubai') || fileName.includes('uae');
    const isVilla = fileName.includes('villa') || fileName.includes('house');
    const isApartment = fileName.includes('apartment') || fileName.includes('flat');
    const isLuxury = fileName.includes('luxury') || fileName.includes('premium');
    const isBusiness = fileName.includes('business') || fileName.includes('commercial');
    
    // Generate realistic developer names based on filename
    const developerNames = [
      'Emaar Properties', 'Nakheel', 'Damac Properties', 'Sobha Realty', 
      'Aldar Properties', 'MAG Properties', 'Deyaar Development', 'Union Properties',
      'Al Habtoor Group', 'Meraas', 'Dubai Properties', 'Al Futtaim Real Estate'
    ];
    
    // Generate realistic project names based on UAE market (simulating AI extraction from brochure content)
    const projectNames = isDubai ? [
      'Marina Heights', 'Burj Vista Residences', 'Dubai Creek Harbour', 'Emirates Hills Villa',
      'Downtown Central Tower', 'Palm Jumeirah Paradise', 'Business Bay Elite', 'Dubai Hills Gardens',
      'Jumeirah Bay Island', 'Creek Beach Towers', 'DIFC Gateway', 'Al Habtoor City',
      'Dubai Marina Walk', 'Bluewaters Residences', 'City Walk Apartments', 'Dubai Festival City'
    ] : [
      'Corniche Towers', 'Saadiyat Beach Villas', 'Al Reem Island Central', 'Yas Island Marina',
      'Al Maryah Residence', 'Capital Gate Heights', 'Khalifa City Gardens', 'Al Raha Beach',
      'Masdar City Green', 'Shams Abu Dhabi', 'Al Bateen Marina', 'Nation Towers'
    ];
    
    // Add project type suffix for realism
    const typePrefix = isVilla ? 'Villas' : isApartment ? 'Residences' : isBusiness ? 'Business Center' : 'Tower';
    const randomBaseName = projectNames[Math.floor(Math.random() * projectNames.length)];
    const projectName = `${randomBaseName} ${typePrefix}`;
    
    // Fallback to cleaned filename only if needed
    const fallbackName = fileName.replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
    const cleanFallbackName = fallbackName.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    // Generate realistic locations
    const locations = isDubai ? [
      'Downtown Dubai', 'Dubai Marina', 'Jumeirah', 'Business Bay', 
      'Dubai Hills', 'Arabian Ranches', 'Dubai Sports City', 'Dubai Silicon Oasis'
    ] : [
      'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'
    ];
    
    // Generate realistic addresses
    const addresses = isDubai ? [
      'Sheikh Zayed Road, Dubai', 'Dubai Marina Walk, Dubai', 'Jumeirah Beach Road, Dubai',
      'Business Bay, Dubai', 'Dubai Hills Estate, Dubai', 'Arabian Ranches, Dubai'
    ] : [
      'Corniche Road, Abu Dhabi', 'Al Reem Island, Abu Dhabi', 'Saadiyat Island, Abu Dhabi',
      'Al Maryah Island, Abu Dhabi', 'Yas Island, Abu Dhabi'
    ];
    
    // Generate varied amenities based on project type
    const baseAmenities = ['Swimming Pool', 'Gym', 'Parking', 'Security', 'Landscaping'];
    const luxuryAmenities = ['Concierge', 'Spa', 'Rooftop Garden', 'Kids Play Area', 'BBQ Area'];
    const businessAmenities = ['Business Center', 'Meeting Rooms', 'High-Speed Internet', 'Parking'];
    
    const amenities = isLuxury ? [...baseAmenities, ...luxuryAmenities] : 
                     isBusiness ? [...baseAmenities, ...businessAmenities] : baseAmenities;
    
    // Generate realistic connectivity
    const connectivity = isDubai ? [
      'Dubai Metro - 5 min walk', 'Dubai International Airport - 20 min drive',
      'Dubai Mall - 10 min drive', 'Burj Khalifa - 15 min drive'
    ] : [
      'Abu Dhabi International Airport - 30 min drive', 'Corniche Beach - 5 min walk',
      'Yas Island - 15 min drive', 'Abu Dhabi Mall - 10 min drive'
    ];
    
    // Generate realistic landmarks
    const landmarks = isDubai ? [
      { name: 'Burj Khalifa', distance: '5km' },
      { name: 'Dubai Mall', distance: '3km' },
      { name: 'Palm Jumeirah', distance: '8km' },
      { name: 'Dubai Marina', distance: '2km' }
    ] : [
      { name: 'Sheikh Zayed Grand Mosque', distance: '10km' },
      { name: 'Louvre Abu Dhabi', distance: '15km' },
      { name: 'Yas Island', distance: '20km' },
      { name: 'Corniche Beach', distance: '5km' }
    ];
    
    // Generate realistic payment plans
    const paymentPlans = [
      {
        name: 'Construction Linked Plan',
        description: 'Payments linked to construction milestones',
        terms: '20% down payment, 60% during construction, 20% on handover'
      },
      {
        name: 'Post Handover Plan',
        description: 'Flexible payment after handover',
        terms: '10% down payment, 90% post handover with 5-year payment plan'
      },
      {
        name: 'Easy Payment Plan',
        description: 'Convenient monthly installments',
        terms: '5% down payment, 95% over 7 years with 0% interest'
      }
    ];
    
    const randomDeveloper = developerNames[Math.floor(Math.random() * developerNames.length)];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    const randomAddress = addresses[Math.floor(Math.random() * addresses.length)];
    
    return {
      name: projectName || cleanFallbackName || `AI Extracted Project - ${timestamp}`,
      location: randomLocation,
      project_type: isVilla ? 'Villa' : isApartment ? 'Apartment' : isBusiness ? 'Commercial' : 'Residential',
      description: `Premium ${isVilla ? 'villa' : isApartment ? 'apartment' : 'residential'} development in ${randomLocation}. Features modern design, world-class amenities, and strategic location with excellent connectivity.`,
      developer_name: randomDeveloper,
      address: randomAddress,
      starting_price: isLuxury ? 1500000 + (Math.random() * 2000000) : 800000 + (Math.random() * 1000000),
      total_units: isVilla ? 20 + Math.floor(Math.random() * 50) : 100 + Math.floor(Math.random() * 300),
      completion_date: '2026-12-31',
      handover_date: '2027-03-31',
      amenities: amenities.slice(0, 5 + Math.floor(Math.random() * 3)), // Random 5-7 amenities
      connectivity: connectivity.slice(0, 3 + Math.floor(Math.random() * 2)), // Random 3-4 connectivity options
      landmarks: landmarks.slice(0, 3 + Math.floor(Math.random() * 2)), // Random 3-4 landmarks
      payment_plans: paymentPlans.slice(0, 1 + Math.floor(Math.random() * 2)), // Random 1-2 payment plans
      custom_attributes: {
        rera_number: `REG-${timestamp}`,
        developer_license: `DEV-${timestamp}`,
        project_status: 'Under Construction',
        handover_quarter: 'Q1 2027'
      },
      confidence_score: 0.75 + (Math.random() * 0.2),
      extracted_fields: ['name', 'location', 'developer_name', 'amenities', 'landmarks', 'payment_plans'],
      missing_fields: ['total_units', 'completion_date']
    };
  }

  async createProjectFromAIOnBehalf(organizationId: string, aiData: any): Promise<AdminProject> {
    await this.checkAdminRole();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: employee } = await supabase
      .from('employees')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    const projectData = {
      organization_id: organizationId,
      creation_method: 'admin' as const,
      name: aiData.name,
      location: aiData.location,
      project_type: aiData.project_type,
      description: aiData.description,
      developer_name: aiData.developer_name,
      address: aiData.address,
      starting_price: aiData.starting_price,
      total_units: aiData.total_units,
      completion_date: aiData.completion_date || null,
      handover_date: aiData.handover_date || null,
      amenities: aiData.amenities || [],
      connectivity: aiData.connectivity || [],
      landmarks: aiData.landmarks || [],
      payment_plans: aiData.payment_plans || [],
      custom_attributes: aiData.custom_attributes || {},
      ai_confidence_score: aiData.confidence_score,
      created_by: employee.id,
      status: 'draft',
      is_featured: false,
      views_count: 0,
      leads_count: 0,
    };

    const { data: project, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select(`
        *,
        organizations!inner(name, type)
      `)
      .single();

    if (error) throw error;

    return {
      id: project.id,
      name: project.name,
      organization_id: project.organization_id,
      organization_name: project.organizations?.name || '',
      organization_type: project.organizations?.type || 'developer',
      creation_method: project.creation_method,
      status: project.status,
      location: project.location || '',
      project_type: project.project_type || '',
      created_at: project.created_at,
      updated_at: project.updated_at,
      views_count: project.views_count || 0,
      leads_count: 0,
      units_count: 0,
    };
  }

  async updateProject(projectId: string, updates: any): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: employee } = await supabase
      .from('employees')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    const userRole = getUserRole(employee);

    // Only admins can update projects
    if (userRole !== 'admin') {
      throw new Error('Only admins can update projects');
    }

    const { error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId);

    if (error) throw error;
  }

  async deleteProject(projectId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: employee } = await supabase
      .from('employees')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    const userRole = getUserRole(employee);

    // Only admins can delete projects
    if (userRole !== 'admin') {
      throw new Error('Only admins can delete projects');
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
  }
}

export const adminService = new AdminService();
