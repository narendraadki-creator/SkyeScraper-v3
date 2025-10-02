// Manual project creation form component
// Follows unified architecture - same form for all creation methods

import React, { useState } from 'react';
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
}

export const CreateProjectForm: React.FC<CreateProjectFormProps> = ({
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreateProjectData>({
    creation_method: 'manual',
    name: '',
    location: '',
    project_type: '',
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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newAmenity, setNewAmenity] = useState('');
  const [newConnectivity, setNewConnectivity] = useState('');
  const [newLandmark, setNewLandmark] = useState({ name: '', distance: '' });
  const [newPaymentPlan, setNewPaymentPlan] = useState({ name: '', description: '', terms: '' });

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
    console.log('=== FORM SUBMIT CLICKED ===');
    e.preventDefault();
    
    console.log('Validating form...');
    const isValid = validateForm();
    console.log('Form validation result:', isValid);
    console.log('Current errors:', errors);
    
    if (!isValid) {
      console.log('Form validation failed, not submitting');
      return;
    }

    try {
      console.log('=== FORM SUBMISSION DEBUG ===');
      console.log('Form data being submitted:', formData);
      console.log('Amenities array length:', formData.amenities?.length);
      console.log('Amenities:', formData.amenities);
      console.log('Connectivity array length:', formData.connectivity?.length);
      console.log('Connectivity:', formData.connectivity);
      console.log('Landmarks array length:', formData.landmarks?.length);
      console.log('Landmarks:', formData.landmarks);
      console.log('Payment Plans array length:', formData.payment_plans?.length);
      console.log('Payment Plans:', formData.payment_plans);
      console.log('=== END FORM SUBMISSION DEBUG ===');
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const addAmenity = () => {
    console.log('addAmenity called with:', newAmenity);
    if (newAmenity.trim()) {
      console.log('Adding amenity:', newAmenity.trim());
      setFormData(prev => {
        const newAmenities = [...(prev.amenities || []), newAmenity.trim()];
        console.log('New amenities array:', newAmenities);
        return {
          ...prev,
          amenities: newAmenities
        };
      });
      setNewAmenity('');
    } else {
      console.log('Amenity is empty, not adding');
    }
  };

  const removeAmenity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities?.filter((_, i) => i !== index) || []
    }));
  };

  const addConnectivity = () => {
    console.log('addConnectivity called with:', newConnectivity);
    if (newConnectivity.trim()) {
      console.log('Adding connectivity:', newConnectivity.trim());
      setFormData(prev => {
        const newConnectivityArray = [...(prev.connectivity || []), newConnectivity.trim()];
        console.log('New connectivity array:', newConnectivityArray);
        return {
          ...prev,
          connectivity: newConnectivityArray
        };
      });
      setNewConnectivity('');
    } else {
      console.log('Connectivity is empty, not adding');
    }
  };

  const removeConnectivity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      connectivity: prev.connectivity?.filter((_, i) => i !== index) || []
    }));
  };

  const addLandmark = () => {
    if (newLandmark.name.trim() && newLandmark.distance.trim()) {
      setFormData(prev => ({
        ...prev,
        landmarks: [...(prev.landmarks || []), { ...newLandmark }]
      }));
      setNewLandmark({ name: '', distance: '' });
    }
  };

  const removeLandmark = (index: number) => {
    setFormData(prev => ({
      ...prev,
      landmarks: prev.landmarks?.filter((_, i) => i !== index) || []
    }));
  };

  const addPaymentPlan = () => {
    console.log('addPaymentPlan called with:', newPaymentPlan);
    if (newPaymentPlan.name.trim() && newPaymentPlan.terms.trim()) {
      console.log('Adding payment plan:', newPaymentPlan);
      setFormData(prev => {
        const newPaymentPlansArray = [...(prev.payment_plans || []), { ...newPaymentPlan }];
        console.log('New payment plans array:', newPaymentPlansArray);
        return {
          ...prev,
          payment_plans: newPaymentPlansArray
        };
      });
      setNewPaymentPlan({ name: '', description: '', terms: '' });
    } else {
      console.log('Payment plan is missing required fields, not adding');
      console.log('Name:', newPaymentPlan.name.trim());
      console.log('Terms:', newPaymentPlan.terms.trim());
    }
  };

  const removePaymentPlan = (index: number) => {
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
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
            />
            <Button type="button" onClick={addAmenity} variant="outline">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.amenities?.map((amenity, index) => {
              console.log('Rendering amenity:', amenity, 'at index:', index);
              return (
                <Badge key={index} variant="default" className="flex items-center gap-1">
                  {amenity}
                  <button
                    type="button"
                    onClick={() => removeAmenity(index)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })}
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
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addConnectivity())}
            />
            <Button type="button" onClick={addConnectivity} variant="outline">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.connectivity?.map((item, index) => (
              <Badge key={index} variant="default" className="flex items-center gap-1">
                {item}
                <button
                  type="button"
                  onClick={() => removeConnectivity(index)}
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
            <Button type="button" onClick={addLandmark} variant="outline">
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
                  onClick={() => removeLandmark(index)}
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
            <Button type="button" onClick={addPaymentPlan} variant="outline">
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
                    onClick={() => removePaymentPlan(index)}
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
          type="button" 
          variant="outline" 
          onClick={() => {
            console.log('Current form data:', formData);
            console.log('Amenities:', formData.amenities);
            console.log('Connectivity:', formData.connectivity);
            console.log('Landmarks:', formData.landmarks);
            console.log('Payment Plans:', formData.payment_plans);
          }}
        >
          Debug Form Data
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            console.log('Testing addAmenity function...');
            // Directly call addAmenity with a test value
            const testAmenity = 'Test Amenity';
            console.log('addAmenity called with:', testAmenity);
            if (testAmenity.trim()) {
              console.log('Adding amenity:', testAmenity.trim());
              setFormData(prev => {
                const newAmenities = [...(prev.amenities || []), testAmenity.trim()];
                console.log('New amenities array:', newAmenities);
                return {
                  ...prev,
                  amenities: newAmenities
                };
              });
            }
          }}
        >
          Test Add Amenity
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            console.log('Testing manual amenity input...');
            setNewAmenity('Manual Test Amenity');
            console.log('Set newAmenity to: Manual Test Amenity');
            console.log('Current newAmenity state:', newAmenity);
          }}
        >
          Set Manual Input
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            console.log('Testing addConnectivity function...');
            const testConnectivity = 'Test Connectivity';
            console.log('addConnectivity called with:', testConnectivity);
            if (testConnectivity.trim()) {
              console.log('Adding connectivity:', testConnectivity.trim());
              setFormData(prev => {
                const newConnectivityArray = [...(prev.connectivity || []), testConnectivity.trim()];
                console.log('New connectivity array:', newConnectivityArray);
                return {
                  ...prev,
                  connectivity: newConnectivityArray
                };
              });
            }
          }}
        >
          Test Add Connectivity
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            console.log('Testing addPaymentPlan function...');
            const testPaymentPlan = { name: 'Test Plan', description: 'Test Description', terms: 'Test Terms' };
            console.log('addPaymentPlan called with:', testPaymentPlan);
            if (testPaymentPlan.name.trim() && testPaymentPlan.terms.trim()) {
              console.log('Adding payment plan:', testPaymentPlan);
              setFormData(prev => {
                const newPaymentPlansArray = [...(prev.payment_plans || []), { ...testPaymentPlan }];
                console.log('New payment plans array:', newPaymentPlansArray);
                return {
                  ...prev,
                  payment_plans: newPaymentPlansArray
                };
              });
            }
          }}
        >
          Test Add Payment Plan
        </Button>
        <Button 
          type="submit" 
          loading={loading} 
          disabled={loading}
          onClick={() => console.log('Create Project button clicked!')}
        >
          <Save className="w-4 h-4 mr-2" />
          Create Project
        </Button>
      </div>
    </form>
  );
};
