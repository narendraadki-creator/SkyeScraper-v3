import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RoleBasedBottomNavigation } from '../components/mobile/RoleBasedBottomNavigation';
import { Star, TrendingUp, Gift, Percent, ArrowLeft } from 'lucide-react';

export const MobileDeveloperPromotionsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F5F5F5',
      paddingBottom: '80px',
      fontFamily: 'Montserrat, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #016A5D 0%, #014D43 100%)',
        padding: '20px',
        color: 'white',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <button
            onClick={() => navigate('/mobile/dev')}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px',
              marginRight: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowLeft size={20} color="white" />
          </button>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              margin: 0,
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Promotions
            </h1>
            <p style={{
              fontSize: '14px',
              margin: '4px 0 0 0',
              opacity: 0.9,
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Manage your promotional campaigns
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '16px',
          border: '1px solid rgba(1, 106, 93, 0.1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          textAlign: 'center'
        }}>
          <Star size={48} color="#CBA135" style={{ marginBottom: '16px' }} />
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#333333',
            marginBottom: '12px',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            Coming Soon!
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#777777',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            Promotional campaign management tools will be available here soon.
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid rgba(1, 106, 93, 0.1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#333333',
            marginBottom: '16px',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            What to Expect:
          </h3>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0
          }}>
            {[
              { icon: TrendingUp, text: 'Create promotional campaigns' },
              { icon: Gift, text: 'Set up special offers and discounts' },
              { icon: Percent, text: 'Track campaign performance' },
              { icon: Star, text: 'Target specific agent organizations' }
            ].map((item, index) => (
              <li key={index} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: index < 3 ? '1px solid rgba(1, 106, 93, 0.1)' : 'none'
              }}>
                <div style={{
                  backgroundColor: 'rgba(1, 106, 93, 0.1)',
                  borderRadius: '8px',
                  padding: '8px',
                  marginRight: '12px'
                }}>
                  <item.icon size={20} color="#016A5D" />
                </div>
                <span style={{
                  fontSize: '16px',
                  color: '#333333',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Role-Based Bottom Navigation */}
      <RoleBasedBottomNavigation />
    </div>
  );
};
