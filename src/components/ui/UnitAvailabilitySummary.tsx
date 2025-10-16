import React, { useState, useEffect } from 'react';
import { Building, Users, Home, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { getUnitSummary, getUnits, type UnitSummary } from '../../services/smartUnitService';

interface UnitAvailabilitySummaryProps {
  projectId: string;
  onDataLoaded?: (summary: UnitSummary | null) => void;
  onUploadClick?: () => void;
  canUpload?: boolean;
}

export const UnitAvailabilitySummary: React.FC<UnitAvailabilitySummaryProps> = ({
  projectId,
  onDataLoaded,
  onUploadClick,
  canUpload = false
}) => {
  const [summary, setSummary] = useState<UnitSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));

  useEffect(() => {
    loadUnitSummary();
  }, [projectId]);

  const loadUnitSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const unitSummary = await getUnitSummary(projectId);
      setSummary(unitSummary);
      onDataLoaded?.(unitSummary);
    } catch (error) {
      console.error('Failed to load unit summary:', error);
      setError('Failed to load unit data');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle size={16} color="#10B981" />;
      case 'sold': return <AlertCircle size={16} color="#EF4444" />;
      case 'reserved': return <AlertCircle size={16} color="#F59E0B" />;
      case 'blocked': return <AlertCircle size={16} color="#6B7280" />;
      default: return <AlertCircle size={16} color="#6B7280" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#10B981';
      case 'sold': return '#EF4444';
      case 'reserved': return '#F59E0B';
      case 'blocked': return '#6B7280';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid rgba(1, 106, 93, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        fontFamily: 'Montserrat, sans-serif'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
          <div className="spinner" style={{
            border: '3px solid rgba(1, 106, 93, 0.1)',
            borderTop: '3px solid #016A5D',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            animation: 'spin 1s linear infinite'
          }}></div>
          <span style={{ color: '#016A5D', fontWeight: '500' }}>Loading unit data...</span>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid rgba(1, 106, 93, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        fontFamily: 'Montserrat, sans-serif'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <AlertCircle size={20} color="#EF4444" />
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#333333',
            margin: 0
          }}>
            Unit Data Not Available
          </h3>
        </div>
        <p style={{
          fontSize: '14px',
          color: '#777777',
          margin: 0,
          marginBottom: '16px'
        }}>
          {error || 'No unit data has been uploaded for this project yet.'}
        </p>
        <div style={{
          fontSize: '12px',
          color: '#999999',
          fontStyle: 'italic',
          marginBottom: '16px'
        }}>
          Upload a CSV or Excel file with unit data to see the summary.
        </div>
        {canUpload && onUploadClick && (
          <button
            onClick={onUploadClick}
            style={{
              padding: '12px 20px',
              backgroundColor: '#016A5D',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: 'Montserrat, sans-serif',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#014D42';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#016A5D';
            }}
          >
            Upload Unit Data
          </button>
        )}
      </div>
    );
  }

  const { total, byStatus, byBedrooms, byFloor, byTower, confidence } = summary;

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid rgba(1, 106, 93, 0.1)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      fontFamily: 'Montserrat, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid rgba(1, 106, 93, 0.1)',
        backgroundColor: '#F8F9F9'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#333333',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Building size={24} color="#016A5D" />
            Unit Availability Summary
          </h3>
          {confidence.overall < 0.8 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              backgroundColor: '#FEF3C7',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#92400E'
            }}>
              <AlertCircle size={14} />
              Review Required
            </div>
          )}
        </div>
        <div style={{
          fontSize: '14px',
          color: '#777777',
          marginTop: '4px'
        }}>
          Smart analysis of {total} units
        </div>
      </div>

      {/* Overview Section */}
      <div style={{ padding: '20px 24px' }}>
        <button
          onClick={() => toggleSection('overview')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'none',
            border: 'none',
            padding: '12px 0',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            color: '#333333',
            fontFamily: 'Montserrat, sans-serif'
          }}
        >
          <span>Overview</span>
          <span style={{
            transform: expandedSections.has('overview') ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}>
            ▼
          </span>
        </button>
        
        {expandedSections.has('overview') && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '16px',
            marginTop: '16px'
          }}>
            <div style={{
              textAlign: 'center',
              padding: '16px',
              backgroundColor: '#F0F9F8',
              borderRadius: '8px',
              border: '1px solid rgba(1, 106, 93, 0.1)'
            }}>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#016A5D',
                marginBottom: '4px'
              }}>
                {total}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#777777',
                fontWeight: '500'
              }}>
                Total Units
              </div>
            </div>
            
            {Object.entries(byStatus).map(([status, count]) => (
              <div key={status} style={{
                textAlign: 'center',
                padding: '16px',
                backgroundColor: '#F8F9F9',
                borderRadius: '8px',
                border: '1px solid rgba(1, 106, 93, 0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  marginBottom: '4px'
                }}>
                  {getStatusIcon(status)}
                  <span style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: getStatusColor(status)
                  }}>
                    {count}
                  </span>
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#777777',
                  fontWeight: '500',
                  textTransform: 'capitalize'
                }}>
                  {status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* By Bedrooms Section */}
      {Object.keys(byBedrooms).length > 0 && (
        <div style={{
          borderTop: '1px solid rgba(1, 106, 93, 0.1)',
          padding: '20px 24px'
        }}>
          <button
            onClick={() => toggleSection('bedrooms')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'none',
              border: 'none',
              padding: '12px 0',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              color: '#333333',
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Home size={18} color="#016A5D" />
              By Bedrooms
            </span>
            <span style={{
              transform: expandedSections.has('bedrooms') ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}>
              ▼
            </span>
          </button>
          
          {expandedSections.has('bedrooms') && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
              gap: '12px',
              marginTop: '16px'
            }}>
              {Object.entries(byBedrooms)
                .sort(([a], [b]) => {
                  if (a === 'unknown') return 1;
                  if (b === 'unknown') return -1;
                  return parseInt(a) - parseInt(b);
                })
                .map(([bedrooms, count]) => (
                  <div key={bedrooms} style={{
                    textAlign: 'center',
                    padding: '12px',
                    backgroundColor: '#F8F9F9',
                    borderRadius: '8px',
                    border: '1px solid rgba(1, 106, 93, 0.1)'
                  }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#016A5D',
                      marginBottom: '4px'
                    }}>
                      {count}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#777777',
                      fontWeight: '500'
                    }}>
                      {bedrooms === 'unknown' ? 'Unknown' : `${bedrooms} BR`}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* By Floor Section */}
      {Object.keys(byFloor).length > 1 && (
        <div style={{
          borderTop: '1px solid rgba(1, 106, 93, 0.1)',
          padding: '20px 24px'
        }}>
          <button
            onClick={() => toggleSection('floor')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'none',
              border: 'none',
              padding: '12px 0',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              color: '#333333',
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="#016A5D" />
              By Floor
            </span>
            <span style={{
              transform: expandedSections.has('floor') ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}>
              ▼
            </span>
          </button>
          
          {expandedSections.has('floor') && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
              gap: '12px',
              marginTop: '16px'
            }}>
              {Object.entries(byFloor)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([floor, count]) => (
                  <div key={floor} style={{
                    textAlign: 'center',
                    padding: '12px',
                    backgroundColor: '#F8F9F9',
                    borderRadius: '8px',
                    border: '1px solid rgba(1, 106, 93, 0.1)'
                  }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: '#016A5D',
                      marginBottom: '4px'
                    }}>
                      {count}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#777777',
                      fontWeight: '500'
                    }}>
                      Floor {floor}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* By Tower Section */}
      {Object.keys(byTower).length > 1 && (
        <div style={{
          borderTop: '1px solid rgba(1, 106, 93, 0.1)',
          padding: '20px 24px'
        }}>
          <button
            onClick={() => toggleSection('tower')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'none',
              border: 'none',
              padding: '12px 0',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              color: '#333333',
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={18} color="#016A5D" />
              By Tower/Project
            </span>
            <span style={{
              transform: expandedSections.has('tower') ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}>
              ▼
            </span>
          </button>
          
          {expandedSections.has('tower') && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginTop: '16px'
            }}>
              {Object.entries(byTower)
                .sort(([, a], [, b]) => b - a)
                .map(([tower, count]) => (
                  <div key={tower} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    backgroundColor: '#F8F9F9',
                    borderRadius: '8px',
                    border: '1px solid rgba(1, 106, 93, 0.1)'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#333333',
                      flex: 1,
                      wordBreak: 'break-word'
                    }}>
                      {tower}
                    </div>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#016A5D',
                      marginLeft: '12px'
                    }}>
                      {count}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Confidence Indicator */}
      {confidence.overall < 0.9 && (
        <div style={{
          borderTop: '1px solid rgba(1, 106, 93, 0.1)',
          padding: '16px 24px',
          backgroundColor: '#F8F9F9'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: '#777777'
          }}>
            <AlertCircle size={14} />
            <span>
              Data confidence: {Math.round(confidence.overall * 100)}% - 
              Some fields may need manual review
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
