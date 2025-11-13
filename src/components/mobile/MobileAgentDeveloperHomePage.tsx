import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { projectService } from '../../services/projectService';
// import { MobileLayout } from './MobileLayout'; // REMOVED - using RoleBasedBottomNavigation instead
import { RoleBasedBottomNavigation } from './RoleBasedBottomNavigation';
import type { Project } from '../../types/project';
import { 
  ArrowLeft,
  MapPin,
  Building,
  Calendar
} from 'lucide-react';

interface DeveloperInfo {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  address?: string;
  projects_count: number;
  min_starting_price?: number;
}

export const MobileAgentDeveloperHomePage: React.FC = () => {
  const { developerId } = useParams<{ developerId: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [developer, setDeveloper] = useState<DeveloperInfo | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('name');

  useEffect(() => {
    if (developerId) {
      loadDeveloperData();
    }
  }, [developerId]);

  const loadDeveloperData = async () => {
    setLoading(true);
    try {
      console.log('Loading developer data for ID:', developerId);
      
      // Import supabase to get developer info
      const { supabase } = await import('../../lib/supabase');
      
      // Get developer organization info
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', developerId)
        .eq('type', 'developer')
        .single();

      if (orgError || !organization) {
        console.error('Developer not found:', orgError);
        navigate('/mobile/developer');
        return;
      }

      console.log('Developer organization:', organization);

      // Get all published projects
      const allProjects = await projectService.listProjects({ status: 'published' });
      console.log('All projects:', allProjects);

      // Filter projects for this developer
      const developerProjects = allProjects.filter(project => project.organization_id === developerId);
      console.log('Developer projects:', developerProjects);

      // Calculate developer stats
      const projects_count = developerProjects.length;
      const prices = developerProjects
        .map(p => p.starting_price)
        .filter(price => price && price > 0);
      const min_starting_price = prices.length > 0 ? Math.min(...prices) : undefined;

      const developerInfo: DeveloperInfo = {
        id: organization.id,
        name: organization.name,
        description: organization.description,
        logo_url: organization.logo_url,
        address: organization.address,
        projects_count,
        min_starting_price
      };

      setDeveloper(developerInfo);
      setProjects(developerProjects);
    } catch (error) {
      console.error('Failed to load developer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/mobile/agent');
  };

  const handleProjectClick = (project: Project) => {
    navigate(`/mobile/agent/project/${project.id}`);
  };

  const handleCreateLead = (project: Project) => {
    navigate(`/mobile/agent/leads/create/${project.id}`);
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

  const getProjectStatus = (project: Project) => {
    if (project.completion_date) {
      const completionDate = new Date(project.completion_date);
      const now = new Date();
      if (completionDate <= now) {
        return 'Ready to Move';
      } else {
        return 'Under Construction';
      }
    }
    return 'Launching Soon';
  };

  const getAvailabilityStatus = (project: Project) => {
    const totalUnits = project.total_units || 0;
    const leadsCount = project.leads_count || 0;
    
    if (totalUnits === 0) return 'Available';
    if (leadsCount >= totalUnits * 0.8) return 'Few Units Left';
    if (leadsCount >= totalUnits * 0.5) return 'Available';
    return 'Available';
  };

  const sortProjects = (projects: Project[], sortBy: string) => {
    const sorted = [...projects];
    switch (sortBy) {
      case 'price':
        return sorted.sort((a, b) => (a.starting_price || 0) - (b.starting_price || 0));
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'completion':
        return sorted.sort((a, b) => {
          if (!a.completion_date && !b.completion_date) return 0;
          if (!a.completion_date) return 1;
          if (!b.completion_date) return -1;
          return new Date(a.completion_date).getTime() - new Date(b.completion_date).getTime();
        });
      default:
        return sorted;
    }
  };

  if (loading) {
    return (
      <div className="mobile-app">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px',
          color: 'var(--gray-600)'
        }}>
          Loading developer projects...
        </div>
      </div>
    );
  }

  if (!developer) {
    return (
      <div className="mobile-app">
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px',
          color: 'var(--gray-600)'
        }}>
          <div>Developer not found</div>
          <button 
            onClick={handleBack}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              backgroundColor: 'var(--primary-500)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const sortedProjects = sortProjects(projects, sortBy);
  const primaryLocation = developer.address || 'Various Locations';

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#F8F9F9',
      fontFamily: 'Montserrat, sans-serif',
      paddingBottom: '80px' // Add padding for Agent Layout bottom navigation
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#F8F9F9',
        padding: '60px 20px 40px 20px',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Back Button */}
        <button
          onClick={handleBack}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            backgroundColor: 'white',
            border: '1px solid rgba(1, 106, 93, 0.15)',
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 8px rgba(0, 0, 0, 0.05)'
          }}
        >
          <ArrowLeft size={20} color="#016A5D" />
        </button>

        {/* Developer Logo */}
        <div style={{
          width: '100px',
          height: '100px',
          backgroundColor: '#F0F9F8',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          border: '2px solid rgba(1, 106, 93, 0.15)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          {developer.logo_url ? (
            <img 
              src={developer.logo_url} 
              alt={developer.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
            />
          ) : (
            <Building size={40} color="#016A5D" />
          )}
        </div>

        {/* Developer Name */}
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#333333',
          margin: '0 0 12px 0',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          {developer.name}
        </h1>

        {/* Developer Description */}
        <p style={{
          fontSize: '16px',
          color: '#777777',
          fontWeight: '300',
          margin: '0 0 24px 0',
          fontFamily: 'Montserrat, sans-serif',
          lineHeight: '1.5'
        }}>
          {developer.description || `${developer.projects_count} Premium Properties in ${primaryLocation}`}
        </p>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          maxWidth: '300px',
          margin: '0 auto'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid rgba(1, 106, 93, 0.1)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#016A5D',
              marginBottom: '4px'
            }}>
              {developer.projects_count}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#777777',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Projects
            </div>
          </div>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid rgba(1, 106, 93, 0.1)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#016A5D',
              marginBottom: '4px'
            }}>
              {developer.min_starting_price ? formatCurrency(developer.min_starting_price) : 'N/A'}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#777777',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Starting Price
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        padding: '0 20px 100px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Sort Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          border: '1px solid rgba(1, 106, 93, 0.1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#333333',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            Sort by:
          </span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '12px 16px',
              border: '1px solid rgba(1, 106, 93, 0.15)',
              borderRadius: '8px',
              backgroundColor: 'white',
              fontSize: '14px',
              color: '#333333',
              cursor: 'pointer',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: '500',
              boxShadow: '0 1px 8px rgba(0, 0, 0, 0.05)'
            }}
          >
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="completion">Completion Date</option>
          </select>
        </div>

        {/* Projects List */}
        {sortedProjects.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid rgba(1, 106, 93, 0.1)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <Building size={64} color="#777777" style={{ marginBottom: '20px' }} />
            <h3 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              marginBottom: '12px',
              color: '#333333',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              No Projects Found
            </h3>
            <p style={{ 
              fontSize: '16px',
              color: '#777777',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: '300'
            }}>
              This developer doesn't have any published projects yet.
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '24px' 
          }}>
            {sortedProjects.map((project) => (
              <div 
                key={project.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(1, 106, 93, 0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: 'Montserrat, sans-serif'
                }}
                onClick={() => handleProjectClick(project)}
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
                {/* Project Image Placeholder */}
                <div style={{
                  height: '200px',
                  backgroundColor: '#F0F9F8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  borderBottom: '1px solid rgba(1, 106, 93, 0.1)'
                }}>
                  <Building size={48} color="#016A5D" />
                  {project.starting_price && (
                    <div style={{
                      position: 'absolute',
                      bottom: '16px',
                      left: '16px',
                      backgroundColor: '#016A5D',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      {formatCurrency(project.starting_price)}
                    </div>
                  )}
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    backgroundColor: getAvailabilityStatus(project) === 'Few Units Left' ? '#CBA135' : '#016A5D',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    {getAvailabilityStatus(project)}
                  </div>
                </div>

                {/* Project Details */}
                <div style={{ padding: '24px' }}>
                  <h3 style={{ 
                    fontSize: '22px', 
                    fontWeight: '700', 
                    color: '#333333',
                    margin: '0 0 8px 0',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    {project.name}
                  </h3>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#777777',
                    margin: '0 0 16px 0',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: '300'
                  }}>
                    by {developer.name}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                    {/* Location */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={16} color="#016A5D" />
                      <span style={{ fontSize: '14px', color: '#333333', fontWeight: '500' }}>
                        {project.location}
                      </span>
                    </div>

                    {/* Configuration */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Bed size={16} color="#016A5D" />
                        <span style={{ fontSize: '14px', color: '#333333', fontWeight: '500' }}>
                          {project.project_type || 'Various'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building size={16} color="#016A5D" />
                        <span style={{ fontSize: '14px', color: '#333333', fontWeight: '500' }}>
                          {project.total_units || 'N/A'} Units
                        </span>
                      </div>
                    </div>

                    {/* Possession Date */}
                    {project.completion_date && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={16} color="#016A5D" />
                        <span style={{ fontSize: '14px', color: '#333333', fontWeight: '500' }}>
                          {formatDate(project.completion_date)}
                        </span>
                      </div>
                    )}

                    {/* Status */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        backgroundColor: '#E8F5E8',
                        color: '#016A5D',
                        border: '1px solid rgba(1, 106, 93, 0.2)',
                        padding: '6px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontFamily: 'Montserrat, sans-serif'
                      }}>
                        {getProjectStatus(project)}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{
                    display: 'flex',
                    gap: '12px'
                  }}>
                    <button 
                      style={{
                        flex: 1,
                        padding: '14px',
                        backgroundColor: '#016A5D',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontFamily: 'Montserrat, sans-serif',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProjectClick(project);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#014A42';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#016A5D';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      View Details
                    </button>
                    <button 
                      style={{
                        flex: 1,
                        padding: '14px',
                        backgroundColor: '#CBA135',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontFamily: 'Montserrat, sans-serif',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateLead(project);
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#A68B2A';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#CBA135';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      Create Lead
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Role-Based Bottom Navigation */}
      <RoleBasedBottomNavigation />
    </div>
  );
};
