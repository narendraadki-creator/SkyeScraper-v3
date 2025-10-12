import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { RoleBasedBottomNavigation } from '../components/mobile/RoleBasedBottomNavigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export const MobileProjectUnitsPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

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

        {/* Content - Temporary Placeholder */}
        <div style={{ padding: '20px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            maxWidth: '400px',
            textAlign: 'center',
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <AlertCircle size={48} color="#016A5D" style={{ marginBottom: '16px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '12px' }}>
              Feature Coming Soon
            </h2>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
              Mobile unit management is being optimized for the best experience. 
              Please use the desktop version for now or contact support.
            </p>
            <button
              onClick={() => navigate(-1)}
              style={{
                backgroundColor: '#016A5D',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Go Back
            </button>
          </div>
        </div>

        {/* Role-Based Bottom Navigation */}
        <RoleBasedBottomNavigation />
      </div>
    </ProtectedRoute>
  );
};


