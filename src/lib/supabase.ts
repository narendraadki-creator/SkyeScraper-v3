import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Database types (matching our schema)
export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          type: 'developer' | 'agent';
          status: 'pending' | 'active' | 'suspended' | 'inactive';
          contact_email: string;
          contact_phone?: string;
          address?: string;
          website?: string;
          description?: string;
          logo_url?: string;
          created_by?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: 'developer' | 'agent';
          status?: 'pending' | 'active' | 'suspended' | 'inactive';
          contact_email: string;
          contact_phone?: string;
          address?: string;
          website?: string;
          description?: string;
          logo_url?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: 'developer' | 'agent';
          status?: 'pending' | 'active' | 'suspended' | 'inactive';
          contact_email?: string;
          contact_phone?: string;
          address?: string;
          website?: string;
          description?: string;
          logo_url?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      employees: {
        Row: {
          id: string;
          organization_id: string;
          user_id?: string;
          employee_code: string;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string;
          role: 'admin' | 'manager' | 'agent' | 'staff';
          status: 'active' | 'inactive' | 'suspended';
          permissions: any;
          department?: string;
          position?: string;
          profile_image?: string;
          created_by?: string;
          created_at: string;
          updated_at: string;
          last_login?: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id?: string;
          employee_code: string;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string;
          role: 'admin' | 'manager' | 'agent' | 'staff';
          status?: 'active' | 'inactive' | 'suspended';
          permissions?: any;
          department?: string;
          position?: string;
          profile_image?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          last_login?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string;
          employee_code?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string;
          role?: 'admin' | 'manager' | 'agent' | 'staff';
          status?: 'active' | 'inactive' | 'suspended';
          permissions?: any;
          department?: string;
          position?: string;
          profile_image?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
          last_login?: string;
        };
      };
    };
  };
}

// User types
export interface User {
  id: string;
  email: string;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
  };
}

export interface Employee {
  id: string;
  organization_id: string;
  user_id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'manager' | 'agent' | 'staff';
  status: 'active' | 'inactive' | 'suspended';
  permissions: any;
  department?: string;
  position?: string;
  profile_image?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface Organization {
  id: string;
  name: string;
  type: 'developer' | 'agent';
  status: 'pending' | 'active' | 'suspended' | 'inactive';
  contact_email: string;
  contact_phone?: string;
  address?: string;
  website?: string;
  description?: string;
  logo_url?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  employee: Employee | null;
  organization: Organization | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<{ error: any }>;
}
