import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SimpleSelect } from '../components/ui/SimpleSelect';
import { Textarea } from '../components/ui/Textarea';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Loading } from '../components/ui/Loading';
import { CreateProjectForm } from '../components/projects/CreateProjectForm';
import { adminService } from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';
import type { CreateProjectOnBehalfData, AdminOrganization } from '../types/admin';
import type { CreateProjectData } from '../types/project';
import {
  ArrowLeft,
  Building,
  Save,
  AlertTriangle,
  Plus,
  X,
  Zap,
  Upload,
  CheckCircle,
  Edit
} from 'lucide-react';

type AdminCreationMethod = 'manual' | 'ai_assisted';

export const AdminCreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<AdminCreationMethod | null>(null);
  const [organizations, setOrganizations] = useState<AdminOrganization[]>([]);
  const [formData, setFormData] = useState<CreateProjectOnBehalfData>({
    organization_id: '',
    creation_method: 'admin',
    name: '',
    location: '',
    project_type: 'Residential',
    description: '',
    starting_price: undefined,
    completion_date: '',
    amenities: [],
    connectivity: [],
    landmarks: [],
    payment_plans: [],
    custom_attributes: {},
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // AI-specific states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [aiStep, setAiStep] = useState<'upload' | 'review' | 'confirm'>('upload');
  const [aiData, setAiData] = useState<any>(null);

  useEffect(() => {
    if (role !== 'admin') {
      // Redirect non-admins to their appropriate dashboard
      if (role === 'developer') {
        navigate('/developer');
      } else if (role === 'agent') {
        navigate('/agent-projects');
      } else {
        navigate('/developer'); // fallback
      }
      return;
    }
    loadOrganizations();
  }, [role, navigate]);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      // Get only developer organizations
      const allOrgs = await adminService.getAllOrganizations({ organization_type: 'developer' });
      setOrganizations(allOrgs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateProjectOnBehalfData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle standardized form submission for manual creation
  const handleStandardizedFormSubmit = async (data: CreateProjectData) => {
    if (!formData.organization_id) {
      setError('Please select a developer organization');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Convert standardized form data to admin format
      const adminProjectData: CreateProjectOnBehalfData = {
        organization_id: formData.organization_id,
        creation_method: 'admin',
        name: data.name,
        location: data.location,
        project_type: data.project_type || 'Residential',
        description: data.description || '',
        developer_name: data.developer_name || '',
        address: data.address || '',
        starting_price: data.starting_price,
        total_units: data.total_units,
        completion_date: data.completion_date || '',
        handover_date: data.handover_date || '',
        amenities: data.amenities || [],
        connectivity: data.connectivity || [],
        landmarks: data.landmarks || [],
        payment_plans: data.payment_plans || [],
        custom_attributes: data.custom_attributes || {},
        is_featured: data.is_featured || false,
      };

      // Create project on behalf of developer
      const project = await adminService.createProjectOnBehalf(adminProjectData);

      // Navigate to the admin projects page
      navigate('/admin/projects');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  // AI-specific methods
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a PDF or image file');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleAIExtract = async () => {
    if (!selectedFile || !formData.organization_id) {
      setError('Please select a file and organization');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const result = await adminService.processFileWithAIOnBehalf(selectedFile, formData.organization_id);
      setAiData(result);
      setAiStep('review');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI extraction failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleAIConfirm = async () => {
    if (!aiData || !formData.organization_id) return;

    try {
      setSaving(true);
      setError(null);

      const project = await adminService.createProjectFromAIOnBehalf(formData.organization_id, aiData);
      console.log('AI Project created successfully:', project);
      setAiStep('confirm');
      
      // Navigate after a short delay to show success
      setTimeout(() => {
        navigate('/admin/projects');
      }, 2000);
    } catch (err) {
      console.error('Failed to create AI project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  const resetAI = () => {
    setSelectedFile(null);
    setAiData(null);
    setAiStep('upload');
    setError(null);
  };

  if (role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600">Admin privileges required to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text="Loading organizations..." />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/projects')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Project</h1>
              <p className="text-gray-600">Create a new project on behalf of a developer</p>
            </div>
          </div>
        </div>

        {/* Method Selection or Content */}
        {!selectedMethod ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Manual Creation */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedMethod('manual')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-500" />
                  Manual Entry
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Create a project by manually entering all the details on behalf of a developer.
                </p>
                <div className="space-y-2">
                  <Badge variant="default">Full Control</Badge>
                  <Badge variant="default">Step by Step</Badge>
                  <Badge variant="default">Detailed Forms</Badge>
                </div>
                <div className="pt-4">
                  <Button className="w-full">
                    Start Manual Entry
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI-Assisted Creation */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedMethod('ai_assisted')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-500" />
                  AI-Assisted
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Upload a project brochure received from the developer and let AI extract the information automatically.
                </p>
                <div className="space-y-2">
                  <Badge variant="default">Fast Setup</Badge>
                  <Badge variant="default">AI Extraction</Badge>
                  <Badge variant="default">Smart Review</Badge>
                </div>
                <div className="pt-4">
                  <Button className="w-full">
                    Start AI Extraction
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : selectedMethod === 'manual' ? (
          <div className="space-y-6">
            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Developer Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Developer Organization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Developer Organization *
                  </label>
                  <SimpleSelect
                    value={formData.organization_id}
                    onChange={(e) => handleInputChange('organization_id', e.target.value)}
                  >
                    <option value="">Select a developer...</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </SimpleSelect>
                  {errors.organization_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.organization_id}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Standardized Project Form */}
            {formData.organization_id && (
              <CreateProjectForm
                onSubmit={handleStandardizedFormSubmit}
                loading={saving}
              />
            )}

            {!formData.organization_id && (
              <Card>
                <CardContent className="text-center py-8">
                  <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a Developer Organization
                  </h3>
                  <p className="text-gray-600">
                    Please select a developer organization above to continue with project creation.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          // AI-Assisted Creation
          <div className="space-y-6">
            {aiStep === 'upload' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-500" />
                    AI Project Extraction
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Error Display */}
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        <span>{error}</span>
                      </div>
                    </div>
                  )}

                  {/* Developer Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Developer Organization *
                    </label>
                    <SimpleSelect
                      value={formData.organization_id}
                      onChange={(e) => handleInputChange('organization_id', e.target.value)}
                    >
                      <option value="">Select a developer...</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </SimpleSelect>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Brochure
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <div className="space-y-2">
                        <p className="text-gray-600">
                          Upload a project brochure received from the developer
                        </p>
                        <p className="text-sm text-gray-500">
                          Supports PDF, JPG, PNG files up to 10MB
                        </p>
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="brochure-upload"
                      />
                      <label
                        htmlFor="brochure-upload"
                        className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                      >
                        Choose File
                      </label>
                      {selectedFile && (
                        <p className="mt-2 text-sm text-green-600">
                          Selected: {selectedFile.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setSelectedMethod(null)}>
                      Back to Methods
                    </Button>
                    <Button 
                      onClick={handleAIExtract} 
                      disabled={!selectedFile || !formData.organization_id || processing}
                      loading={processing}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Extract with AI
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {aiStep === 'review' && aiData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit className="w-5 h-5 text-blue-500" />
                    Review Extracted Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* AI Confidence Score */}
                  {aiData.confidence_score && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                        <span className="font-medium text-blue-900">
                          AI Confidence: {Math.round(aiData.confidence_score * 100)}%
                        </span>
                      </div>
                      <p className="text-sm text-blue-700 mt-1">
                        High confidence extraction from the uploaded document
                      </p>
                    </div>
                  )}

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                      <p className="text-gray-900 font-medium">{aiData.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Developer</label>
                      <p className="text-gray-900">{aiData.developer_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <p className="text-gray-900">{aiData.location}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                      <p className="text-gray-900">{aiData.project_type}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Starting Price</label>
                      <p className="text-gray-900 font-medium">AED {aiData.starting_price?.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Units</label>
                      <p className="text-gray-900">{aiData.total_units}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Completion Date</label>
                      <p className="text-gray-900">{aiData.completion_date}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Handover Date</label>
                      <p className="text-gray-900">{aiData.handover_date}</p>
                    </div>
                  </div>

                  {/* Address */}
                  {aiData.address && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <p className="text-gray-900">{aiData.address}</p>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <p className="text-gray-900">{aiData.description}</p>
                  </div>

                  {/* Amenities */}
                  {aiData.amenities && aiData.amenities.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                      <div className="flex flex-wrap gap-2">
                        {aiData.amenities.map((amenity: string, index: number) => (
                          <Badge key={index} variant="default">{amenity}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Connectivity */}
                  {aiData.connectivity && aiData.connectivity.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Connectivity</label>
                      <div className="flex flex-wrap gap-2">
                        {aiData.connectivity.map((conn: string, index: number) => (
                          <Badge key={index} variant="outline">{conn}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Landmarks */}
                  {aiData.landmarks && aiData.landmarks.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nearby Landmarks</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {aiData.landmarks.map((landmark: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-gray-900">{landmark.name}</span>
                            <span className="text-sm text-gray-500">{landmark.distance}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payment Plans */}
                  {aiData.payment_plans && aiData.payment_plans.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Plans</label>
                      <div className="space-y-2">
                        {aiData.payment_plans.map((plan: any, index: number) => (
                          <div key={index} className="p-3 bg-gray-50 rounded">
                            <h4 className="font-medium text-gray-900">{plan.name}</h4>
                            {plan.description && (
                              <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-1">{plan.terms}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom Attributes */}
                  {aiData.custom_attributes && Object.keys(aiData.custom_attributes).length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Additional Information</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(aiData.custom_attributes).map(([key, value]: [string, any]) => (
                          <div key={key} className="flex justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm font-medium text-gray-700 capitalize">
                              {key.replace(/_/g, ' ')}:
                            </span>
                            <span className="text-sm text-gray-900">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={resetAI}>
                      Upload Different File
                    </Button>
                    <Button onClick={handleAIConfirm} loading={saving}>
                      <Save className="w-4 h-4 mr-2" />
                      Create Project
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {aiStep === 'confirm' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Project Created Successfully
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    AI Project Created!
                  </h3>
                  <p className="text-gray-600">
                    The project has been successfully created using AI extraction.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
