import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MobileSupportModal } from './MobileSupportModal';
import { RoleBasedBottomNavigation } from './RoleBasedBottomNavigation';
import { getRoleBasedBackPath } from '../../utils/rolePermissions';
import { 
  User,
  Bell,
  Globe,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Mail,
  ArrowLeft
} from 'lucide-react';

interface MobileDeveloperSettingsPageProps {
  className?: string;
}

export const MobileDeveloperSettingsPage: React.FC<MobileDeveloperSettingsPageProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useAuth();
  const [showSupportModal, setShowSupportModal] = useState(false);

  const handleLogout = () => {
    // Handle logout logic here
    console.log('Logout clicked');
    navigate('/login');
  };

  const handleBack = () => {
    navigate(getRoleBasedBackPath(role || 'developer', location.pathname));
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: <User size={20} color="var(--gray-600)" />,
          title: 'Profile',
          subtitle: 'Manage your personal information',
          onClick: () => {
            console.log('Navigating to Profile');
            navigate('/mobile/profile');
          }
        },
        {
          icon: <Mail size={20} color="var(--gray-600)" />,
          title: 'Email Settings',
          subtitle: 'Update email preferences',
          onClick: () => navigate('/mobile/profile')
        },
        {
          icon: <Shield size={20} color="var(--gray-600)" />,
          title: 'Security',
          subtitle: 'Password and security settings',
          onClick: () => {
            console.log('Navigating to Security');
            navigate('/mobile/security');
          }
        }
      ]
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: <Bell size={20} color="var(--gray-600)" />,
          title: 'Notifications',
          subtitle: 'Manage notification preferences',
          onClick: () => {
            console.log('Navigating to Notifications');
            navigate('/mobile/notifications');
          }
        },
        {
          icon: <Globe size={20} color="var(--gray-600)" />,
          title: 'Language & Region',
          subtitle: 'Set your language and region',
          onClick: () => {
            console.log('Navigating to Language');
            navigate('/mobile/language');
          }
        }
      ]
    },
    {
      title: 'Support',
      items: [
        {
          icon: <HelpCircle size={20} color="var(--gray-600)" />,
          title: 'Help & Support',
          subtitle: 'Get help and contact support',
          onClick: () => setShowSupportModal(true)
        }
      ]
    }
  ];

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
              Settings
            </h1>
            <p style={{
              fontSize: '14px',
              margin: '4px 0 0 0',
              opacity: 0.9,
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Manage your account and preferences
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {settingsSections.map((section, sectionIndex) => (
          <div key={sectionIndex} style={{ marginBottom: '24px' }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#333333',
              marginBottom: '12px',
              paddingLeft: '4px',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              {section.title}
            </h3>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid rgba(1, 106, 93, 0.1)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              overflow: 'hidden'
            }}>
              {section.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={item.onClick}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px 20px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    borderBottom: itemIndex < section.items.length - 1 ? '1px solid rgba(1, 106, 93, 0.1)' : 'none',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s ease',
                    textAlign: 'left'
                  }}
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
                    backgroundColor: 'rgba(1, 106, 93, 0.1)',
                    borderRadius: '8px',
                    marginRight: '16px',
                    flexShrink: 0
                  }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#333333',
                      margin: 0,
                      marginBottom: '4px',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      {item.title}
                    </h4>
                    <p style={{
                      fontSize: '14px',
                      color: '#777777',
                      margin: 0,
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      {item.subtitle}
                    </p>
                  </div>
                  <ChevronRight size={20} color="#777777" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Logout Button */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid rgba(220, 38, 38, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          marginTop: '24px'
        }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px 20px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <LogOut size={20} color="#DC2626" style={{ marginRight: '12px' }} />
            <span style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#DC2626',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* Support Modal */}
      {showSupportModal && (
        <MobileSupportModal
          isOpen={showSupportModal}
          onClose={() => setShowSupportModal(false)}
        />
      )}

      {/* Role-Based Bottom Navigation - Updated */}
      <RoleBasedBottomNavigation />
    </div>
  );
};
