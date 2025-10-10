import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { leadService } from '../../services/leadService';
import { AgentBottomNavigation } from './AgentBottomNavigation';
import { LEAD_SOURCES, UNIT_TYPES } from '../../types/lead';
import type { CreateLeadData, Lead } from '../../types/lead';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  Calendar, 
  FileText,
  Check,
  X,
  ArrowLeft,
  Home,
  Users,
  Gift,
  Settings
} from 'lucide-react';

interface MobileCreateLeadPageProps {
  className?: string;
}

export const MobileCreateLeadPage: React.FC<MobileCreateLeadPageProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { user, role } = useAuth();
  
  const [formData, setFormData] = useState<CreateLeadData>(() => {
    const initialFormData = {
      project_id: projectId,
      unit_id: undefined,
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      source: 'Website Inquiry',
      budget_min: undefined,
      budget_max: undefined,
      preferred_unit_types: [],
      preferred_location: '',
      requirements: '',
      notes: '',
      next_followup: '',
    };
    return initialFormData;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<Array<{ id: string; name: string; email: string }>>([]);

  // Update formData when projectId changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      project_id: projectId,
    }));
  }, [projectId]);

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      const members = await leadService.getTeamMembers();
      setTeamMembers(members);
    } catch (error) {
      console.error('Failed to load team members:', error);
    }
  };

  const handleInputChange = (field: keyof CreateLeadData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleUnitTypeToggle = (unitType: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_unit_types: prev.preferred_unit_types?.includes(unitType)
        ? prev.preferred_unit_types.filter(type => type !== unitType)
        : [...(prev.preferred_unit_types || []), unitType],
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Only validate budget comparison if both values are provided and are valid numbers
    const minBudget = Number(formData.budget_min);
    const maxBudget = Number(formData.budget_max);
    
    // Only validate if both values are valid numbers greater than 0
    if (!isNaN(minBudget) && !isNaN(maxBudget) && minBudget > 0 && maxBudget > 0) {
      if (minBudget > maxBudget) {
        newErrors.budget_max = 'Maximum budget must be greater than minimum budget';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const lead = await leadService.createLead(formData);
      console.log('Lead created successfully:', lead);
      // Navigate back to mobile leads
      navigate('/mobile/leads');
    } catch (error) {
      console.error('Failed to create lead:', error);
      setErrors({ submit: `Failed to create lead: ${error.message || 'Please try again.'}` });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/mobile/leads');
  };

  if (!projectId) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#F8F9F9',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Montserrat, sans-serif'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#F8F9F9',
          padding: '60px 20px 40px 20px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <button
            onClick={handleCancel}
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              backgroundColor: 'white',
              border: '1px solid rgba(1, 106, 93, 0.15)',
              borderRadius: '8px',
              padding: '8px',
              boxShadow: '0 1px 8px rgba(0, 0, 0, 0.05)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowLeft size={20} color="#016A5D" />
          </button>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#333333',
            marginBottom: '8px'
          }}>
            Create Lead
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#777777',
            fontWeight: '300'
          }}>
            Error
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
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid rgba(220, 38, 38, 0.2)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <X size={48} color="#DC2626" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#DC2626' }}>
              Project Not Found
            </h3>
            <p style={{ fontSize: '14px', color: '#DC2626', marginBottom: '16px' }}>
              The project ID is missing or invalid.
            </p>
            <button
              onClick={handleCancel}
              style={{
                backgroundColor: '#DC2626',
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
            alignItems: 'center',
            padding: '0 16px',
            height: '80px'
          }}>
            {[
              { id: 'home', label: 'Home', icon: Home, active: false },
              { id: 'leads', label: 'Leads', icon: Users, active: true },
              { id: 'promotions', label: 'Promotions', icon: Gift, active: false },
              { id: 'settings', label: 'Settings', icon: Settings, active: false }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'home') navigate('/mobile/developer');
                  else if (item.id === 'leads') navigate('/mobile/leads');
                  else if (item.id === 'promotions') navigate('/mobile/promotions');
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
                  transition: 'all 0.2s ease',
                  minWidth: '60px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <item.icon size={22} color={item.active ? '#016A5D' : '#777777'} />
                <span style={{
                  fontSize: '11px',
                  fontWeight: '500',
                  letterSpacing: '0.3px'
                }}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#F8F9F9',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Montserrat, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#F8F9F9',
        padding: '60px 20px 40px 20px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <button
          onClick={handleCancel}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            backgroundColor: 'white',
            border: '1px solid rgba(1, 106, 93, 0.15)',
            borderRadius: '8px',
            padding: '8px',
            boxShadow: '0 1px 8px rgba(0, 0, 0, 0.05)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ArrowLeft size={20} color="#016A5D" />
        </button>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#333333',
          marginBottom: '8px'
        }}>
          Create New Lead
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#777777',
          fontWeight: '300'
        }}>
          Capture lead information
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
        <form onSubmit={handleSubmit}>
          {/* Error Message */}
          {errors.submit && (
            <div style={{
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              border: '1px solid rgba(220, 38, 38, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              color: '#DC2626',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {errors.submit}
            </div>
          )}

          {/* Basic Information */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid rgba(1, 106, 93, 0.1)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            marginBottom: '24px'
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
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ 
                  fontSize: '16px', 
                  fontWeight: '500', 
                  color: '#333333',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Enter first name"
                  style={{
                    padding: '16px',
                    border: `1px solid ${errors.first_name ? '#DC2626' : 'rgba(1, 106, 93, 0.15)'}`,
                    borderRadius: '12px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    outline: 'none',
                    fontFamily: 'Montserrat, sans-serif',
                    boxShadow: '0 1px 8px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s ease'
                  }}
                />
                {errors.first_name && (
                  <span style={{ 
                    fontSize: '14px', 
                    color: '#DC2626',
                    fontWeight: '500'
                  }}>
                    {errors.first_name}
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
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Enter last name"
                  style={{
                    padding: '16px',
                    border: `1px solid ${errors.last_name ? '#DC2626' : 'rgba(1, 106, 93, 0.15)'}`,
                    borderRadius: '12px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    outline: 'none',
                    fontFamily: 'Montserrat, sans-serif',
                    boxShadow: '0 1px 8px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s ease'
                  }}
                />
                {errors.last_name && (
                  <span style={{ 
                    fontSize: '14px', 
                    color: '#DC2626',
                    fontWeight: '500'
                  }}>
                    {errors.last_name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid rgba(1, 106, 93, 0.1)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            marginBottom: '24px'
          }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              marginBottom: '20px', 
              color: '#333333',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Contact Information
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ 
                  fontSize: '16px', 
                  fontWeight: '500', 
                  color: '#333333',
                  fontFamily: 'Montserrat, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Phone size={18} color="#016A5D" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+971 50 123 4567"
                  style={{
                    padding: '16px',
                    border: `1px solid ${errors.phone ? '#DC2626' : 'rgba(1, 106, 93, 0.15)'}`,
                    borderRadius: '12px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    outline: 'none',
                    fontFamily: 'Montserrat, sans-serif',
                    boxShadow: '0 1px 8px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s ease'
                  }}
                />
                {errors.phone && (
                  <span style={{ 
                    fontSize: '14px', 
                    color: '#DC2626',
                    fontWeight: '500'
                  }}>
                    {errors.phone}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ 
                  fontSize: '16px', 
                  fontWeight: '500', 
                  color: '#333333',
                  fontFamily: 'Montserrat, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Mail size={18} color="#016A5D" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@example.com"
                  style={{
                    padding: '16px',
                    border: `1px solid ${errors.email ? '#DC2626' : 'rgba(1, 106, 93, 0.15)'}`,
                    borderRadius: '12px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    outline: 'none',
                    fontFamily: 'Montserrat, sans-serif',
                    boxShadow: '0 1px 8px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s ease'
                  }}
                />
                {errors.email && (
                  <span style={{ 
                    fontSize: '14px', 
                    color: '#DC2626',
                    fontWeight: '500'
                  }}>
                    {errors.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Source and Assignment */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid rgba(1, 106, 93, 0.1)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            marginBottom: '24px'
          }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              marginBottom: '20px', 
              color: '#333333',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Lead Details
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ 
                  fontSize: '16px', 
                  fontWeight: '500', 
                  color: '#333333',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  Lead Source
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => handleInputChange('source', e.target.value)}
                  style={{
                    padding: '16px',
                    border: '1px solid rgba(1, 106, 93, 0.15)',
                    borderRadius: '12px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    outline: 'none',
                    fontFamily: 'Montserrat, sans-serif',
                    boxShadow: '0 1px 8px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {LEAD_SOURCES.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ 
                  fontSize: '16px', 
                  fontWeight: '500', 
                  color: '#333333',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  Assign To
                </label>
                <select
                  value={formData.assigned_to || ''}
                  onChange={(e) => handleInputChange('assigned_to', e.target.value || undefined)}
                  style={{
                    padding: '16px',
                    border: '1px solid rgba(1, 106, 93, 0.15)',
                    borderRadius: '12px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    outline: 'none',
                    fontFamily: 'Montserrat, sans-serif',
                    boxShadow: '0 1px 8px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Budget Range */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid rgba(1, 106, 93, 0.1)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            marginBottom: '24px'
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
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ 
                  fontSize: '16px', 
                  fontWeight: '500', 
                  color: '#333333',
                  fontFamily: 'Montserrat, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <DollarSign size={18} color="#016A5D" />
                  Minimum Budget (AED)
                </label>
                <input
                  type="number"
                  value={formData.budget_min || ''}
                  onChange={(e) => handleInputChange('budget_min', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="800000"
                  style={{
                    padding: '16px',
                    border: '1px solid rgba(1, 106, 93, 0.15)',
                    borderRadius: '12px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    outline: 'none',
                    fontFamily: 'Montserrat, sans-serif',
                    boxShadow: '0 1px 8px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ 
                  fontSize: '16px', 
                  fontWeight: '500', 
                  color: '#333333',
                  fontFamily: 'Montserrat, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <DollarSign size={18} color="#016A5D" />
                  Maximum Budget (AED)
                </label>
                <input
                  type="number"
                  value={formData.budget_max || ''}
                  onChange={(e) => handleInputChange('budget_max', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="1200000"
                  style={{
                    padding: '16px',
                    border: `1px solid ${errors.budget_max ? '#DC2626' : 'rgba(1, 106, 93, 0.15)'}`,
                    borderRadius: '12px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    outline: 'none',
                    fontFamily: 'Montserrat, sans-serif',
                    boxShadow: '0 1px 8px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s ease'
                  }}
                />
                {errors.budget_max && (
                  <span style={{ 
                    fontSize: '14px', 
                    color: '#DC2626',
                    fontWeight: '500'
                  }}>
                    {errors.budget_max}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Preferred Unit Types */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid rgba(1, 106, 93, 0.1)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            marginBottom: '24px'
          }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              marginBottom: '20px', 
              color: '#333333',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Preferred Unit Types
            </h3>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {UNIT_TYPES.map(unitType => (
                <button
                  key={unitType}
                  type="button"
                  onClick={() => handleUnitTypeToggle(unitType)}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '24px',
                    border: `1px solid ${formData.preferred_unit_types?.includes(unitType) ? '#016A5D' : 'rgba(1, 106, 93, 0.15)'}`,
                    backgroundColor: formData.preferred_unit_types?.includes(unitType) ? '#016A5D' : 'white',
                    color: formData.preferred_unit_types?.includes(unitType) ? 'white' : '#333333',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'Montserrat, sans-serif',
                    boxShadow: '0 1px 8px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  {unitType}
                </button>
              ))}
            </div>
          </div>

          {/* Location and Requirements */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid rgba(1, 106, 93, 0.1)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            marginBottom: '24px'
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
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ 
                  fontSize: '16px', 
                  fontWeight: '500', 
                  color: '#333333',
                  fontFamily: 'Montserrat, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <MapPin size={18} color="#016A5D" />
                  Preferred Location
                </label>
                <input
                  type="text"
                  value={formData.preferred_location || ''}
                  onChange={(e) => handleInputChange('preferred_location', e.target.value)}
                  placeholder="e.g., Downtown Dubai, Dubai Marina"
                  style={{
                    padding: '16px',
                    border: '1px solid rgba(1, 106, 93, 0.15)',
                    borderRadius: '12px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    outline: 'none',
                    fontFamily: 'Montserrat, sans-serif',
                    boxShadow: '0 1px 8px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ 
                  fontSize: '16px', 
                  fontWeight: '500', 
                  color: '#333333',
                  fontFamily: 'Montserrat, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <FileText size={18} color="#016A5D" />
                  Requirements & Notes
                </label>
                <textarea
                  value={formData.requirements || ''}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  placeholder="Any specific requirements, preferences, or additional notes..."
                  rows={3}
                  style={{
                    padding: '16px',
                    border: '1px solid rgba(1, 106, 93, 0.15)',
                    borderRadius: '12px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '100px',
                    fontFamily: 'Montserrat, sans-serif',
                    boxShadow: '0 1px 8px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ 
                  fontSize: '16px', 
                  fontWeight: '500', 
                  color: '#333333',
                  fontFamily: 'Montserrat, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Calendar size={18} color="#016A5D" />
                  Next Follow-up
                </label>
                <input
                  type="datetime-local"
                  value={formData.next_followup || ''}
                  onChange={(e) => handleInputChange('next_followup', e.target.value)}
                  style={{
                    padding: '16px',
                    border: '1px solid rgba(1, 106, 93, 0.15)',
                    borderRadius: '12px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    outline: 'none',
                    fontFamily: 'Montserrat, sans-serif',
                    boxShadow: '0 1px 8px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            padding: '24px 0',
            borderTop: '1px solid rgba(1, 106, 93, 0.1)'
          }}>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                flex: 1,
                padding: '16px 24px',
                backgroundColor: '#777777',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontFamily: 'Montserrat, sans-serif',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.2s ease'
              }}
            >
              <X size={20} />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '16px 24px',
                backgroundColor: loading ? '#777777' : '#016A5D',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: loading ? 0.6 : 1,
                fontFamily: 'Montserrat, sans-serif',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.2s ease'
              }}
            >
              <Check size={20} />
              {loading ? 'Creating...' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>

      {/* Agent Bottom Navigation */}
      <AgentBottomNavigation />
    </div>
  );
};
