import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { LeadCaptureForm } from '../components/leads/LeadCaptureForm';
import { ArrowLeft, User } from 'lucide-react';

export const CreateLeadPage: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  const handleLeadSuccess = (lead: any) => {
    // Navigate back to agent projects or to lead details
    navigate('/agent-projects');
    console.log('Lead created successfully:', lead);
  };

  const handleCancel = () => {
    navigate('/agent-projects');
  };

  if (!projectId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Project Not Found</h3>
              <p className="text-gray-600 mb-4">The project ID is missing or invalid.</p>
              <Button onClick={() => navigate('/agent-projects')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Button>
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
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/agent-projects')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
          
          <div className="flex items-center gap-2 mb-2">
            <User className="w-6 h-6 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Create New Lead</h1>
          </div>
          <p className="text-gray-600">Capture lead information for your client</p>
        </div>

        {/* Lead Capture Form */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadCaptureForm
              projectId={projectId}
              onSuccess={handleLeadSuccess}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
