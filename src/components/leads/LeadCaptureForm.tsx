import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { SimpleSelect } from '../ui/SimpleSelect';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { leadService } from '../../services/leadService';
import { LEAD_SOURCES, UNIT_TYPES } from '../../types/lead';
import type { CreateLeadData, Lead } from '../../types/lead';
import { User, Phone, Mail, MapPin, DollarSign, Calendar, FileText } from 'lucide-react';

interface LeadCaptureFormProps {
  projectId?: string;
  unitId?: string;
  onSuccess: (lead: Lead) => void;
  onCancel: () => void;
  initialData?: Partial<CreateLeadData>;
}

export const LeadCaptureForm: React.FC<LeadCaptureFormProps> = ({
  projectId,
  unitId,
  onSuccess,
  onCancel,
  initialData,
}) => {
  console.log('LeadCaptureForm props:', { projectId, unitId, initialData });
  const [formData, setFormData] = useState<CreateLeadData>({
    project_id: projectId,
    unit_id: unitId,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    source: 'Website Inquiry',
    budget_min: undefined,
    budget_max: undefined,
    preferred_unit_types: [],
    preferred_location: '',
    requirements: '',
    notes: '',
    next_followup: '',
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<Array<{ id: string; name: string; email: string }>>([]);

  // Update formData when projectId changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      project_id: projectId,
      unit_id: unitId,
    }));
  }, [projectId, unitId]);

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      const members = await leadService.getTeamMembers();
      setTeamMembers(members);
    } catch (error) {
      console.error('Failed to load team members:', error);
    }
  };

  const handleInputChange = (field: keyof CreateLeadData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleUnitTypeToggle = (unitType: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_unit_types: prev.preferred_unit_types?.includes(unitType)
        ? prev.preferred_unit_types.filter(type => type !== unitType)
        : [...(prev.preferred_unit_types || []), unitType],
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    console.log('Validating form data:', formData);

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (formData.budget_min && formData.budget_max && formData.budget_min > formData.budget_max) {
      newErrors.budget_max = 'Maximum budget must be greater than minimum budget';
    }

    console.log('Validation errors:', newErrors);
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('Form is valid:', isValid);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submit button clicked!');
    console.log('Form data:', formData);
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Form validation passed, creating lead...');
    setLoading(true);
    try {
      const lead = await leadService.createLead(formData);
      console.log('Lead created successfully:', lead);
      onSuccess(lead);
    } catch (error) {
      console.error('Failed to create lead:', error);
      setErrors({ submit: `Failed to create lead: ${error.message || 'Please try again.'}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Capture New Lead
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {errors.submit}
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <Input
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="Enter first name"
                error={errors.first_name}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <Input
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Enter last name"
                error={errors.last_name}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone Number *
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+971 50 123 4567"
                error={errors.phone}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-4 h-4 inline mr-1" />
                Email Address
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="email@example.com"
                error={errors.email}
              />
            </div>
          </div>

          {/* Source and Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lead Source
              </label>
              <SimpleSelect
                value={formData.source}
                onChange={(e) => handleInputChange('source', e.target.value)}
              >
                {LEAD_SOURCES.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </SimpleSelect>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign To
              </label>
              <SimpleSelect
                value={formData.assigned_to || ''}
                onChange={(e) => handleInputChange('assigned_to', e.target.value || undefined)}
              >
                <option value="">Unassigned</option>
                {teamMembers.map(member => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </SimpleSelect>
            </div>
          </div>

          {/* Budget Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Minimum Budget (AED)
              </label>
              <Input
                type="number"
                value={formData.budget_min || ''}
                onChange={(e) => handleInputChange('budget_min', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="800000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Maximum Budget (AED)
              </label>
              <Input
                type="number"
                value={formData.budget_max || ''}
                onChange={(e) => handleInputChange('budget_max', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="1200000"
                error={errors.budget_max}
              />
            </div>
          </div>

          {/* Preferred Unit Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Unit Types
            </label>
            <div className="flex flex-wrap gap-2">
              {UNIT_TYPES.map(unitType => (
                <Badge
                  key={unitType}
                  variant={formData.preferred_unit_types?.includes(unitType) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handleUnitTypeToggle(unitType)}
                >
                  {unitType}
                </Badge>
              ))}
            </div>
          </div>

          {/* Location and Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              Preferred Location
            </label>
            <Input
              value={formData.preferred_location || ''}
              onChange={(e) => handleInputChange('preferred_location', e.target.value)}
              placeholder="e.g., Downtown Dubai, Dubai Marina"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FileText className="w-4 h-4 inline mr-1" />
              Requirements & Notes
            </label>
            <Textarea
              value={formData.requirements || ''}
              onChange={(e) => handleInputChange('requirements', e.target.value)}
              placeholder="Any specific requirements, preferences, or additional notes..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              Next Follow-up
            </label>
            <Input
              type="datetime-local"
              value={formData.next_followup || ''}
              onChange={(e) => handleInputChange('next_followup', e.target.value)}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                console.log('Test button clicked');
                console.log('Form data:', formData);
                console.log('Validation result:', validateForm());
              }}
            >
              Test Form
            </Button>
            <Button type="submit" loading={loading} disabled={loading}>
              Create Lead
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
