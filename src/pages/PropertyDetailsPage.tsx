import React from 'react';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { PropertyDetailsPage } from '../components/mobile/PropertyDetailsPage';

export const PropertyDetailsPageWrapper: React.FC = () => {
  return (
    <ProtectedRoute>
      <PropertyDetailsPage />
    </ProtectedRoute>
  );
};

