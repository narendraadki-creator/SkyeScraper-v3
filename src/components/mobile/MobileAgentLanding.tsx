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

  useEffect(() => {
    loadDevelopers();
  }, []);

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

  const handleSearch = () => {
    // Filter developers based on search term and filters
    loadDevelopers();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
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
          </div>
        </div>

        {/* Filter Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          paddingBottom: '8px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          {[
            { icon: MapPin, label: 'Location' },
            { icon: Building, label: 'Type' },
            { icon: DollarSign, label: 'Price Range' },
            { icon: Home, label: 'Bedrooms' },
            { icon: Calendar, label: 'Status' }
          ].map((filter, index) => (
            <button
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                background: 'white',
                border: '1px solid rgba(1, 106, 93, 0.15)',
                borderRadius: '8px',
                color: '#333333',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                boxShadow: '0 1px 8px rgba(0, 0, 0, 0.05)',
                fontFamily: 'Montserrat, sans-serif'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#016A5D';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(1, 106, 93, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(1, 106, 93, 0.15)';
                e.currentTarget.style.boxShadow = '0 1px 8px rgba(0, 0, 0, 0.05)';
              }}
            >
              <filter.icon size={16} color="#016A5D" />
              {filter.label}
              <ChevronDown size={14} color="#777777" />
            </button>
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
            Featured Developers
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#777777',
            margin: '0',
            fontWeight: '300',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            Discover properties from India's leading developers
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
          /* Developer Cards Grid - Premium Design */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            margin: '0 auto'
          }}>
            {developers.map((developer) => (
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
            ))}
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
