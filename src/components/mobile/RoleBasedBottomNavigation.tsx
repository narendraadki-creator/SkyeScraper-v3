import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home,
  Users,
  Star,
  Menu,
  Building,
  UserCheck
} from 'lucide-react';

export const RoleBasedBottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, loading } = useAuth();
  console.log('=== ROLE BASED NAV RENDERING ===');
  
  // Debug: Log role and pathname
  const componentId = 'RBN-' + Date.now();
  console.log(`[${componentId}] RoleBasedBottomNavigation - Role:`, role, 'Path:', location.pathname, 'Role Type:', typeof role, 'Loading:', loading);
  console.log(`[${componentId}] RoleBasedBottomNavigation - Role comparison:`, {
    'role === "developer"': role === 'developer',
    'role === "agent"': role === 'agent',
    'role === "admin"': role === 'admin'
  });

  // Don't render navigation if still loading
  if (loading || !role) {
    return null;
  }

  // Navigation configuration for each role
  const getNavigationConfig = () => {
    switch (role) {
      case 'agent':
        return [
          {
            icon: Home,
            label: 'Home',
            path: '/mobile/agent',
            isActive: location.pathname === '/mobile/agent'
          },
          {
            icon: Users,
            label: 'Leads',
            path: '/mobile/agent/leads',
            isActive: location.pathname.startsWith('/mobile/agent/leads')
          },
          {
            icon: Star,
            label: 'Promotions',
            path: '/mobile/agent/promotion',
            isActive: location.pathname === '/mobile/agent/promotion'
          },
          {
            icon: Menu,
            label: 'Settings',
            path: '/mobile/agent/settings',
            isActive: location.pathname.startsWith('/mobile/agent/settings') || 
                     location.pathname.startsWith('/mobile/profile') ||
                     location.pathname.startsWith('/mobile/security') ||
                     location.pathname.startsWith('/mobile/notifications') ||
                     location.pathname.startsWith('/mobile/language')
          }
        ];

      case 'developer':
        return [
          {
            icon: Home,
            label: 'Home',
            path: '/mobile/dev',
            isActive: location.pathname === '/mobile/dev'
          },
          {
            icon: Star,
            label: 'Promotions',
            path: '/mobile/dev/promotion',
            isActive: location.pathname === '/mobile/dev/promotion'
          },
          {
            icon: Menu,
            label: 'Settings',
            path: '/mobile/dev/settings',
            isActive: location.pathname.startsWith('/mobile/dev/settings') || 
                     location.pathname.startsWith('/mobile/profile') ||
                     location.pathname.startsWith('/mobile/security') ||
                     location.pathname.startsWith('/mobile/notifications') ||
                     location.pathname.startsWith('/mobile/language')
          }
        ];

      case 'admin':
        return [
          {
            icon: Home,
            label: 'Home',
            path: '/mobile/admin',
            isActive: location.pathname === '/mobile/admin'
          },
          {
            icon: UserCheck,
            label: 'Users',
            path: '/mobile/admin/users',
            isActive: location.pathname.startsWith('/mobile/admin/users')
          },
          {
            icon: Building,
            label: 'Projects',
            path: '/mobile/admin/projects',
            isActive: location.pathname.startsWith('/mobile/admin/projects')
          },
          {
            icon: Menu,
            label: 'Settings',
            path: '/mobile/admin/settings',
            isActive: location.pathname.startsWith('/mobile/admin/settings') || 
                     location.pathname.startsWith('/mobile/profile') ||
                     location.pathname.startsWith('/mobile/security') ||
                     location.pathname.startsWith('/mobile/notifications') ||
                     location.pathname.startsWith('/mobile/language')
          }
        ];

      default:
        // Fallback to agent navigation
        return [
          {
            icon: Home,
            label: 'Home',
            path: '/mobile/agent',
            isActive: location.pathname === '/mobile/agent'
          },
          {
            icon: Users,
            label: 'Leads',
            path: '/mobile/agent/leads',
            isActive: location.pathname.startsWith('/mobile/agent/leads')
          },
          {
            icon: Star,
            label: 'Promotions',
            path: '/mobile/agent/promotion',
            isActive: location.pathname === '/mobile/agent/promotion'
          },
          {
            icon: Menu,
            label: 'Settings',
            path: '/mobile/agent/settings',
            isActive: location.pathname.startsWith('/mobile/agent/settings') || 
                     location.pathname.startsWith('/mobile/profile') ||
                     location.pathname.startsWith('/mobile/security') ||
                     location.pathname.startsWith('/mobile/notifications') ||
                     location.pathname.startsWith('/mobile/language')
          }
        ];
    }
  };

  const navItems = getNavigationConfig();
  console.log(`[${componentId}] RoleBasedBottomNavigation - Selected navItems:`, navItems);

  return (
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
        padding: '8px 0',
        maxWidth: '600px', // Ensure it's constrained
        margin: '0 auto', // Center it
        width: '100%'
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: item.isActive ? '#016A5D' : '#777777',
                minWidth: '60px'
              }}
              onMouseOver={(e) => {
                if (!item.isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(1, 106, 93, 0.05)';
                }
              }}
              onMouseOut={(e) => {
                if (!item.isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div style={{
                position: 'relative'
              }}>
                <Icon size={24} />
                {item.isActive && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-2px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '20px',
                    height: '2px',
                    backgroundColor: '#016A5D',
                    borderRadius: '1px'
                  }} />
                )}
              </div>
              <span style={{
                fontSize: '12px',
                fontWeight: item.isActive ? '600' : '400',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
