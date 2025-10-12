import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  allowedRoles,
  fallbackPath
}) => {
  const { role, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#F8F9F9',
        fontFamily: 'Montserrat, sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(1, 106, 93, 0.1)',
            borderTop: '4px solid #016A5D',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#666', fontSize: '14px' }}>Loading...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // If no role or role not in allowed roles, redirect
  if (!role || !allowedRoles.includes(role)) {
    console.warn(`Access denied: User role '${role}' not allowed for route '${location.pathname}'. Allowed roles:`, allowedRoles);
    
    // Determine fallback path based on user role
    if (!fallbackPath) {
      switch (role) {
        case 'agent':
          fallbackPath = '/mobile/agent';
          break;
        case 'developer':
          fallbackPath = '/mobile/dev';
          break;
        case 'admin':
          fallbackPath = '/admin/dashboard';
          break;
        default:
          fallbackPath = '/login';
      }
    }

    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

// Convenience components for specific roles
export const AgentRoute: React.FC<{ children: React.ReactNode; fallbackPath?: string }> = ({ children, fallbackPath }) => (
  <RoleBasedRoute allowedRoles={['agent']} fallbackPath={fallbackPath}>
    {children}
  </RoleBasedRoute>
);

export const DeveloperRoute: React.FC<{ children: React.ReactNode; fallbackPath?: string }> = ({ children, fallbackPath }) => (
  <RoleBasedRoute allowedRoles={['developer']} fallbackPath={fallbackPath}>
    {children}
  </RoleBasedRoute>
);

export const AdminRoute: React.FC<{ children: React.ReactNode; fallbackPath?: string }> = ({ children, fallbackPath }) => (
  <RoleBasedRoute allowedRoles={['admin']} fallbackPath={fallbackPath}>
    {children}
  </RoleBasedRoute>
);

export const DeveloperOrAdminRoute: React.FC<{ children: React.ReactNode; fallbackPath?: string }> = ({ children, fallbackPath }) => (
  <RoleBasedRoute allowedRoles={['developer', 'admin']} fallbackPath={fallbackPath}>
    {children}
  </RoleBasedRoute>
);

export const AgentOrDeveloperRoute: React.FC<{ children: React.ReactNode; fallbackPath?: string }> = ({ children, fallbackPath }) => (
  <RoleBasedRoute allowedRoles={['agent', 'developer']} fallbackPath={fallbackPath}>
    {children}
  </RoleBasedRoute>
);
