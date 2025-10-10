import React from 'react';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { MobileAgentPropertyDetailsPage } from '../components/mobile/MobileAgentPropertyDetailsPage';

export const PropertyDetailsPageWrapper: React.FC = () => {
  return (
    <ProtectedRoute>
      <MobileAgentPropertyDetailsPage />
    </ProtectedRoute>
  );
};

