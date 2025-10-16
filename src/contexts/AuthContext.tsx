// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Three-role system types
export type UserRole = 'admin' | 'developer' | 'agent';

interface AuthContextType {
  user: User | null;
  employeeId: string | null;
  organizationId: string | null;
  role: UserRole | null;
  loading: boolean;
  // Helper functions for role checking
  isAdmin: boolean;
  isDeveloper: boolean;
  isAgent: boolean;
  canManageProjects: boolean;
  canViewAllProjects: boolean;
  // Auth functions
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  employeeId: null,
  organizationId: null,
  role: null,
  loading: true,
  isAdmin: false,
  isDeveloper: false,
  isAgent: false,
  canManageProjects: false,
  canViewAllProjects: false,
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Computed role-based properties
  const isAdmin = role === 'admin';
  const isDeveloper = role === 'developer';
  const isAgent = role === 'agent';
  const canManageProjects = isAdmin || isDeveloper;
  const canViewAllProjects = isAdmin;

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
      // First try with just the basic columns to avoid 406 errors
      let data, error;
      
      const result = await supabase
        .from('employees')
        .select('id, organization_id, role')
        .eq('user_id', userId)
        .single();
      
      data = result.data;
      error = result.error;

      if (error) {
        // If it's a "no rows" error, that's expected during registration
        if (error.code === 'PGRST116') {
          // No employee record found yet - user may be in registration process
        }
        // Don't fail - just set loading to false
        setLoading(false);
        return;
      }

      if (data) {
        setEmployeeId(data.id);
        setOrganizationId(data.organization_id);
        
        // Use the role from the database
        const userRole = data.role;
        
        // Validate and set role with type safety
        // Handle both old and new role systems
        if (userRole === 'admin') {
          setRole('admin');
        } else if (userRole === 'developer') {
          setRole('developer');
        } else if (userRole === 'agent') {
          setRole('agent');
        } else if (userRole === 'manager' || userRole === 'staff') {
          // Legacy roles map to developer
          setRole('developer');
        } else {
          setRole('developer'); // Safe fallback
        }
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear all auth state
      setUser(null);
      setEmployeeId(null);
      setOrganizationId(null);
      setRole(null);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error during logout:', error);
        // Even if there's an error, we still clear the local state
      }
      
      // Clear any stored tokens or session data
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local state even if logout fails
      setUser(null);
      setEmployeeId(null);
      setOrganizationId(null);
      setRole(null);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      employeeId, 
      organizationId, 
      role, 
      loading,
      isAdmin,
      isDeveloper,
      isAgent,
      canManageProjects,
      canViewAllProjects,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);