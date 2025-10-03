// Manual project creation form component
// Follows unified architecture - same form for all creation methods

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Plus, X, Save } from 'lucide-react';
import type { CreateProjectData } from '../../types/project';

interface CreateProjectFormProps {
  onSubmit: (data: CreateProjectData) => Promise<void>;
  loading?: boolean;
  initialData?: CreateProjectData;
  isEditMode?: boolean;
}

export const CreateProjectForm: React.FC<CreateProjectFormProps> = ({
  onSubmit,
  loading = false,
  initialData,
  isEditMode = false,
}) => {
  // Initialize form data only once - never reset it
  const [formData, setFormData] = useState<CreateProjectData>(() => {
    if (initialData) {
      return initialData;
    }
    return {
      creation_method: 'manual',
      name: '',
      location: '',
      project_type: '',
      status: 'published',
      description: '',
      developer_name: '',
      address: '',
      starting_price: undefined,
      total_units: undefined,
      completion_date: '',
      handover_date: '',
      amenities: [],
      connectivity: [],
      landmarks: [],
      payment_plans: [],
      custom_attributes: {},
      is_featured: false,
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newAmenity, setNewAmenity] = useState('');
  const [newConnectivity, setNewConnectivity] = useState('');
  const [newLandmark, setNewLandmark] = useState({ name: '', distance: '' });
  const [newPaymentPlan, setNewPaymentPlan] = useState({ name: '', description: '', terms: '' });

  // NO useEffect for form data - it's initialized once and never reset

  const projectTypeOptions = [
    { value: 'Apartment', label: 'Apartment' },
    { value: 'Villa', label: 'Villa' },
    { value: 'Townhouse', label: 'Townhouse' },
    { value: 'Penthouse', label: 'Penthouse' },
    { value: 'Studio', label: 'Studio' },
    { value: 'Commercial', label: 'Commercial' },
  ];

  const handleInputChange = (field: keyof CreateProjectData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    // Date validation - only validate if both dates are provided and not empty
    if (formData.completion_date && formData.completion_date.trim() !== '' &&
        formData.handover_date && formData.handover_date.trim() !== '') {
      const completionDate = new Date(formData.completion_date);
      const handoverDate = new Date(formData.handover_date);
      
      // Check if dates are valid
      if (!isNaN(completionDate.getTime()) && !isNaN(handoverDate.getTime())) {
        if (handoverDate < completionDate) {
          newErrors.handover_date = 'Handover date must be after completion date';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submit triggered!');
    
    const isValid = validateForm();
    console.log('Form validation result:', isValid);
    console.log('Form errors:', errors);
    console.log('Form data being submitted:', formData);
    
    if (!isValid) {
      console.log('Form validation failed, not submitting');
      return;
    }

    console.log('Form validation passed, calling onSubmit...');
    try {
      await onSubmit(formData);
      console.log('Form submission completed successfully');
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const addAmenity = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (newAmenity.trim()) {
      setFormData(prev => ({
        ...prev,
        amenities: [...(prev.amenities || []), newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const removeAmenity = (index: number, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities?.filter((_, i) => i !== index) || []
    }));
  };

  const addConnectivity = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (newConnectivity.trim()) {
      setFormData(prev => ({
        ...prev,
        connectivity: [...(prev.connectivity || []), newConnectivity.trim()]
      }));
      setNewConnectivity('');
    }
  };

  const removeConnectivity = (index: number, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    setFormData(prev => ({
      ...prev,
      connectivity: prev.connectivity?.filter((_, i) => i !== index) || []
    }));
  };

  const addLandmark = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (newLandmark.name.trim() && newLandmark.distance.trim()) {
      setFormData(prev => ({
        ...prev,
        landmarks: [...(prev.landmarks || []), { ...newLandmark }]
      }));
      setNewLandmark({ name: '', distance: '' });
    }
  };

  const removeLandmark = (index: number, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    setFormData(prev => ({
      ...prev,
      landmarks: prev.landmarks?.filter((_, i) => i !== index) || []
    }));
  };

  const addPaymentPlan = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (newPaymentPlan.name.trim() && newPaymentPlan.terms.trim()) {
      setFormData(prev => ({
        ...prev,
        payment_plans: [...(prev.payment_plans || []), { ...newPaymentPlan }]
      }));
      setNewPaymentPlan({ name: '', description: '', terms: '' });
    }
  };

  const removePaymentPlan = (index: number, e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    setFormData(prev => ({
      ...prev,
      payment_plans: prev.payment_plans?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter project name"
                error={errors.name}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <Input
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Enter location"
                error={errors.location}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Type
              </label>
              <Select
                value={formData.project_type || ''}
                onChange={(e) => handleInputChange('project_type', e.target.value)}
                options={projectTypeOptions}
                placeholder="Select project type"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Developer Name
              </label>
              <Input
                value={formData.developer_name || ''}
                onChange={(e) => handleInputChange('developer_name', e.target.value)}
                placeholder="Enter developer name"
              />
            </div>
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter project description"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <Input
              value={formData.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter full address"
            />
          </div>
        </CardContent>
      </Card>

      {/* Project Details */}
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Starting Price (AED)
              </label>
              <Input
                type="number"
                value={formData.starting_price || ''}
                onChange={(e) => handleInputChange('starting_price', parseFloat(e.target.value) || undefined)}
                placeholder="Enter starting price"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Units
              </label>
              <Input
                type="number"
                value={formData.total_units || ''}
                onChange={(e) => handleInputChange('total_units', parseInt(e.target.value) || undefined)}
                placeholder="Enter total units"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_featured || false}
                  onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Featured Project</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Completion Date
              </label>
              <Input
                type="date"
                value={formData.completion_date || ''}
                onChange={(e) => handleInputChange('completion_date', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Handover Date
              </label>
              <Input
                type="date"
                value={formData.handover_date || ''}
                onChange={(e) => handleInputChange('handover_date', e.target.value)}
                error={errors.handover_date}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amenities */}
      <Card>
        <CardHeader>
          <CardTitle>Amenities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              placeholder="Add amenity"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity(e))}
            />
            <Button type="button" onClick={(e) => addAmenity(e)} variant="outline">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.amenities?.map((amenity, index) => (
              <Badge key={index} variant="default" className="flex items-center gap-1">
                {amenity}
                <button
                  type="button"
                  onClick={(e) => removeAmenity(index, e)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connectivity */}
      <Card>
        <CardHeader>
          <CardTitle>Connectivity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newConnectivity}
              onChange={(e) => setNewConnectivity(e.target.value)}
              placeholder="Add connectivity (e.g., Metro 500m)"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addConnectivity(e))}
            />
            <Button type="button" onClick={(e) => addConnectivity(e)} variant="outline">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.connectivity?.map((item, index) => (
              <Badge key={index} variant="default" className="flex items-center gap-1">
                {item}
                <button
                  type="button"
                  onClick={(e) => removeConnectivity(index, e)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Landmarks */}
      <Card>
        <CardHeader>
          <CardTitle>Landmarks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input
              value={newLandmark.name}
              onChange={(e) => setNewLandmark(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Landmark name"
            />
            <Input
              value={newLandmark.distance}
              onChange={(e) => setNewLandmark(prev => ({ ...prev, distance: e.target.value }))}
              placeholder="Distance (e.g., 5km)"
            />
            <Button type="button" onClick={(e) => addLandmark(e)} variant="outline">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {formData.landmarks?.map((landmark, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">
                  <strong>{landmark.name}</strong> - {landmark.distance}
                </span>
                <button
                  type="button"
                  onClick={(e) => removeLandmark(index, e)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Plans</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              value={newPaymentPlan.name}
              onChange={(e) => setNewPaymentPlan(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Payment plan name"
            />
            <Input
              value={newPaymentPlan.description}
              onChange={(e) => setNewPaymentPlan(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description"
            />
            <Textarea
              value={newPaymentPlan.terms}
              onChange={(e) => setNewPaymentPlan(prev => ({ ...prev, terms: e.target.value }))}
              placeholder="Terms and conditions"
              rows={2}
            />
            <Button type="button" onClick={(e) => addPaymentPlan(e)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Plan
            </Button>
          </div>
          <div className="space-y-2">
            {formData.payment_plans?.map((plan, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{plan.name}</h4>
                    {plan.description && (
                      <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">{plan.terms}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => removePaymentPlan(index, e)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button 
          type="submit" 
          loading={loading} 
          disabled={loading}
        >
          <Save className="w-4 h-4 mr-2" />
          {isEditMode ? 'Save Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
};
