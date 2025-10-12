import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { RoleBasedBottomNavigation } from './RoleBasedBottomNavigation';
import type { Project } from '../../types/project';
import { 
  Search, 
  MapPin, 
  Building, 
  DollarSign, 
  Calendar,
  ChevronDown,
  Home
} from 'lucide-react';

interface DeveloperWithStats {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  projects_count: number;
  min_starting_price?: number;
  earliest_possession_date?: string;
  primary_location?: string;
  availability_status: 'Available' | 'Few Units Left' | 'Sold Out';
}

interface MobileAgentLandingProps {
  className?: string;
}

export const MobileAgentLanding: React.FC<MobileAgentLandingProps> = () => {
  const navigate = useNavigate();
  const [developers, setDevelopers] = useState<DeveloperWithStats[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredDevelopers, setFilteredDevelopers] = useState<DeveloperWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    property_type: '',
    price_range: '',
    bedrooms: '',
    bathrooms: '',
    project_status: ''
  });
  const [dropdownOptions, setDropdownOptions] = useState({
    locations: [] as string[],
    propertyTypes: [] as string[],
    priceRanges: [] as string[],
    bedrooms: [] as string[],
    statuses: [] as string[]
  });
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    loadDevelopers();
    loadProjects();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Update filtered projects when projects or filters change
  useEffect(() => {
    applyFilters();
    extractDropdownOptions();
  }, [projects, filters]);

  // Initialize filtered developers when developers are loaded
  useEffect(() => {
    if (developers.length > 0 && filteredDevelopers.length === 0) {
      setFilteredDevelopers(developers);
    }
  }, [developers]);

  const extractDropdownOptions = () => {
    if (projects.length === 0) return;

            // Extract unique locations
            const locations = [...new Set(projects.map(p => p.location).filter((loc): loc is string => Boolean(loc)))].sort();
    
    // Extract unique property types
    const propertyTypes = [...new Set(projects.map(p => p.project_type).filter((type): type is string => Boolean(type)))].sort();
    
    // Extract unique statuses
    const statuses = [...new Set(projects.map(p => p.status).filter(Boolean))].sort();
    
    // Generate price ranges based on actual data
    const allPrices = projects.map(p => p.starting_price).filter(Boolean) as number[];
    const priceRanges = generatePriceRanges(allPrices);
    
    // Generate bedroom options (this might need to be extracted from custom_attributes or units)
    const bedrooms = ['1', '2', '3', '4', '5+']; // Default options, can be enhanced with real data
    
    setDropdownOptions({
      locations,
      propertyTypes,
      priceRanges,
      bedrooms,
      statuses
    });
  };

  const generatePriceRanges = (prices: number[]): string[] => {
    if (prices.length === 0) return ['Under 500K', '500K - 1M', '1M - 2M', 'Over 2M'];
    
    const min = Math.min(...prices);
    
    const ranges = [];
    
    if (min < 500000) ranges.push('Under 500K');
    if (prices.some(p => p >= 500000 && p <= 1000000)) ranges.push('500K - 1M');
    if (prices.some(p => p > 1000000 && p <= 2000000)) ranges.push('1M - 2M');
    if (prices.some(p => p > 2000000)) ranges.push('Over 2M');
    
    return ranges.length > 0 ? ranges : ['Under 500K', '500K - 1M', '1M - 2M', 'Over 2M'];
  };

  const loadDevelopers = async () => {
    setLoading(true);
    try {
      console.log('Loading developers from organizations table...');
      
      // Import supabase directly to query organizations
      const { supabase } = await import('../../lib/supabase');
      
      // Get all developer organizations
      const { data: organizations, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('type', 'developer')
        .order('name');

      if (orgError) {
        console.error('Error fetching organizations:', orgError);
        throw orgError;
      }

      console.log('Organizations loaded:', organizations);

      if (!organizations || organizations.length === 0) {
        console.log('No organizations found');
        setDevelopers([]);
        return;
      }

      // Get all published projects to calculate stats
      const projects = await projectService.listProjects({ status: 'published' });
      console.log('Projects loaded:', projects);
      console.log('Project organization IDs:', projects.map(p => ({ name: p.name, org_id: p.organization_id })));

      // Convert organizations to developer stats
      const developersData: DeveloperWithStats[] = await Promise.all(
        organizations.map(async (org) => {
          // Get projects for this organization
          const orgProjects = projects.filter(project => project.organization_id === org.id);
          const projects_count = orgProjects.length;
          
          console.log(`Developer: ${org.name} (${org.id}) - Projects: ${projects_count}`);
          if (orgProjects.length > 0) {
            console.log(`  Project names: ${orgProjects.map(p => p.name).join(', ')}`);
          }
          
          // Find minimum starting price
          const prices = orgProjects
            .map(p => p.starting_price)
            .filter(price => price && price > 0);
          const min_starting_price = prices.length > 0 ? Math.min(...prices) : undefined;

          // Find earliest possession date
          const dates = orgProjects
            .map(p => p.completion_date)
            .filter(date => date)
            .map(date => new Date(date!))
            .filter(date => !isNaN(date.getTime()));
          const earliest_possession_date = dates.length > 0 
            ? new Date(Math.min(...dates.map(d => d.getTime()))).toISOString().split('T')[0]
            : undefined;

          // Find primary location (most common location)
          const locations = orgProjects
            .map(p => p.location)
            .filter(loc => loc);
          const locationCounts = locations.reduce((acc, loc) => {
            acc[loc] = (acc[loc] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          const primary_location = Object.keys(locationCounts).length > 0
            ? Object.keys(locationCounts).reduce((a, b) => locationCounts[a] > locationCounts[b] ? a : b)
            : org.address || undefined;

          // Calculate availability status
          let availability_status: 'Available' | 'Few Units Left' | 'Sold Out' = 'Available';
          const totalUnits = orgProjects.reduce((sum, p) => sum + (p.total_units || 0), 0);
          const totalLeads = orgProjects.reduce((sum, p) => sum + (p.leads_count || 0), 0);
          
          if (totalUnits === 0) {
            availability_status = 'Available'; // Default to Available if no units data
          } else if (totalLeads >= totalUnits * 0.8) {
            availability_status = 'Few Units Left';
          } else if (totalLeads >= totalUnits * 0.5) {
            availability_status = 'Available';
          }

          return {
            id: org.id,
            name: org.name,
            description: org.description || `${org.name} - Real estate development company`,
            logo_url: org.logo_url,
            projects_count,
            min_starting_price,
            earliest_possession_date,
            primary_location,
            availability_status
          };
        })
      );

      // Filter out developers with 0 projects
      const developersWithProjects = developersData.filter(dev => dev.projects_count > 0);
      
      // Sort by project count (descending), then by name
      developersWithProjects.sort((a, b) => {
        if (b.projects_count !== a.projects_count) {
          return b.projects_count - a.projects_count;
        }
        return a.name.localeCompare(b.name);
      });
      
      console.log('Developers with projects:', developersWithProjects);
      setDevelopers(developersWithProjects);
    } catch (error) {
      console.error('Failed to load developers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      console.log('Loading projects...');
      const projectsData = await projectService.listProjects();
      setProjects(projectsData);
      console.log('Loaded projects:', projectsData.length);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...projects];

    // Apply search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(searchLower) ||
        project.location.toLowerCase().includes(searchLower) ||
        project.developer_name?.toLowerCase().includes(searchLower) ||
        project.id.toLowerCase().includes(searchLower)
      );
    }

    // Apply filters
    if (filters.location) {
      filtered = filtered.filter(project => 
        project.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.property_type) {
      filtered = filtered.filter(project => 
        project.project_type?.toLowerCase().includes(filters.property_type.toLowerCase())
      );
    }

    if (filters.project_status) {
      filtered = filtered.filter(project => 
        project.status === filters.project_status
      );
    }

    if (filters.price_range) {
      const priceRanges = {
        'Under 500K': (price: number) => price < 500000,
        '500K - 1M': (price: number) => price >= 500000 && price <= 1000000,
        '1M - 2M': (price: number) => price > 1000000 && price <= 2000000,
        'Over 2M': (price: number) => price > 2000000
      };
      
      const rangeFilter = priceRanges[filters.price_range as keyof typeof priceRanges];
      if (rangeFilter) {
        filtered = filtered.filter(project => 
          project.starting_price && rangeFilter(project.starting_price)
        );
      }
    }

    // Now create filtered developers with project counts
    createFilteredDevelopers(filtered);
  };

  const createFilteredDevelopers = (filteredProjects: Project[]) => {
    // Group projects by developer/organization
    const developerProjectMap = new Map<string, {
      developer: DeveloperWithStats;
      projects: Project[];
    }>();

    // First, add all existing developers
    developers.forEach(dev => {
      developerProjectMap.set(dev.id, {
        developer: { ...dev, projects_count: 0 },
        projects: []
      });
    });

    // Then, add projects to their respective developers
    filteredProjects.forEach(project => {
      // Find developer by organization_id or developer_name
      const developerEntry = Array.from(developerProjectMap.values()).find(entry => 
        entry.developer.id === project.organization_id || 
        entry.developer.name === project.developer_name
      );

      if (developerEntry) {
        developerEntry.projects.push(project);
      } else {
        // Create new developer entry if not found
        const newDeveloper: DeveloperWithStats = {
          id: project.organization_id || `dev-${project.developer_name}`,
          name: project.developer_name || 'Unknown Developer',
          description: '',
          logo_url: '',
          projects_count: 1,
          min_starting_price: project.starting_price,
          earliest_possession_date: project.completion_date,
          primary_location: project.location,
          availability_status: 'Available'
        };
        
        developerProjectMap.set(newDeveloper.id, {
          developer: newDeveloper,
          projects: [project]
        });
      }
    });

    // Update project counts and filter out developers with no matching projects
    const filteredDevelopersWithCounts = Array.from(developerProjectMap.values())
      .filter(entry => entry.projects.length > 0)
      .map(entry => ({
        ...entry.developer,
        projects_count: entry.projects.length,
        min_starting_price: Math.min(...entry.projects.map(p => p.starting_price || Infinity)),
        earliest_possession_date: entry.projects
          .map(p => p.completion_date)
          .filter(Boolean)
          .sort()[0],
        primary_location: entry.projects[0]?.location || entry.developer.primary_location
      }));

    setFilteredDevelopers(filteredDevelopersWithCounts);
  };

  const handleSearch = () => {
    // Always show developers with project counts, regardless of search
    applyFilters();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    setActiveDropdown(null); // Close dropdown after selection
  };

  const toggleDropdown = (dropdownKey: string) => {
    setActiveDropdown(activeDropdown === dropdownKey ? null : dropdownKey);
  };

  const getDropdownOptions = (type: string): string[] => {
    switch (type) {
      case 'location': return dropdownOptions.locations;
      case 'property_type': return dropdownOptions.propertyTypes;
      case 'price_range': return dropdownOptions.priceRanges;
      case 'bedrooms': return dropdownOptions.bedrooms;
      case 'project_status': return dropdownOptions.statuses;
      default: return [];
    }
  };


  const clearSearch = () => {
    setSearchTerm('');
    setFilters({
      location: '',
      property_type: '',
      price_range: '',
      bedrooms: '',
      bathrooms: '',
      project_status: ''
    });
    setActiveDropdown(null);
    // Reset to show all developers
    setFilteredDevelopers(developers);
  };

  const handleViewDeveloper = (developer: DeveloperWithStats) => {
    // Navigate to developer details or projects
    navigate(`/developer/${developer.id}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount / 1000) + 'K';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AE', {
      year: 'numeric',
      month: 'short',
    });
  };


  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#F8F9F9', 
      display: 'flex', 
      flexDirection: 'column',
      fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, sans-serif',
      overflow: 'visible'
    }}>
      {/* Hero Section - Premium Design */}
      <div style={{
        backgroundColor: '#F8F9F9',
        padding: '60px 20px 40px 20px',
        textAlign: 'center',
        overflow: 'visible',
        position: 'relative',
        zIndex: 100
      }}>
        {/* Title */}
        <h1 style={{
          fontSize: '48px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          color: '#016A5D',
          margin: '0 0 8px 0',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          SKYESCRAPER
        </h1>
        
        {/* Subtle underline accent */}
        <div style={{
          width: '120px',
          height: '2px',
          background: 'linear-gradient(90deg, #016A5D 0%, #CBA135 100%)',
          margin: '0 auto 20px auto'
        }} />
        
        {/* Sub-header */}
        <p style={{
          fontSize: '16px',
          color: '#777777',
          fontWeight: '300',
          margin: '0 0 40px 0',
          letterSpacing: '0.05em'
        }}>
          Discover • Manage • Book Properties in Real-Time
        </p>

        {/* Search Bar */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '16px 20px',
          boxShadow: '0 2px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(1, 106, 93, 0.1)',
          marginBottom: '24px',
          maxWidth: '500px',
          margin: '0 auto 24px auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Search size={20} color="#016A5D" />
            <input
              type="text"
              placeholder="Search by Project, Developer, or Property ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              style={{
                flex: 1,
                border: 'none',
                background: 'none',
                outline: 'none',
                fontSize: '16px',
                color: '#333333',
                fontWeight: '400',
                fontFamily: 'Montserrat, sans-serif'
              }}
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#777777',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px'
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Filter Dropdowns */}
        <div style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          overflowY: 'visible',
          paddingBottom: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          position: 'relative',
          zIndex: 1000
        }}>
          {[
            { icon: MapPin, label: 'Location', key: 'location' },
            { icon: Building, label: 'Type', key: 'property_type' },
            { icon: DollarSign, label: 'Price Range', key: 'price_range' },
            { icon: Home, label: 'Bedrooms', key: 'bedrooms' },
            { icon: Calendar, label: 'Status', key: 'project_status' }
          ].map((filter, index) => (
            <div key={index} style={{ position: 'relative' }} data-dropdown>
              <button
                onClick={() => toggleDropdown(filter.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  background: filters[filter.key as keyof typeof filters] ? '#016A5D' : 'white',
                  border: `1px solid ${filters[filter.key as keyof typeof filters] ? '#016A5D' : 'rgba(1, 106, 93, 0.15)'}`,
                  borderRadius: '8px',
                  color: filters[filter.key as keyof typeof filters] ? 'white' : '#333333',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  boxShadow: '0 1px 8px rgba(0, 0, 0, 0.05)',
                  fontFamily: 'Montserrat, sans-serif'
                }}
              >
                <filter.icon size={16} color={filters[filter.key as keyof typeof filters] ? 'white' : '#016A5D'} />
                {filters[filter.key as keyof typeof filters] || filter.label}
                <ChevronDown size={14} color={filters[filter.key as keyof typeof filters] ? 'white' : '#777777'} />
              </button>

              {/* Dropdown Menu */}
              {activeDropdown === filter.key && (
                <>
                  {/* Backdrop */}
                  <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    zIndex: 9998
                  }} onClick={() => setActiveDropdown(null)} />
                  
                  {/* Dropdown */}
                  <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '90vw',
                    maxWidth: '400px',
                    backgroundColor: 'white',
                    border: '1px solid rgba(1, 106, 93, 0.15)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                    zIndex: 9999,
                    maxHeight: '70vh',
                    overflowY: 'auto'
                  }}>
                    {/* Dropdown Header */}
                    <div style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid rgba(1, 106, 93, 0.1)',
                      backgroundColor: '#F8F9F9',
                      borderRadius: '12px 12px 0 0'
                    }}>
                      <h3 style={{
                        margin: 0,
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#016A5D',
                        textAlign: 'center',
                        fontFamily: 'Montserrat, sans-serif'
                      }}>
                        Select {filter.label}
                      </h3>
                    </div>

                  {/* Clear Filter Option */}
                  <button
                    onClick={() => handleFilterChange(filter.key, '')}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      fontSize: '12px',
                      color: '#777777',
                      cursor: 'pointer',
                      fontFamily: 'Montserrat, sans-serif',
                      borderBottom: '1px solid rgba(1, 106, 93, 0.1)'
                    }}
                  >
                    Clear {filter.label}
                  </button>

                  {/* Filter Options */}
                  {getDropdownOptions(filter.key).map((option, optionIndex) => (
                    <button
                      key={optionIndex}
                      onClick={() => handleFilterChange(filter.key, option)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        fontSize: '14px',
                        color: '#333333',
                        cursor: 'pointer',
                        fontFamily: 'Montserrat, sans-serif',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F0F9F8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {option}
                    </button>
                  ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Featured Developers Section */}
      <div style={{
        flex: 1,
        padding: '0 20px 100px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Section Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#333333',
            margin: '0 0 8px 0',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            {searchTerm || Object.values(filters).some(f => f) ? (
              `Search Results (${filteredDevelopers.length})`
            ) : (
              'Featured Developers'
            )}
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#777777',
            margin: '0',
            fontWeight: '300',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            {searchTerm || Object.values(filters).some(f => f) ? (
              searchTerm ? 
                `Found ${filteredDevelopers.length} developers with projects matching "${searchTerm}"` :
                `Found ${filteredDevelopers.length} developers matching your filters`
            ) : (
              'Discover properties from India\'s leading developers'
            )}
          </p>
        </div>

        {loading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            color: '#777777'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              border: '2px solid rgba(1, 106, 93, 0.2)',
              borderTop: '2px solid #016A5D',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginRight: '12px'
            }} />
            <span style={{ fontFamily: 'Montserrat, sans-serif' }}>Loading developers...</span>
          </div>
        ) : developers.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            textAlign: 'center',
            color: '#777777'
          }}>
            <Building size={48} color="#016A5D" style={{ marginBottom: '16px', opacity: 0.6 }} />
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#333333',
              margin: '0 0 8px 0',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              No developers found
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#777777',
              margin: '0',
              lineHeight: '1.5',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              No active developers with projects available at the moment.
            </p>
          </div>
        ) : (
          /* Results Grid - Shows Developers or Projects */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            margin: '0 auto'
          }}>
            {filteredDevelopers.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '60px 20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(1, 106, 93, 0.1)'
              }}>
                <Search size={48} color="#777777" style={{ marginBottom: '16px' }} />
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#333333',
                  marginBottom: '8px',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  No Developers Found
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#777777',
                  marginBottom: '20px',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {searchTerm ? `No developers have projects matching "${searchTerm}"` : 'No developers match your filters'}
                </p>
                <button
                  onClick={clearSearch}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#016A5D',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                >
                  Clear Search
                </button>
              </div>
            ) : (
              // Developer Cards with Project Counts
              filteredDevelopers.map((developer) => (
              <div
                key={developer.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(1, 106, 93, 0.1)',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: 'Montserrat, sans-serif'
                }}
                onClick={() => handleViewDeveloper(developer)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(1, 106, 93, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(1, 106, 93, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(1, 106, 93, 0.1)';
                }}
              >
                {/* Availability Badge */}
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: '20px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  backgroundColor: '#E8F5E8',
                  color: '#016A5D',
                  border: '1px solid rgba(1, 106, 93, 0.2)',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {developer.availability_status}
                </div>

                {/* Developer Logo */}
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#F0F9F8',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#016A5D',
                  border: '1px solid rgba(1, 106, 93, 0.15)'
                }}>
                  {developer.logo_url ? (
                    <img
                      src={developer.logo_url}
                      alt={developer.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '12px'
                      }}
                    />
                  ) : (
                    <Building size={24} />
                  )}
                </div>

                {/* Developer Name */}
                <h3 style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  color: '#333333',
                  margin: '0 0 8px 0',
                  lineHeight: '1.3',
                  paddingTop: '12px',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {developer.name}
                </h3>

                {/* Description */}
                <p style={{
                  fontSize: '14px',
                  color: '#777777',
                  margin: '0 0 20px 0',
                  lineHeight: '1.5',
                  fontWeight: '300',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {developer.description || 'Premium residential and commercial developments'}
                </p>

                {/* Details */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {developer.primary_location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <MapPin size={16} color="#016A5D" />
                      <span style={{ 
                        fontSize: '14px', 
                        color: '#333333', 
                        fontWeight: '500',
                        fontFamily: 'Montserrat, sans-serif'
                      }}>
                        {developer.primary_location}
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Building size={16} color="#016A5D" />
                    <span style={{ 
                      fontSize: '14px', 
                      color: '#333333', 
                      fontWeight: '500',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      {developer.projects_count} Projects
                    </span>
                  </div>

                  {developer.min_starting_price && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <DollarSign size={16} color="#016A5D" />
                      <span style={{ 
                        fontSize: '14px', 
                        color: '#333333', 
                        fontWeight: '500',
                        fontFamily: 'Montserrat, sans-serif'
                      }}>
                        Starting from {formatCurrency(developer.min_starting_price)}
                      </span>
                    </div>
                  )}

                  {developer.earliest_possession_date && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Calendar size={16} color="#016A5D" />
                      <span style={{ 
                        fontSize: '14px', 
                        color: '#333333', 
                        fontWeight: '500',
                        fontFamily: 'Montserrat, sans-serif'
                      }}>
                        {formatDate(developer.earliest_possession_date)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
            )}
          </div>
        )}
      </div>

      {/* Role-Based Bottom Navigation */}
      <RoleBasedBottomNavigation />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
