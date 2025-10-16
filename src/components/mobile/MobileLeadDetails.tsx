import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { leadService } from '../../services/leadService';
// import { MobileLayout } from './MobileLayout'; // REMOVED - using RoleBasedBottomNavigation instead
import { RoleBasedBottomNavigation } from './RoleBasedBottomNavigation';
import type { Lead, UpdateLeadData, LeadStatus, LeadStage } from '../../types/lead';
import { 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Edit,
  Save,
  X,
  Building,
  Target,
  TrendingUp,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowLeft
} from 'lucide-react';

interface MobileLeadDetailsProps {
  className?: string;
}

export const MobileLeadDetails: React.FC<MobileLeadDetailsProps> = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updateData, setUpdateData] = useState<UpdateLeadData>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (leadId) {
      loadLead();
    }
  }, [leadId]);

  const loadLead = async () => {
    setLoading(true);
    setError(null);
    try {
      const leadData = await leadService.getLead(leadId!);
      setLead(leadData);
      setUpdateData({
        first_name: leadData.first_name,
        last_name: leadData.last_name,
        email: leadData.email,
        phone: leadData.phone,
        status: leadData.status,
        stage: leadData.stage,
        budget_min: leadData.budget_min,
        budget_max: leadData.budget_max,
        preferred_location: leadData.preferred_location,
        requirements: leadData.requirements,
        notes: leadData.notes,
        next_followup: leadData.next_followup
      });

      // Load project information if project_id exists
      if (leadData.project_id) {
        try {
          const { supabase } = await import('../../lib/supabase');
          const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', leadData.project_id)
            .single();

          if (projectError) {
            console.error('Error loading project:', projectError);
          } else {
            setProject(projectData);
            console.log('Project loaded:', projectData);
          }
        } catch (projectError) {
          console.error('Failed to load project:', projectError);
        }
      }
    } catch (error) {
      console.error('Failed to load lead:', error);
      setError('Failed to load lead details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = () => {
    if (project && lead?.project_id) {
      // Navigate to the project details page based on user role
      if (role === 'agent') {
        navigate(`/mobile/agent/project/${lead.project_id}`);
      } else if (role === 'developer') {
        navigate(`/mobile/dev/project/${lead.project_id}`);
      } else {
        // Default to agent route
        navigate(`/mobile/agent/project/${lead.project_id}`);
      }
    }
  };

  const handleSave = async () => {
    if (!lead) return;
    
    console.log('Saving lead with data:', updateData);
    setSaving(true);
    setError(null);
    try {
      const updatedLead = await leadService.updateLead(lead.id, updateData);
      console.log('Lead updated successfully:', updatedLead);
      setLead(updatedLead);
      setEditing(false);
    } catch (error) {
      console.error('Failed to update lead:', error);
      setError('Failed to update lead. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (lead) {
      setUpdateData({
        first_name: lead.first_name,
        last_name: lead.last_name,
        email: lead.email,
        phone: lead.phone,
        status: lead.status,
        stage: lead.stage,
        budget_min: lead.budget_min,
        budget_max: lead.budget_max,
        preferred_location: lead.preferred_location,
        requirements: lead.requirements,
        notes: lead.notes,
        next_followup: lead.next_followup
      });
    }
    setEditing(false);
    setError(null);
  };

  const handleBack = () => {
    navigate('/mobile/leads');
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
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
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
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          position: 'relative'
        }}>
          <button
            onClick={handleBack}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px',
              position: 'absolute',
              left: '20px',
              top: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowLeft size={20} color="white" />
          </button>
          <div style={{ textAlign: 'center', paddingTop: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Lead Details</h1>
            <p style={{ fontSize: '14px', margin: '4px 0 0 0', opacity: 0.9 }}>Loading...</p>
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          fontSize: '16px',
          color: 'var(--gray-600)'
        }}>
          Loading lead details...
        </div>
        
        <RoleBasedBottomNavigation />
      </div>
    );
  }

  if (error && !lead) {
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
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          position: 'relative'
        }}>
          <button
            onClick={handleBack}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px',
              position: 'absolute',
              left: '20px',
              top: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowLeft size={20} color="white" />
          </button>
          <div style={{ textAlign: 'center', paddingTop: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Lead Details</h1>
            <p style={{ fontSize: '14px', margin: '4px 0 0 0', opacity: 0.9 }}>Error</p>
          </div>
        </div>
        
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid var(--red-200)',
          margin: '16px'
        }}>
          <AlertCircle size={48} color="var(--red-500)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--red-700)' }}>
            Error Loading Lead
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--red-600)', marginBottom: '16px' }}>
            {error}
          </p>
          <button
            onClick={loadLead}
            style={{
              backgroundColor: 'var(--red-600)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
        
        <RoleBasedBottomNavigation />
      </div>
    );
  }

  if (!lead) {
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
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          position: 'relative'
        }}>
          <button
            onClick={handleBack}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px',
              position: 'absolute',
              left: '20px',
              top: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowLeft size={20} color="white" />
          </button>
          <div style={{ textAlign: 'center', paddingTop: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>Lead Details</h1>
            <p style={{ fontSize: '14px', margin: '4px 0 0 0', opacity: 0.9 }}>Not Found</p>
          </div>
        </div>
        
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid var(--gray-200)',
          margin: '16px'
        }}>
          <User size={48} color="var(--gray-400)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--gray-900)' }}>
            Lead Not Found
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '16px' }}>
            The requested lead could not be found.
          </p>
          <button
            onClick={handleBack}
            style={{
              backgroundColor: 'var(--primary-600)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Back to Leads
          </button>
        </div>
        
        <RoleBasedBottomNavigation />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8F9F9',
      fontFamily: 'Montserrat, sans-serif'
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

        {/* Lead Name */}
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#333333',
          margin: '0 0 8px 0',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          {lead.first_name} {lead.last_name}
        </h1>

        {/* Lead Status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
          {getStatusIcon(lead.status)}
          <span style={{
            fontSize: '16px',
            fontWeight: '600',
            padding: '8px 16px',
            borderRadius: '20px',
            backgroundColor: getStatusColor(lead.status),
            color: getStatusTextColor(lead.status),
            textTransform: 'capitalize',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            {lead.status}
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'Montserrat, sans-serif',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              >
                <Save size={18} color="#ffffff" />
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6b7280',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'Montserrat, sans-serif',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              >
                <X size={18} color="#ffffff" />
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                console.log('Edit button clicked, setting editing to true');
                setEditing(true);
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#016A5D',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'Montserrat, sans-serif',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Edit size={18} color="#ffffff" />
              Edit
            </button>
          )}
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
        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            border: '1px solid rgba(220, 38, 38, 0.2)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            color: '#DC2626',
            fontSize: '16px',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            {error}
          </div>
        )}

        {/* Lead Information */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Basic Information */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid rgba(1, 106, 93, 0.1)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              marginBottom: '20px', 
              color: '#333333',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Basic Information
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ 
                  fontSize: '16px', 
                  fontWeight: '500', 
                  color: '#333333',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  First Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={updateData.first_name || ''}
                    onChange={(e) => setUpdateData({ ...updateData, first_name: e.target.value })}
                    style={{
                      padding: '16px',
                      border: '1px solid rgba(1, 106, 93, 0.15)',
                      borderRadius: '8px',
                      fontSize: '16px',
                      backgroundColor: 'white',
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: '400',
                      color: '#333333',
                      boxShadow: '0 1px 8px rgba(0, 0, 0, 0.05)'
                    }}
                  />
                ) : (
                  <span style={{ 
                    fontSize: '18px', 
                    color: '#333333',
                    fontWeight: '500',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    {lead.first_name}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ 
                  fontSize: '16px', 
                  fontWeight: '500', 
                  color: '#333333',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  Last Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={updateData.last_name || ''}
                    onChange={(e) => setUpdateData({ ...updateData, last_name: e.target.value })}
                    style={{
                      padding: '16px',
                      border: '1px solid rgba(1, 106, 93, 0.15)',
                      borderRadius: '8px',
                      fontSize: '16px',
                      backgroundColor: 'white',
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: '400',
                      color: '#333333',
                      boxShadow: '0 1px 8px rgba(0, 0, 0, 0.05)'
                    }}
                  />
                ) : (
                  <span style={{ 
                    fontSize: '18px', 
                    color: '#333333',
                    fontWeight: '500',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    {lead.last_name}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ 
                  fontSize: '16px', 
                  fontWeight: '500', 
                  color: '#333333',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  Phone
                </label>
                {editing ? (
                  <input
                    type="tel"
                    value={updateData.phone || ''}
                    onChange={(e) => setUpdateData({ ...updateData, phone: e.target.value })}
                    style={{
                      padding: '16px',
                      border: '1px solid rgba(1, 106, 93, 0.15)',
                      borderRadius: '8px',
                      fontSize: '16px',
                      backgroundColor: 'white',
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: '400',
                      color: '#333333',
                      boxShadow: '0 1px 8px rgba(0, 0, 0, 0.05)'
                    }}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Phone size={20} color="#016A5D" />
                    <span style={{ 
                      fontSize: '18px', 
                      color: '#333333',
                      fontWeight: '500',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      {lead.phone}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ 
                  fontSize: '16px', 
                  fontWeight: '500', 
                  color: '#333333',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  Email
                </label>
                {editing ? (
                  <input
                    type="email"
                    value={updateData.email || ''}
                    onChange={(e) => setUpdateData({ ...updateData, email: e.target.value })}
                    style={{
                      padding: '16px',
                      border: '1px solid rgba(1, 106, 93, 0.15)',
                      borderRadius: '8px',
                      fontSize: '16px',
                      backgroundColor: 'white',
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: '400',
                      color: '#333333',
                      boxShadow: '0 1px 8px rgba(0, 0, 0, 0.05)'
                    }}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Mail size={20} color="#016A5D" />
                    <span style={{ 
                      fontSize: '18px', 
                      color: '#333333',
                      fontWeight: '500',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      {lead.email || 'Not provided'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Project Information */}
          {project && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid rgba(1, 106, 93, 0.1)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                marginBottom: '20px', 
                color: '#333333',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Project Information
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ 
                    fontSize: '16px', 
                    fontWeight: '500', 
                    color: '#333333',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    Project Name
                  </label>
                  <button
                    onClick={handleProjectClick}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '16px',
                      border: '1px solid rgba(1, 106, 93, 0.15)',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      fontFamily: 'Montserrat, sans-serif',
                      textAlign: 'left',
                      width: '100%'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F0F9F8';
                      e.currentTarget.style.borderColor = '#016A5D';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.borderColor = 'rgba(1, 106, 93, 0.15)';
                    }}
                  >
                    <Building size={20} color="#016A5D" />
                    <span style={{ 
                      fontSize: '18px', 
                      color: '#016A5D',
                      fontWeight: '600',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      {project.name}
                    </span>
                  </button>
                </div>

                {project.location && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ 
                      fontSize: '16px', 
                      fontWeight: '500', 
                      color: '#333333',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      Project Location
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <MapPin size={20} color="#777777" />
                      <span style={{ 
                        fontSize: '18px', 
                        color: '#333333',
                        fontWeight: '500',
                        fontFamily: 'Montserrat, sans-serif'
                      }}>
                        {project.location}
                      </span>
                    </div>
                  </div>
                )}

                {project.developer_name && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ 
                      fontSize: '16px', 
                      fontWeight: '500', 
                      color: '#333333',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      Developer
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Building size={20} color="#777777" />
                      <span style={{ 
                        fontSize: '18px', 
                        color: '#333333',
                        fontWeight: '500',
                        fontFamily: 'Montserrat, sans-serif'
                      }}>
                        {project.developer_name}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status & Stage */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid rgba(1, 106, 93, 0.1)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              marginBottom: '20px', 
              color: '#333333',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Status & Stage
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ 
                  fontSize: '16px', 
                  fontWeight: '500', 
                  color: '#333333',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  Status
                </label>
                {editing ? (
                  <select
                    value={updateData.status || lead.status}
                    onChange={(e) => setUpdateData({ ...updateData, status: e.target.value as LeadStatus })}
                    style={{
                      padding: '16px',
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
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="won">Won</option>
                    <option value="lost">Lost</option>
                  </select>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {getStatusIcon(lead.status)}
                    <span style={{
                      fontSize: '18px',
                      fontWeight: '500',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      backgroundColor: getStatusColor(lead.status),
                      color: getStatusTextColor(lead.status),
                      textTransform: 'capitalize',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      {lead.status}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ 
                  fontSize: '16px', 
                  fontWeight: '500', 
                  color: '#333333',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  Stage
                </label>
                {editing ? (
                  <select
                    value={updateData.stage || lead.stage}
                    onChange={(e) => setUpdateData({ ...updateData, stage: e.target.value as LeadStage })}
                    style={{
                      padding: '16px',
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
                    <option value="inquiry">Inquiry</option>
                    <option value="site_visit">Site Visit</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="closed">Closed</option>
                  </select>
                ) : (
                  <span style={{ 
                    fontSize: '18px', 
                    color: '#333333', 
                    textTransform: 'capitalize',
                    fontWeight: '500',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    {lead.stage.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Budget Information */}
          {(lead.budget_min || lead.budget_max) && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid rgba(1, 106, 93, 0.1)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                marginBottom: '20px', 
                color: '#333333',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Budget Information
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <DollarSign size={20} color="#016A5D" />
                  <span style={{ 
                    fontSize: '18px', 
                    color: '#333333',
                    fontWeight: '500',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    {lead.budget_min && lead.budget_max 
                      ? `${formatCurrency(lead.budget_min)} - ${formatCurrency(lead.budget_max)}`
                      : lead.budget_min 
                        ? `From ${formatCurrency(lead.budget_min)}`
                        : `Up to ${formatCurrency(lead.budget_max!)}`
                    }
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Additional Information */}
          {(lead.preferred_location || lead.requirements || lead.notes) && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid rgba(1, 106, 93, 0.1)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                marginBottom: '20px', 
                color: '#333333',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Additional Information
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {lead.preferred_location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <MapPin size={20} color="#016A5D" />
                    <span style={{ 
                      fontSize: '18px', 
                      color: '#333333',
                      fontWeight: '500',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      {lead.preferred_location}
                    </span>
                  </div>
                )}
                
                {lead.requirements && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ 
                      fontSize: '16px', 
                      fontWeight: '500', 
                      color: '#333333',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      Requirements
                    </label>
                    <span style={{ 
                      fontSize: '18px', 
                      color: '#333333',
                      fontWeight: '400',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      {lead.requirements}
                    </span>
                  </div>
                )}
                
                {lead.notes && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ 
                      fontSize: '16px', 
                      fontWeight: '500', 
                      color: '#333333',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      Notes
                    </label>
                    <span style={{ 
                      fontSize: '18px', 
                      color: '#333333',
                      fontWeight: '400',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      {lead.notes}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid rgba(1, 106, 93, 0.1)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              marginBottom: '20px', 
              color: '#333333',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Timeline
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Calendar size={20} color="#016A5D" />
                <span style={{ 
                  fontSize: '18px', 
                  color: '#333333',
                  fontWeight: '500',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  Created: {formatDate(lead.created_at)}
                </span>
              </div>
              
              {lead.last_contacted && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Clock size={20} color="#016A5D" />
                  <span style={{ 
                    fontSize: '18px', 
                    color: '#333333',
                    fontWeight: '500',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    Last Contacted: {formatDate(lead.last_contacted)}
                  </span>
                </div>
              )}
              
              {lead.next_followup && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <TrendingUp size={20} color="#016A5D" />
                  <span style={{ 
                    fontSize: '18px', 
                    color: '#333333',
                    fontWeight: '500',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    Next Follow-up: {formatDate(lead.next_followup)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Role-Based Bottom Navigation */}
      <RoleBasedBottomNavigation />
    </div>
  );
};
