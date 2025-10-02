import React, { useState } from 'react';
import { LeadDashboard } from '../components/leads/LeadDashboard';
import { LeadDetailView } from '../components/leads/LeadDetailView';
import type { Lead } from '../types/lead';

export const LeadsPage: React.FC = () => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLeadSelect = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const handleLeadUpdate = (updatedLead: Lead) => {
    setSelectedLead(updatedLead);
    // Refresh the dashboard to show updated data
    setRefreshKey(prev => prev + 1);
  };

  const handleCloseDetail = () => {
    setSelectedLead(null);
  };

  if (selectedLead) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LeadDetailView
            leadId={selectedLead.id}
            onClose={handleCloseDetail}
            onUpdate={handleLeadUpdate}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <LeadDashboard
          key={refreshKey}
          onLeadSelect={handleLeadSelect}
        />
      </div>
    </div>
  );
};
