// src/services/developerService.ts
import { supabase } from '../lib/supabase';
import type { Organization } from '../lib/supabase';

export interface DeveloperWithStats {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  contact_email: string;
  contact_phone?: string;
  address?: string;
  website?: string;
  type: 'developer' | 'agent';
  status: 'pending' | 'active' | 'suspended' | 'inactive';
  created_at: string;
  updated_at: string;
  
  // Aggregated project statistics
  projects_count: number;
  min_starting_price?: number;
  earliest_possession_date?: string;
  primary_location?: string;
  availability_status: 'Available' | 'Few Units Left' | 'Sold Out';
}

export const developerService = {
  /**
   * Fetch all active developer organizations with aggregated project statistics
   */
  async getDevelopersWithStats(): Promise<DeveloperWithStats[]> {
    try {
      // Check authentication first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('Not authenticated');
        throw new Error('Not authenticated');
      }

      // Get employee data to check role
      const { data: employee } = await supabase
        .from('employees')
        .select('organization_id, role, role_new')
        .eq('user_id', user.id)
        .single();

      if (!employee) {
        console.error('Employee not found');
        throw new Error('Employee not found');
      }

      // For agents, get all developer organizations
      // For developers/admins, get all organizations (they can see all)
      const userRole = employee.role_new || employee.role;
      
      let organizationsQuery = supabase
        .from('organizations')
        .select('*')
        .eq('type', 'developer')
        .eq('status', 'active')
        .order('name');

      const { data: organizations, error: orgError } = await organizationsQuery;

      if (orgError) {
        console.error('Error fetching organizations:', orgError);
        throw orgError;
      }

      if (!organizations || organizations.length === 0) {
        console.log('No organizations found');
        return [];
      }

      // Get project statistics for each organization
      const developersWithStats: DeveloperWithStats[] = await Promise.all(
        organizations.map(async (org) => {
          // Get projects for this organization
          // Use role-based filtering similar to projectService
          let projectsQuery = supabase
            .from('projects')
            .select('starting_price, completion_date, location, status, total_units, leads_count')
            .eq('organization_id', org.id)
            .eq('status', 'published');

          // For agents, only show published projects
          // For developers, show their own projects
          // For admins, show all projects
          if (userRole === 'agent') {
            // Agents can see all published projects from all developers
            // No additional filtering needed
          } else if (userRole === 'developer') {
            // Developers can only see their own organization's projects
            // This is already filtered by organization_id
          } else if (userRole === 'admin') {
            // Admins can see all projects
            // No additional filtering needed
          }

          const { data: projects, error: projectsError } = await projectsQuery;

          if (projectsError) {
            console.error(`Error fetching projects for ${org.name}:`, projectsError);
            // Continue with empty projects array
          }

          const projectsList = projects || [];

          // Calculate aggregated statistics
          const projects_count = projectsList.length;
          
          // Find minimum starting price
          const prices = projectsList
            .map(p => p.starting_price)
            .filter(price => price && price > 0);
          const min_starting_price = prices.length > 0 ? Math.min(...prices) : undefined;

          // Find earliest possession date
          const dates = projectsList
            .map(p => p.completion_date)
            .filter(date => date)
            .map(date => new Date(date!))
            .filter(date => !isNaN(date.getTime()));
          const earliest_possession_date = dates.length > 0 
            ? new Date(Math.min(...dates.map(d => d.getTime()))).toISOString().split('T')[0]
            : undefined;

          // Find primary location (most common location)
          const locations = projectsList
            .map(p => p.location)
            .filter(loc => loc);
          const locationCounts = locations.reduce((acc, loc) => {
            acc[loc] = (acc[loc] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          const primary_location = Object.keys(locationCounts).length > 0
            ? Object.keys(locationCounts).reduce((a, b) => locationCounts[a] > locationCounts[b] ? a : b)
            : undefined;

          // Calculate availability status based on project data
          let availability_status: 'Available' | 'Few Units Left' | 'Sold Out' = 'Available';
          if (projectsList.length > 0) {
            const totalUnits = projectsList.reduce((sum, p) => sum + (p.total_units || 0), 0);
            const totalLeads = projectsList.reduce((sum, p) => sum + (p.leads_count || 0), 0);
            
            if (totalUnits === 0) {
              availability_status = 'Sold Out';
            } else if (totalLeads >= totalUnits * 0.8) {
              availability_status = 'Few Units Left';
            } else if (totalLeads >= totalUnits * 0.5) {
              availability_status = 'Available';
            }
          }

          return {
            ...org,
            projects_count,
            min_starting_price,
            earliest_possession_date,
            primary_location,
            availability_status
          };
        })
      );

      // Filter out developers with no projects and sort by project count
      return developersWithStats
        .filter(dev => dev.projects_count > 0)
        .sort((a, b) => b.projects_count - a.projects_count);
    } catch (error) {
      console.error('Error in getDevelopersWithStats:', error);
      throw error;
    }
  },

  /**
   * Get a single developer by ID with project statistics
   */
  async getDeveloperById(id: string): Promise<DeveloperWithStats | null> {
    try {
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id)
        .eq('type', 'developer')
        .single();

      if (orgError || !organization) {
        return null;
      }

      // Get project statistics
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('starting_price, completion_date, location, status, total_units, leads_count')
        .eq('organization_id', id)
        .eq('status', 'published');

      if (projectsError) {
        console.error(`Error fetching projects for ${organization.name}:`, projectsError);
      }

      const projectsList = projects || [];
      const projects_count = projectsList.length;
      
      const prices = projectsList
        .map(p => p.starting_price)
        .filter(price => price && price > 0);
      const min_starting_price = prices.length > 0 ? Math.min(...prices) : undefined;

      const dates = projectsList
        .map(p => p.completion_date)
        .filter(date => date)
        .map(date => new Date(date!))
        .filter(date => !isNaN(date.getTime()));
      const earliest_possession_date = dates.length > 0 
        ? new Date(Math.min(...dates.map(d => d.getTime()))).toISOString().split('T')[0]
        : undefined;

      const locations = projectsList
        .map(p => p.location)
        .filter(loc => loc);
      const locationCounts = locations.reduce((acc, loc) => {
        acc[loc] = (acc[loc] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const primary_location = Object.keys(locationCounts).length > 0
        ? Object.keys(locationCounts).reduce((a, b) => locationCounts[a] > locationCounts[b] ? a : b)
        : undefined;

      let availability_status: 'Available' | 'Few Units Left' | 'Sold Out' = 'Available';
      if (projectsList.length > 0) {
        const totalUnits = projectsList.reduce((sum, p) => sum + (p.total_units || 0), 0);
        const totalLeads = projectsList.reduce((sum, p) => sum + (p.leads_count || 0), 0);
        
        if (totalUnits === 0) {
          availability_status = 'Sold Out';
        } else if (totalLeads >= totalUnits * 0.8) {
          availability_status = 'Few Units Left';
        } else if (totalLeads >= totalUnits * 0.5) {
          availability_status = 'Available';
        }
      }

      return {
        ...organization,
        projects_count,
        min_starting_price,
        earliest_possession_date,
        primary_location,
        availability_status
      };
    } catch (error) {
      console.error('Error in getDeveloperById:', error);
      throw error;
    }
  }
};
