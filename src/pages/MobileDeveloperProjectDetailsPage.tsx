import React from 'react';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { MobileDeveloperProjectDetails } from '../components/mobile/MobileDeveloperProjectDetails';

export const MobileDeveloperProjectDetailsPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <MobileDeveloperProjectDetails />
    </ProtectedRoute>
  );
};

