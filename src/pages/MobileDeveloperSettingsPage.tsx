import React from 'react';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { MobileDeveloperSettingsPage } from '../components/mobile/MobileDeveloperSettingsPage';

export const MobileDeveloperSettingsPageWrapper: React.FC = () => {
  return (
    <ProtectedRoute>
      <MobileDeveloperSettingsPage />
    </ProtectedRoute>
  );
};
