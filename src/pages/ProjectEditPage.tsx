// Project edit page for developers

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Loading } from '../components/ui/Loading';
import { projectService } from '../services/projectService';
import { useAuth } from '../contexts/AuthContext';
import { CreateProjectForm } from '../components/projects/CreateProjectForm';
import { ArrowLeft, Building, FileText, Edit, Archive, Trash2 } from 'lucide-react';
import type { Project, CreateProjectData } from '../types/project';

interface ProjectEditProps { variant?: 'desktop' | 'mobile' }
export const ProjectEditPage: React.FC<ProjectEditProps> = ({ variant = 'desktop' }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateProjectData | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  
  // Confirmation dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'delete' | 'archive';
  }>({
    isOpen: false,
    type: 'delete',
  });

  useEffect(() => {
    // Redirect non-developers to appropriate pages
    if (role === 'admin') {
      // Redirect admin to admin project edit page
      navigate(`/admin/projects/${id}/edit`, { replace: true });
    } else if (role === 'agent') {
      // Agents cannot edit projects - redirect based on variant
      if (variant === 'mobile') {
        navigate('/mobile/agent', { replace: true });
      } else {
        navigate('/agent-projects', { replace: true });
      }
    }
    // Developers can stay and edit
  }, [role, navigate, id, variant]);

  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id]);

  // Debug success message state
  useEffect(() => {
    console.log('Success message state changed:', successMessage);
  }, [successMessage]);


  const loadProject = async (projectId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await projectService.getProject(projectId);
      setProject(result);
      // Convert project to form data only once when loading
      setFormData(convertProjectToFormData(result));
    } catch (err) {
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async (data: CreateProjectData) => {
    console.log('handleUpdateProject called with data:', data);
    if (!project) {
      console.log('No project found, returning');
      return;
    }

    console.log('Starting project update...');
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await projectService.updateProject(project.id, data);
      
      if (result.error) {
        setError(result.error.message);
        return;
      }

      // Update the form data with the saved data
      console.log('Updating form data with saved data:', data);
      setFormData(data);
      
      // Show success message briefly, then redirect
      console.log('Setting success message...');
      setSuccessMessage('Project updated successfully! Redirecting...');
      console.log('Success message set');
      
      // Redirect to project details page after 2 seconds
      setTimeout(() => {
        console.log('Redirecting to project details...');
        setRedirecting(true);
        navigate(`/projects/${project.id}`);
      }, 2000);
    } catch (err) {
      console.error('Update failed:', err);
      setError('Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  const convertProjectToFormData = (project: Project): CreateProjectData => {
    return {
      creation_method: project.creation_method || 'manual',
      name: project.name,
      location: project.location,
      project_type: project.project_type,
      status: project.status,
      description: project.description || '',
      developer_name: project.developer_name || '',
      address: project.address || '',
      starting_price: project.starting_price,
      total_units: project.total_units,
      completion_date: project.completion_date || '',
      handover_date: project.handover_date || '',
      amenities: project.amenities || [],
      connectivity: project.connectivity || [],
      landmarks: project.landmarks || [],
      payment_plans: project.payment_plans || [],
      custom_attributes: project.custom_attributes || {},
      is_featured: project.is_featured || false,
    };
  };

  const handleDeleteProject = () => {
    setConfirmDialog({
      isOpen: true,
      type: 'delete',
    });
  };

  const handleArchiveProject = () => {
    setConfirmDialog({
      isOpen: true,
      type: 'archive',
    });
  };

  const handleConfirmAction = async () => {
    if (!project) return;

    try {
      if (confirmDialog.type === 'delete') {
        await projectService.deleteProject(project.id);
        navigate('/projects');
      } else if (confirmDialog.type === 'archive') {
        const newStatus = project.status === 'archived' ? 'draft' : 'archived';
        await projectService.updateProject(project.id, { status: newStatus } as CreateProjectData);
        // Reload project to get updated status
        await loadProject(project.id);
      }
    } catch (err) {
      setError(`Failed to ${confirmDialog.type} project`);
    } finally {
      setConfirmDialog({ isOpen: false, type: 'delete' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading project..." />
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => navigate('/projects')}>
                Back to Projects
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Project not found</p>
              <Button onClick={() => navigate('/projects')}>
                Back to Projects
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={variant === 'mobile' ? '' : 'min-h-screen bg-gray-50'}>
      <div className={variant === 'mobile' ? '' : 'max-w-4xl mx-auto px-4 py-8'}>
        {/* Header */}
        {variant === 'desktop' && (
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigate('/projects')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Button>
            </div>
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Project</h1>
                <p className="text-gray-600 mt-2">
                  Update the details for "{project.name}"
                </p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 md:justify-end">
                <Button
                  onClick={() => navigate(`/projects/${project.id}/units`)}
                  variant="outline"
                  title="Manage Project Units"
                >
                  <Building className="w-4 h-4 mr-2" />
                  Units
                </Button>
                <Button
                  onClick={() => {
                    console.log('Navigating to project files:', `/projects/${project.id}`);
                    navigate(`/projects/${project.id}`, { state: { activeTab: 'files' } });
                  }}
                  variant="outline"
                  title="View Project Files"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Files
                </Button>
                <Button
                  onClick={() => navigate(`/projects/${project.id}/units`)}
                  variant="outline"
                  title="Manage Project Units"
                >
                  <Building className="w-4 h-4 mr-2" />
                  Manage Units
                </Button>
                <Button
                  onClick={() => navigate(`/projects/${project.id}`)}
                  variant="outline"
                  title="View Project Details"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button
                  onClick={handleArchiveProject}
                  variant="outline"
                  className="text-orange-600 hover:text-orange-700"
                  disabled={project.status === 'archived'}
                  title={project.status === 'archived' ? 'Project is already archived' : 'Archive Project'}
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Archive
                </Button>
                <Button
                  onClick={handleDeleteProject}
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  title="Delete Project"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Success Display */}
        {successMessage && (
          <Card className="mb-6 border-green-400 bg-green-50 shadow-xl ring-2 ring-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-green-800 font-semibold text-xl">{successMessage}</p>
                <div className="ml-auto">
                  {redirecting ? (
                    <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            {formData && (
              <CreateProjectForm
                initialData={formData}
                onSubmit={handleUpdateProject}
                loading={saving || redirecting}
                isEditMode={true}
              />
            )}
          </CardContent>
        </Card>

        {/* Confirmation Dialog */}
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>
                  {confirmDialog.type === 'delete' 
                    ? 'Delete Project' 
                    : 'Archive Project'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">
                  {confirmDialog.type === 'delete'
                    ? `Are you sure you want to delete "${project.name}"? This action cannot be undone.`
                    : `Are you sure you want to ${project.status === 'archived' ? 'unarchive' : 'archive'} "${project.name}"?`}
                </p>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmDialog({ isOpen: false, type: 'delete' })}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmAction}
                    className={confirmDialog.type === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'}
                  >
                    {confirmDialog.type === 'delete' ? 'Delete' : (project.status === 'archived' ? 'Unarchive' : 'Archive')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

