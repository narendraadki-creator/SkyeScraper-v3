import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  User,
  Home,
  Users,
  TrendingUp,
  Settings,
  LogOut,
  Globe,
  Languages
} from 'lucide-react';

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  className?: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  title = "Skyescraper",
  subtitle = "Discover • Manage • Book Properties in Real-Time",
  showBackButton = false,
  onBack,
  className = ''
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleUserMenuAction = (action: string) => {
    setShowUserMenu(false);
    switch (action) {
      case 'settings':
        navigate('/mobile/settings');
        break;
      case 'preferences':
        navigate('/mobile/settings');
        break;
      case 'logout':
        // Handle logout
        console.log('Logout clicked');
        navigate('/login');
        break;
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className={`mobile-app ${className}`}>
      {/* Hero Header */}
      <header className="mobile-header">
        <div className="mobile-header-content">
          {showBackButton && (
            <button 
              className="mobile-btn mobile-btn-ghost" 
              style={{ 
                padding: '8px', 
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                marginRight: '12px'
              }}
              onClick={onBack}
            >
              ←
            </button>
          )}
          
          <button 
            className="mobile-btn mobile-btn-ghost mobile-header-user-menu" 
            style={{ 
              padding: '8px', 
              color: 'white',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <User className="mobile-nav-icon" />
          </button>
          
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h1 className="mobile-header-title">{title}</h1>
            <p className="mobile-header-subtitle">{subtitle}</p>
          </div>
        </div>
        
        {/* User Account Menu */}
        {showUserMenu && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: '16px',
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            minWidth: '200px'
          }}>
            <button 
              className="mobile-btn mobile-btn-ghost"
              style={{ 
                width: '100%', 
                justifyContent: 'flex-start',
                padding: '12px 16px',
                fontSize: '14px',
                color: 'var(--gray-700)'
              }}
              onClick={() => handleUserMenuAction('settings')}
            >
              <Settings className="mobile-nav-icon" style={{ marginRight: '12px' }} />
              Settings
            </button>
            <button 
              className="mobile-btn mobile-btn-ghost"
              style={{ 
                width: '100%', 
                justifyContent: 'flex-start',
                padding: '12px 16px',
                fontSize: '14px',
                color: 'var(--gray-700)'
              }}
              onClick={() => handleUserMenuAction('preferences')}
            >
              <Globe className="mobile-nav-icon" style={{ marginRight: '12px' }} />
              Preferences
            </button>
            <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid var(--gray-200)' }} />
            <button 
              className="mobile-btn mobile-btn-ghost"
              style={{ 
                width: '100%', 
                justifyContent: 'flex-start',
                padding: '12px 16px',
                fontSize: '14px',
                color: 'var(--red-600)'
              }}
              onClick={() => handleUserMenuAction('logout')}
            >
              <LogOut className="mobile-nav-icon" style={{ marginRight: '12px' }} />
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="mobile-content">
        {children}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        <div className="mobile-bottom-nav-content">
          <button 
            className={`mobile-nav-item ${isActiveRoute('/mobile/developer') ? 'active' : ''}`}
            onClick={() => handleNavigation('/mobile/developer')}
          >
            <Home className="mobile-nav-icon" />
            <span className="mobile-nav-label">Home</span>
          </button>
          <button 
            className={`mobile-nav-item ${isActiveRoute('/mobile/leads') ? 'active' : ''}`}
            onClick={() => handleNavigation('/mobile/leads')}
          >
            <Users className="mobile-nav-icon" />
            <span className="mobile-nav-label">Leads</span>
          </button>
          <button 
            className={`mobile-nav-item ${isActiveRoute('/mobile/promotions') ? 'active' : ''}`}
            onClick={() => handleNavigation('/mobile/promotions')}
          >
            <TrendingUp className="mobile-nav-icon" />
            <span className="mobile-nav-label">Promotions</span>
          </button>
          <button 
            className={`mobile-nav-item ${isActiveRoute('/mobile/settings') ? 'active' : ''}`}
            onClick={() => handleNavigation('/mobile/settings')}
          >
            <Settings className="mobile-nav-icon" />
            <span className="mobile-nav-label">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
