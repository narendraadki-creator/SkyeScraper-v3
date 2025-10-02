import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SimpleSelect } from '../components/ui/SimpleSelect';
import { Textarea } from '../components/ui/Textarea';
import { Loading } from '../components/ui/Loading';
import { adminService } from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';
import type { AdminOrganization } from '../types/admin';
import {
  ArrowLeft,
  Save,
  AlertTriangle,
  Building
} from 'lucide-react';

interface OrganizationFormData {
  name: string;
  type: 'developer' | 'agent';
  status: 'active' | 'pending' | 'suspended';
  contact_email: string;
  contact_phone: string;
  address: string;
}

export const AdminOrganizationEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { organizationId } = useParams<{ organizationId: string }>();
  const { role } = useAuth();
  const [organization, setOrganization] = useState<AdminOrganization | null>(null);
  const [formData, setFormData] = useState<OrganizationFormData>({
    name: '',
    type: 'developer',
    status: 'active',
    contact_email: '',
    contact_phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    if (organizationId) {
      loadOrganizationDetails();
    }
  }, [role, navigate, organizationId]);

  const loadOrganizationDetails = async () => {
    if (!organizationId) return;
    
    try {
      setLoading(true);
      // Get all organizations and find the specific one
      const organizations = await adminService.getAllOrganizations();
      const org = organizations.find(o => o.id === organizationId);
      
      if (!org) {
        setError('Organization not found');
        return;
      }
      
      setOrganization(org);
      setFormData({
        name: org.name,
        type: org.type,
        status: org.status,
        contact_email: org.contact_email,
        contact_phone: org.contact_phone || '',
        address: org.address || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organization details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof OrganizationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Organization name is required';
    }

    if (!formData.contact_email.trim()) {
      newErrors.contact_email = 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !organization) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Update organization with all form data
      await adminService.updateOrganization(organization.id, {
        name: formData.name,
        type: formData.type,
        status: formData.status,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone || undefined,
        address: formData.address || undefined,
      });

      // Navigate back to organization details
      navigate(`/admin/organizations/${organization.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update organization');
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
        <Loading size="lg" text="Loading organization details..." />
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Organization</h3>
            <p className="text-gray-600 mb-4">{error || 'Organization not found'}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => navigate('/admin/organizations')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Organizations
              </Button>
              <Button onClick={loadOrganizationDetails} variant="outline">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/admin/organizations/${organization.id}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Details
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Organization</h1>
              <p className="text-gray-600">{organization.name}</p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Organization Information
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
                
                <Input
                  label="Organization Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={errors.name}
                  placeholder="Enter organization name"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization Type
                    </label>
                    <SimpleSelect
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value as 'developer' | 'agent')}
                    >
                      <option value="developer">Developer</option>
                      <option value="agent">Agent</option>
                    </SimpleSelect>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <SimpleSelect
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'pending' | 'suspended')}
                    >
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </SimpleSelect>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
                
                <Input
                  label="Contact Email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  error={errors.contact_email}
                  placeholder="Enter contact email"
                  required
                />

                <Input
                  label="Contact Phone"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  placeholder="Enter contact phone number"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter organization address"
                    rows={3}
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
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/admin/organizations/${organization.id}`)}
                  disabled={saving}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Organization Statistics (Read-only) */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Organization Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{organization.employee_count}</div>
                <div className="text-sm text-gray-500">Employees</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{organization.project_count}</div>
                <div className="text-sm text-gray-500">Projects</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{organization.lead_count}</div>
                <div className="text-sm text-gray-500">Leads</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
