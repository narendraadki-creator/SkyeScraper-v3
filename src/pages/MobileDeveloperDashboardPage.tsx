import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { projectService } from '../services/projectService';
import { leadService } from '../services/leadService';
import { RoleBasedBottomNavigation } from '../components/mobile/RoleBasedBottomNavigation';
import { 
  Plus, 
  LogOut, 
  Building, 
  Users, 
  DollarSign,
  MapPin,
  ArrowRight
} from 'lucide-react';
import type { Project } from '../types/project';

const MobileDeveloperDashboardContent: React.FC = () => {
  const navigate = useNavigate();
  const { user, organizationId, role } = useAuth();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalUnits: 0,
    activeLeads: 0,
    totalRevenue: 0
  });

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load projects
        const projectsData = await projectService.listProjects();
        setProjects(projectsData || []);
        
        // Load leads
        const leadsResponse = await leadService.getLeads({});
        setLeads(leadsResponse.leads || []);
        
        // Calculate stats
        const totalProjects = projectsData?.length || 0;
        const totalUnits = projectsData?.reduce((sum, project) => sum + (project.total_units || 0), 0) || 0;
        const activeLeads = leadsResponse.leads?.length || 0;
        const totalRevenue = projectsData?.reduce((sum, project) => sum + (project.total_units || 0) * (project.starting_price || 0), 0) || 0;
        
        setStats({
          totalProjects,
          totalUnits,
          activeLeads,
          totalRevenue
        });
        
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (organizationId) {
      loadDashboardData();
    }
  }, [organizationId]);

  const handleSignOut = async () => {
    await import('../lib/supabase').then(({ supabase }) => supabase.auth.signOut());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return '#10B981';
      case 'draft':
        return '#F59E0B';
      case 'archived':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#F8F9F9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Montserrat, sans-serif',
        paddingBottom: '80px'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#333333'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #F0F9F8',
            borderTop: '4px solid #016A5D',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px auto'
          }}></div>
          <p style={{ fontSize: '16px', fontWeight: '500' }}>Loading Dashboard...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#F8F9F9',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Montserrat, sans-serif',
      paddingBottom: '80px'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#F8F9F9',
        padding: '20px',
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        {/* Left Side - Title Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start'
        }}>
          <h1 style={{
            fontSize: '12px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#016A5D',
            marginBottom: '8px',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            SKYESCRAPER
          </h1>
          
          {/* Gradient line */}
          <div style={{
            width: '80px',
            height: '2px',
            background: 'linear-gradient(90deg, #016A5D 0%, #CBA135 100%)',
            marginBottom: '8px'
          }} />
          
          <p style={{
            fontSize: '7px',
            color: '#777777',
            fontWeight: '300',
            letterSpacing: '0.05em',
            fontFamily: 'Montserrat, sans-serif',
            margin: 0
          }}>
            Developer Dashboard
          </p>
        </div>
        
        {/* Center - User Info Section */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '20px',
          transform: 'translateX(-50%)',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#333333',
            marginBottom: '4px',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            Welcome back, {user?.email?.split('@')[0] || 'User'}
          </p>
          <p style={{
            fontSize: '14px',
            color: '#777777',
            fontWeight: '400',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            {role || 'Developer'} - Project Manager
          </p>
        </div>
        
        {/* Right Side - Logout Button */}
        <button
          onClick={handleSignOut}
          style={{
            backgroundColor: 'white',
            border: '1px solid #DC2626',
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <LogOut size={16} color="#DC2626" />
        </button>
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        padding: '0 20px 100px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>

        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid rgba(1, 106, 93, 0.1)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#F0F9F8',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(1, 106, 93, 0.15)'
              }}>
                <Building size={20} color="#016A5D" />
              </div>
              <div>
                <p style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#777777',
                  marginBottom: '2px'
                }}>
                  Total Projects
                </p>
                <p style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#333333'
                }}>
                  {stats.totalProjects}
                </p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid rgba(1, 106, 93, 0.1)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#F0F9F8',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(1, 106, 93, 0.15)'
              }}>
                <Users size={20} color="#016A5D" />
              </div>
              <div>
                <p style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#777777',
                  marginBottom: '2px'
                }}>
                  Total Units
                </p>
                <p style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#333333'
                }}>
                  {stats.totalUnits}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Create New Project Button */}
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => navigate('/projects/create')}
            style={{
              width: '100%',
              padding: '16px 20px',
              backgroundColor: '#016A5D',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#014A42';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#016A5D';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Plus size={20} />
            Create New Project
          </button>
        </div>

        {/* Featured Projects */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid rgba(1, 106, 93, 0.1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#333333'
            }}>
              Featured Projects
            </h3>
            <button
              onClick={() => navigate('/projects')}
              style={{
                padding: '6px 12px',
                backgroundColor: '#016A5D',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#014A42';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#016A5D';
              }}
            >
              View All
              <ArrowRight size={12} />
            </button>
          </div>
          
          {projects.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '32px 16px',
              color: '#777777'
            }}>
              <Building size={40} color="#E5E7EB" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
                No projects yet
              </p>
              <p style={{ fontSize: '12px', marginBottom: '16px' }}>
                Create your first project to get started
              </p>
              <button
                onClick={() => navigate('/projects/create')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#016A5D',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  margin: '0 auto',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#014A42';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#016A5D';
                }}
              >
                <Plus size={14} />
                Create Project
              </button>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '16px' 
            }}>
              {projects.map((project) => (
                <div
                  key={project.id}
                  style={{
                    padding: '16px',
                    backgroundColor: '#F8F9F9',
                    borderRadius: '12px',
                    border: '1px solid rgba(1, 106, 93, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => navigate(`/mobile/dev/project/${project.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F0F9F8';
                    e.currentTarget.style.borderColor = 'rgba(1, 106, 93, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8F9F9';
                    e.currentTarget.style.borderColor = 'rgba(1, 106, 93, 0.1)';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#333333',
                      margin: 0,
                      lineHeight: '1.3'
                    }}>
                      {project.name}
                    </h4>
                    <div style={{
                      padding: '2px 6px',
                      backgroundColor: getStatusColor(project.status),
                      color: 'white',
                      borderRadius: '6px',
                      fontSize: '10px',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      flexShrink: 0,
                      marginLeft: '8px'
                    }}>
                      {project.status}
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontSize: '12px',
                    color: '#777777'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {project.location}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <DollarSign size={12} />
                      {formatCurrency(project.starting_price || 0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>


        {/* Recent Activity */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid rgba(1, 106, 93, 0.1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#333333',
            marginBottom: '20px'
          }}>
            Recent Activity
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              backgroundColor: '#F8F9F9',
              borderRadius: '12px',
              border: '1px solid rgba(1, 106, 93, 0.1)'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#016A5D',
                borderRadius: '50%'
              }}></div>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#333333',
                  margin: '0 0 2px 0'
                }}>
                  Account created successfully
                </p>
                <p style={{
                  fontSize: '10px',
                  color: '#777777',
                  margin: 0
                }}>
                  Just now
                </p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              backgroundColor: '#F8F9F9',
              borderRadius: '12px',
              border: '1px solid rgba(1, 106, 93, 0.1)'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#10B981',
                borderRadius: '50%'
              }}></div>
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#333333',
                  margin: '0 0 2px 0'
                }}>
                  Organization activated
                </p>
                <p style={{
                  fontSize: '10px',
                  color: '#777777',
                  margin: 0
                }}>
                  Just now
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role-Based Bottom Navigation */}
      <RoleBasedBottomNavigation />
    </div>
  );
};

export const MobileDeveloperDashboardPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <MobileDeveloperDashboardContent />
    </ProtectedRoute>
  );
};
