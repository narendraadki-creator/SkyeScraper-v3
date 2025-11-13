import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { leadService } from '../../services/leadService';
import { RoleBasedBottomNavigation } from './RoleBasedBottomNavigation';
import type { Lead, LeadFilters, LeadStatus, LeadStage } from '../../types/lead';
import {
  Search,
  Filter,
  Plus,
  User,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Calendar,
  Eye,
  Edit,
  Trash2,
  ArrowLeft,
  Home,
  Gift,
  Settings
} from 'lucide-react';

interface MobileDeveloperLeadsPageProps {
  className?: string;
}

export const MobileDeveloperLeadsPage: React.FC<MobileDeveloperLeadsPageProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<LeadFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState<{
    total: number;
    byStatus: Record<string, number>;
    byStage: Record<string, number>;
    thisMonth: number;
    conversionRate: number;
  }>({
    total: 0,
    byStatus: {},
    byStage: {},
    thisMonth: 0,
    conversionRate: 0
  });

  useEffect(() => {
    loadLeads();
    loadStats();
  }, [filters]);

  const loadLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const leadsResponse = await leadService.getLeads(filters);
      console.log('Leads response:', leadsResponse);
      console.log('Leads array:', leadsResponse.leads);
      setLeads(leadsResponse.leads || []);
    } catch (error) {
      console.error('Failed to load leads:', error);
      setError('Failed to load leads. Please try again.');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsResponse = await leadService.getLeadStats();
      setStats(statsResponse);
    } catch (error) {
      console.error('Failed to load lead stats:', error);
    }
  };

  const handleBack = () => {
    navigate('/mobile/dev');
  };

  const handleLeadClick = (lead: Lead) => {
    navigate(`/mobile/dev/leads/${lead.id}`);
  };

  const handleCreateLead = () => {
    // Navigate to a project selection page or default project
    navigate('/mobile/dev/projects');
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      await leadService.updateLead(leadId, { status: newStatus });
      setLeads(prev => prev.map(lead => 
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      ));
    } catch (error) {
      console.error('Failed to update lead status:', error);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await leadService.deleteLead(leadId);
        setLeads(prev => prev.filter(lead => lead.id !== leadId));
      } catch (error) {
        console.error('Failed to delete lead:', error);
      }
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      lead.first_name?.toLowerCase().includes(searchLower) ||
      lead.last_name?.toLowerCase().includes(searchLower) ||
      lead.email?.toLowerCase().includes(searchLower) ||
      lead.phone?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'new': return '#3B82F6';
      case 'contacted': return '#F59E0B';
      case 'qualified': return '#10B981';
      case 'negotiation': return '#8B5CF6';
      case 'won': return '#10B981';
      case 'lost': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8F9F9',
      fontFamily: 'Montserrat, sans-serif',
      paddingBottom: '80px'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #016A5D 0%, #014D43 100%)',
        padding: '20px',
        color: 'white',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <button
            onClick={handleBack}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px',
              marginRight: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowLeft size={20} color="white" />
          </button>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              margin: 0,
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Lead Management
            </h1>
            <p style={{
              fontSize: '14px',
              margin: '4px 0 0 0',
              opacity: 0.9,
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Manage all project leads
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '8px',
            padding: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>{stats.total}</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>Total Leads</div>
          </div>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '8px',
            padding: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', fontWeight: '700' }}>{stats.new}</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>New This Month</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div style={{ padding: '20px' }}>
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={20} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#777777'
            }} />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 44px',
                border: '1px solid rgba(1, 106, 93, 0.2)',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: 'Montserrat, sans-serif',
                backgroundColor: 'white'
              }}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: '12px',
              backgroundColor: showFilters ? '#016A5D' : 'white',
              color: showFilters ? 'white' : '#016A5D',
              border: '1px solid #016A5D',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Filter size={20} />
          </button>
        </div>

        {/* Create Lead Button */}
        <button
          onClick={handleCreateLead}
          style={{
            width: '100%',
            backgroundColor: '#016A5D',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '20px',
            fontFamily: 'Montserrat, sans-serif'
          }}
        >
          <Plus size={20} />
          Create New Lead
        </button>

        {/* Leads List */}
        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#777777',
            fontSize: '16px'
          }}>
            Loading leads...
          </div>
        ) : error ? (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center',
            color: '#DC2626'
          }}>
            {error}
          </div>
        ) : filteredLeads.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#777777'
          }}>
            <User size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              No leads found
            </div>
            <div style={{ fontSize: '14px' }}>
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first lead to get started'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => handleLeadClick(lead)}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid rgba(1, 106, 93, 0.1)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#333333',
                      margin: 0,
                      marginBottom: '4px',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      {lead.first_name} {lead.last_name}
                    </h3>
                    <div style={{
                      fontSize: '12px',
                      color: '#777777',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      {formatDate(lead.created_at)}
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: getStatusColor(lead.status),
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    {lead.status}
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  {lead.phone && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '4px',
                      fontSize: '14px',
                      color: '#555555'
                    }}>
                      <Phone size={14} />
                      <span style={{ fontFamily: 'Montserrat, sans-serif' }}>{lead.phone}</span>
                    </div>
                  )}
                  {lead.email && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '4px',
                      fontSize: '14px',
                      color: '#555555'
                    }}>
                      <Mail size={14} />
                      <span style={{ fontFamily: 'Montserrat, sans-serif' }}>{lead.email}</span>
                    </div>
                  )}
                </div>

                {lead.budget_min && lead.budget_max && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    color: '#555555',
                    marginBottom: '8px'
                  }}>
                    <DollarSign size={14} />
                    <span style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {lead.budget_min.toLocaleString()} - {lead.budget_max.toLocaleString()} AED
                    </span>
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(1, 106, 93, 0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    color: '#777777'
                  }}>
                    <Eye size={14} />
                    <span style={{ fontFamily: 'Montserrat, sans-serif' }}>View Details</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '8px'
                  }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(lead.id, 'contacted');
                      }}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: 'rgba(1, 106, 93, 0.1)',
                        color: '#016A5D',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        fontFamily: 'Montserrat, sans-serif'
                      }}
                    >
                      Contact
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLead(lead.id);
                      }}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: '#DC2626',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        fontFamily: 'Montserrat, sans-serif'
                      }}
                    >
                      Delete
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
