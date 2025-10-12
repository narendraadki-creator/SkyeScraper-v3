import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface RoleBasedRedirectProps {
  fallback?: string;
}

export const RoleBasedRedirect: React.FC<RoleBasedRedirectProps> = ({ 
  fallback = '/mobile/dev' 
}) => {
  const { role } = useAuth();

  // Redirect based on user role
  const getRedirectPath = () => {
    switch (role) {
      case 'admin':
        return '/mobile/admin';
      case 'developer':
        return '/mobile/dev';
      case 'agent':
        return '/mobile/agent';
      default:
        return fallback;
    }
  };

  return <Navigate to={getRedirectPath()} replace />;
};
