import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { ProjectEditPage } from './ProjectEditPage';
import { ArrowLeft } from 'lucide-react';

export const MobileProjectEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  return (
    <ProtectedRoute>
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#F8F9F9',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Montserrat, sans-serif'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#F8F9F9',
          padding: '24px 20px 16px 20px',
          position: 'relative',
          textAlign: 'center',
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
            Edit Project
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#777777',
            marginTop: '6px'
          }}>Update your project details</p>
        </div>

        {/* Content */}
        <div style={{ padding: '12px 20px 100px 20px' }}>
          <div style={{
            maxWidth: '720px',
            margin: '0 auto',
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid rgba(1,106,93,0.10)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            padding: '16px'
          }}>
            {/* Reuse existing page (functionality unchanged) */}
            <ProjectEditPage variant="mobile" />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};


