import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { projectService } from '../../services/projectService';
import { RoleBasedBottomNavigation } from './RoleBasedBottomNavigation';
import type { Project } from '../../types/project';
import { 
  Search, 
  MapPin, 
  Building, 
  DollarSign, 
  Calendar,
  Users,
  Eye,
  Star,
  Filter,
  Menu,
  Bell,
  Share2,
  Heart,
  ChevronDown,
  ChevronRight,
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

export const MobileAgentLanding: React.FC<MobileAgentLandingProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [developers, setDevelopers] = useState<DeveloperWithStats[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
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
  const [showFilters, setShowFilters] = useState(false);
  const [searchResults, setSearchResults] = useState<'developers' | 'projects'>('developers');
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

  const extractDropdownOptions = () => {
    if (projects.length === 0) return;

    // Extract unique locations
    const locations = [...new Set(projects.map(p => p.location).filter(Boolean))].sort();
    
    // Extract unique property types
    const propertyTypes = [...new Set(projects.map(p => p.project_type).filter(Boolean))].sort();
    
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
    const max = Math.max(...prices);
    
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

    setFilteredProjects(filtered);
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setSearchResults('projects');
    } else {
      setSearchResults('developers');
    }
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

  const getFilterKey = (label: string): string => {
    switch (label) {
      case 'Location': return 'location';
      case 'Type': return 'property_type';
      case 'Price Range': return 'price_range';
      case 'Bedrooms': return 'bedrooms';
      case 'Status': return 'project_status';
      default: return '';
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults('developers');
    setFilters({
      location: '',
      property_type: '',
      price_range: '',
      bedrooms: '',
      bathrooms: '',
      project_status: ''
    });
    setActiveDropdown(null);
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

  const getAvailabilityBadgeVariant = (status: string) => {
    switch (status) {
      case 'Available': return 'success';
      case 'Few Units Left': return 'warning';
      case 'Sold Out': return 'danger';
      default: return 'success';
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#F8F9F9', 
      display: 'flex', 
      flexDirection: 'column',
      fontFamily: 'Montserrat, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Hero Section - Premium Design */}
      <div style={{
        backgroundColor: '#F8F9F9',
        padding: '60px 20px 40px 20px',
        textAlign: 'center'
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
          paddingBottom: '8px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          position: 'relative'
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
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '0',
                  right: '0',
                  backgroundColor: 'white',
                  border: '1px solid rgba(1, 106, 93, 0.15)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                  zIndex: 1000,
                  maxHeight: '200px',
                  overflowY: 'auto',
                  marginTop: '4px'
                }}>
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
            {searchResults === 'projects' ? (
              searchTerm ? `Search Results (${filteredProjects.length})` : 'All Projects'
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
            {searchResults === 'projects' ? (
              searchTerm ? `Found ${filteredProjects.length} projects matching "${searchTerm}"` : 'Browse all available projects'
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
            {searchResults === 'projects' ? (
              filteredProjects.length === 0 ? (
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
                    No Projects Found
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: '#777777',
                    marginBottom: '20px',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    {searchTerm ? `No projects match "${searchTerm}"` : 'No projects available'}
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
              // Project Cards
              filteredProjects.map((project) => (
                <div
                  key={project.id}
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
                  onClick={() => navigate(`/mobile/agent/project/${project.id}`)}
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
                  {/* Status Badge */}
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
                    backgroundColor: project.status === 'published' ? '#E8F5E8' : '#FFF3CD',
                    color: project.status === 'published' ? '#016A5D' : '#856404',
                    border: `1px solid ${project.status === 'published' ? 'rgba(1, 106, 93, 0.2)' : 'rgba(133, 100, 4, 0.2)'}`,
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    {project.status}
                  </div>

                  {/* Project Type Icon */}
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
                    <Building size={24} />
                  </div>

                  {/* Project Name */}
                  <h3 style={{
                    fontSize: '22px',
                    fontWeight: '700',
                    color: '#333333',
                    margin: '0 0 8px 0',
                    lineHeight: '1.3',
                    paddingTop: '12px',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    {project.name}
                  </h3>

                  {/* Developer Name */}
                  <p style={{
                    fontSize: '14px',
                    color: '#016A5D',
                    margin: '0 0 12px 0',
                    fontWeight: '600',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    {project.developer_name || 'Developer'}
                  </p>

                  {/* Location */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px'
                  }}>
                    <MapPin size={16} color="#777777" />
                    <span style={{
                      fontSize: '14px',
                      color: '#777777',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      {project.location}
                    </span>
                  </div>

                  {/* Starting Price */}
                  {project.starting_price && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '16px'
                    }}>
                      <DollarSign size={16} color="#016A5D" />
                      <span style={{
                        fontSize: '16px',
                        color: '#016A5D',
                        fontWeight: '600',
                        fontFamily: 'Montserrat, sans-serif'
                      }}>
                        Starting from AED {project.starting_price.toLocaleString()}K
                      </span>
                    </div>
                  )}

                  {/* Project Type */}
                  {project.project_type && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '16px'
                    }}>
                      <Building size={16} color="#777777" />
                      <span style={{
                        fontSize: '14px',
                        color: '#777777',
                        fontFamily: 'Montserrat, sans-serif'
                      }}>
                        {project.project_type}
                      </span>
                    </div>
                  )}

                  {/* View Details Button */}
                  <button style={{
                    width: '100%',
                    padding: '12px 20px',
                    backgroundColor: '#016A5D',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    View Details
                  </button>
                </div>
              ))
              )
            ) : (
              // Developer Cards
              developers.map((developer) => (
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
