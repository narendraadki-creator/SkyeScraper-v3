// Project edit page for developers

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Loading } from '../components/ui/Loading';
import { projectService } from '../services/projectService';
import { useAuth } from '../contexts/AuthContext';
import { CreateProjectForm } from '../components/projects/CreateProjectForm';
import { ArrowLeft } from 'lucide-react';
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
                variant="outline"
                size="sm"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Project
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Project</h1>
            <p className="text-gray-600 mt-2">
              Update the details for "{project.name}"
            </p>
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
      </div>
    </div>
  );
};

