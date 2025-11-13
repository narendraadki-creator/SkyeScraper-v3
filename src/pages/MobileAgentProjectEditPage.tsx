import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { RoleBasedBottomNavigation } from '../components/mobile/RoleBasedBottomNavigation';
import { ArrowLeft, Lock, AlertTriangle } from 'lucide-react';

export const MobileAgentProjectEditPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/mobile/agent');
  };

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
          textAlign: 'center',
        }}>
          <button
            onClick={handleBack}
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
            Project Edit
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#777777',
            marginTop: '6px'
          }}>Access restricted</p>
        </div>

        {/* Access Denied Content */}
        <div style={{ 
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid rgba(220, 38, 38, 0.2)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            padding: '32px 24px',
            textAlign: 'center',
            maxWidth: '400px',
            width: '100%'
          }}>
            <div style={{
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              borderRadius: '50%',
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px auto'
            }}>
              <Lock size={40} color="#DC2626" />
            </div>
            
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#333333',
              marginBottom: '12px',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Access Restricted
            </h2>
            
            <p style={{
              fontSize: '16px',
              color: '#777777',
              marginBottom: '24px',
              lineHeight: '1.5',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Agents can view project details but cannot edit projects. Only developers and administrators can modify project information.
            </p>

            <div style={{
              backgroundColor: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid rgba(255, 193, 7, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertTriangle size={20} color="#F59E0B" />
              <span style={{
                fontSize: '14px',
                color: '#92400E',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                Contact your developer or administrator to make changes
              </span>
            </div>

            <button
              onClick={handleBack}
              style={{
                backgroundColor: '#016A5D',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'Montserrat, sans-serif',
                transition: 'background-color 0.2s ease',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#014D43';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#016A5D';
              }}
            >
              Back to Agent Dashboard
            </button>
          </div>
        </div>

        {/* Role-Based Bottom Navigation */}
        <RoleBasedBottomNavigation />
      </div>
    </ProtectedRoute>
  );
};
