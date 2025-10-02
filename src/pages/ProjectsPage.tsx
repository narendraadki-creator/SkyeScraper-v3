// Project list page - shows all projects using unified architecture

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Loading } from '../components/ui/Loading';
import { projectService } from '../services/projectService';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Search, Filter, Eye, Edit, Trash2, Calendar, MapPin, DollarSign, Users } from 'lucide-react';
import type { Project, ProjectFilters, ProjectListResponse } from '../types/project';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, employeeId, organizationId, role } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProjectFilters>({
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    total_pages: 0,
    current_page: 1,
  });

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
  ];

  const creationMethodOptions = [
    { value: '', label: 'All Methods' },
    { value: 'manual', label: 'Manual' },
    { value: 'ai_assisted', label: 'AI-Assisted' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'admin', label: 'Admin' },
  ];

  const projectTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'Apartment', label: 'Apartment' },
    { value: 'Villa', label: 'Villa' },
    { value: 'Townhouse', label: 'Townhouse' },
    { value: 'Penthouse', label: 'Penthouse' },
    { value: 'Studio', label: 'Studio' },
    { value: 'Commercial', label: 'Commercial' },
  ];

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await projectService.listProjects(filters);
      
      setProjects(result);
      setPagination({
        total: result.length,
        total_pages: Math.ceil(result.length / 20),
        current_page: 1,
      });
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [filters]);

  const handleFilterChange = (key: keyof ProjectFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const result = await projectService.deleteProject(projectId);
      
      if (result.error) {
        setError(result.error.message);
        return;
      }

      // Reload projects
      await loadProjects();
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

    return (
      <Badge variant={variants[method as keyof typeof variants] || 'default'}>
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

  if (loading && projects.length === 0) {
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
              <p className="text-gray-600 mt-2">
                {role === 'agent' 
                  ? 'Browse published projects from developers'
                  : 'Manage your real estate projects'
                }
              </p>
            </div>
            {role !== 'agent' && (
              <Button onClick={() => navigate('/projects/create')}>
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search projects..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Select
                  value={filters.status || ''}
                  onChange={(value) => handleFilterChange('status', value || undefined)}
                  options={statusOptions}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Creation Method
                </label>
                <Select
                  value={filters.creation_method || ''}
                  onChange={(value) => handleFilterChange('creation_method', value || undefined)}
                  options={creationMethodOptions}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Type
                </label>
                <Select
                  value={filters.project_type || ''}
                  onChange={(value) => handleFilterChange('project_type', value || undefined)}
                  options={projectTypeOptions}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Plus className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No projects found
              </h3>
              <p className="text-gray-600 mb-4">
                {filters.search || filters.status || filters.creation_method || filters.project_type
                  ? 'Try adjusting your filters or search terms.'
                  : role === 'agent' 
                    ? 'No published projects are available at the moment.'
                    : 'Get started by creating your first project.'
                }
              </p>
              {role !== 'agent' && (
                <Button onClick={() => navigate('/projects/create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">
                        {project.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{project.location}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {getCreationMethodBadge(project.creation_method)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    {getStatusBadge(project.status)}
                    {project.is_featured && (
                      <Badge variant="default">Featured</Badge>
                    )}
                  </div>

                  {project.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {project.starting_price && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {project.starting_price.toLocaleString()} AED
                        </span>
                      </div>
                    )}
                    {project.total_units && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {project.total_units} units
                        </span>
                      </div>
                    )}
                  </div>

                  {project.amenities && project.amenities.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Amenities</p>
                      <div className="flex flex-wrap gap-1">
                        {project.amenities.slice(0, 3).map((amenity, index) => (
                          <Badge key={index} variant="default" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {project.amenities.length > 3 && (
                          <Badge variant="default" className="text-xs">
                            +{project.amenities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      {role !== 'agent' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/projects/${project.id}/edit`)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteProject(project.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
            >
              Previous
            </Button>
            
            <span className="text-sm text-gray-600">
              Page {pagination.current_page} of {pagination.total_pages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.total_pages}
            >
              Next
            </Button>
          </div>
        )}

        {/* Loading overlay */}
        {loading && projects.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
            <Loading size="lg" text="Loading..." />
          </div>
        )}
      </div>
    </div>
  );
};
