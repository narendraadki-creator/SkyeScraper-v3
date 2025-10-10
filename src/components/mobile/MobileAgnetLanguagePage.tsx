import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AgentBottomNavigation } from './AgentBottomNavigation';
import { 
  Globe,
  MapPin,
  Clock,
  Check,
  ArrowLeft,
  Home,
  Users,
  Gift,
  Settings
} from 'lucide-react';

interface MobileLanguagePageProps {
  className?: string;
}

export const MobileAgentLanguagePage: React.FC<MobileLanguagePageProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedRegion, setSelectedRegion] = useState('AE');
  const [selectedTimezone, setSelectedTimezone] = useState('Asia/Dubai');

  const handleBack = () => {
    navigate('/mobile/settings');
  };

  const handleSave = () => {
    // Here you would typically save the settings
    console.log('Saving language settings:', { selectedLanguage, selectedRegion, selectedTimezone });
    navigate('/mobile/settings');
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇦🇪' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ur', name: 'اردو', flag: '🇵🇰' }
  ];

  const regions = [
    { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
    { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
    { code: 'KW', name: 'Kuwait', flag: '🇰🇼' },
    { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
    { code: 'BH', name: 'Bahrain', flag: '🇧🇭' },
    { code: 'OM', name: 'Oman', flag: '🇴🇲' }
  ];

  const timezones = [
    { code: 'Asia/Dubai', name: 'Dubai (GMT+4)' },
    { code: 'Asia/Riyadh', name: 'Riyadh (GMT+3)' },
    { code: 'Asia/Kuwait', name: 'Kuwait (GMT+3)' },
    { code: 'Asia/Qatar', name: 'Qatar (GMT+3)' },
    { code: 'Asia/Bahrain', name: 'Bahrain (GMT+3)' },
    { code: 'Asia/Muscat', name: 'Muscat (GMT+4)' }
  ];

  return (
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
        padding: '60px 20px 40px 20px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <button
          onClick={handleBack}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            backgroundColor: 'white',
            border: '1px solid rgba(1, 106, 93, 0.15)',
            borderRadius: '8px',
            padding: '8px',
            boxShadow: '0 1px 8px rgba(0, 0, 0, 0.05)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ArrowLeft size={20} color="#016A5D" />
        </button>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#333333',
          marginBottom: '8px'
        }}>
          Language & Region
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#777777',
          fontWeight: '300'
        }}>
          Set your language and region preferences
        </p>
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        padding: '0 20px 100px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        {/* Language Selection */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid rgba(1, 106, 93, 0.1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          marginBottom: '24px'
        }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            marginBottom: '20px', 
            color: '#333333',
            fontFamily: 'Montserrat, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Globe size={24} color="#016A5D" />
            Language
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => setSelectedLanguage(language.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  border: `1px solid ${selectedLanguage === language.code ? '#016A5D' : 'rgba(1, 106, 93, 0.15)'}`,
                  borderRadius: '12px',
                  backgroundColor: selectedLanguage === language.code ? '#F0F9F8' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedLanguage === language.code ? '0 2px 8px rgba(1, 106, 93, 0.15)' : '0 1px 4px rgba(0, 0, 0, 0.05)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '24px' }}>{language.flag}</span>
                  <span style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: '#333333',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    {language.name}
                  </span>
                </div>
                {selectedLanguage === language.code && (
                  <Check size={24} color="#016A5D" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Region Selection */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid rgba(1, 106, 93, 0.1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          marginBottom: '24px'
        }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            marginBottom: '20px', 
            color: '#333333',
            fontFamily: 'Montserrat, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <MapPin size={24} color="#016A5D" />
            Region
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {regions.map((region) => (
              <button
                key={region.code}
                onClick={() => setSelectedRegion(region.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  border: `1px solid ${selectedRegion === region.code ? '#016A5D' : 'rgba(1, 106, 93, 0.15)'}`,
                  borderRadius: '12px',
                  backgroundColor: selectedRegion === region.code ? '#F0F9F8' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedRegion === region.code ? '0 2px 8px rgba(1, 106, 93, 0.15)' : '0 1px 4px rgba(0, 0, 0, 0.05)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '24px' }}>{region.flag}</span>
                  <span style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: '#333333',
                    fontFamily: 'Montserrat, sans-serif'
                  }}>
                    {region.name}
                  </span>
                </div>
                {selectedRegion === region.code && (
                  <Check size={24} color="#016A5D" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Timezone Selection */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid rgba(1, 106, 93, 0.1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          marginBottom: '24px'
        }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            marginBottom: '20px', 
            color: '#333333',
            fontFamily: 'Montserrat, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Clock size={24} color="#016A5D" />
            Timezone
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {timezones.map((timezone) => (
              <button
                key={timezone.code}
                onClick={() => setSelectedTimezone(timezone.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  border: `1px solid ${selectedTimezone === timezone.code ? '#016A5D' : 'rgba(1, 106, 93, 0.15)'}`,
                  borderRadius: '12px',
                  backgroundColor: selectedTimezone === timezone.code ? '#F0F9F8' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedTimezone === timezone.code ? '0 2px 8px rgba(1, 106, 93, 0.15)' : '0 1px 4px rgba(0, 0, 0, 0.05)'
                }}
              >
                <span style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: '#333333',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {timezone.name}
                </span>
                {selectedTimezone === timezone.code && (
                  <Check size={24} color="#016A5D" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          style={{
            width: '100%',
            padding: '16px 24px',
            backgroundColor: '#016A5D',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontFamily: 'Montserrat, sans-serif',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.2s ease'
          }}
        >
          <Check size={20} />
          Save Settings
        </button>
      </div>

      {/* Agent Bottom Navigation */}
      <AgentBottomNavigation />
    </div>
  );
};
