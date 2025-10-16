import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leadService } from '../../services/leadService';
// import { MobileLayout } from './MobileLayout'; // REMOVED - using RoleBasedBottomNavigation instead
import { RoleBasedBottomNavigation } from './RoleBasedBottomNavigation';
import type { Lead, LeadFilters, LeadStatus, LeadStage } from '../../types/lead';
import { 
  Search, 
  Filter,
  Phone,
  Mail,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  Target,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Building,
  Home,
  Settings
} from 'lucide-react';

interface MobileLeadsPageProps {
  className?: string;
}

export const MobileLeadsPage: React.FC<MobileLeadsPageProps> = () => {
  const navigate = useNavigate();
  const [leadsWithProjects, setLeadsWithProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<LeadFilters>({ status: 'all' as any });
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    negotiation: 0,
    won: 0,
    lost: 0,
    thisMonth: 0
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
      const leadsData = leadsResponse.leads || [];

      // Load project information for leads that have project_id
      const { supabase } = await import('../../lib/supabase');
      const leadsWithProjectData = await Promise.all(
        leadsData.map(async (lead) => {
          if (lead.project_id) {
            try {
              const { data: projectData, error: projectError } = await supabase
                .from('projects')
                .select('name, location, developer_name')
                .eq('id', lead.project_id)
                .single();

              if (projectError) {
                console.error('Error loading project for lead:', lead.id, projectError);
                return { ...lead, project: null };
              } else {
                return { ...lead, project: projectData };
              }
            } catch (error) {
              console.error('Failed to load project for lead:', lead.id, error);
              return { ...lead, project: null };
            }
          } else {
            return { ...lead, project: null };
          }
        })
      );

      setLeadsWithProjects(leadsWithProjectData);
    } catch (error) {
      console.error('Failed to load leads:', error);
      setError('Failed to load leads. Please try again.');
      setLeadsWithProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const allLeadsResponse = await leadService.getLeads({});
      const allLeads = allLeadsResponse.leads || [];
      const thisMonth = new Date();
      thisMonth.setDate(1);
      
      // Get all unique statuses to ensure we count all leads
      const allStatuses = [...new Set(allLeads.map(lead => lead.status))];
      console.log('All lead statuses found:', allStatuses);
      
      const statsData = {
        total: allLeads.length,
        new: allLeads.filter(lead => lead.status === 'new').length,
        contacted: allLeads.filter(lead => lead.status === 'contacted').length,
        qualified: allLeads.filter(lead => lead.status === 'qualified').length,
        negotiation: allLeads.filter(lead => lead.status === 'negotiation').length,
        won: allLeads.filter(lead => lead.status === 'won').length,
        lost: allLeads.filter(lead => lead.status === 'lost').length,
        thisMonth: allLeads.filter(lead => new Date(lead.created_at) >= thisMonth).length
      };
      
      console.log('Lead stats breakdown:', statsData);
      
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
      setStats({
        total: 0,
        new: 0,
        contacted: 0,
        qualified: 0,
        negotiation: 0,
        won: 0,
        lost: 0,
        thisMonth: 0
      });
    }
  };

  const handleLeadClick = (lead: Lead) => {
    navigate(`/mobile/leads/${lead.id}`);
  };

  const handleStatusClick = (status: LeadStatus | 'all') => {
    // Toggle the status filter - if already selected, clear it
    if (filters.status === status) {
      setFilters(prev => ({ ...prev, status: undefined }));
    } else {
      setFilters(prev => ({ ...prev, status: status === 'all' ? undefined : status }));
    }
  };

  const getStatusIcon = (status: LeadStatus) => {
    switch (status) {
      case 'new':
        return <Clock size={16} color="var(--blue-500)" />;
      case 'contacted':
        return <CheckCircle size={16} color="var(--green-500)" />;
      case 'qualified':
        return <Target size={16} color="var(--purple-500)" />;
      case 'negotiation':
        return <AlertCircle size={16} color="var(--orange-500)" />;
      case 'won':
        return <CheckCircle size={16} color="var(--green-600)" />;
      case 'lost':
        return <XCircle size={16} color="var(--red-500)" />;
      default:
        return <Clock size={16} color="var(--gray-500)" />;
    }
  };

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'new':
        return 'var(--blue-100)';
      case 'contacted':
        return 'var(--green-100)';
      case 'qualified':
        return 'var(--purple-100)';
      case 'negotiation':
        return 'var(--orange-100)';
      case 'won':
        return 'var(--green-100)';
      case 'lost':
        return 'var(--red-100)';
      default:
        return 'var(--gray-100)';
    }
  };

  const getStatusTextColor = (status: LeadStatus) => {
    switch (status) {
      case 'new':
        return 'var(--blue-700)';
      case 'contacted':
        return 'var(--green-700)';
      case 'qualified':
        return 'var(--purple-700)';
      case 'negotiation':
        return 'var(--orange-700)';
      case 'won':
        return 'var(--green-700)';
      case 'lost':
        return 'var(--red-700)';
      default:
        return 'var(--gray-700)';
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1_000_000) {
      return new Intl.NumberFormat('en-AE', {
        style: 'currency',
        currency: 'AED',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }).format(amount / 1_000_000) + 'M';
    }
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AE', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredLeads = (leadsWithProjects || []).filter(lead => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const matches = (
      lead.first_name.toLowerCase().includes(searchLower) ||
      lead.last_name.toLowerCase().includes(searchLower) ||
      lead.email?.toLowerCase().includes(searchLower) ||
      lead.phone.includes(searchTerm) ||
      lead.project?.name?.toLowerCase().includes(searchLower)
    );
    console.log(`Searching for "${searchTerm}" in lead ${lead.first_name} ${lead.last_name}:`, matches);
    return matches;
  });

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8F9F9',
      fontFamily: 'Montserrat, sans-serif',
      paddingBottom: '80px' // Space for bottom navigation
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#F8F9F9',
        padding: '60px 20px 40px 20px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#333333',
          margin: '0 0 8px 0',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          Leads Management
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#777777',
          fontWeight: '300',
          margin: '0 0 24px 0',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          {stats.total} Total Leads • {stats.thisMonth} This Month
        </p>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        padding: '0 20px 100px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid rgba(1, 106, 93, 0.1)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <Users size={24} color="#016A5D" />
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#016A5D', marginBottom: '8px' }}>
              {stats.total}
            </div>
            <div style={{ fontSize: '14px', color: '#777777', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Leads
            </div>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid rgba(1, 106, 93, 0.1)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <TrendingUp size={24} color="#CBA135" />
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#CBA135', marginBottom: '8px' }}>
              {stats.thisMonth}
            </div>
            <div style={{ fontSize: '14px', color: '#777777', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              This Month
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid rgba(1, 106, 93, 0.1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          marginBottom: '24px'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            marginBottom: '16px', 
            color: '#333333',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            Lead Status Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* All Status */}
            <div 
              onClick={() => handleStatusClick('all')}
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: !filters.status || filters.status === 'all' ? '#F0F9F8' : 'transparent',
                border: !filters.status || filters.status === 'all' ? '1px solid rgba(1, 106, 93, 0.2)' : '1px solid transparent',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!filters.status || filters.status !== 'all') {
                  e.currentTarget.style.backgroundColor = '#F8F9F9';
                  e.currentTarget.style.borderColor = 'rgba(1, 106, 93, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!filters.status || filters.status !== 'all') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Users size={16} color="#016A5D" />
                <span style={{ fontSize: '16px', color: '#333333', fontWeight: '500' }}>All</span>
              </div>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#016A5D' }}>{stats.total}</span>
            </div>

            {/* New Status */}
            <div 
              onClick={() => handleStatusClick('new')}
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: filters.status === 'new' ? '#F0F9F8' : 'transparent',
                border: filters.status === 'new' ? '1px solid rgba(1, 106, 93, 0.2)' : '1px solid transparent',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (filters.status !== 'new') {
                  e.currentTarget.style.backgroundColor = '#F8F9F9';
                  e.currentTarget.style.borderColor = 'rgba(1, 106, 93, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (filters.status !== 'new') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Clock size={16} color="#016A5D" />
                <span style={{ fontSize: '16px', color: '#333333', fontWeight: '500' }}>New</span>
              </div>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#016A5D' }}>{stats.new}</span>
            </div>
            <div 
              onClick={() => handleStatusClick('contacted')}
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: filters.status === 'contacted' ? '#F0F9F8' : 'transparent',
                border: filters.status === 'contacted' ? '1px solid rgba(1, 106, 93, 0.2)' : '1px solid transparent',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (filters.status !== 'contacted') {
                  e.currentTarget.style.backgroundColor = '#F8F9F9';
                  e.currentTarget.style.borderColor = 'rgba(1, 106, 93, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (filters.status !== 'contacted') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle size={16} color="#CBA135" />
                <span style={{ fontSize: '16px', color: '#333333', fontWeight: '500' }}>Contacted</span>
              </div>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#CBA135' }}>{stats.contacted}</span>
            </div>
            {stats.qualified > 0 && (
              <div 
                onClick={() => handleStatusClick('qualified')}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: filters.status === 'qualified' ? '#F0F9F8' : 'transparent',
                  border: filters.status === 'qualified' ? '1px solid rgba(1, 106, 93, 0.2)' : '1px solid transparent',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (filters.status !== 'qualified') {
                    e.currentTarget.style.backgroundColor = '#F8F9F9';
                    e.currentTarget.style.borderColor = 'rgba(1, 106, 93, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (filters.status !== 'qualified') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Target size={16} color="#016A5D" />
                  <span style={{ fontSize: '16px', color: '#333333', fontWeight: '500' }}>Qualified</span>
                </div>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#016A5D' }}>{stats.qualified}</span>
              </div>
            )}
            {stats.negotiation > 0 && (
              <div 
                onClick={() => handleStatusClick('negotiation')}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: filters.status === 'negotiation' ? '#F0F9F8' : 'transparent',
                  border: filters.status === 'negotiation' ? '1px solid rgba(1, 106, 93, 0.2)' : '1px solid transparent',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (filters.status !== 'negotiation') {
                    e.currentTarget.style.backgroundColor = '#F8F9F9';
                    e.currentTarget.style.borderColor = 'rgba(1, 106, 93, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (filters.status !== 'negotiation') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <AlertCircle size={16} color="#FF6B35" />
                  <span style={{ fontSize: '16px', color: '#333333', fontWeight: '500' }}>Negotiation</span>
                </div>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#FF6B35' }}>{stats.negotiation}</span>
              </div>
            )}
            {stats.won > 0 && (
              <div 
                onClick={() => handleStatusClick('won')}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: filters.status === 'won' ? '#F0F9F8' : 'transparent',
                  border: filters.status === 'won' ? '1px solid rgba(1, 106, 93, 0.2)' : '1px solid transparent',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (filters.status !== 'won') {
                    e.currentTarget.style.backgroundColor = '#F8F9F9';
                    e.currentTarget.style.borderColor = 'rgba(1, 106, 93, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (filters.status !== 'won') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CheckCircle size={16} color="#10B981" />
                  <span style={{ fontSize: '16px', color: '#333333', fontWeight: '500' }}>Won</span>
                </div>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#10B981' }}>{stats.won}</span>
              </div>
            )}
            {stats.lost > 0 && (
              <div 
                onClick={() => handleStatusClick('lost')}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: filters.status === 'lost' ? '#F0F9F8' : 'transparent',
                  border: filters.status === 'lost' ? '1px solid rgba(1, 106, 93, 0.2)' : '1px solid transparent',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (filters.status !== 'lost') {
                    e.currentTarget.style.backgroundColor = '#F8F9F9';
                    e.currentTarget.style.borderColor = 'rgba(1, 106, 93, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (filters.status !== 'lost') {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <XCircle size={16} color="#EF4444" />
                  <span style={{ fontSize: '16px', color: '#333333', fontWeight: '500' }}>Lost</span>
                </div>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#EF4444' }}>{stats.lost}</span>
              </div>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search 
                size={20} 
                color="#016A5D" 
                style={{ 
                  position: 'absolute', 
                  left: '16px', 
                  top: '50%', 
                  transform: 'translateY(-50%)' 
                }} 
              />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px 16px 16px 48px',
                  border: '1px solid rgba(1, 106, 93, 0.15)',
                  borderRadius: '12px',
                  fontSize: '16px',
                  backgroundColor: 'white',
                  outline: 'none',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: '400',
                  color: '#333333',
                  boxShadow: '0 2px 20px rgba(0, 0, 0, 0.08)'
                }}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: '16px',
                backgroundColor: showFilters ? '#016A5D' : 'white',
                color: showFilters ? 'white' : '#016A5D',
                border: '1px solid rgba(1, 106, 93, 0.15)',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 20px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.2s ease'
              }}
            >
              <Filter size={20} />
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid rgba(1, 106, 93, 0.1)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              marginBottom: '16px'
            }}>
              <h4 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                marginBottom: '16px', 
                color: '#333333',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Filters
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <select
                  value={filters.status || ''}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value as LeadStatus || undefined })}
                  style={{
                    padding: '12px 16px',
                    border: '1px solid rgba(1, 106, 93, 0.15)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: '500',
                    color: '#333333',
                    boxShadow: '0 1px 8px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>
                
                <select
                  value={filters.stage || ''}
                  onChange={(e) => setFilters({ ...filters, stage: e.target.value as LeadStage || undefined })}
                  style={{
                    padding: '12px 16px',
                    border: '1px solid rgba(1, 106, 93, 0.15)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: '500',
                    color: '#333333',
                    boxShadow: '0 1px 8px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <option value="">All Stages</option>
                  <option value="inquiry">Inquiry</option>
                  <option value="site_visit">Site Visit</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Leads List */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              color: '#333333',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Leads ({filteredLeads.length})
            </h3>
          </div>

          {loading ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              padding: '60px',
              fontSize: '18px',
              color: '#777777',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Loading leads...
            </div>
          ) : error ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid rgba(220, 38, 38, 0.2)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}>
              <AlertCircle size={64} color="#DC2626" style={{ marginBottom: '20px' }} />
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: '600', 
                marginBottom: '12px', 
                color: '#DC2626',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Error Loading Leads
              </h3>
              <p style={{ 
                fontSize: '16px', 
                color: '#DC2626', 
                marginBottom: '20px',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                {error}
              </p>
              <button
                onClick={() => {
                  setError(null);
                  loadLeads();
                }}
                style={{
                  backgroundColor: '#DC2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '14px 28px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: 'Montserrat, sans-serif',
                  transition: 'all 0.2s ease'
                }}
              >
                Try Again
              </button>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid rgba(1, 106, 93, 0.1)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}>
              <Users size={64} color="#777777" style={{ marginBottom: '20px' }} />
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: '600', 
                marginBottom: '12px', 
                color: '#333333',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                No Leads Found
              </h3>
              <p style={{ 
                fontSize: '16px', 
                color: '#777777',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                {searchTerm ? 'Try adjusting your search criteria' : 'No leads found'}
              </p>
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
                    padding: '24px',
                    border: '1px solid rgba(1, 106, 93, 0.1)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(1, 106, 93, 0.2)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(1, 106, 93, 0.15)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(1, 106, 93, 0.1)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        fontSize: '20px', 
                        fontWeight: '700', 
                        color: '#333333',
                        margin: '0 0 8px 0',
                        fontFamily: 'Montserrat, sans-serif'
                      }}>
                        {lead.first_name} {lead.last_name}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        {getStatusIcon(lead.status)}
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          padding: '6px 12px',
                          borderRadius: '16px',
                          backgroundColor: getStatusColor(lead.status),
                          color: getStatusTextColor(lead.status),
                          textTransform: 'capitalize',
                          fontFamily: 'Montserrat, sans-serif'
                        }}>
                          {lead.status}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={24} color="#016A5D" />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {lead.project && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Building size={16} color="#016A5D" />
                        <span style={{ fontSize: '16px', color: '#333333', fontWeight: '500' }}>
                          {lead.project.name}
                        </span>
                      </div>
                    )}
                    {lead.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Phone size={16} color="#016A5D" />
                        <span style={{ fontSize: '16px', color: '#333333', fontWeight: '500' }}>{lead.phone}</span>
                      </div>
                    )}
                    
                    {lead.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Mail size={16} color="#016A5D" />
                        <span style={{ fontSize: '16px', color: '#333333', fontWeight: '500' }}>{lead.email}</span>
                      </div>
                    )}

                    {(lead.budget_min || lead.budget_max) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <DollarSign size={16} color="#016A5D" />
                        <span style={{ fontSize: '16px', color: '#333333', fontWeight: '500' }}>
                          {lead.budget_min && lead.budget_max 
                            ? `${formatCurrency(lead.budget_min)} - ${formatCurrency(lead.budget_max)}`
                            : lead.budget_min 
                              ? `From ${formatCurrency(lead.budget_min)}`
                              : `Up to ${formatCurrency(lead.budget_max!)}`
                          }
                        </span>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Calendar size={16} color="#016A5D" />
                      <span style={{ fontSize: '16px', color: '#333333', fontWeight: '500' }}>
                        Created {formatDate(lead.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderTop: '1px solid rgba(1, 106, 93, 0.1)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)',
        zIndex: 1000
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          padding: '0 16px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          {[
            { id: 'home', label: 'Home', icon: Home, active: false },
            { id: 'leads', label: 'Leads', icon: Users, active: true },
            { id: 'promotions', label: 'Promotions', icon: TrendingUp, active: false },
            { id: 'settings', label: 'Settings', icon: Settings, active: false }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'home') navigate('/mobile/developer');
                  else if (item.id === 'leads') navigate('/mobile/leads');
                  else if (item.id === 'settings') navigate('/mobile/settings');
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: item.active ? 'rgba(1, 106, 93, 0.1)' : 'none',
                  color: item.active ? '#016A5D' : '#777777',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minWidth: '60px'
                }}
              >
                <Icon size={22} color={item.active ? '#016A5D' : '#777777'} />
                <span style={{
                  fontSize: '11px',
                  fontWeight: '500',
                  letterSpacing: '0.3px',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Role-Based Bottom Navigation */}
      <RoleBasedBottomNavigation />
    </div>
  );
};
