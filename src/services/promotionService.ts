import { supabase } from '../lib/supabase';
import type { CreatePromotionInput, Promotion, PromotionMetrics } from '../types/promotion';

export const promotionService = {
  async listPromotions(params?: { projectId?: string; status?: string }): Promise<Promotion[]> {
    // Scope results based on current user's role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: employee } = await supabase
      .from('employees')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    let query = supabase.from('promotions').select('*').order('created_at', { ascending: false });

    // Developers: only their organization's promotions; Admin: all; Agents (if used): only active
    if (employee.role === 'developer') {
      query = query.eq('organization_id', employee.organization_id);
    } else if (employee.role === 'agent') {
      query = query.eq('status', 'active');
    }

    if (params?.projectId) query = query.eq('project_id', params.projectId);
    if (params?.status) query = query.eq('status', params.status);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getPromotion(id: string): Promise<Promotion | null> {
    const { data, error } = await supabase.from('promotions').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async createPromotion(input: CreatePromotionInput): Promise<Promotion> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('id, organization_id')
      .eq('user_id', user.id)
      .single();
    if (empError) throw empError;
    if (!employee) throw new Error('Employee not found');

    const payload = {
      organization_id: employee.organization_id,
      project_id: input.project_id ?? null,
      title: input.title,
      short_message: input.short_message ?? null,
      description: input.description ?? null,
      promotion_type: input.promotion_type ?? null,
      discount_percentage: input.discount_percentage ?? null,
      discount_amount: input.discount_amount ?? null,
      start_date: input.start_date,
      end_date: input.end_date,
      terms_conditions: input.terms_conditions ?? null,
      media_url: input.media_url ?? null,
      send_at: input.send_at ?? null,
      is_scheduled: input.is_scheduled ?? false,
      created_by: employee.id,
    };

    const { data, error } = await supabase.from('promotions').insert(payload).select().single();
    if (error) throw error;
    return data as Promotion;
  },

  async updatePromotion(id: string, updates: Partial<CreatePromotionInput> & { status?: string }): Promise<Promotion> {
    const { data, error } = await supabase
      .from('promotions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Promotion;
  },

  async deletePromotion(id: string): Promise<void> {
    const { error } = await supabase.from('promotions').delete().eq('id', id);
    if (error) throw error;
  },

  async getMetrics(promotionId: string): Promise<PromotionMetrics | null> {
    const { data, error } = await supabase
      .from('promotion_metrics')
      .select('*')
      .eq('promotion_id', promotionId)
      .single();
    if (error) return null;
    return data as PromotionMetrics;
  },
};


