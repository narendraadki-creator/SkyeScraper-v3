import { supabase, type User, type Employee, type Organization } from '../lib/supabase';

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  organizationType: 'developer' | 'agent';
  contactPhone?: string;
  address?: string;
  website?: string;
  description?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResult {
  user?: User;
  employee?: Employee;
  organization?: Organization;
  error?: any;
}

class AuthService {
  /**
   * Register a new organization and admin user
   */
  async signUp(data: SignUpData): Promise<AuthResult> {
    try {
      console.log('Starting sign up process for:', data.email);
      
      // Step 1: Create user account with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
          },
        },
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        return { error: authError };
      }

      if (!authData.user) {
        console.error('No user returned from signup');
        return { error: { message: 'Failed to create user account' } };
      }

      console.log('User created successfully:', authData.user.id);

      // Step 2: Create organization
      console.log('Creating organization:', data.organizationName);
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: data.organizationName,
          type: data.organizationType,
          contact_email: data.email,
          contact_phone: data.contactPhone,
          address: data.address,
          website: data.website,
          description: data.description,
          created_by: authData.user.id,
        })
        .select()
        .single();

      if (orgError) {
        // If organization creation fails, we should clean up the user
        // Note: In production, you might want to use a service role key for cleanup
        console.error('Organization creation failed:', orgError);
        return { error: orgError };
      }

      // Step 3: Create admin employee record
      console.log('Creating employee record for user:', authData.user.id);
      const employeeCode = this.generateEmployeeCode(data.organizationName);
      const { data: employee, error: empError } = await supabase
        .from('employees')
        .insert({
          organization_id: organization.id,
          user_id: authData.user.id,
          employee_code: employeeCode,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.contactPhone,
          role: 'admin',
          status: 'active',
          permissions: {
            can_create_projects: true,
            can_manage_employees: true,
            can_view_analytics: true,
            can_manage_organization: true,
          },
          created_by: authData.user.id,
        })
        .select()
        .single();

      if (empError) {
        // Clean up organization if employee creation fails
        // Note: In production, you might want to use a service role key for cleanup
        console.error('Employee creation failed:', empError);
        await supabase.from('organizations').delete().eq('id', organization.id);
        return { error: empError };
      }

      console.log('Registration completed successfully');
      return {
        user: authData.user ? {
          id: authData.user.id,
          email: authData.user.email || '',
          user_metadata: authData.user.user_metadata
        } : null,
        employee,
        organization,
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: { message: 'An unexpected error occurred during registration' } };
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(data: SignInData): Promise<AuthResult> {
    try {
      console.log('Starting sign in process for:', data.email);
      
      // Step 1: Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        console.error('Auth signin error:', authError);
        return { error: authError };
      }

      if (!authData.user) {
        console.error('No user returned from signin');
        return { error: { message: 'Authentication failed' } };
      }

      console.log('User authenticated successfully:', authData.user.id);

      // Step 2: Get employee record
      console.log('Fetching employee record for user:', authData.user.id);
      const { data: employee, error: empError } = await supabase
        .from('employees')
        .select(`
          *,
          organizations (*)
        `)
        .eq('user_id', authData.user.id)
        .eq('status', 'active')
        .single();

      if (empError) {
        console.error('Employee fetch error:', empError);
        return { error: { message: 'Employee record not found or inactive' } };
      }

      console.log('Employee record found:', employee.id);

      // Step 3: Update last login
      await supabase
        .from('employees')
        .update({ last_login: new Date().toISOString() })
        .eq('id', employee.id);

      return {
        user: authData.user ? {
          id: authData.user.id,
          email: authData.user.email || '',
          user_metadata: authData.user.user_metadata
        } : null,
        employee,
        organization: employee.organizations,
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: { message: 'An unexpected error occurred during sign in' } };
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<{ error?: any }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: { message: 'An unexpected error occurred during sign out' } };
    }
  }

  /**
   * Get current session and user data
   */
  async getCurrentUser(): Promise<AuthResult> {
    try {
      console.log('getCurrentUser: Getting user from session...');
      
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        console.log('getCurrentUser: No authenticated user');
        return { error: { message: 'No authenticated user' } };
      }

      console.log('getCurrentUser: User found, querying employee data...');
      // Get employee and organization data
      const { data: employee, error: empError } = await supabase
        .from('employees')
        .select(`
          *,
          organizations (*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (empError) {
        console.log('getCurrentUser: Employee query error:', empError);
        return { error: { message: 'Employee record not found' } };
      }

      console.log('getCurrentUser: Employee data found successfully');
      return {
        user,
        employee,
        organization: employee.organizations,
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return { error: { message: 'An unexpected error occurred' } };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    department?: string;
    position?: string;
  }): Promise<{ error?: any }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return { error: authError || { message: 'No authenticated user' } };
      }

      // Update employee record
      const { error: empError } = await supabase
        .from('employees')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          phone: updates.phone,
          department: updates.department,
          position: updates.position,
        })
        .eq('user_id', user.id);

      if (empError) {
        return { error: empError };
      }

      // Update auth user metadata if needed
      if (updates.firstName || updates.lastName) {
        const { error: authUpdateError } = await supabase.auth.updateUser({
          data: {
            first_name: updates.firstName,
            last_name: updates.lastName,
          },
        });

        if (authUpdateError) {
          return { error: authUpdateError };
        }
      }

      return {};
    } catch (error) {
      console.error('Update profile error:', error);
      return { error: { message: 'An unexpected error occurred' } };
    }
  }

  /**
   * Generate employee code from organization name
   */
  private generateEmployeeCode(organizationName: string): string {
    const prefix = organizationName
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 3)
      .toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    return `${prefix}${timestamp}`;
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(employee: Employee, permission: string): boolean {
    if (!employee.permissions) return false;
    return employee.permissions[permission] === true;
  }

  /**
   * Check if user has specific role
   */
  hasRole(employee: Employee, role: string): boolean {
    return employee.role === role;
  }

  /**
   * Check if user is admin
   */
  isAdmin(employee: Employee): boolean {
    return employee.role === 'admin';
  }
}

export const authService = new AuthService();
