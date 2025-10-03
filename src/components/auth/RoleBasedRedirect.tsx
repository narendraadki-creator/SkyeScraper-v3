import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface RoleBasedRedirectProps {
  fallback?: string;
}

export const RoleBasedRedirect: React.FC<RoleBasedRedirectProps> = ({ 
  fallback = '/developer' 
}) => {
  const { role } = useAuth();

  // Redirect based on user role
  const getRedirectPath = () => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'developer':
        return '/developer';
      case 'agent':
        return '/agent-projects';
      default:
        return fallback;
    }
  };

  return <Navigate to={getRedirectPath()} replace />;
};
