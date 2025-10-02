// Project details page - shows complete project information

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Loading } from '../components/ui/Loading';
import { projectService } from '../services/projectService';
import { useAuth } from '../contexts/AuthContext';
import { FileList } from '../components/files/FileList';
import { FileUploadDialog } from '../components/files/FileUploadDialog';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Building, 
  Star,
  Eye,
  Heart,
  Share2,
  Download,
  Zap,
  Edit3,
  Upload
} from 'lucide-react';
import type { Project } from '../types/project';

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, employeeId, organizationId, role } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'units' | 'files'>('details');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadPurpose, setUploadPurpose] = useState<'brochure' | 'floor_plan' | 'unit_data' | 'image' | 'document'>('brochure');
  const [fileListKey, setFileListKey] = useState(0);

  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id]);

  const loadProject = async (projectId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await projectService.getProject(projectId);
      
      setProject(result);
    } catch (err) {
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!project || !confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const result = await projectService.deleteProject(project.id);
      
      if (result.error) {
        setError(result.error.message);
        return;
      }

      navigate('/projects');
    } catch (err) {
      setError('Failed to delete project');
    }
  };

  const getCreationMethodBadge = (method: string) => {
    const variants = {
      manual: 'default',
      ai_assisted: 'success',
      hybrid: 'warning',
      admin: 'error',
    } as const;

    const icons = {
      manual: Edit3,
      ai_assisted: Zap,
      hybrid: Edit3,
      admin: Edit3,
    } as const;

    const Icon = icons[method as keyof typeof icons] || Edit3;

    return (
      <Badge variant={variants[method as keyof typeof variants] || 'default'} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {method.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'warning',
      published: 'success',
      archived: 'error',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text="Loading project..." />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <div className="text-red-500 mb-4">
              <Trash2 className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Project Not Found
            </h3>
            <p className="text-gray-600 mb-4">
              {error || 'The project you are looking for does not exist.'}
            </p>
            <Button onClick={() => navigate('/projects')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={() => navigate('/projects')}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </div>
          
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                {project.is_featured && (
                  <Badge variant="default" className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Featured
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{project.location}</span>
              </div>
            </div>
            
            {/* Only show management buttons for developers */}
            {role !== 'agent' && (
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate(`/projects/${project.id}/units`)}
                  variant="outline"
                >
                  <Building className="w-4 h-4 mr-2" />
                  Manage Units
                </Button>
                <Button
                  onClick={() => navigate(`/projects/${project.id}/edit`)}
                  variant="outline"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={handleDeleteProject}
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-4 font-medium ${activeTab === 'details' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('units')}
              className={`pb-4 font-medium ${activeTab === 'units' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Units
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`pb-4 font-medium ${activeTab === 'files' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Files
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <>
            {/* Project Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Project Type</label>
                    <p className="text-gray-900">{project.project_type || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Developer</label>
                    <p className="text-gray-900">{project.developer_name || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      {getStatusBadge(project.status)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Creation Method</label>
                    <div className="mt-1">
                      {getCreationMethodBadge(project.creation_method)}
                    </div>
                  </div>
                </div>

                {project.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-900 mt-1">{project.description}</p>
                  </div>
                )}

                {project.address && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-gray-900 mt-1">{project.address}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Amenities */}
            {project.amenities && project.amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.amenities.map((amenity, index) => (
                      <Badge key={index} variant="default">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Connectivity */}
            {project.connectivity && project.connectivity.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Connectivity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.connectivity.map((item, index) => (
                      <Badge key={index} variant="default">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Landmarks */}
            {project.landmarks && project.landmarks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Nearby Landmarks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {project.landmarks.map((landmark, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="font-medium">{landmark.name}</span>
                        <span className="text-sm text-gray-600">{landmark.distance}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Plans */}
            {project.payment_plans && project.payment_plans.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {project.payment_plans.map((plan, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">{plan.name}</h4>
                        {plan.description && (
                          <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                        )}
                        <p className="text-sm text-gray-500">{plan.terms}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.starting_price && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Starting Price</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {project.starting_price.toLocaleString()} AED
                      </p>
                    </div>
                  </div>
                )}
                
                {project.total_units && (
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Units</p>
                      <p className="text-lg font-semibold text-gray-900">{project.total_units}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Views</p>
                    <p className="text-lg font-semibold text-gray-900">{project.views_count}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Leads</p>
                    <p className="text-lg font-semibold text-gray-900">{project.leads_count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created</p>
                    <p className="text-gray-900">
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {project.completion_date && (
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Completion Date</p>
                      <p className="text-gray-900">
                        {new Date(project.completion_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {project.handover_date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Handover Date</p>
                      <p className="text-gray-900">
                        {new Date(project.handover_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {project.published_at && (
                  <div className="flex items-center gap-3">
                    <Share2 className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Published</p>
                      <p className="text-gray-900">
                        {new Date(project.published_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Information */}
            {project.creation_method === 'ai_assisted' && project.ai_confidence_score && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-500" />
                    AI Extraction
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Confidence Score</span>
                      <span className="text-sm font-medium">
                        {(project.ai_confidence_score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${project.ai_confidence_score * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Custom Attributes */}
            {project.custom_attributes && Object.keys(project.custom_attributes).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Custom Attributes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(project.custom_attributes).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-sm text-gray-500 capitalize">
                          {key.replace('_', ' ')}
                        </span>
                        <span className="text-sm font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
          </>
        )}

        {activeTab === 'units' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Project Units</h2>
              {role !== 'agent' && (
                <Button onClick={() => navigate(`/projects/${project.id}/units`)}>
                  <Building className="w-4 h-4 mr-2" />
                  Manage Units
                </Button>
              )}
            </div>
            <Card>
              <CardContent className="text-center py-8">
                <Building className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {role === 'agent' ? 'Project Units' : 'Unit Management'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {role === 'agent' 
                    ? 'View available units for this project.'
                    : 'Click "Manage Units" to view and manage unit inventory for this project.'
                  }
                </p>
                <Button onClick={() => navigate(`/projects/${project.id}/units`)}>
                  {role === 'agent' ? 'View Units' : 'Go to Units'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'files' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Project Files</h2>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={() => { setUploadPurpose('brochure'); setShowUploadDialog(true); }}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Brochure
                </Button>
                <Button variant="outline" onClick={() => { setUploadPurpose('floor_plan'); setShowUploadDialog(true); }}>
                  Upload Floor Plan
                </Button>
                <Button variant="outline" onClick={() => { setUploadPurpose('image'); setShowUploadDialog(true); }}>
                  Upload Image
                </Button>
                <Button variant="outline" onClick={() => { setUploadPurpose('document'); setShowUploadDialog(true); }}>
                  Upload Document
                </Button>
                <Button variant="outline" onClick={() => { setUploadPurpose('unit_data'); setShowUploadDialog(true); }}>
                  Upload Unit Data
                </Button>
              </div>
            </div>

            <FileList
              key={fileListKey}
              projectId={project.id}
              projectName={project.name}
              canDelete={true}
              onUpdate={() => {
                console.log('🔄 File list update triggered');
                setFileListKey(prev => prev + 1);
              }}
            />
          </div>
        )}

        {/* Upload Dialog */}
        {showUploadDialog && (
          <FileUploadDialog
            projectId={project.id}
            purpose={uploadPurpose}
            onSuccess={() => {
              setShowUploadDialog(false);
              setFileListKey(prev => prev + 1); // Force file list refresh
            }}
            onClose={() => setShowUploadDialog(false)}
          />
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};
