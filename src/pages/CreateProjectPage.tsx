// Unified project creation page
// Handles both manual and AI creation methods using the same service

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { CreateProjectForm } from '../components/projects/CreateProjectForm';
import { AIProjectCreation } from '../components/projects/AIProjectCreation';
import { projectService } from '../services/projectService';
import { useAuth } from '../contexts/AuthContext';
import { Edit3, Zap, ArrowLeft, CheckCircle } from 'lucide-react';
import type { CreateProjectData } from '../types/project';

type CreationMethod = 'manual' | 'ai_assisted';

export const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, employeeId, organizationId, role } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<CreationMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdProject, setCreatedProject] = useState<any>(null);

  // Redirect admins to the admin-specific project creation page
  // Block agents from accessing this page
  React.useEffect(() => {
    if (role === 'admin') {
      navigate('/admin/projects/create', { replace: true });
    } else if (role === 'agent') {
      navigate('/agent-projects', { replace: true });
    }
  }, [role, navigate]);

  const handleCreateProject = async (data: CreateProjectData) => {
    setLoading(true);
    try {
      // Clean the data to remove any circular references and ensure only serializable data
      const cleanData = {
        name: data.name,
        location: data.location,
        project_type: data.project_type,
        description: data.description,
        developer_name: data.developer_name,
        address: data.address,
        starting_price: data.starting_price,
        total_units: data.total_units,
        completion_date: data.completion_date,
        handover_date: data.handover_date,
        amenities: data.amenities ?? [],
        connectivity: data.connectivity ?? [],
        landmarks: data.landmarks ?? [],
        payment_plans: data.payment_plans ?? [],
        custom_attributes: data.custom_attributes || {},
        creation_method: data.creation_method,
        ai_confidence_score: data.ai_confidence_score,
        source_file_id: data.source_file_id,
        featured_image: data.featured_image,
        gallery_images: data.gallery_images || [],
        brochure_url: data.brochure_url,
        brochure_file: (data as any).brochure_file,
        floor_plan_urls: data.floor_plan_urls || [],
        is_featured: data.is_featured || false,
      };
      
      console.log('Creating project with data:', cleanData);
      console.log('Original data amenities:', data.amenities);
      console.log('Original data connectivity:', data.connectivity);
      console.log('Original data landmarks:', data.landmarks);
      console.log('Original data payment_plans:', data.payment_plans);
      console.log('Clean data amenities:', cleanData.amenities);
      console.log('Clean data connectivity:', cleanData.connectivity);
      console.log('Clean data landmarks:', cleanData.landmarks);
      console.log('Clean data payment_plans:', cleanData.payment_plans);
      console.log('Creation method:', data.creation_method);
      console.log('Full original data:', data);
      const result = await projectService.createProject(cleanData);
      
      setCreatedProject(result);
      setSuccess(true);
      
      // Redirect to project details after a short delay
      setTimeout(() => {
        navigate(`/projects/${result.id}`);
      }, 2000);
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSelectedMethod(null);
    setSuccess(false);
    setCreatedProject(null);
  };

  if (success && createdProject) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                Project Created Successfully
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-green-800">
                      {createdProject.name}
                    </h3>
                    <p className="text-green-600">
                      Created using {createdProject.creation_method} method
                    </p>
                    <p className="text-sm text-green-500 mt-1">
                      Redirecting to project details...
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button onClick={reset} variant="outline">
                  Create Another Project
                </Button>
                <Button onClick={() => navigate(`/projects/${createdProject.id}`)}>
                  View Project Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!selectedMethod) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button
                onClick={() => navigate('/projects')}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
            <p className="text-gray-600 mt-2">
              Choose how you'd like to create your project
            </p>
          </div>

          {/* Method Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Manual Creation */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedMethod('manual')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-blue-500" />
                  Manual Entry
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Create your project by manually entering all the details. 
                  Perfect for when you have all the information ready.
                </p>
                <div className="space-y-2">
                  <Badge variant="default">Full Control</Badge>
                  <Badge variant="default">Step by Step</Badge>
                  <Badge variant="default">Detailed Forms</Badge>
                </div>
                <div className="pt-4">
                  <Button className="w-full">
                    Start Manual Entry
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI-Assisted Creation */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedMethod('ai_assisted')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-500" />
                  AI-Assisted
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Upload a project brochure and let our AI extract the information automatically. 
                  Review and edit the extracted data before creating the project.
                </p>
                <div className="space-y-2">
                  <Badge variant="default">Fast Setup</Badge>
                  <Badge variant="default">AI Extraction</Badge>
                  <Badge variant="default">Smart Review</Badge>
                </div>
                <div className="pt-4">
                  <Button className="w-full">
                    Start AI Extraction
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Info */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Current User</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">User</h4>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Role</h4>
                  <p className="text-sm text-gray-600">{role || 'Not assigned'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Organization ID</h4>
                  <p className="text-sm text-gray-600">{organizationId || 'Not available'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={reset}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Method Selection
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Create Project - {selectedMethod === 'manual' ? 'Manual Entry' : 'AI-Assisted'}
          </h1>
          <p className="text-gray-600 mt-2">
            {selectedMethod === 'manual' 
              ? 'Fill out the form below to create your project manually'
              : 'Upload a brochure and let AI extract the project information'
            }
          </p>
        </div>

        {/* Creation Form */}
        {selectedMethod === 'manual' && (
          <CreateProjectForm
            onSubmit={handleCreateProject}
            loading={loading}
          />
        )}

        {selectedMethod === 'ai_assisted' && (
          <AIProjectCreation
            onSubmit={handleCreateProject}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};
