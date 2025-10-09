import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell,
  Mail,
  MessageSquare,
  Calendar,
  TrendingUp,
  Shield,
  ArrowLeft,
  Home,
  Users,
  Gift,
  Settings
} from 'lucide-react';

interface MobileNotificationsPageProps {
  className?: string;
}

export const MobileNotificationsPage: React.FC<MobileNotificationsPageProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    leadUpdates: true,
    projectUpdates: true,
    systemAlerts: true,
    marketing: false
  });

  const handleBack = () => {
    navigate('/mobile/settings');
  };

  const handleToggle = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const notificationSettings = [
    {
      icon: <Mail size={20} color="var(--gray-600)" />,
      title: 'Email Notifications',
      subtitle: 'Receive updates via email',
      key: 'email'
    },
    {
      icon: <Bell size={20} color="var(--gray-600)" />,
      title: 'Push Notifications',
      subtitle: 'Receive push notifications on your device',
      key: 'push'
    },
    {
      icon: <MessageSquare size={20} color="var(--gray-600)" />,
      title: 'SMS Notifications',
      subtitle: 'Receive text message alerts',
      key: 'sms'
    },
    {
      icon: <TrendingUp size={20} color="var(--gray-600)" />,
      title: 'Lead Updates',
      subtitle: 'Notifications about lead activities',
      key: 'leadUpdates'
    },
    {
      icon: <Calendar size={20} color="var(--gray-600)" />,
      title: 'Project Updates',
      subtitle: 'Notifications about project changes',
      key: 'projectUpdates'
    },
    {
      icon: <Shield size={20} color="var(--gray-600)" />,
      title: 'System Alerts',
      subtitle: 'Important system notifications',
      key: 'systemAlerts'
    }
  ];

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
          Notifications
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#777777',
          fontWeight: '300'
        }}>
          Manage your notification preferences
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
        {/* Notification Settings */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid rgba(1, 106, 93, 0.1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          marginBottom: '24px'
        }}>
          {notificationSettings.map((setting, index) => (
            <div
              key={setting.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '20px 24px',
                borderBottom: index < notificationSettings.length - 1 ? '1px solid rgba(1, 106, 93, 0.1)' : 'none',
                backgroundColor: 'transparent',
                transition: 'all 0.2s ease'
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
                {setting.icon}
              </div>
              
              <div style={{ flex: 1 }}>
                <h4 style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: '#333333',
                  margin: '0 0 4px 0',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {setting.title}
                </h4>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#777777',
                  margin: 0,
                  fontWeight: '400',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {setting.subtitle}
                </p>
              </div>
              
              <label style={{ position: 'relative', display: 'inline-block', width: '52px', height: '28px' }}>
                <input
                  type="checkbox"
                  checked={notifications[setting.key as keyof typeof notifications]}
                  onChange={() => handleToggle(setting.key)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: notifications[setting.key as keyof typeof notifications] ? '#016A5D' : '#E5E7EB',
                  transition: '0.3s',
                  borderRadius: '28px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '22px',
                    width: '22px',
                    left: notifications[setting.key as keyof typeof notifications] ? '26px' : '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    transition: '0.3s',
                    borderRadius: '50%',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                  }} />
                </span>
              </label>
            </div>
          ))}
        </div>

        {/* Marketing Notifications */}
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
            Marketing Communications
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
              <TrendingUp size={20} color="#016A5D" />
            </div>
            
            <div style={{ flex: 1 }}>
              <h4 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#333333',
                margin: '0 0 4px 0',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Marketing Emails
              </h4>
              <p style={{ 
                fontSize: '14px', 
                color: '#777777',
                margin: 0,
                fontWeight: '400',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Receive promotional offers and updates
              </p>
            </div>
            
            <label style={{ position: 'relative', display: 'inline-block', width: '52px', height: '28px' }}>
              <input
                type="checkbox"
                checked={notifications.marketing}
                onChange={() => handleToggle('marketing')}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: notifications.marketing ? '#016A5D' : '#E5E7EB',
                transition: '0.3s',
                borderRadius: '28px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: '22px',
                  width: '22px',
                  left: notifications.marketing ? '26px' : '3px',
                  bottom: '3px',
                  backgroundColor: 'white',
                  transition: '0.3s',
                  borderRadius: '50%',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                }} />
              </span>
            </label>
          </div>
        </div>

        {/* Info Card */}
        <div style={{
          backgroundColor: '#F0F9F8',
          border: '1px solid rgba(1, 106, 93, 0.15)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <p style={{ 
            fontSize: '14px', 
            color: '#333333',
            margin: 0,
            lineHeight: '1.6',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            <strong>Note:</strong> You can change these settings at any time. Some notifications are required for system functionality and cannot be disabled.
          </p>
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
