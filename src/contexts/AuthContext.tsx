// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  employeeId: string | null;
  organizationId: string | null;
  role: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  employeeId: null,
  organizationId: null,
  role: null,
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch employee data ONLY if user exists
        fetchEmployeeData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchEmployeeData(session.user.id);
      } else {
        setEmployeeId(null);
        setOrganizationId(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchEmployeeData = async (userId: string) => {
    try {
      console.log('Fetching employee data for user:', userId);
      const { data, error } = await supabase
        .from('employees')
        .select('id, organization_id, role')
        .eq('user_id', userId)
        .single();

      console.log('Employee fetch result:', { data, error });

      if (error) {
        console.error('Employee fetch error:', error);
        // If it's a "no rows" error, that's expected during registration
        if (error.code === 'PGRST116') {
          console.log('No employee record found yet - user may be in registration process');
        }
        // Don't fail - just set loading to false
        setLoading(false);
        return;
      }

      if (data) {
        console.log('Setting employee data:', data);
        setEmployeeId(data.id);
        setOrganizationId(data.organization_id);
        setRole(data.role);
      } else {
        console.log('No employee data found for user:', userId);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, employeeId, organizationId, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);