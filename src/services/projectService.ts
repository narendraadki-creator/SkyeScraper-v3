// src/services/projectService.ts
import { supabase } from '../lib/supabase';
import type { Project } from '../types/project';

// Helper function to get user role with three-role system
const getUserRole = (employee: { role: string }): string => {
  // Use the role from the database
  const role = employee.role;
  
  // Validate and return typed role
  if (role === 'admin' || role === 'developer' || role === 'agent') {
    return role;
  }
  
  // Legacy role mapping for backward compatibility
  if (role === 'manager' || role === 'staff') {
    return 'developer'; // Legacy roles become developers
  }
  
  console.warn('Unknown role:', role, 'defaulting to developer');
  return 'developer'; // Safe fallback
};

interface CreateProjectInput {
  name: string;
  location: string;
  project_type?: string;
  status?: 'draft' | 'published' | 'archived';
  description?: string;
  developer_name?: string;
  address?: string;
  starting_price?: number;
  total_units?: number;
  completion_date?: string;
  handover_date?: string;
  amenities?: any[];
  connectivity?: any[];
  landmarks?: any[];
  payment_plans?: any[];
  custom_attributes?: any;
  creation_method: 'manual' | 'ai_assisted' | 'hybrid' | 'admin';
  ai_confidence_score?: number;
  source_file_id?: string;
  featured_image?: string;
  gallery_images?: string[];
  brochure_url?: string;
  brochure_file?: File;
  floor_plan_urls?: string[];
  is_featured?: boolean;
}

export const projectService = {
  async createProject(input: CreateProjectInput) {
    // Get current user directly
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get employee data
    const { data: employee } = await supabase
      .from('employees')
      .select('id, organization_id, role')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    // Check role - only developers can create projects directly
    const userRole = getUserRole(employee);
    if (userRole === 'admin') {
      throw new Error('Admins must use the admin project creation flow');
    }
    if (userRole === 'agent') {
      throw new Error('Agents cannot create projects');
    }

    // Handle file upload if brochure is provided
    let brochureUrl = input.brochure_url;
    let brochureStoragePath: string | undefined;
    if (input.brochure_file) {
      try {
        const fileExt = input.brochure_file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `projects/${employee.organization_id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('project-files')
          .upload(filePath, input.brochure_file);
        
        if (uploadError) {
          console.error('File upload error:', uploadError);
          console.log('Skipping file upload due to storage error, continuing with project creation...');
          // Don't throw error, just skip file upload
          brochureUrl = undefined;
        } else {
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('project-files')
            .getPublicUrl(filePath);
          
          brochureUrl = urlData.publicUrl;
          brochureStoragePath = filePath;
        }
      } catch (error) {
        console.error('File upload failed:', error);
        console.log('Skipping file upload, continuing with project creation...');
        brochureUrl = undefined;
      }
    }

            // Create project - clean empty date strings and remove non-database fields
            const { brochure_file, ...inputWithoutFile } = input;
            const projectData = {
              ...inputWithoutFile,
              brochure_url: brochureUrl,
              organization_id: employee.organization_id,
              created_by: employee.id,
              status: input.status || 'published', // Use provided status or default to published
              is_featured: false,
              views_count: 0,
              leads_count: 0,
              // Convert empty date strings to null
              completion_date: input.completion_date && input.completion_date.trim() !== '' ? input.completion_date : null,
              handover_date: input.handover_date && input.handover_date.trim() !== '' ? input.handover_date : null,
            };
    
    console.log('Project data being inserted:', projectData);
    console.log('Amenities in insert:', projectData.amenities);
    console.log('Connectivity in insert:', projectData.connectivity);
    console.log('Landmarks in insert:', projectData.landmarks);
    console.log('Payment plans in insert:', projectData.payment_plans);
    
    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();

    if (error) throw error;
    // If we uploaded a brochure file for AI extraction, also create a record in project_files
    if (input.brochure_file && brochureUrl && brochureStoragePath && data?.id) {
      try {
        const { data: fileRecord, error: fileErr } = await supabase
          .from('project_files')
          .insert({
            project_id: data.id,
            organization_id: employee.organization_id,
            file_name: input.brochure_file.name,
            file_path: brochureStoragePath,
            file_purpose: 'brochure',
            file_size: input.brochure_file.size,
            mime_type: input.brochure_file.type,
            storage_bucket: 'project-files',
            storage_path: brochureStoragePath,
            public_url: brochureUrl,
            uploaded_by: employee.id,
          })
          .select()
          .single();

        if (!fileErr && fileRecord?.id) {
          // Link source file to project for traceability
          await supabase
            .from('projects')
            .update({ source_file_id: fileRecord.id })
            .eq('id', data.id);
        }
      } catch (e) {
        console.warn('Failed to create project_files record for brochure:', e);
      }
    }

    return data;
  },

  async listProjects(filters?: { status?: string; search?: string }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: employee } = await supabase
      .from('employees')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    const userRole = getUserRole(employee);

    let query = supabase
      .from('projects')
      .select('*');

    // Filter based on NEW three-role system:
    // - Agents: see published projects from all developers
    // - Developers: see only their own organization's projects
    // - Admins: see all projects
    if (userRole === 'agent') {
      query = query.eq('status', 'published');
    } else if (userRole === 'admin') {
      // System admin can see all projects - no filter needed
    } else { // userRole === 'developer'
      query = query.eq('organization_id', employee.organization_id);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getProject(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: employee } = await supabase
      .from('employees')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    const userRole = getUserRole(employee);

    let query = supabase
      .from('projects')
      .select('*')
      .eq('id', id);

    // Filter based on NEW three-role system:
    // - Agents: can view published projects from any organization
    // - Developers: can only view their own organization's projects
    // - Admins: can view all projects
    if (userRole === 'agent') {
      query = query.eq('status', 'published');
    } else if (userRole === 'admin') {
      // System admin can view all projects - no filter needed
    } else { // userRole === 'developer'
      query = query.eq('organization_id', employee.organization_id);
    }

    const { data, error } = await query.single();

    if (error) throw error;
    
    // Increment view count when project is viewed
    if (data) {
      const { error: updateError } = await supabase
        .from('projects')
        .update({ 
          views_count: (data.views_count || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (updateError) {
        console.error('Failed to increment view count:', updateError);
        // Don't throw error here as the project data was retrieved successfully
      }
      
      // Return the updated data with incremented view count
      return {
        ...data,
        views_count: (data.views_count || 0) + 1
      };
    }
    
    return data;
  },

  async updateProject(id: string, updates: Partial<CreateProjectInput>) {
    console.log('projectService.updateProject called with:', { id, updates });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    console.log('User authenticated:', user.id);

    const { data: employee } = await supabase
      .from('employees')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    const userRole = getUserRole(employee);
    console.log('User role:', userRole, 'Employee data:', employee);

    // Only developers and admins can update projects
    if (userRole === 'agent') {
      throw new Error('Agents cannot update projects');
    }

    let query = supabase
      .from('projects')
      .update(updates)
      .eq('id', id);

    // Apply organization filter based on role
    if (userRole === 'developer') {
      query = query.eq('organization_id', employee.organization_id);
    }
    // Admins can update any project - no additional filter needed

    console.log('Executing update query...');
    const { data, error } = await query.select().single();

    if (error) {
      console.error('Update query error:', error);
      throw error;
    }
    
    console.log('Update successful, returning data:', data);
    return data;
  },

  async deleteProject(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: employee } = await supabase
      .from('employees')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    const userRole = getUserRole(employee);

    // Only developers and admins can delete projects
    if (userRole === 'agent') {
      throw new Error('Agents cannot delete projects');
    }

    let query = supabase
      .from('projects')
      .delete()
      .eq('id', id);

    // Apply organization filter based on role
    if (userRole === 'developer') {
      query = query.eq('organization_id', employee.organization_id);
    }
    // Admins can delete any project - no additional filter needed

    const { error } = await query;

    if (error) throw error;
    return true;
  },

  async processFileWithAI(file: File) {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate more realistic data based on file name
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
      payment_plans: [paymentPlans[Math.floor(Math.random() * paymentPlans.length)]],
      custom_attributes: {
        rera_number: `REG-${timestamp}`,
        developer_license: `DEV-${timestamp}`,
        project_status: 'Under Construction',
        handover_quarter: 'Q1 2027'
      },
      confidence_score: 0.75 + (Math.random() * 0.2),
      extracted_fields: ['name', 'location', 'developer_name', 'amenities', 'landmarks'],
      missing_fields: ['total_units', 'completion_date']
    };
  }
};