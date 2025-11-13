import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { RoleBasedBottomNavigation } from './RoleBasedBottomNavigation';
import { 
  Shield,
  Lock,
  Key,
  Eye,
  EyeOff,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';

interface MobileSecurityPageProps {
  className?: string;
}

export const MobileSecurityPage: React.FC<MobileSecurityPageProps> = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  console.log('=== SECURITY PAGE RENDERING ===');
    
    // ... rest of component
  
  // Debug: Log that this component is rendering
  console.log('MobileSecurityPage is rendering');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleBack = () => {
    navigate('/mobile/settings');
  };

  const handleInputChange = (field: string, value: string) => {
    switch (field) {
      case 'currentPassword':
        setCurrentPassword(value);
        break;
      case 'newPassword':
        setNewPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
    }
    
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

    if (!currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    }
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Here you would typically call an API to change the password
      console.log('Changing password for user:', user?.id);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
      
      // Show success message (you could use a toast notification here)
      alert('Password changed successfully!');
    } catch (error) {
      console.error('Failed to change password:', error);
      setErrors({ submit: 'Failed to change password. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorToggle = () => {
    // Here you would implement 2FA toggle functionality
    alert('Two-factor authentication toggle functionality would be implemented here');
  };

  const handleLogoutAllDevices = () => {
    // Here you would implement logout all devices functionality
    alert('Logout all devices functionality would be implemented here');
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
          Security
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#777777',
          fontWeight: '300'
        }}>
          Manage your security settings
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
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle size={16} />
            {errors.submit}
          </div>
        )}

        {/* Change Password Section */}
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
            fontFamily: 'Montserrat, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Lock size={24} color="#016A5D" />
            Change Password
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Current Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ 
                fontSize: '16px', 
                fontWeight: '500', 
                color: '#333333',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Current Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  placeholder="Enter your current password"
                  style={{
                    width: '100%',
                    padding: '16px 48px 16px 16px',
                    border: `1px solid ${errors.currentPassword ? '#DC2626' : 'rgba(1, 106, 93, 0.15)'}`,
                    borderRadius: '12px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    outline: 'none',
                    fontFamily: 'Montserrat, sans-serif',
                    boxShadow: '0 1px 8px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s ease'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  {showCurrentPassword ? <EyeOff size={20} color="#777777" /> : <Eye size={20} color="#777777" />}
                </button>
              </div>
              {errors.currentPassword && (
                <span style={{ 
                  fontSize: '14px', 
                  color: '#DC2626',
                  fontWeight: '500'
                }}>
                  {errors.currentPassword}
                </span>
              )}
            </div>

            {/* New Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ 
                fontSize: '16px', 
                fontWeight: '500', 
                color: '#333333',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                New Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  placeholder="Enter your new password"
                  style={{
                    width: '100%',
                    padding: '16px 48px 16px 16px',
                    border: `1px solid ${errors.newPassword ? '#DC2626' : 'rgba(1, 106, 93, 0.15)'}`,
                    borderRadius: '12px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    outline: 'none',
                    fontFamily: 'Montserrat, sans-serif',
                    boxShadow: '0 1px 8px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s ease'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  {showNewPassword ? <EyeOff size={20} color="#777777" /> : <Eye size={20} color="#777777" />}
                </button>
              </div>
              {errors.newPassword && (
                <span style={{ 
                  fontSize: '14px', 
                  color: '#DC2626',
                  fontWeight: '500'
                }}>
                  {errors.newPassword}
                </span>
              )}
            </div>

            {/* Confirm Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ 
                fontSize: '16px', 
                fontWeight: '500', 
                color: '#333333',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Confirm New Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your new password"
                  style={{
                    width: '100%',
                    padding: '16px 48px 16px 16px',
                    border: `1px solid ${errors.confirmPassword ? '#DC2626' : 'rgba(1, 106, 93, 0.15)'}`,
                    borderRadius: '12px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    outline: 'none',
                    fontFamily: 'Montserrat, sans-serif',
                    boxShadow: '0 1px 8px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s ease'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={20} color="#777777" /> : <Eye size={20} color="#777777" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span style={{ 
                  fontSize: '14px', 
                  color: '#DC2626',
                  fontWeight: '500'
                }}>
                  {errors.confirmPassword}
                </span>
              )}
            </div>
          </div>

          {/* Change Password Button */}
          <button
            onClick={handleChangePassword}
            disabled={loading}
            style={{
              width: '100%',
              marginTop: '24px',
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
            <Key size={20} />
            {loading ? 'Changing Password...' : 'Change Password'}
          </button>
        </div>

        {/* Security Options */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid rgba(1, 106, 93, 0.1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '20px 24px',
            borderBottom: '1px solid rgba(1, 106, 93, 0.1)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onClick={handleTwoFactorToggle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(1, 106, 93, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              backgroundColor: '#F0F9F8',
              borderRadius: '10px',
              border: '1px solid rgba(1, 106, 93, 0.15)'
            }}>
              <Shield size={20} color="#016A5D" />
            </div>
            
            <div style={{ flex: 1 }}>
              <h4 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#333333',
                margin: '0 0 4px 0',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Two-Factor Authentication
              </h4>
              <p style={{ 
                fontSize: '14px', 
                color: '#777777',
                margin: 0,
                fontWeight: '400',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Add an extra layer of security to your account
              </p>
            </div>
            
            <div style={{
              padding: '6px 12px',
              backgroundColor: '#F0F9F8',
              color: '#016A5D',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: '600',
              border: '1px solid rgba(1, 106, 93, 0.15)'
            }}>
              Off
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '20px 24px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onClick={handleLogoutAllDevices}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(1, 106, 93, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              backgroundColor: '#F0F9F8',
              borderRadius: '10px',
              border: '1px solid rgba(1, 106, 93, 0.15)'
            }}>
              <Key size={20} color="#016A5D" />
            </div>
            
            <div style={{ flex: 1 }}>
              <h4 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#333333',
                margin: '0 0 4px 0',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Logout All Devices
              </h4>
              <p style={{ 
                fontSize: '14px', 
                color: '#777777',
                margin: 0,
                fontWeight: '400',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Sign out from all devices and sessions
              </p>
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div style={{
          backgroundColor: '#F0F9F8',
          border: '1px solid rgba(1, 106, 93, 0.15)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <Shield size={24} color="#016A5D" style={{ marginTop: '2px' }} />
            <div>
              <h4 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#333333',
                margin: '0 0 8px 0',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Security Tips
              </h4>
              <ul style={{ 
                fontSize: '14px', 
                color: '#333333',
                margin: 0,
                paddingLeft: '20px',
                lineHeight: '1.6',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                <li>Use a strong, unique password</li>
                <li>Enable two-factor authentication</li>
                <li>Log out from shared devices</li>
                <li>Keep your contact information updated</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Role-Based Bottom Navigation */}
      <RoleBasedBottomNavigation />
    </div>
  );
};
