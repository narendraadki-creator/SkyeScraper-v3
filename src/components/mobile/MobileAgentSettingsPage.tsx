import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MobileSupportModal } from './MobileSupportModal';
import { RoleBasedBottomNavigation } from './RoleBasedBottomNavigation';
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

interface MobileAgentSettingsPageProps {
  className?: string;
}

export const MobileAgentSettingsPage: React.FC<MobileAgentSettingsPageProps> = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [showSupportModal, setShowSupportModal] = useState(false);

  const handleLogout = () => {
    // Handle logout logic here
    console.log('Logout clicked');
    navigate('/login');
  };

  const handleBack = () => {
    navigate('/mobile/agent');
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: <User size={20} color="var(--gray-600)" />,
          title: 'Profile',
          subtitle: 'Manage your personal information',
          onClick: () => navigate('/mobile/profile')
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
          onClick: () => navigate('/mobile/security')
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
          onClick: () => navigate('/mobile/notifications')
        },
        {
          icon: <Globe size={20} color="var(--gray-600)" />,
          title: 'Language & Region',
          subtitle: 'Set your language and region',
          onClick: () => navigate('/mobile/language')
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
      paddingBottom: '80px' // Space for fixed bottom navigation
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
          Settings
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#777777',
          fontWeight: '300'
        }}>
          Manage your account and preferences
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
        {/* User Info Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid rgba(1, 106, 93, 0.1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '28px',
              backgroundColor: '#F0F9F8',
              border: '2px solid rgba(1, 106, 93, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}>
              <User size={28} color="#016A5D" />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '700', 
                color: '#333333',
                margin: '0 0 6px 0',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                {user?.email || 'User'}
              </h3>
              <p style={{ 
                fontSize: '16px', 
                color: '#777777',
                margin: 0,
                textTransform: 'capitalize',
                fontWeight: '500',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                {role || 'Agent'}
              </p>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            padding: '12px 16px',
            backgroundColor: '#F0F9F8',
            borderRadius: '8px',
            border: '1px solid rgba(1, 106, 93, 0.1)'
          }}>
            <Building size={18} color="#016A5D" />
            <span style={{ 
              fontSize: '14px', 
              color: '#333333',
              fontWeight: '500',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Skyescraper Agent Portal
            </span>
          </div>
        </div>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <div key={sectionIndex} style={{ marginBottom: '28px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#333333',
              margin: '0 0 16px 0',
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
                    gap: '16px',
                    padding: '20px 24px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: itemIndex < section.items.length - 1 ? '1px solid rgba(1, 106, 93, 0.1)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
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
                    backgroundColor: '#F0F9F8',
                    borderRadius: '10px',
                    border: '1px solid rgba(1, 106, 93, 0.15)'
                  }}>
                    {React.cloneElement(item.icon, { size: 20, color: '#016A5D' })}
                  </div>
                  
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <h4 style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: '#333333',
                      margin: '0 0 4px 0',
                      fontFamily: 'Montserrat, sans-serif'
                    }}>
                      {item.title}
                    </h4>
                    <p style={{ 
                      fontSize: '14px', 
                      color: '#777777',
                      margin: 0,
                      fontWeight: '400',
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
              gap: '16px',
              padding: '20px 24px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.05)';
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
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              borderRadius: '10px',
              border: '1px solid rgba(220, 38, 38, 0.2)'
            }}>
              <LogOut size={20} color="#DC2626" />
            </div>
            
            <div style={{ flex: 1, textAlign: 'left' }}>
              <h4 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#DC2626',
                margin: 0,
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Logout
              </h4>
            </div>
            
            <ChevronRight size={20} color="#DC2626" />
          </button>
        </div>
      </div>


      {/* Support Modal */}
      <MobileSupportModal 
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />

      {/* Role-Based Bottom Navigation */}
      <RoleBasedBottomNavigation />
    </div>
  );
};
