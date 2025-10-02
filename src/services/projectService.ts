// src/services/projectService.ts
import { supabase } from '../lib/supabase';
// import type { CreateProjectData, Project } from '../types/project';

interface CreateProjectInput {
  name: string;
  location: string;
  project_type?: string;
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
      .select('id, organization_id')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

    // Handle file upload if brochure is provided
    let brochureUrl = input.brochure_url;
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
              status: 'draft',
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

    let query = supabase
      .from('projects')
      .select('*');

    // Filter based on role:
    // - Developers: see only their own organization's projects
    // - Agents: see published projects from all developers
    // - Admins: see all projects
    if (employee.role === 'agent') {
      query = query.eq('status', 'published');
    } else if (employee.role === 'admin') {
      // Admin can see all projects - no filter needed
    } else {
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

    let query = supabase
      .from('projects')
      .select('*')
      .eq('id', id);

    // Filter based on role:
    // - Developers: can only view their own organization's projects
    // - Agents: can view published projects from any organization
    // - Admins: can view all projects
    if (employee.role === 'agent') {
      query = query.eq('status', 'published');
    } else if (employee.role === 'admin') {
      // Admin can view all projects - no filter needed
    } else {
      query = query.eq('organization_id', employee.organization_id);
    }

    const { data, error } = await query.single();

    if (error) throw error;
    return data;
  },

  async updateProject(id: string, updates: Partial<CreateProjectInput>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: employee } = await supabase
      .from('employees')
      .select('organization_id, role')
      .eq('user_id', user.id)
      .single();

    if (!employee) throw new Error('Employee not found');

      // Only developers and admins can update projects
      if (employee.role === 'agent') {
        throw new Error('Agents cannot update projects');
      }

    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', employee.organization_id)
      .select()
      .single();

    if (error) throw error;
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

      // Only developers and admins can delete projects
      if (employee.role === 'agent') {
        throw new Error('Agents cannot delete projects');
      }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('organization_id', employee.organization_id);

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
    
    // Generate realistic project names
    const projectName = fileName.replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
    const cleanProjectName = projectName.split(' ').map(word => 
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
      name: cleanProjectName || `AI Extracted Project - ${timestamp}`,
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