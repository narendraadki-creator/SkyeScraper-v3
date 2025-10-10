import React from 'react';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { MobileAgentDeveloperHomePage } from '../components/mobile/MobileAgentDeveloperHomePage';

export const DeveloperHomePageWrapper: React.FC = () => {
  return (
    <ProtectedRoute>
      <MobileAgentDeveloperHomePage />
    </ProtectedRoute>
  );
};

