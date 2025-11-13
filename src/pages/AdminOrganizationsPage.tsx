import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SimpleSelect } from '../components/ui/SimpleSelect';
import { Badge } from '../components/ui/Badge';
import { Loading } from '../components/ui/Loading';
import { adminService } from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';
import type { AdminOrganization, AdminFilters } from '../types/admin';
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ArrowLeft,
  Eye,
  Edit,
  MoreVertical,
  AlertTriangle
} from 'lucide-react';

export const AdminOrganizationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [organizations, setOrganizations] = useState<AdminOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AdminFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

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
  }, [role, navigate, filters]);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllOrganizations(filters);
      setOrganizations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm || undefined
    }));
  };

  const handleFilterChange = (key: keyof AdminFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const handleStatusChange = async (organizationId: string, newStatus: 'active' | 'suspended') => {
    try {
      await adminService.updateOrganizationStatus(organizationId, newStatus);
      await loadOrganizations(); // Reload to get updated data
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
      month: 'short',
      day: 'numeric',
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
        <Loading size="lg" text="Loading organizations..." />
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
              variant="outline"
              onClick={() => navigate('/admin')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Organization Management</h1>
              <p className="text-gray-600">Manage all organizations in the system</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Type</label>
                <SimpleSelect
                  value={filters.organization_type || ''}
                  onChange={(e) => handleFilterChange('organization_type', e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="developer">Developer</option>
                  <option value="agent">Agent</option>
                </SimpleSelect>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <SimpleSelect
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </SimpleSelect>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch}>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Organizations List */}
        {organizations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No organizations found</h3>
              <p className="text-gray-600">Try adjusting your search criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <Card key={org.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2">
                      <Badge 
                        variant="outline" 
                        className={`border-${getTypeColor(org.type)}-200 text-${getTypeColor(org.type)}-700`}
                      >
                        {org.type}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`border-${getStatusColor(org.status)}-200 text-${getStatusColor(org.status)}-700`}
                      >
                        {org.status}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-lg">{org.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    {org.contact_email}
                  </div>

                  {org.contact_phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      {org.contact_phone}
                    </div>
                  )}

                  {org.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {org.address}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    Created: {formatDate(org.created_at)}
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{org.employee_count}</div>
                      <div className="text-xs text-gray-500">Employees</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{org.project_count}</div>
                      <div className="text-xs text-gray-500">Projects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{org.lead_count}</div>
                      <div className="text-xs text-gray-500">Leads</div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => navigate(`/admin/organizations/${org.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => navigate(`/admin/organizations/${org.id}/edit`)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    {org.status === 'active' ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-red-600 hover:text-red-700"
                        onClick={() => handleStatusChange(org.id, 'suspended')}
                      >
                        <UserX className="w-4 h-4 mr-1" />
                        Suspend
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-green-600 hover:text-green-700"
                        onClick={() => handleStatusChange(org.id, 'active')}
                      >
                        <UserCheck className="w-4 h-4 mr-1" />
                        Activate
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{organizations.length}</div>
                <div className="text-sm text-gray-500">Total Organizations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {organizations.filter(org => org.type === 'developer').length}
                </div>
                <div className="text-sm text-gray-500">Developers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {organizations.filter(org => org.type === 'agent').length}
                </div>
                <div className="text-sm text-gray-500">Agents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {organizations.filter(org => org.status === 'active').length}
                </div>
                <div className="text-sm text-gray-500">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
