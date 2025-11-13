import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Loading } from '../ui/Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'manager' | 'agent' | 'staff';
  requiredPermission?: string;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user, employeeId, organizationId, role, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading..." />
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to access this page.
            </p>
            <a
              href="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has employee data
  if (!employeeId || !organizationId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Account Setup Required
            </h2>
            <p className="text-gray-600 mb-6">
              Your account needs to be properly set up. Please contact support for assistance.
            </p>
            <button
              onClick={() => window.location.href = '/contact'}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check role requirement
  if (requiredRole && role !== requiredRole) {
    const roleHierarchy = {
      admin: 4,
      manager: 3,
      agent: 2,
      staff: 1,
    };

    const userRoleLevel = roleHierarchy[role as keyof typeof roleHierarchy] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole];

    if (userRoleLevel < requiredRoleLevel) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8 p-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Insufficient Permissions
              </h2>
              <p className="text-gray-600 mb-6">
                You need {requiredRole} role or higher to access this page. 
                Your current role is {role || 'not assigned'}.
              </p>
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // All checks passed, render children
  return <>{children}</>;
};

// Higher-order component for easier usage
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requiredRole?: 'admin' | 'manager' | 'agent' | 'staff';
    requiredPermission?: string;
  }
) => {
  return (props: P) => (
    <ProtectedRoute
      requiredRole={options?.requiredRole}
      requiredPermission={options?.requiredPermission}
    >
      <Component {...props} />
    </ProtectedRoute>
  );
};
