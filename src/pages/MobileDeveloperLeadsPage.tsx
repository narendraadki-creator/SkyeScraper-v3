import React from 'react';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { MobileDeveloperLeadsPage } from '../components/mobile/MobileDeveloperLeadsPage';

export const MobileDeveloperLeadsPageWrapper: React.FC = () => {
  return (
    <ProtectedRoute>
      <MobileDeveloperLeadsPage />
    </ProtectedRoute>
  );
};
