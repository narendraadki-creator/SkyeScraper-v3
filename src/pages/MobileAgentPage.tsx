import React from 'react';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { MobileAgentLanding } from '../components/mobile/MobileAgentLanding';

export const MobileAgentPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <MobileAgentLanding />
    </ProtectedRoute>
  );
};

