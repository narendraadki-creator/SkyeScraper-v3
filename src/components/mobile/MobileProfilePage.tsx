import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Edit3,
  Save,
  X,
  ArrowLeft,
  Home,
  Users,
  Gift,
  Settings
} from 'lucide-react';

interface MobileProfilePageProps {
  className?: string;
}

export const MobileProfilePage: React.FC<MobileProfilePageProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    first_name: user?.user_metadata?.first_name || '',
    last_name: user?.user_metadata?.last_name || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    organization: user?.user_metadata?.organization || '',
    location: user?.user_metadata?.location || '',
    role: role || '',
    created_at: user?.created_at || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleBack = () => {
    navigate('/mobile/settings');
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    // Reset form data to original values
    setProfileData({
      first_name: user?.user_metadata?.first_name || '',
      last_name: user?.user_metadata?.last_name || '',
      email: user?.email || '',
      phone: user?.user_metadata?.phone || '',
      organization: user?.user_metadata?.organization || '',
      location: user?.user_metadata?.location || '',
      role: role || '',
      created_at: user?.created_at || ''
    });
    setErrors({});
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!profileData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!profileData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    if (!profileData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Here you would typically call an API to update the user profile
      // For now, we'll just simulate the update
      console.log('Updating profile:', profileData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEditing(false);
      // You might want to show a success message here
    } catch (error) {
      console.error('Failed to update profile:', error);
      setErrors({ submit: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
          onClick={handleBack}
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
          Profile
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#777777',
          fontWeight: '300'
        }}>
          Manage your personal information
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

        {/* Profile Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px 24px',
          border: '1px solid rgba(1, 106, 93, 0.1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50px',
            backgroundColor: '#F0F9F8',
            border: '3px solid rgba(1, 106, 93, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <User size={48} color="#016A5D" />
          </div>
          <h2 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: '#333333',
            margin: '0 0 8px 0',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            {profileData.first_name} {profileData.last_name}
          </h2>
          <p style={{ 
            fontSize: '18px', 
            color: '#777777',
            margin: '0 0 8px 0',
            textTransform: 'capitalize',
            fontWeight: '500',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            {profileData.role}
          </p>
          <p style={{ 
            fontSize: '14px', 
            color: '#777777',
            margin: 0,
            fontWeight: '400',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            Member since {formatDate(profileData.created_at)}
          </p>
        </div>

        {/* Profile Form */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid rgba(1, 106, 93, 0.1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          marginBottom: '24px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '24px'
          }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              color: '#333333', 
              margin: 0,
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Personal Information
            </h3>
            {!editing && (
              <button
                onClick={handleEdit}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#016A5D',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'Montserrat, sans-serif',
                  boxShadow: '0 2px 8px rgba(1, 106, 93, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Edit3 size={16} />
                Edit
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* First Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ 
                fontSize: '16px', 
                fontWeight: '500', 
                color: '#333333',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                First Name *
              </label>
              {editing ? (
                <input
                  type="text"
                  value={profileData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
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
              ) : (
                <p style={{ 
                  fontSize: '16px', 
                  color: '#333333', 
                  margin: 0,
                  padding: '16px 0',
                  fontWeight: '500',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {profileData.first_name || 'Not provided'}
                </p>
              )}
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

            {/* Last Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ 
                fontSize: '16px', 
                fontWeight: '500', 
                color: '#333333',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Last Name *
              </label>
              {editing ? (
                <input
                  type="text"
                  value={profileData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
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
              ) : (
                <p style={{ 
                  fontSize: '16px', 
                  color: '#333333', 
                  margin: 0,
                  padding: '16px 0',
                  fontWeight: '500',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {profileData.last_name || 'Not provided'}
                </p>
              )}
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

            {/* Email */}
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
                Email Address *
              </label>
              {editing ? (
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
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
              ) : (
                <p style={{ 
                  fontSize: '16px', 
                  color: '#333333', 
                  margin: 0,
                  padding: '16px 0',
                  fontWeight: '500',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {profileData.email || 'Not provided'}
                </p>
              )}
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

            {/* Phone */}
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
                Phone Number
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+971 50 123 4567"
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
              ) : (
                <p style={{ 
                  fontSize: '16px', 
                  color: '#333333', 
                  margin: 0,
                  padding: '16px 0',
                  fontWeight: '500',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {profileData.phone || 'Not provided'}
                </p>
              )}
            </div>

            {/* Organization */}
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
                <Building size={18} color="#016A5D" />
                Organization
              </label>
              {editing ? (
                <input
                  type="text"
                  value={profileData.organization}
                  onChange={(e) => handleInputChange('organization', e.target.value)}
                  placeholder="Your organization name"
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
              ) : (
                <p style={{ 
                  fontSize: '16px', 
                  color: '#333333', 
                  margin: 0,
                  padding: '16px 0',
                  fontWeight: '500',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {profileData.organization || 'Not provided'}
                </p>
              )}
            </div>

            {/* Location */}
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
                Location
              </label>
              {editing ? (
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Your location"
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
              ) : (
                <p style={{ 
                  fontSize: '16px', 
                  color: '#333333', 
                  margin: 0,
                  padding: '16px 0',
                  fontWeight: '500',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {profileData.location || 'Not provided'}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {editing && (
            <div style={{ 
              display: 'flex', 
              gap: '16px', 
              marginTop: '28px',
              paddingTop: '24px',
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
                type="button"
                onClick={handleSave}
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
                <Save size={20} />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
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
          alignItems: 'center',
          padding: '0 16px',
          height: '80px'
        }}>
          {[
            { id: 'home', label: 'Home', icon: Home, active: false },
            { id: 'leads', label: 'Leads', icon: Users, active: false },
            { id: 'promotions', label: 'Promotions', icon: Gift, active: false },
            { id: 'settings', label: 'Settings', icon: Settings, active: true }
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
};
