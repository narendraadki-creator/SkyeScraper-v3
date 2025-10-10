import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { projectService } from '../../services/projectService';
import { unitService } from '../../services/unitService';
import { AgentBottomNavigation } from './AgentBottomNavigation';
import type { Project } from '../../types/project';
import type { Unit } from '../../types/unit';
import { 
  ArrowLeft,
  MapPin,
  DollarSign,
  Calendar,
  Building,
  Bed,
  Bath,
  Download,
  Star,
  Home,
  Users,
  TrendingUp,
  Settings,
  ChevronRight,
  Play,
  FileText,
  CheckCircle,
  Clock,
  CreditCard,
  Eye,
  Share2,
  Image as ImageIcon,
  File,
  FileImage,
  Edit,
  Trash2,
  Archive,
  Upload,
  Plus
} from 'lucide-react';
import { fileService } from '../../services/fileService';

interface MobileDeveloperProjectDetailsProps {
  className?: string;
}

type TabType = 'overview' | 'floor-plans' | 'brochures' | 'availability' | 'payment-plans';

export const MobileDeveloperProjectDetails: React.FC<MobileDeveloperProjectDetailsProps> = ({ className = '' }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [projectFiles, setProjectFiles] = useState<any[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [displayConfig, setDisplayConfig] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [visibleUnitsCount, setVisibleUnitsCount] = useState(10);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'delete' | 'archive' | null>(null);
  const [uploadPurpose, setUploadPurpose] = useState<'brochure' | 'floor_plan' | 'unit_data' | 'image' | 'document'>('brochure');
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; text: string; type: 'success' | 'error' }>(
    { visible: false, text: '', type: 'success' }
  );

  const getAcceptForPurpose = (purpose: typeof uploadPurpose) => {
    if (purpose === 'unit_data') return '.xlsx,.xls,.csv';
    if (purpose === 'image') return 'image/*';
    return '.pdf,.doc,.docx,.xlsx,.xls,.csv,.txt,.jpg,.jpeg,.png,.gif,.webp';
  };

  const handleOpenFilePicker = (purpose: typeof uploadPurpose) => {
    setUploadPurpose(purpose);
    const input = fileInputRef.current;
    if (input) {
      input.value = '';
      input.setAttribute('accept', getAcceptForPurpose(purpose));
      input.click();
    }
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !project) return;
    try {
      setUploading(true);
      await fileService.uploadFile(file, project.id, uploadPurpose);
      await loadProjectData();
      setToast({ visible: true, text: `${file.name} uploaded successfully`, type: 'success' });
    } catch (err) {
      console.error('Upload failed:', err);
      setToast({ visible: true, text: 'Upload failed. Please try again.', type: 'error' });
    }
    setUploading(false);
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500);
  };

  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  // Reset visible units count when tab changes
  useEffect(() => {
    setVisibleUnitsCount(10);
  }, [activeTab]);

  const loadProjectData = async () => {
    setLoading(true);
    try {
      console.log('Loading project data for ID:', projectId);
      
      // Load project data
      const projectData = await projectService.getProject(projectId!);
      console.log('Project loaded:', projectData);
      setProject(projectData);
      
      // Load project files from database
      const { supabase } = await import('../../lib/supabase');
      const { data: files, error: filesError } = await supabase
        .from('project_files')
        .select('*')
        .eq('project_id', projectId)
        .in('file_purpose', ['brochure', 'floor_plan', 'image', 'document'])
        .order('uploaded_at', { ascending: false });

      if (filesError) {
        console.error('Error loading project files:', filesError);
      } else {
        console.log('Project files loaded:', files);
        setProjectFiles(files || []);
      }

      // Load units data
      try {
        const unitsData = await unitService.getUnits(projectId!);
        console.log('Units loaded:', unitsData);
        setUnits(unitsData);
        
        // Generate display config from units data
        if (unitsData.length > 0) {
          const customCols = new Set<string>();
          unitsData.forEach(unit => {
            if (unit.custom_fields) {
              Object.keys(unit.custom_fields).forEach(key => {
                if (key !== 'id' && key !== 'project_id') {
                  customCols.add(key);
                }
              });
            }
          });

          const config = Array.from(customCols).map(col => {
            const sampleValue = unitsData.find(u => u.custom_fields?.[col])?.custom_fields?.[col];
            let type = 'text';
            if (typeof sampleValue === 'number') {
              type = 'number';
            } else if (typeof sampleValue === 'string' && sampleValue.includes('$')) {
              type = 'currency';
            }
            return {
              source: col,
              label: col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              type
            };
          });
          setDisplayConfig(config);
        }
      } catch (error) {
        console.error('Error loading units:', error);
      }
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAvailabilityStatus = (project: Project) => {
    if (!project.total_units) return 'Available';
    const availableUnits = project.total_units - (project.leads_count || 0);
    if (availableUnits <= 0) return 'Sold Out';
    if (availableUnits <= 5) return 'Few Units Left';
    return 'Available';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return '#10B981';
      case 'draft': return '#F59E0B';
      case 'archived': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return <ImageIcon size={20} />;
    if (fileType.includes('pdf')) return <FileText size={20} />;
    return <File size={20} />;
  };

  const getFileType = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toUpperCase();
    return extension || 'FILE';
  };

  const handleViewFile = (url: string) => {
    window.open(url, '_blank');
  };

  const handleDownloadFile = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareFile = async (url: string, fileName: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: fileName,
          url: url
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        alert('File URL copied to clipboard');
      } catch (error) {
        console.log('Error copying to clipboard:', error);
      }
    }
  };

  const handleDelete = async () => {
    if (!project) return;
    try {
      await projectService.deleteProject(project.id);
      navigate('/mobile/developer');
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleArchive = async () => {
    if (!project) return;
    try {
      const next = project.status === 'archived' ? 'published' : 'archived';
      await projectService.updateProject(project.id, { status: next as any });
      setProject({ ...project, status: next as any });
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Error archiving project:', error);
    }
  };

  const handleConfirmAction = () => {
    if (confirmAction === 'delete') {
      handleDelete();
    } else if (confirmAction === 'archive') {
      handleArchive();
    }
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  const formatValue = (value: any, type: string) => {
    if (value === null || value === undefined) return '-';
    if (type === 'currency') {
      return formatCurrency(Number(value));
    }
    if (type === 'number') {
      return Number(value).toLocaleString();
    }
    return String(value);
  };

  const getValue = (unit: Unit, config: any) => {
    return unit.custom_fields?.[config.source] || '-';
  };

  const handleLoadMoreUnits = () => {
    setVisibleUnitsCount(prev => Math.min(prev + 10, units.length));
  };

  const handleShowAllUnits = () => {
    setVisibleUnitsCount(units.length);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'floor-plans', label: 'Floor Plans', icon: Building },
    { id: 'brochures', label: 'Brochures', icon: FileText },
    { id: 'availability', label: 'Availability', icon: CheckCircle },
    { id: 'payment-plans', label: 'Payment Plans', icon: CreditCard }
  ];

  const renderTabContent = () => {
    if (!project) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <div style={{ padding: '20px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--gray-900)',
              marginBottom: '16px'
            }}>
              Project Overview
            </h3>
            <p style={{
              fontSize: '14px',
              lineHeight: '1.6',
              color: 'var(--gray-700)',
              marginBottom: '20px'
            }}>
              {project.description || 'No description available for this project.'}
            </p>
            
            {project.amenities && project.amenities.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'var(--gray-900)',
                  marginBottom: '12px'
                }}>
                  Amenities
                </h4>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  {project.amenities.map((amenity, index) => (
                    <span key={index} style={{
                      backgroundColor: 'var(--primary-50)',
                      color: 'var(--primary-600)',
                      padding: '6px 12px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {typeof amenity === 'string' ? amenity : amenity.name || JSON.stringify(amenity)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {project.connectivity && project.connectivity.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'var(--gray-900)',
                  marginBottom: '12px'
                }}>
                  Connectivity
                </h4>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  {project.connectivity.map((item, index) => (
                    <span key={index} style={{
                      backgroundColor: 'var(--gray-50)',
                      color: 'var(--gray-700)',
                      padding: '6px 12px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {typeof item === 'string' ? item : item.name || JSON.stringify(item)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {project.landmarks && project.landmarks.length > 0 && (
              <div>
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'var(--gray-900)',
                  marginBottom: '12px'
                }}>
                  Nearby Landmarks
                </h4>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  {project.landmarks.map((landmark, index) => (
                    <span key={index} style={{
                      backgroundColor: 'var(--gray-50)',
                      color: 'var(--gray-700)',
                      padding: '6px 12px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {typeof landmark === 'string' ? landmark : landmark.name || JSON.stringify(landmark)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'floor-plans':
        return (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            minHeight: '350px'
          }}>
            <Building size={48} color="#E5E7EB" style={{ marginBottom: '16px' }} />
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--gray-900)',
              marginBottom: '8px'
            }}>
              Floor Plans
            </h3>
            <p style={{
              fontSize: '14px',
              color: 'var(--gray-500)'
            }}>
              Floor plans will be displayed here
            </p>
          </div>
        );

      case 'brochures':
        return (
          <div style={{ padding: '16px' }}>
            {/* Upload Actions */}
            <div style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'flex-end',
              marginBottom: '12px'
            }}>
              {[
                { id: 'brochure', label: 'Upload Brochure' },
                { id: 'floor_plan', label: 'Upload Floor Plan' },
                { id: 'image', label: 'Upload Image' },
                { id: 'document', label: 'Upload Document' }
              ].map(btn => (
                <button
                  key={btn.id}
                  onClick={() => handleOpenFilePicker(btn.id as any)}
                  style={{
                    padding: '10px 12px',
                    backgroundColor: 'var(--primary-600)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            {projectFiles.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--gray-500)'
              }}>
                <FileText size={48} color="#E5E7EB" style={{ marginBottom: '16px' }} />
                <p style={{ fontSize: '16px', marginBottom: '8px' }}>No files available</p>
                <p style={{ fontSize: '14px' }}>Files will appear here once uploaded</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {projectFiles.map((file, index) => (
                  <div key={index} style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '12px',
                    border: '1px solid var(--gray-200)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{
                      flex: 1,
                      minWidth: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      justifyContent: 'flex-start'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '4px'
                      }}>
                        <span style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: 'var(--gray-900)',
                          textAlign: 'left'
                        }}>
                          {file.file_name}
                        </span>
                        <span style={{
                          padding: '2px 6px',
                          backgroundColor: 'var(--primary-100)',
                          color: 'var(--primary-700)',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {getFileType(file.file_name)}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginBottom: '4px'
                      }}>
                        <span style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: 'var(--primary-600)',
                          backgroundColor: 'var(--primary-50)',
                          padding: '4px 8px',
                          borderRadius: '6px'
                        }}>
                          {file.file_purpose}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: 'var(--gray-500)',
                        wordBreak: 'break-all',
                        fontFamily: 'monospace',
                        textAlign: 'left'
                      }}>
                        {file.public_url}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--gray-400)',
                        fontWeight: '500',
                        textAlign: 'left'
                      }}>
                        {file.file_size ? `${(file.file_size / 1024).toFixed(1)} KB` : 'Unknown size'}
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      marginLeft: '12px'
                    }}>
                      <button
                        onClick={() => handleViewFile(file.public_url)}
                        style={{
                          padding: '10px',
                          backgroundColor: 'var(--primary-50)',
                          color: 'var(--primary-600)',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--primary-100)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--primary-50)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleDownloadFile(file.public_url, file.file_name)}
                        style={{
                          padding: '10px',
                          backgroundColor: 'var(--success-50)',
                          color: 'var(--success-600)',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--success-100)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--success-50)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => handleShareFile(file.public_url, file.file_name)}
                        style={{
                          padding: '10px',
                          backgroundColor: 'var(--warning-50)',
                          color: 'var(--warning-600)',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--warning-100)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--warning-50)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'availability':
        return (
          <div style={{ padding: '16px' }}>
            {/* Unit Data Upload (uses existing Units import logic) */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
              <button
                onClick={() => navigate(`/mobile/developer/project/${project?.id}/units`)}
                style={{
                  padding: '10px 12px',
                  backgroundColor: 'var(--primary-600)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Upload Unit Data
              </button>
            </div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid var(--gray-200)',
              marginBottom: '16px'
            }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: 'var(--gray-900)',
                marginBottom: '12px'
              }}>
                Unit Availability Summary
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: 'var(--primary-600)'
                  }}>
                    {units.length}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--gray-500)'
                  }}>
                    Total Units
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: 'var(--success-600)'
                  }}>
                    {units.length}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--gray-500)'
                  }}>
                    Available
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: 'var(--warning-600)'
                  }}>
                    {project.leads_count || 0}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--gray-500)'
                  }}>
                    Leads Generated
                  </div>
                </div>
              </div>
            </div>

            {units.length > 0 ? (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid var(--gray-200)',
                overflow: 'hidden'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${displayConfig.length + 1}, 1fr)`,
                  backgroundColor: 'var(--gray-50)'
                }}>
                  <div style={{
                    padding: '12px 8px',
                    textAlign: 'left',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'var(--gray-500)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Unit
                  </div>
                  {displayConfig.map((config, index) => (
                    <div key={index} style={{
                      padding: '12px 8px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'var(--gray-500)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {config.label}
                    </div>
                  ))}
                </div>
                {units.slice(0, visibleUnitsCount).map((unit, unitIndex) => (
                  <div key={unit.id} style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${displayConfig.length + 1}, 1fr)`,
                    borderBottom: unitIndex < visibleUnitsCount - 1 ? '1px solid var(--gray-200)' : 'none',
                    backgroundColor: unitIndex % 2 === 0 ? 'white' : 'var(--gray-25)'
                  }}>
                    <div style={{
                      padding: '12px 8px',
                      fontSize: '14px',
                      color: 'var(--gray-900)'
                    }}>
                      {unitIndex + 1}
                    </div>
                    {displayConfig.map((config, configIndex) => (
                      <div key={configIndex} style={{
                        padding: '12px 8px',
                        fontSize: '14px',
                        color: 'var(--gray-900)'
                      }}>
                        {formatValue(getValue(unit, config), config.type)}
                      </div>
                    ))}
                  </div>
                ))}
                {units.length > visibleUnitsCount && (
                  <div style={{
                    padding: '16px',
                    borderTop: '1px solid var(--gray-200)',
                    textAlign: 'center',
                    backgroundColor: 'var(--gray-50)'
                  }}>
                    <div style={{
                      marginBottom: '12px',
                      fontSize: '14px',
                      color: 'var(--gray-600)'
                    }}>
                      Showing {visibleUnitsCount} of {units.length} available units
                    </div>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                      <button
                        onClick={handleLoadMoreUnits}
                        style={{
                          backgroundColor: 'var(--primary-600)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Load 10 More
                      </button>
                      <button
                        onClick={handleShowAllUnits}
                        style={{
                          backgroundColor: 'var(--gray-220)',
                          color: 'var(--gray-700)',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        Show All
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--gray-500)'
              }}>
                <Building size={48} color="#E5E7EB" style={{ marginBottom: '16px' }} />
                <p style={{ fontSize: '16px', marginBottom: '8px' }}>No units available</p>
                <p style={{ fontSize: '14px' }}>Units will appear here once added</p>
              </div>
            )}
          </div>
        );

      case 'payment-plans':
        return (
          <div style={{ padding: '20px' }}>
            {project.payment_plans && project.payment_plans.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {project.payment_plans.map((plan: any, index: number) => (
                  <div key={index} style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid var(--gray-200)'
                  }}>
                    <h4 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: 'var(--gray-900)',
                      marginBottom: '12px'
                    }}>
                      {plan.name || `Payment Plan ${index + 1}`}
                    </h4>
                    <p style={{
                      fontSize: '14px',
                      color: 'var(--gray-600)',
                      marginBottom: '16px'
                    }}>
                      {plan.description || 'No description available'}
                    </p>
                    {plan.terms && (
                      <div>
                        <h5 style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: 'var(--gray-900)',
                          marginBottom: '8px'
                        }}>
                          Terms & Conditions
                        </h5>
                        <p style={{
                          fontSize: '14px',
                          color: 'var(--gray-700)',
                          lineHeight: '1.5'
                        }}>
                          {plan.terms}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--gray-500)'
              }}>
                <CreditCard size={48} color="#E5E7EB" style={{ marginBottom: '16px' }} />
                <p style={{ fontSize: '16px', marginBottom: '8px' }}>No payment plans available</p>
                <p style={{ fontSize: '14px' }}>Payment plans will appear here once added</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#F8F9F9',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Montserrat, sans-serif'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontSize: '18px',
          color: '#777777'
        }}>
          Loading project details...
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#F8F9F9',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Montserrat, sans-serif'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          fontSize: '18px',
          color: '#777777'
        }}>
          Project not found
        </div>
      </div>
    );
  }

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
        padding: '20px',
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        {/* Left Side - Back Button and Title */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <button
            onClick={() => navigate('/mobile/developer')}
            style={{
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
          <div>
            <h1 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#333333',
              marginBottom: '4px',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              {project.name}
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#777777',
              fontWeight: '300',
              fontFamily: 'Montserrat, sans-serif'
            }}>
              Project Details
            </p>
          </div>
        </div>
        
        {/* Right Side - Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          <button
            onClick={() => navigate(`/mobile/developer/project/${project.id}/edit`)}
            style={{
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
            <Edit size={16} color="#016A5D" />
          </button>
          <button
            onClick={() => navigate(`/mobile/developer/project/${project.id}/units`)}
            style={{
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
            <Building size={16} color="#016A5D" />
          </button>
          <button
            onClick={() => { setConfirmAction('archive'); setShowConfirmDialog(true); }}
            title={project.status === 'archived' ? 'Unarchive' : 'Archive'}
            style={{
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
            <Archive size={16} color="#016A5D" />
          </button>
          <button
            onClick={() => { setConfirmAction('delete'); setShowConfirmDialog(true); }}
            style={{
              backgroundColor: 'white',
              border: '1px solid rgba(220, 38, 38, 0.15)',
              borderRadius: '8px',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 8px rgba(0, 0, 0, 0.05)'
            }}
          >
            <Trash2 size={16} color="#DC2626" />
          </button>
        </div>
      </div>

      {/* Image/Gallery Section */}
      <div style={{
        height: '250px',
        backgroundColor: '#F0F9F8',
        margin: '0 20px 20px 20px',
        borderRadius: '12px',
        border: '1px solid rgba(1, 106, 93, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          backgroundColor: '#016A5D',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '16px',
          fontWeight: '600'
        }}>
          {formatCurrency(project.starting_price || 0)}
        </div>
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          backgroundColor: getAvailabilityStatus(project) === 'Few Units Left' ? '#CBA135' : '#016A5D',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '16px',
          fontSize: '12px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {getAvailabilityStatus(project)}
        </div>
        <Building size={64} color="#016A5D" />
      </div>

      {/* Key Details Box */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        margin: '0 20px 20px 20px',
        borderRadius: '12px',
        border: '1px solid rgba(1, 106, 93, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#333333',
          marginBottom: '16px'
        }}>
          {project.name}
        </h2>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <MapPin size={20} color="#016A5D" />
            <span style={{
              fontSize: '16px',
              color: '#333333',
              fontWeight: '500'
            }}>
              {project.location}
            </span>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <DollarSign size={20} color="#016A5D" />
            <span style={{
              fontSize: '16px',
              color: '#333333',
              fontWeight: '500'
            }}>
              Starting from {formatCurrency(project.starting_price || 0)}
            </span>
          </div>
          
          {project.completion_date && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Calendar size={20} color="#016A5D" />
              <span style={{
                fontSize: '16px',
                color: '#333333',
                fontWeight: '500'
              }}>
                Possession: {formatDate(project.completion_date)}
              </span>
            </div>
          )}
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <CheckCircle size={20} color="#016A5D" />
            <span style={{
              fontSize: '16px',
              color: '#333333',
              fontWeight: '500'
            }}>
              Status: {project.status}
            </span>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Building size={20} color="#016A5D" />
            <span style={{
              fontSize: '16px',
              color: '#333333',
              fontWeight: '500'
            }}>
              Type: {project.project_type || 'Residential'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabbed Navigation */}
      <div style={{
        backgroundColor: 'white',
        margin: '0 20px 20px 20px',
        borderRadius: '12px',
        border: '1px solid rgba(1, 106, 93, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'flex',
          overflowX: 'auto'
        }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '16px 8px',
                  backgroundColor: activeTab === tab.id ? 'rgba(1, 106, 93, 0.1)' : 'transparent',
                  color: activeTab === tab.id ? '#016A5D' : '#777777',
                  border: 'none',
                  cursor: 'pointer',
                  minWidth: '80px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={20} color={activeTab === tab.id ? '#016A5D' : '#777777'} />
                <span style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  letterSpacing: '0.3px'
                }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Content Area */}
      <div style={{
        margin: '0 20px 100px 20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid rgba(1, 106, 93, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        minHeight: '450px',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '450px',
          overflowY: 'auto'
        }}>
          {renderTabContent()}
        </div>
      </div>

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileSelected}
      />

      {/* Upload progress chip */}
      {uploading && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          backgroundColor: 'white', border: '1px solid rgba(1,106,93,0.2)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)', borderRadius: 9999,
          padding: '8px 14px', color: '#016A5D', fontWeight: 600, zIndex: 1100
        }}>
          Uploading...
        </div>
      )}

      {/* Toast */}
      {toast.visible && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          backgroundColor: toast.type === 'success' ? '#016A5D' : '#DC2626',
          color: 'white', borderRadius: 8, padding: '10px 16px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.18)', zIndex: 1100,
          fontWeight: 600, letterSpacing: 0.3
        }}>
          {toast.text}
        </div>
      )}

      {/* Agent Bottom Navigation */}
      <AgentBottomNavigation />

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#333333',
              marginBottom: '12px'
            }}>
              Confirm Action
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#777777',
              marginBottom: '24px'
            }}>
              {confirmAction === 'delete' ? 'Are you sure you want to delete this project? This action cannot be undone.' : (project?.status === 'archived' ? 'Unarchive this project?' : 'Archive this project?')}
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setShowConfirmDialog(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#777777',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              {confirmAction === 'delete' ? (
                <button
                  onClick={handleConfirmAction}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#DC2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              ) : (
                <button
                  onClick={handleArchive}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#016A5D',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {project?.status === 'archived' ? 'Unarchive' : 'Archive'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
