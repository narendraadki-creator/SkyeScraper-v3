/**
 * Role-based permission utilities
 * Defines what actions each role can perform
 */

export type UserRole = 'agent' | 'developer' | 'admin';

/**
 * Check if user can edit projects
 */
export const canEditProject = (role: string): boolean => {
  return ['developer', 'admin'].includes(role);
};

/**
 * Check if user can delete projects
 */
export const canDeleteProject = (role: string): boolean => {
  return ['developer', 'admin'].includes(role);
};

/**
 * Check if user can manage units
 */
export const canManageUnits = (role: string): boolean => {
  return ['developer', 'admin'].includes(role);
};

/**
 * Check if user can create projects
 */
export const canCreateProject = (role: string): boolean => {
  return ['developer', 'admin'].includes(role);
};

/**
 * Check if user can edit leads
 */
export const canEditLeads = (role: string): boolean => {
  return ['developer', 'admin'].includes(role);
};

/**
 * Check if user can delete leads
 */
export const canDeleteLeads = (role: string): boolean => {
  return ['developer', 'admin'].includes(role);
};

/**
 * Check if user can view leads (all roles can view leads)
 */
export const canViewLeads = (role: string): boolean => {
  return ['agent', 'developer', 'admin'].includes(role);
};

/**
 * Check if user can create leads (all roles can create leads)
 */
export const canCreateLeads = (role: string): boolean => {
  return ['agent', 'developer', 'admin'].includes(role);
};

/**
 * Check if user can access admin features
 */
export const canAccessAdmin = (role: string): boolean => {
  return role === 'admin';
};

/**
 * Check if user can manage users
 */
export const canManageUsers = (role: string): boolean => {
  return role === 'admin';
};

/**
 * Check if user can view analytics
 */
export const canViewAnalytics = (role: string): boolean => {
  return ['developer', 'admin'].includes(role);
};

/**
 * Get the appropriate base path for a role
 */
export const getRoleBasePath = (role: string): string => {
  switch (role) {
    case 'agent':
      return '/mobile/agent';
    case 'developer':
      return '/mobile/dev';
    case 'admin':
      return '/mobile/admin';
    default:
      return '/mobile/agent'; // fallback
  }
};

/**
 * Check if a role has access to a specific feature
 */
export const hasFeatureAccess = (role: string, feature: string): boolean => {
  const featurePermissions = {
    'leads': ['agent', 'developer', 'admin'],
    'projects': ['agent', 'developer', 'admin'],
    'users': ['admin'],
    'analytics': ['developer', 'admin'],
    'promotions': ['agent', 'developer', 'admin'],
    'settings': ['agent', 'developer', 'admin']
  };

  return featurePermissions[feature]?.includes(role) || false;
};

/**
 * Get the appropriate back navigation path based on role and current page
 */
export const getRoleBasedBackPath = (role: string, currentPath: string): string => {
  const basePath = getRoleBasePath(role);
  
  // If we're on a project details page, go back to the role's home
  if (currentPath.includes('/project/') && currentPath.includes('/edit')) {
    return basePath;
  }
  
  // If we're on project units page, go back to project details
  if (currentPath.includes('/project/') && currentPath.includes('/units')) {
    const projectId = currentPath.match(/\/project\/([^\/]+)/)?.[1];
    return `${basePath}/project/${projectId}`;
  }
  
  // If we're on project details page, go back to role's home
  if (currentPath.includes('/project/')) {
    return basePath;
  }
  
  // If we're on shared pages (profile, security, notifications, language), go back to role's settings
  if (currentPath.includes('/profile') || 
      currentPath.includes('/security') || 
      currentPath.includes('/notifications') || 
      currentPath.includes('/language')) {
    return `${basePath}/settings`;
  }
  
  // If we're on role-specific settings, go back to role's home
  if (currentPath.includes('/settings')) {
    return basePath;
  }
  
  // Default fallback to role's home
  return basePath;
};

/**
 * Get the appropriate navigation path for shared pages based on role
 */
export const getRoleBasedSharedPagePath = (role: string, page: 'profile' | 'security' | 'notifications' | 'language'): string => {
  switch (page) {
    case 'profile':
      return '/mobile/profile';
    case 'security':
      return '/mobile/security';
    case 'notifications':
      return '/mobile/notifications';
    case 'language':
      return '/mobile/language';
    default:
      return '/mobile/profile';
  }
};
