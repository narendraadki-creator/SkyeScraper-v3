// AI project creation component
// Follows unified architecture - uses same service and types

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Upload, FileText, CheckCircle, AlertCircle, Edit3, Save } from 'lucide-react';
import type { CreateProjectData, AIExtractionResult } from '../../types/project';
import { projectService } from '../../services/projectService';

interface AIProjectCreationProps {
  onSubmit: (data: CreateProjectData) => Promise<void>;
  loading?: boolean;
}

export const AIProjectCreation: React.FC<AIProjectCreationProps> = ({
  onSubmit,
  loading = false,
}) => {
  const [step, setStep] = useState<'upload' | 'review' | 'confirm'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractionResult, setExtractionResult] = useState<AIExtractionResult | null>(null);
  const [editableData, setEditableData] = useState<CreateProjectData | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string>('');

  // Load logged-in organization name to lock developer_name
  useEffect(() => {
    (async () => {
      try {
        const { supabase } = await import('../../lib/supabase');
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: employee } = await supabase
          .from('employees')
          .select('organization_id')
          .eq('user_id', user.id)
          .single();
        if (employee?.organization_id) {
          const { data: org } = await supabase
            .from('organizations')
            .select('name')
            .eq('id', employee.organization_id)
            .single();
          if (org?.name) setOrgName(org.name);
        }
      } catch {}
    })();
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const simulateAIExtraction = async (): Promise<AIExtractionResult> => {
    if (!selectedFile) throw new Error('No file selected');
    
    // Use the projectService AI processing
    return await projectService.processFileWithAI(selectedFile);
  };

  const handleExtract = async () => {
    if (!selectedFile) return;

    setProcessing(true);
    setError(null);

    try {
      const result = await simulateAIExtraction();
      setExtractionResult(result);
      
      // Convert extraction result to CreateProjectData
      const projectData: CreateProjectData = {
        creation_method: 'ai_assisted',
        name: result.name,
        location: result.location,
        project_type: result.project_type,
        description: result.description,
        developer_name: orgName || result.developer_name,
        address: result.address,
        starting_price: result.starting_price,
        total_units: result.total_units,
        completion_date: result.completion_date,
        handover_date: result.handover_date,
        amenities: result.amenities,
        connectivity: result.connectivity,
        landmarks: result.landmarks,
        payment_plans: result.payment_plans,
        custom_attributes: result.custom_attributes,
        ai_confidence_score: result.confidence_score,
        is_featured: false,
      };

      setEditableData(projectData);
      setStep('review');
    } catch (err) {
      setError('AI extraction failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDataEdit = (field: keyof CreateProjectData, value: any) => {
    if (editableData) {
      setEditableData(prev => prev ? { ...prev, [field]: value } : null);
    }
  };

  const handleConfirm = async () => {
    if (!editableData) return;

    try {
      // Include the brochure file in the data
      const dataWithFile = {
        ...editableData,
        brochure_file: selectedFile,
      };
      
      console.log('AI Project Creation - Data being submitted:', dataWithFile);
      console.log('AI Project Creation - Amenities:', dataWithFile.amenities);
      console.log('AI Project Creation - Connectivity:', dataWithFile.connectivity);
      console.log('AI Project Creation - Landmarks:', dataWithFile.landmarks);
      console.log('AI Project Creation - Payment Plans:', dataWithFile.payment_plans);
      
      await onSubmit(dataWithFile);
      setStep('confirm');
    } catch (err) {
      setError('Failed to create project. Please try again.');
    }
  };

  const reset = () => {
    setStep('upload');
    setSelectedFile(null);
    setExtractionResult(null);
    setEditableData(null);
    setError(null);
  };

  if (step === 'upload') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Brochure for AI Extraction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Upload Project Brochure
              </h3>
              <p className="text-gray-600 mb-4">
                Upload a PDF brochure and our AI will extract project information automatically.
              </p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 cursor-pointer"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose PDF File
              </label>
            </div>
          </div>

          {selectedFile && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    File selected: {selectedFile.name}
                  </p>
                  <p className="text-sm text-green-600">
                    Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleExtract}
              disabled={!selectedFile || processing}
              loading={processing}
            >
              {processing ? 'Extracting...' : 'Extract with AI'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'review') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              Review Extracted Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {extractionResult && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      AI Extraction Complete
                    </p>
                    <p className="text-sm text-blue-600">
                      Confidence Score: {(extractionResult.confidence_score * 100).toFixed(1)}%
                    </p>
                  </div>
                  <Badge variant="default">
                    {extractionResult.extracted_fields.length} fields extracted
                  </Badge>
                </div>
              </div>
            )}

            {editableData && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Name
                    </label>
                    <Input
                      value={editableData.name}
                      onChange={(e) => handleDataEdit('name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <Input
                      value={editableData.location}
                      onChange={(e) => handleDataEdit('location', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Textarea
                    value={editableData.description || ''}
                    onChange={(e) => handleDataEdit('description', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Developer Name
                    </label>
                    <Input
                      value={orgName || editableData.developer_name || ''}
                      onChange={() => { /* locked - no manual override */ }}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Starting Price (AED)
                    </label>
                    <Input
                      type="number"
                      value={editableData.starting_price || ''}
                      onChange={(e) => handleDataEdit('starting_price', parseFloat(e.target.value) || undefined)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amenities
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {editableData.amenities?.map((amenity, index) => (
                      <Badge key={index} variant="default">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Landmarks
                  </label>
                  <div className="space-y-2">
                    {editableData.landmarks?.map((landmark, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded">
                        <strong>{landmark.name}</strong> - {landmark.distance}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Plans
                  </label>
                  <div className="space-y-2">
                    {editableData.payment_plans?.map((plan, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded">
                        <h4 className="font-medium text-gray-900">{plan.name}</h4>
                        {plan.description && (
                          <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">{plan.terms}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button onClick={reset} variant="outline">
                Upload Different File
              </Button>
              <Button onClick={handleConfirm} loading={loading} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Project Created Successfully
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-green-800 mb-2">
              Project Created with AI Assistance
            </h3>
            <p className="text-green-600">
              Your project has been successfully created using AI extraction.
            </p>
          </div>
          <Button onClick={reset} variant="outline">
            Create Another Project
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
};
