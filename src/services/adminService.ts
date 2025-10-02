import { supabase } from '../lib/supabase';
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

class AdminService {
  // System Analytics
  async getSystemAnalytics(): Promise<SystemAnalytics> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Check if user is admin
    const { data: employee } = await supabase
      .from('employees')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (employee?.role !== 'admin') {
      throw new Error('Access denied: Admin role required');
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
        agent_id,
        status,
        employees!leads_agent_id_fkey(first_name, last_name)
      `);

    const { data: topProjects } = await supabase
      .from('projects')
      .select('id, name, views_count, leads_count')
      .order('leads_count', { ascending: false })
      .limit(5);

    const performance = {
      avg_response_time: 2.5, // Mock data - would need actual calculation
      top_performing_agents: topAgents?.slice(0, 5).map(agent => ({
        agent_id: agent.agent_id,
        agent_name: `${agent.employees?.first_name} ${agent.employees?.last_name}`,
        leads_count: 0, // Would need actual calculation
        conversion_rate: 0, // Would need actual calculation
      })) || [],
      top_projects: topProjects?.map(project => ({
        project_id: project.id,
        project_name: project.name,
        leads_count: project.leads_count || 0,
        views_count: project.views_count || 0,
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

    // Check if user is admin
    const { data: employee } = await supabase
      .from('employees')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (employee?.role !== 'admin') {
      throw new Error('Access denied: Admin role required');
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

    // Check if user is admin
    const { data: employee } = await supabase
      .from('employees')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (employee?.role !== 'admin') {
      throw new Error('Access denied: Admin role required');
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

    // Check if user is admin
    const { data: employee } = await supabase
      .from('employees')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (employee?.role !== 'admin') {
      throw new Error('Access denied: Admin role required');
    }

    let query = supabase
      .from('leads')
      .select(`
        *,
        projects!inner(name, organization_id, organizations!inner(name)),
        employees!leads_agent_id_fkey(first_name, last_name)
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
      query = query.eq('agent_id', filters.agent_id);
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
      agent_id: lead.agent_id,
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

    // Check if user is admin
    const { data: employee } = await supabase
      .from('employees')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (employee?.role !== 'admin') {
      throw new Error('Access denied: Admin role required');
    }

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        ...data,
        created_by: user.id,
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

    // Check if user is admin
    const { data: employee } = await supabase
      .from('employees')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (employee?.role !== 'admin') {
      throw new Error('Access denied: Admin role required');
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

    // Check if user is admin
    const { data: employee } = await supabase
      .from('employees')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (employee?.role !== 'admin') {
      throw new Error('Access denied: Admin role required');
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
}

export const adminService = new AdminService();
