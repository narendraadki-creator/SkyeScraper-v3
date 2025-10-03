import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Loading } from '../components/ui/Loading';
import { adminService } from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';
import type { AdminOrganization } from '../types/admin';
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  FileText,
  Target,
  Edit,
  UserCheck,
  UserX,
  AlertTriangle,
  Activity
} from 'lucide-react';

export const AdminOrganizationDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { organizationId } = useParams<{ organizationId: string }>();
  const { role } = useAuth();
  const [organization, setOrganization] = useState<AdminOrganization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organization details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: 'active' | 'suspended') => {
    if (!organization) return;
    
    try {
      await adminService.updateOrganizationStatus(organization.id, newStatus);
      await loadOrganizationDetails(); // Reload to get updated data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update organization status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'pending': return 'yellow';
      case 'suspended': return 'red';
      default: return 'gray';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'developer': return 'blue';
      case 'agent': return 'green';
      default: return 'gray';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/organizations')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Organizations
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{organization.name}</h1>
                <p className="text-gray-600">Organization Details</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/admin/organizations/${organization.id}/edit`)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Organization
              </Button>
              {organization.status === 'active' ? (
                <Button 
                  variant="outline" 
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleStatusChange('suspended')}
                >
                  <UserX className="w-4 h-4 mr-2" />
                  Suspend
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="text-green-600 hover:text-green-700"
                  onClick={() => handleStatusChange('active')}
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Activate
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Organization Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Basic Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Organization Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2 mb-4">
                <Badge 
                  variant="outline" 
                  className={`border-${getTypeColor(organization.type)}-200 text-${getTypeColor(organization.type)}-700`}
                >
                  {organization.type}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={`border-${getStatusColor(organization.status)}-200 text-${getStatusColor(organization.status)}-700`}
                >
                  {organization.status}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Contact Email</p>
                      <p className="text-gray-900">{organization.contact_email}</p>
                    </div>
                  </div>

                  {organization.contact_phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Contact Phone</p>
                        <p className="text-gray-900">{organization.contact_phone}</p>
                      </div>
                    </div>
                  )}

                  {organization.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Address</p>
                        <p className="text-gray-900">{organization.address}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Created</p>
                      <p className="text-gray-900">{formatDate(organization.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Last Updated</p>
                      <p className="text-gray-900">{formatDate(organization.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-blue-900">{organization.employee_count}</div>
                  <div className="text-sm text-blue-700">Employees</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <FileText className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-green-900">{organization.project_count}</div>
                  <div className="text-sm text-green-700">Projects</div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="w-6 h-6 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold text-purple-900">{organization.lead_count}</div>
                  <div className="text-sm text-purple-700">Leads</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => navigate(`/admin/projects?organization_id=${organization.id}`)}
              >
                <FileText className="w-6 h-6" />
                <span className="text-sm">View Projects</span>
                <span className="text-xs text-gray-500">{organization.project_count} projects</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => navigate(`/admin/leads?organization_id=${organization.id}`)}
              >
                <Target className="w-6 h-6" />
                <span className="text-sm">View Leads</span>
                <span className="text-xs text-gray-500">{organization.lead_count} leads</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => navigate(`/admin/organizations/${organization.id}/edit`)}
              >
                <Edit className="w-6 h-6" />
                <span className="text-sm">Edit Organization</span>
                <span className="text-xs text-gray-500">Update details</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
