import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { UnitsPage } from './UnitsPage';
import { RoleBasedBottomNavigation } from '../components/mobile/RoleBasedBottomNavigation';
import { ArrowLeft } from 'lucide-react';

export const MobileProjectUnitsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <ProtectedRoute>
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#F8F9F9',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Montserrat, sans-serif',
        paddingBottom: '80px'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#F8F9F9',
          padding: '24px 20px 16px 20px',
          position: 'relative',
          textAlign: 'center'
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              position: 'absolute',
              left: '20px',
              top: '24px',
              backgroundColor: 'white',
              border: '1px solid rgba(1, 106, 93, 0.15)',
              borderRadius: '8px',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 8px rgba(0, 0, 0, 0.05)'
            }}
          >
            <ArrowLeft size={20} color="#016A5D" />
          </button>
          <h1 style={{
            fontSize: '22px',
            fontWeight: '700',
            color: '#333333',
            margin: 0
          }}>
            Manage Units
          </h1>
          <p style={{ fontSize: '14px', color: '#777777', marginTop: '6px' }}>Units and availability</p>
        </div>

        {/* Content */}
        <div style={{ padding: '12px 20px 100px 20px' }}>
          <div style={{
            maxWidth: '960px',
            margin: '0 auto',
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid rgba(1,106,93,0.10)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            padding: '12px'
          }}>
            {/* Reuse existing page (functionality unchanged) */}
            <UnitsPage variant="mobile" initialShowImport={true} />
          </div>
        </div>

        {/* Role-Based Bottom Navigation */}
        <RoleBasedBottomNavigation />
      </div>
    </ProtectedRoute>
  );
};


