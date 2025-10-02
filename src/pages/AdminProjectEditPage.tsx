import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SimpleSelect } from '../components/ui/SimpleSelect';
import { Textarea } from '../components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Loading } from '../components/ui/Loading';
import { projectService } from '../services/projectService';
import { useAuth } from '../contexts/AuthContext';
import type { Project } from '../types/project';
import {
  ArrowLeft,
  Building,
  Save,
  AlertTriangle,
  Plus,
  X
} from 'lucide-react';

interface ProjectFormData {
  name: string;
  location: string;
  project_type: string;
  description: string;
  starting_price?: number;
  completion_date: string;
  amenities: string[];
  connectivity: string[];
  landmarks: string[];
  payment_plans: string[];
}

export const AdminProjectEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { role } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
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
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dynamic array fields
  const [newAmenity, setNewAmenity] = useState('');
  const [newConnectivity, setNewConnectivity] = useState('');
  const [newLandmark, setNewLandmark] = useState('');
  const [newPaymentPlan, setNewPaymentPlan] = useState('');

  useEffect(() => {
    if (role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    if (projectId) {
      loadProjectDetails();
    }
  }, [role, navigate, projectId]);

  const loadProjectDetails = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const projectData = await projectService.getProject(projectId);
      
      setProject(projectData);
      setFormData({
        name: projectData.name,
        location: projectData.location,
        project_type: projectData.project_type,
        description: projectData.description || '',
        starting_price: projectData.starting_price,
        completion_date: projectData.completion_date || '',
        amenities: projectData.amenities || [],
        connectivity: projectData.connectivity || [],
        landmarks: projectData.landmarks || [],
        payment_plans: projectData.payment_plans || [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addToArray = (field: 'amenities' | 'connectivity' | 'landmarks' | 'payment_plans', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), value.trim()]
      }));
      // Clear the input
      switch (field) {
        case 'amenities': setNewAmenity(''); break;
        case 'connectivity': setNewConnectivity(''); break;
        case 'landmarks': setNewLandmark(''); break;
        case 'payment_plans': setNewPaymentPlan(''); break;
      }
    }
  };

  const removeFromArray = (field: 'amenities' | 'connectivity' | 'landmarks' | 'payment_plans', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field]?.filter((_, i) => i !== index) || []
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.project_type) {
      newErrors.project_type = 'Project type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !project) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Update project
      await projectService.updateProject(project.id, {
        name: formData.name,
        location: formData.location,
        project_type: formData.project_type,
        description: formData.description,
        starting_price: formData.starting_price,
        completion_date: formData.completion_date || undefined,
        amenities: formData.amenities,
        connectivity: formData.connectivity,
        landmarks: formData.landmarks,
        payment_plans: formData.payment_plans,
      });

      // Navigate back to project details
      navigate(`/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
    } finally {
      setSaving(false);
    }
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
        <Loading size="lg" text="Loading project details..." />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Project</h3>
            <p className="text-gray-600 mb-4">{error || 'Project not found'}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => navigate('/admin/projects')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Button>
              <Button onClick={loadProjectDetails} variant="outline">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ArrayField: React.FC<{
    label: string;
    items: string[];
    newValue: string;
    setNewValue: (value: string) => void;
    onAdd: () => void;
    onRemove: (index: number) => void;
    placeholder: string;
  }> = ({ label, items, newValue, setNewValue, onAdd, onRemove, placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder={placeholder}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), onAdd())}
          />
          <Button type="button" onClick={onAdd} variant="outline" size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Project
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Project</h1>
              <p className="text-gray-600">{project.name}</p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Project Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Project Name *"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    error={errors.name}
                    placeholder="Enter project name"
                  />

                  <Input
                    label="Location *"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    error={errors.location}
                    placeholder="Enter project location"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Type *
                    </label>
                    <SimpleSelect
                      value={formData.project_type}
                      onChange={(e) => handleInputChange('project_type', e.target.value)}
                    >
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Mixed Use">Mixed Use</option>
                      <option value="Villa">Villa</option>
                      <option value="Apartment">Apartment</option>
                    </SimpleSelect>
                    {errors.project_type && (
                      <p className="mt-1 text-sm text-red-600">{errors.project_type}</p>
                    )}
                  </div>

                  <Input
                    label="Starting Price (AED)"
                    type="number"
                    value={formData.starting_price || ''}
                    onChange={(e) => handleInputChange('starting_price', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Enter starting price"
                  />
                </div>

                <Input
                  label="Completion Date"
                  type="date"
                  value={formData.completion_date}
                  onChange={(e) => handleInputChange('completion_date', e.target.value)}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter project description"
                    rows={4}
                  />
                </div>
              </div>

              {/* Project Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Project Features</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ArrayField
                    label="Amenities"
                    items={formData.amenities || []}
                    newValue={newAmenity}
                    setNewValue={setNewAmenity}
                    onAdd={() => addToArray('amenities', newAmenity)}
                    onRemove={(index) => removeFromArray('amenities', index)}
                    placeholder="Add amenity"
                  />

                  <ArrayField
                    label="Connectivity"
                    items={formData.connectivity || []}
                    newValue={newConnectivity}
                    setNewValue={setNewConnectivity}
                    onAdd={() => addToArray('connectivity', newConnectivity)}
                    onRemove={(index) => removeFromArray('connectivity', index)}
                    placeholder="Add connectivity feature"
                  />

                  <ArrayField
                    label="Landmarks"
                    items={formData.landmarks || []}
                    newValue={newLandmark}
                    setNewValue={setNewLandmark}
                    onAdd={() => addToArray('landmarks', newLandmark)}
                    onRemove={(index) => removeFromArray('landmarks', index)}
                    placeholder="Add nearby landmark"
                  />

                  <ArrayField
                    label="Payment Plans"
                    items={formData.payment_plans || []}
                    newValue={newPaymentPlan}
                    setNewValue={setNewPaymentPlan}
                    onAdd={() => addToArray('payment_plans', newPaymentPlan)}
                    onRemove={(index) => removeFromArray('payment_plans', index)}
                    placeholder="Add payment plan"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-6 border-t">
                <Button
                  type="submit"
                  loading={saving}
                  disabled={saving}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving Changes...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/projects/${project.id}`)}
                  disabled={saving}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Project Statistics (Read-only) */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Project Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{project.views_count || 0}</div>
                <div className="text-sm text-gray-500">Views</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{project.leads_count || 0}</div>
                <div className="text-sm text-gray-500">Leads</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{project.total_units || 0}</div>
                <div className="text-sm text-gray-500">Units</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{project.creation_method}</div>
                <div className="text-sm text-gray-500">Creation Method</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
