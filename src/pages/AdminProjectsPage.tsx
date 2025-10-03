import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SimpleSelect } from '../components/ui/SimpleSelect';
import { Badge } from '../components/ui/Badge';
import { Loading } from '../components/ui/Loading';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { adminService } from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';
import type { AdminProject, AdminProjectFilters } from '../types/admin';
import {
  Building,
  Search,
  Filter,
  MapPin,
  DollarSign,
  Calendar,
  Eye,
  Users,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Archive,
  MoreVertical,
  AlertTriangle,
  TrendingUp,
  FileText
} from 'lucide-react';

export const AdminProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AdminProjectFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  
  // Confirmation dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'delete' | 'archive';
    projectId: string | null;
    projectName: string;
    action?: 'archive' | 'unarchive';
  }>({
    isOpen: false,
    type: 'delete',
    projectId: null,
    projectName: '',
  });

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
    loadProjects();
  }, [role, navigate, filters]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllProjects(filters);
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
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

  const handleFilterChange = (key: keyof AdminProjectFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const handleDeleteProject = (projectId: string, projectName: string) => {
    console.log('Delete button clicked for project:', projectId, projectName);
    setConfirmDialog({
      isOpen: true,
      type: 'delete',
      projectId,
      projectName,
    });
  };

  const handleArchiveProject = (projectId: string, projectName: string, currentStatus: string) => {
    const isArchived = currentStatus === 'archived';
    const action = isArchived ? 'unarchive' : 'archive';
    
    console.log(`${action} button clicked for project:`, projectId, projectName);
    setConfirmDialog({
      isOpen: true,
      type: 'archive',
      projectId,
      projectName,
      action,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.projectId) return;

    console.log('Confirming action:', confirmDialog.type, 'for project:', confirmDialog.projectId);

    try {
      if (confirmDialog.type === 'delete') {
        console.log('Deleting project...');
        await adminService.deleteProject(confirmDialog.projectId);
        console.log('Project deleted successfully');
      } else if (confirmDialog.type === 'archive') {
        const action = confirmDialog.action || 'archive';
        const newStatus = action === 'archive' ? 'archived' : 'published';
        
        console.log(`${action}ing project...`);
        await adminService.updateProject(confirmDialog.projectId, { status: newStatus } as any);
        console.log(`Project ${action}d successfully`);
      }
      
      // Reload projects
      console.log('Reloading projects...');
      await loadProjects();
      
      // Close dialog
      setConfirmDialog({
        isOpen: false,
        type: 'delete',
        projectId: null,
        projectName: '',
      });
    } catch (err) {
      console.error('Action failed:', err);
      setError(err instanceof Error ? err.message : `Failed to ${confirmDialog.type} project`);
    }
  };

  const handleCloseDialog = () => {
    setConfirmDialog({
      isOpen: false,
      type: 'delete',
      projectId: null,
      projectName: '',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'green';
      case 'draft': return 'yellow';
      case 'archived': return 'gray';
      default: return 'gray';
    }
  };

  const getCreationMethodColor = (method: string) => {
    switch (method) {
      case 'manual': return 'blue';
      case 'ai_assisted': return 'purple';
      case 'admin': return 'red';
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(amount);
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
        <Loading size="lg" text="Loading projects..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/admin')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Oversight</h1>
                <p className="text-gray-600">Manage all projects across the system</p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/admin/projects/create')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Creation Method</label>
                <SimpleSelect
                  value={filters.creation_method || ''}
                  onChange={(e) => handleFilterChange('creation_method', e.target.value)}
                >
                  <option value="">All Methods</option>
                  <option value="manual">Manual</option>
                  <option value="ai_assisted">AI Assisted</option>
                  <option value="admin">Admin Created</option>
                </SimpleSelect>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Status</label>
                <SimpleSelect
                  value={filters.project_status || ''}
                  onChange={(e) => handleFilterChange('project_status', e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </SimpleSelect>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by name or location..."
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

        {/* Projects List */}
        {projects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600">Try adjusting your search criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2 flex-wrap">
                      <Badge 
                        variant="outline" 
                        className={`border-${getStatusColor(project.status)}-200 text-${getStatusColor(project.status)}-700`}
                      >
                        {project.status}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`border-${getCreationMethodColor(project.creation_method)}-200 text-${getCreationMethodColor(project.creation_method)}-700`}
                      >
                        {project.creation_method}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`border-${getTypeColor(project.organization_type)}-200 text-${getTypeColor(project.organization_type)}-700`}
                      >
                        {project.organization_type}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{project.name}</CardTitle>
                  <p className="text-sm text-gray-600">{project.organization_name}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {project.location}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building className="w-4 h-4" />
                    {project.project_type}
                  </div>

                  {project.starting_price && (
                    <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                      <DollarSign className="w-4 h-4" />
                      From {formatCurrency(project.starting_price)}
                    </div>
                  )}

                  {project.completion_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      Completion: {formatDate(project.completion_date)}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {project.views_count} views
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {project.leads_count} leads
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {project.units_count} units
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    Created: {formatDate(project.created_at)}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => navigate(`/admin/projects/${project.id}/edit`)}
                      disabled={project.status === 'archived'}
                      title={project.status === 'archived' ? 'Cannot edit archived projects' : 'Edit Project'}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={project.status === 'archived' ? 'text-green-600 hover:text-green-700' : 'text-orange-600 hover:text-orange-700'}
                      onClick={() => handleArchiveProject(project.id, project.name, project.status)}
                      title={project.status === 'archived' ? 'Unarchive Project' : 'Archive Project'}
                    >
                      <Archive className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteProject(project.id, project.name)}
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{projects.length}</div>
                <div className="text-sm text-gray-500">Total Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {projects.filter(p => p.status === 'published').length}
                </div>
                <div className="text-sm text-gray-500">Published</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {projects.filter(p => p.status === 'draft').length}
                </div>
                <div className="text-sm text-gray-500">Draft</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {projects.filter(p => p.creation_method === 'manual').length}
                </div>
                <div className="text-sm text-gray-500">Manual</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {projects.filter(p => p.creation_method === 'ai_assisted').length}
                </div>
                <div className="text-sm text-gray-500">AI Assisted</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={handleCloseDialog}
          onConfirm={handleConfirmAction}
          title={confirmDialog.type === 'delete' ? 'Delete Project' : (confirmDialog.action === 'unarchive' ? 'Unarchive Project' : 'Archive Project')}
          message={
            confirmDialog.type === 'delete'
              ? `Are you sure you want to delete "${confirmDialog.projectName}"? This action cannot be undone.`
              : confirmDialog.action === 'unarchive'
              ? `Are you sure you want to unarchive "${confirmDialog.projectName}"? It will be visible to agents again.`
              : `Are you sure you want to archive "${confirmDialog.projectName}"? It will be hidden from agents but can be restored later.`
          }
          confirmText={confirmDialog.type === 'delete' ? 'Delete' : (confirmDialog.action === 'unarchive' ? 'Unarchive' : 'Archive')}
          cancelText="Cancel"
          type={confirmDialog.type === 'delete' ? 'danger' : 'warning'}
        />
      </div>
    </div>
  );
};
