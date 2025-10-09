import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { projectService } from '../../services/projectService';
import { unitService } from '../../services/unitService';
import { MobileLayout } from './MobileLayout';
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
  Calendar as CalendarIcon,
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
  FileImage
} from 'lucide-react';
import { fileService } from '../../services/fileService';

interface PropertyDetailsPageProps {
  className?: string;
}

type TabType = 'overview' | 'floor-plans' | 'brochures' | 'availability' | 'payment-plans';

export const PropertyDetailsPage: React.FC<PropertyDetailsPageProps> = ({ className = '' }) => {
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
        console.log('File purposes found:', files?.map(f => f.file_purpose));
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
                customCols.add(key);
              });
            }
          });
          
          // Create display config with proper formatting
          const generatedDisplayConfig = Array.from(customCols).map(col => {
            // Determine data type based on sample values
            const sampleValues = unitsData.slice(0, 5).map(unit => unit.custom_fields?.[col]).filter(v => v !== undefined);
            let type = 'text';
            
            if (sampleValues.length > 0) {
              const firstValue = sampleValues[0];
              if (typeof firstValue === 'number' || (!isNaN(Number(firstValue)) && String(firstValue).includes('.'))) {
                type = 'number';
              } else if (String(firstValue).toLowerCase().includes('aed') || String(firstValue).includes(',')) {
                type = 'currency';
              }
            }
            
            return {
              source: col,
              label: col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              type: type
            };
          });
          
          console.log('Generated display config:', generatedDisplayConfig);
          setDisplayConfig(generatedDisplayConfig);
        }
      } catch (unitsError) {
        console.error('Error loading units:', unitsError);
        setUnits([]);
        setDisplayConfig([]);
      }
      
      setProject(projectData);
    } catch (error) {
      console.error('Failed to load project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  const handleDownloadBrochure = () => {
    if (project?.brochure_url) {
      window.open(project.brochure_url, '_blank');
    } else {
      alert('Brochure not available for this project');
    }
  };

  const handleBookSiteVisit = () => {
    // Navigate to site visit booking page or show modal
    alert('Site visit booking functionality will be implemented');
  };

  const handleReserveUnit = () => {
    // Navigate to unit reservation page
    alert('Unit reservation functionality will be implemented');
  };

  const handleLoadMoreUnits = () => {
    setVisibleUnitsCount(prev => Math.min(prev + 10, units.filter(u => u.status === 'available').length));
  };

  const handleShowAllUnits = () => {
    setVisibleUnitsCount(units.filter(u => u.status === 'available').length);
  };

  // Helper functions for table formatting (from UnitsTable)
  const formatValue = (value: any, type: string) => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    if (type === 'currency') {
      return new Intl.NumberFormat('en-AE', {
        style: 'currency',
        currency: 'AED',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(Number(value));
    }

    if (type === 'number') {
      return new Intl.NumberFormat('en-US').format(Number(value));
    }

    return String(value);
  };

  const getValue = (unit: Unit, source: string) => {
    if (!source) return null;
    
    // Check custom_fields first
    if (unit.custom_fields && unit.custom_fields[source] !== undefined) {
      return unit.custom_fields[source];
    }
    
    // Check standard fields
    const trimmedSource = source.trim();
    if (unit.custom_fields && unit.custom_fields[trimmedSource] !== undefined) {
      return unit.custom_fields[trimmedSource];
    }
    
    return null;
  };

  const handleViewFile = (fileUrl: string, fileName: string) => {
    // Open file in new tab for viewing
    window.open(fileUrl, '_blank');
  };

  const handleDownloadFile = (fileUrl: string, fileName: string) => {
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareFile = (fileUrl: string, fileName: string) => {
    // Use Web Share API if available, otherwise copy to clipboard
    if (navigator.share) {
      navigator.share({
        title: fileName,
        url: fileUrl
      }).catch(console.error);
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(fileUrl).then(() => {
        alert('File link copied to clipboard!');
      }).catch(() => {
        alert('Unable to copy link. Please copy manually: ' + fileUrl);
      });
    }
  };

  const getFileIcon = (fileUrl: string) => {
    const extension = fileUrl.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <ImageIcon size={20} color="var(--primary-500)" />;
      case 'pdf':
        return <FileText size={20} color="var(--red-500)" />;
      case 'doc':
      case 'docx':
        return <File size={20} color="var(--blue-500)" />;
      default:
        return <File size={20} color="var(--gray-500)" />;
    }
  };

  const getFileType = (fileUrl: string) => {
    const extension = fileUrl.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return 'Image';
      case 'pdf':
        return 'PDF';
      case 'doc':
      case 'docx':
        return 'Document';
      default:
        return 'File';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount / 1000) + 'K';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProjectStatus = (project: Project) => {
    if (project.completion_date) {
      const completionDate = new Date(project.completion_date);
      const now = new Date();
      if (completionDate <= now) {
        return 'Ready to Move';
      } else {
        return 'Under Construction';
      }
    }
    return 'Launching Soon';
  };

  const getAvailabilityStatus = (project: Project) => {
    const totalUnits = project.total_units || 0;
    const leadsCount = project.leads_count || 0;
    
    if (totalUnits === 0) return 'Available';
    if (leadsCount >= totalUnits * 0.8) return 'Few Units Left';
    if (leadsCount >= totalUnits * 0.5) return 'Available';
    return 'Available';
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: Home },
    { id: 'floor-plans' as TabType, label: 'Floor Plans', icon: Building },
    { id: 'brochures' as TabType, label: 'Brochures', icon: FileText },
    { id: 'availability' as TabType, label: 'Availability', icon: CheckCircle },
    { id: 'payment-plans' as TabType, label: 'Payment Plans', icon: CreditCard }
  ];

  const renderTabContent = () => {
    if (!project) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: 'var(--gray-900)' }}>
                Project Description
              </h3>
              <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--gray-700)' }}>
                {project.description || 'No description available for this project.'}
              </p>
            </div>

            {project.amenities && project.amenities.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: 'var(--gray-900)' }}>
                  Amenities
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {project.amenities.map((amenity, index) => (
                    <div key={index} style={{
                      backgroundColor: 'var(--primary-50)',
                      color: 'var(--primary-600)',
                      padding: '6px 12px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {typeof amenity === 'string' ? amenity : (amenity as any)?.name || JSON.stringify(amenity)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {project.connectivity && project.connectivity.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: 'var(--gray-900)' }}>
                  Connectivity
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {project.connectivity.map((conn, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px',
                      backgroundColor: 'var(--gray-50)',
                      borderRadius: '8px'
                    }}>
                      <MapPin size={16} color="var(--gray-500)" />
                      <span style={{ fontSize: '14px', color: 'var(--gray-700)' }}>
                        {typeof conn === 'string' ? conn : `${conn.name} - ${conn.distance}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {project.landmarks && project.landmarks.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: 'var(--gray-900)' }}>
                  Nearby Landmarks
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {project.landmarks.map((landmark, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px',
                      backgroundColor: 'var(--gray-50)',
                      borderRadius: '8px'
                    }}>
                      <Star size={16} color="var(--gray-500)" />
                      <span style={{ fontSize: '14px', color: 'var(--gray-700)' }}>
                        {typeof landmark === 'string' ? landmark : `${(landmark as any)?.name || ''}${(landmark as any)?.distance ? ` - ${(landmark as any).distance}` : ''}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'floor-plans':
        return (
          <div style={{ padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '350px' }}>
            <Building size={48} color="var(--gray-400)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--gray-900)' }}>
              Floor Plans
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--gray-600)' }}>
              Floor plans will be available soon. Please contact us for more details.
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
            {(() => {
              // Collect files from database tables
              const allFiles: Array<{ url: string; name: string; type: string; fileSize?: number; mimeType?: string }> = [];
              
              // Add brochure_url from projects table
              if (project?.brochure_url) {
                allFiles.push({
                  url: project.brochure_url,
                  name: 'Project Brochure',
                  type: 'brochure'
                });
              }
              
              // Add files from project_files table
              console.log('Processing project files:', projectFiles);
              projectFiles.forEach((file) => {
                console.log('Processing file:', file);
                const fileUrl = file.public_url || file.file_path;
                console.log('File URL:', fileUrl);
                if (fileUrl) {
                  allFiles.push({
                    url: fileUrl,
                    name: file.file_name,
                    type: file.file_purpose,
                    fileSize: file.file_size,
                    mimeType: file.mime_type
                  });
                } else {
                  console.log('Skipping file - no URL:', file.file_name);
                }
              });
              console.log('All files collected:', allFiles);

              if (allFiles.length === 0) {
                return (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <FileText size={48} color="var(--gray-400)" style={{ marginBottom: '16px' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--gray-900)' }}>
                      No Files Available
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--gray-600)' }}>
                      No files have been uploaded for this project yet.
                    </p>
                  <div style={{ marginTop: '12px' }}>
                    <button
                      onClick={() => handleOpenFilePicker('brochure')}
                      style={{
                        padding: '10px 16px',
                        backgroundColor: 'var(--primary-600)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Upload Brochure
                    </button>
                  </div>
                  </div>
                );
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {allFiles.map((file, index) => (
                    <div key={index} style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      padding: '12px',
                      border: '1px solid var(--gray-200)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease'
                    }}>
                      {/* File Info - Now fully left aligned */}
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
                          marginBottom: '6px',
                          width: '100%'
                        }}>
                          <h4 style={{ 
                            fontSize: '18px', 
                            fontWeight: '700', 
                            margin: 0,
                            color: 'var(--gray-900)',
                            lineHeight: '1.3',
                            textAlign: 'left'
                          }}>
                            {file.name}
                          </h4>
                          <div style={{
                            padding: '2px 6px',
                            backgroundColor: 'var(--primary-100)',
                            color: 'var(--primary-700)',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '600',
                            textTransform: 'uppercase'
                          }}>
                            {getFileType(file.url)}
                          </div>
                        </div>
                        <div style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '8px',
                          justifyContent: 'flex-start',
                          width: '100%'
                        }}>
                          <span style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: 'var(--primary-600)',
                            backgroundColor: 'var(--primary-50)',
                            padding: '4px 8px',
                            borderRadius: '6px'
                          }}>
                            {getFileType(file.url)}
                          </span>
                          <span style={{
                            fontSize: '13px',
                            fontWeight: '500',
                            color: 'var(--gray-500)',
                            backgroundColor: 'var(--gray-100)',
                            padding: '4px 8px',
                            borderRadius: '6px'
                          }}>
                            {file.type}
                          </span>
                        </div>
                        <p style={{ 
                          fontSize: '13px', 
                          color: 'var(--gray-500)',
                          margin: '0 0 4px 0',
                          wordBreak: 'break-all',
                          fontFamily: 'monospace',
                          textAlign: 'left',
                          width: '100%'
                        }}>
                          {file.url.split('/').pop()}
                        </p>
                        {file.fileSize && (
                          <p style={{ 
                            fontSize: '12px', 
                            color: 'var(--gray-400)',
                            margin: 0,
                            fontWeight: '500',
                            textAlign: 'left',
                            width: '100%'
                          }}>
                            {(file.fileSize / 1024 / 1024).toFixed(1)} MB
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'row',
                        gap: '8px',
                        flexShrink: 0
                      }}>
                        <button
                          onClick={() => handleViewFile(file.url, file.name)}
                          style={{
                            padding: '10px',
                            backgroundColor: 'var(--primary-50)',
                            color: 'var(--primary-600)',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                          }}
                          title="View File"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--primary-100)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--primary-50)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDownloadFile(file.url, file.name)}
                          style={{
                            padding: '10px',
                            backgroundColor: 'var(--success-50)',
                            color: 'var(--success-600)',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                          }}
                          title="Download File"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--success-100)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--success-50)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => handleShareFile(file.url, file.name)}
                          style={{
                            padding: '10px',
                            backgroundColor: 'var(--warning-50)',
                            color: 'var(--warning-600)',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                          }}
                          title="Share File"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--warning-100)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--warning-50)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <Share2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        );

      case 'availability':
        return (
          <div style={{ padding: '16px' }}>
            {units.length > 0 && displayConfig.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Summary Card */}
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid var(--gray-200)',
                  marginBottom: '8px'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--gray-900)' }}>
                    Unit Availability Summary
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', color: 'var(--gray-600)' }}>Total Units:</span>
                      <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--gray-900)' }}>
                        {units.length}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', color: 'var(--gray-600)' }}>Available:</span>
                      <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--green-600)' }}>
                        {units.filter(u => u.status === 'available').length}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', color: 'var(--gray-600)' }}>Leads Generated:</span>
                      <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--gray-900)' }}>
                        {project.leads_count || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Units Table */}
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: '1px solid var(--gray-200)',
                  overflow: 'hidden'
                }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid var(--gray-200)' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--gray-900)' }}>
                      Available Units ({units.filter(u => u.status === 'available').length})
                    </h3>
                  </div>
                  
                  {/* Table */}
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ backgroundColor: 'var(--gray-50)' }}>
                        <tr>
                          {displayConfig.map((col, index) => (
                            <th
                              key={index}
                              style={{
                                padding: '12px 8px',
                                textAlign: 'left',
                                fontSize: '12px',
                                fontWeight: '600',
                                color: 'var(--gray-500)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                borderBottom: '1px solid var(--gray-200)',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {units.filter(u => u.status === 'available').slice(0, visibleUnitsCount).map((unit, unitIndex) => (
                          <tr key={unit.id || unitIndex} style={{ 
                            borderBottom: '1px solid var(--gray-200)',
                            backgroundColor: unitIndex % 2 === 0 ? 'white' : 'var(--gray-25)'
                          }}>
                            {displayConfig.map((col, colIndex) => {
                              const value = getValue(unit, col.source);
                              const formattedValue = formatValue(value, col.type);
                              
                              return (
                                <td
                                  key={colIndex}
                                  style={{
                                    padding: '12px 8px',
                                    fontSize: '14px',
                                    color: 'var(--gray-900)',
                                    whiteSpace: 'nowrap',
                                    borderBottom: '1px solid var(--gray-100)'
                                  }}
                                >
                                  {formattedValue}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {units.filter(u => u.status === 'available').length > visibleUnitsCount && (
                    <div style={{ 
                      padding: '16px', 
                      borderTop: '1px solid var(--gray-200)',
                      textAlign: 'center',
                      backgroundColor: 'var(--gray-50)'
                    }}>
                      <div style={{ marginBottom: '12px' }}>
                        <span style={{ fontSize: '14px', color: 'var(--gray-500)' }}>
                          Showing {visibleUnitsCount} of {units.filter(u => u.status === 'available').length} available units
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
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
                            backgroundColor: 'var(--gray-200)',
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
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <Building size={48} color="var(--gray-400)" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--gray-900)' }}>
                  No Units Available
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--gray-600)' }}>
                  No units have been imported for this project yet.
                </p>
              </div>
            )}
          </div>
        );

      case 'payment-plans':
        return (
          <div style={{ padding: '20px' }}>
            {project.payment_plans && project.payment_plans.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {project.payment_plans.map((plan, index) => (
                  <div key={index} style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid var(--gray-200)'
                  }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px', color: 'var(--gray-900)' }}>
                      {typeof plan === 'string' ? plan : plan.name || `Payment Plan ${index + 1}`}
                    </h3>
                    {typeof plan === 'object' && plan.description && (
                      <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '12px' }}>
                        {plan.description}
                      </p>
                    )}
                    {typeof plan === 'object' && plan.terms && (
                      <div style={{ fontSize: '14px', color: 'var(--gray-700)' }}>
                        <strong>Terms:</strong> {plan.terms}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <CreditCard size={48} color="var(--gray-400)" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--gray-900)' }}>
                  Payment Plans
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--gray-600)' }}>
                  Payment plans will be available soon. Please contact us for more details.
                </p>
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
      <div className="mobile-app">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px',
          color: 'var(--gray-600)'
        }}>
          Loading project details...
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mobile-app">
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px',
          color: 'var(--gray-600)'
        }}>
          <div>Project not found</div>
          <button 
            onClick={handleBack}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              backgroundColor: 'var(--primary-500)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8F9F9',
      fontFamily: 'Montserrat, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#F8F9F9',
        padding: '60px 20px 40px 20px',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Back Button */}
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
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 8px rgba(0, 0, 0, 0.05)'
          }}
        >
          <ArrowLeft size={20} color="#016A5D" />
        </button>

        {/* Project Title */}
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#333333',
          margin: '0 0 8px 0',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          {project?.name || 'Property Details'}
        </h1>

        {/* Project Subtitle */}
        <p style={{
          fontSize: '16px',
          color: '#777777',
          fontWeight: '300',
          margin: '0 0 24px 0',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          {getProjectStatus(project)} • {project?.project_type || 'Apartment'}
        </p>
      </div>

      {/* Image/Gallery Section */}
      <div style={{
        height: '250px',
        backgroundColor: '#F0F9F8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        margin: '0 20px 20px 20px',
        borderRadius: '12px',
        border: '1px solid rgba(1, 106, 93, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
      }}>
        <Building size={64} color="#016A5D" />
        {project.starting_price && (
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            backgroundColor: '#016A5D',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '16px',
            fontWeight: '600',
            fontFamily: 'Montserrat, sans-serif'
          }}>
            {formatCurrency(project.starting_price)}
          </div>
        )}
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
          letterSpacing: '0.5px',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          {getAvailabilityStatus(project)}
        </div>
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
          margin: '0 0 20px 0',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          {project.name}
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Location */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MapPin size={20} color="#016A5D" />
            <span style={{ fontSize: '16px', color: '#333333', fontWeight: '500' }}>
              {project.location}
            </span>
          </div>

          {/* Price */}
          {project.starting_price && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <DollarSign size={20} color="#016A5D" />
              <span style={{ fontSize: '16px', color: '#333333', fontWeight: '500' }}>
                Starting from {formatCurrency(project.starting_price)}
              </span>
            </div>
          )}

          {/* Possession Date */}
          {project.completion_date && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Calendar size={20} color="#016A5D" />
              <span style={{ fontSize: '16px', color: '#333333', fontWeight: '500' }}>
                Possession: {formatDate(project.completion_date)}
              </span>
            </div>
          )}

          {/* Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Clock size={20} color="#016A5D" />
            <span style={{ fontSize: '16px', color: '#333333', fontWeight: '500' }}>
              Status: {getProjectStatus(project)}
            </span>
          </div>

          {/* Property Type */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Building size={20} color="#016A5D" />
            <span style={{ fontSize: '16px', color: '#333333', fontWeight: '500' }}>
              Type: {project.project_type || 'Apartment'}
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
        <div style={{ display: 'flex' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '16px 8px',
                  backgroundColor: activeTab === tab.id ? 'rgba(1, 106, 93, 0.1)' : 'transparent',
                  border: 'none',
                  color: activeTab === tab.id ? '#016A5D' : '#777777',
                  cursor: 'pointer',
                  minWidth: '80px',
                  transition: 'all 0.2s ease',
                  fontFamily: 'Montserrat, sans-serif'
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

      {/* Bottom Navigation */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderTop: '1px solid rgba(1, 106, 93, 0.1)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)',
        zIndex: 1000
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          padding: '0 16px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          {[ 
            { id: 'home', label: 'Home', icon: Home, active: false },
            { id: 'promotions', label: 'Promotions', icon: TrendingUp, active: false },
            { id: 'settings', label: 'Settings', icon: Settings, active: false }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'home') navigate('/mobile/developer');
                  else if (item.id === 'settings') navigate('/mobile/settings');
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: item.active ? 'rgba(1, 106, 93, 0.1)' : 'none',
                  color: item.active ? '#016A5D' : '#777777',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minWidth: '60px'
                }}
              >
                <Icon size={22} color={item.active ? '#016A5D' : '#777777'} />
                <span style={{
                  fontSize: '11px',
                  fontWeight: '500',
                  letterSpacing: '0.3px',
                  fontFamily: 'Montserrat, sans-serif'
                }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
