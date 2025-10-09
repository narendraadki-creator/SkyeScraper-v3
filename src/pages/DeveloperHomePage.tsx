import React from 'react';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { DeveloperHomePage } from '../components/mobile/DeveloperHomePage';

export const DeveloperHomePageWrapper: React.FC = () => {
  return (
    <ProtectedRoute>
      <DeveloperHomePage />
    </ProtectedRoute>
  );
};

