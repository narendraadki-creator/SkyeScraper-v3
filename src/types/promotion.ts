export type PromotionStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';

export interface Promotion {
  id: string;
  organization_id: string;
  project_id: string | null;
  title: string;
  description?: string | null;
  short_message?: string | null;
  promotion_type?: string | null;
  discount_percentage?: number | null;
  discount_amount?: number | null;
  start_date: string; // ISO date
  end_date: string;   // ISO date
  status: PromotionStatus;
  terms_conditions?: string | null;
  target_audience?: any; // jsonb
  banner_image?: string | null;
  media_url?: string | null;
  send_at?: string | null; // timestamp
  sent_at?: string | null; // timestamp
  is_scheduled?: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePromotionInput {
  project_id?: string | null;
  title: string;
  short_message?: string;
  description?: string;
  promotion_type?: string;
  discount_percentage?: number;
  discount_amount?: number;
  start_date: string;
  end_date: string;
  terms_conditions?: string;
  media_url?: string;
  send_at?: string | null;
  is_scheduled?: boolean;
}

export interface PromotionMetrics {
  promotion_id: string;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  updated_at: string;
}






