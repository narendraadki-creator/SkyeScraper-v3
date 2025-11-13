import { supabase } from '../lib/supabase';
import type { 
  Lead, 
  CreateLeadData, 
  UpdateLeadData, 
  LeadFilters, 
  LeadListResponse,
} from '../types/lead';

export const leadService = {
  async createLead(leadData: CreateLeadData): Promise<Lead> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('id, organization_id')
      .eq('user_id', user.id)
      .single();

    if (empError) {
      console.error('Employee fetch error:', empError);
      throw new Error(`Employee not found: ${empError.message}`);
    }
    if (!employee) throw new Error('Employee not found');

    const insertData = {
      ...leadData,
      organization_id: employee.organization_id,
      created_by: employee.id,
      status: 'new',
      stage: 'inquiry',
    };

    const { data, error } = await supabase
      .from('leads')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Lead creation error:', error);
      throw error;
    }

    // Update the project's lead count
    if (data && leadData.project_id) {
      // First get the current lead count
      const { data: project, error: fetchError } = await supabase
        .from('projects')
        .select('leads_count')
        .eq('id', leadData.project_id)
        .single();
      
      if (!fetchError && project) {
        const { error: updateError } = await supabase
          .from('projects')
          .update({ 
            leads_count: (project.leads_count || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', leadData.project_id);
        
        if (updateError) {
          console.error('Failed to update project lead count:', updateError);
          // Don't throw error here as the lead was created successfully
        }
      }
    }

    return data;
  },

  async getLeads(filters?: LeadFilters, page = 1, limit = 20): Promise<LeadListResponse> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: employee } = await supabase
      .from('employees')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    let query = supabase
      .from('leads')
      .select(`
        *,
        project:projects(name, location),
        unit:units(unit_number, unit_type),
        assigned_employee:employees!leads_assigned_to_fkey(first_name, last_name)
      `)
      .eq('organization_id', employee.organization_id);

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.stage) {
      query = query.eq('stage', filters.stage);
    }
    if (filters?.project_id) {
      query = query.eq('project_id', filters.project_id);
    }
    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }
    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to);
    }
    if (filters?.search) {
      query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
    }

    // Get total count - use a separate count query
    const countQuery = supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });
    
    // Apply same filters to count query
    if (employee?.organization_id) {
      countQuery.eq('organization_id', employee.organization_id);
    }
    if (filters?.status) {
      countQuery.eq('status', filters.status);
    }
    if (filters?.project_id) {
      countQuery.eq('project_id', filters.project_id);
    }
    if (filters?.assigned_to) {
      countQuery.eq('assigned_to', filters.assigned_to);
    }
    if (filters?.search) {
      countQuery.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
    }
    
    const { count } = await countQuery;

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Order by created date
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;

    return {
      leads: data || [],
      total: count || 0,
      page,
      limit,
    };
  },

  async getLead(leadId: string): Promise<Lead> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: employee } = await supabase
      .from('employees')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        project:projects(name, location, developer_name),
        unit:units(unit_number, unit_type, area_sqft, price),
        assigned_employee:employees!leads_assigned_to_fkey(first_name, last_name, email),
        creator:employees!leads_created_by_fkey(first_name, last_name)
      `)
      .eq('id', leadId)
      .eq('organization_id', employee.organization_id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateLead(leadId: string, updateData: UpdateLeadData): Promise<Lead> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: employee } = await supabase
      .from('employees')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    const { data, error } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', leadId)
      .eq('organization_id', employee.organization_id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteLead(leadId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: employee } = await supabase
      .from('employees')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    // First, get the lead to find the project_id
    const { data: lead, error: fetchError } = await supabase
      .from('leads')
      .select('project_id')
      .eq('id', leadId)
      .eq('organization_id', employee.organization_id)
      .single();

    if (fetchError) throw fetchError;

    // Delete the lead
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', leadId)
      .eq('organization_id', employee.organization_id);

    if (error) throw error;

    // Decrement the project's lead count
    if (lead && lead.project_id) {
      // First get the current lead count
      const { data: project, error: fetchError } = await supabase
        .from('projects')
        .select('leads_count')
        .eq('id', lead.project_id)
        .single();
      
      if (!fetchError && project) {
        const { error: updateError } = await supabase
          .from('projects')
          .update({ 
            leads_count: Math.max((project.leads_count || 0) - 1, 0),
            updated_at: new Date().toISOString()
          })
          .eq('id', lead.project_id);
        
        if (updateError) {
          console.error('Failed to update project lead count:', updateError);
          // Don't throw error here as the lead was deleted successfully
        }
      }
    }
  },

  async getLeadStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byStage: Record<string, number>;
    thisMonth: number;
    conversionRate: number;
  }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: employee } = await supabase
      .from('employees')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    // Get all leads for stats
    const { data: leads, error } = await supabase
      .from('leads')
      .select('status, stage, created_at')
      .eq('organization_id', employee.organization_id);

    if (error) throw error;

    const stats = {
      total: leads?.length || 0,
      byStatus: {} as Record<string, number>,
      byStage: {} as Record<string, number>,
      thisMonth: 0,
      conversionRate: 0,
    };

    // Calculate stats
    leads?.forEach(lead => {
      // Status counts
      stats.byStatus[lead.status] = (stats.byStatus[lead.status] || 0) + 1;
      
      // Stage counts
      stats.byStage[lead.stage] = (stats.byStage[lead.stage] || 0) + 1;
      
      // This month count
      const leadDate = new Date(lead.created_at);
      const now = new Date();
      if (leadDate.getMonth() === now.getMonth() && leadDate.getFullYear() === now.getFullYear()) {
        stats.thisMonth++;
      }
    });

    // Calculate conversion rate (won / total)
    const wonCount = stats.byStatus.won || 0;
    stats.conversionRate = stats.total > 0 ? (wonCount / stats.total) * 100 : 0;

    return stats;
  },

  async getTeamMembers(): Promise<Array<{ id: string; name: string; email: string }>> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: employee } = await supabase
      .from('employees')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    const { data, error } = await supabase
      .from('employees')
      .select('id, first_name, last_name, email')
      .eq('organization_id', employee.organization_id)
      .eq('role', 'agent');

    if (error) throw error;
    return data?.map(emp => ({
      id: emp.id,
      name: `${emp.first_name} ${emp.last_name}`,
      email: emp.email,
    })) || [];
  },
};
