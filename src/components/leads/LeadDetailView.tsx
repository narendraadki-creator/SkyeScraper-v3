import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { SimpleSelect } from '../ui/SimpleSelect';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Loading } from '../ui/Loading';
import { leadService } from '../../services/leadService';
import { LEAD_STATUS_CONFIG, LEAD_STAGE_CONFIG } from '../../types/lead';
import type { Lead, UpdateLeadData, LeadStatus, LeadStage } from '../../types/lead';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  Calendar, 
  FileText,
  Edit,
  Save,
  X,
  Building,
  Home,
  Target,
  TrendingUp
} from 'lucide-react';

interface LeadDetailViewProps {
  leadId: string;
  onClose: () => void;
  onUpdate?: (lead: Lead) => void;
}

export const LeadDetailView: React.FC<LeadDetailViewProps> = ({
  leadId,
  onClose,
  onUpdate,
}) => {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updateData, setUpdateData] = useState<UpdateLeadData>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLead();
  }, [leadId]);

  const loadLead = async () => {
    setLoading(true);
    try {
      const leadData = await leadService.getLead(leadId);
      setLead(leadData);
    } catch (error) {
      console.error('Failed to load lead:', error);
      setError('Failed to load lead details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!lead) return;

    setSaving(true);
    try {
      const updatedLead = await leadService.updateLead(leadId, updateData);
      setLead(updatedLead);
      setEditing(false);
      setUpdateData({});
      onUpdate?.(updatedLead);
    } catch (error) {
      console.error('Failed to update lead:', error);
      setError('Failed to update lead');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setUpdateData({});
  };

  const handleFieldChange = (field: keyof UpdateLeadData, value: any) => {
    setUpdateData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const getStatusBadge = (status: LeadStatus) => {
    const config = LEAD_STATUS_CONFIG[status];
    return (
      <Badge variant="default" className={`bg-${config.color}-100 text-${config.color}-800`}>
        {config.icon} {config.label}
      </Badge>
    );
  };

  const getStageBadge = (stage: LeadStage) => {
    const config = LEAD_STAGE_CONFIG[stage];
    return (
      <Badge variant="outline" className={`border-${config.color}-200 text-${config.color}-700`}>
        {config.icon} {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-AE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="lg" text="Loading lead details..." />
      </div>
    );
  }

  if (error || !lead) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-red-600 mb-4">{error || 'Lead not found'}</p>
          <Button onClick={onClose}>Close</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {lead.first_name} {lead.last_name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                {getStatusBadge(lead.status)}
                {getStageBadge(lead.stage)}
              </div>
            </div>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <Button size="sm" onClick={handleUpdate} loading={saving}>
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <p className="text-gray-900">{lead.first_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <p className="text-gray-900">{lead.last_name}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone Number
              </label>
              <p className="text-gray-900">{lead.phone}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-4 h-4 inline mr-1" />
                Email Address
              </label>
              <p className="text-gray-900">{lead.email || 'Not provided'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <p className="text-gray-900">{lead.source || 'Not specified'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Lead Status & Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Lead Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              {editing ? (
                <SimpleSelect
                  value={updateData.status || lead.status}
                  onChange={(e) => handleFieldChange('status', e.target.value as LeadStatus)}
                >
                  {Object.entries(LEAD_STATUS_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </SimpleSelect>
              ) : (
                <div>{getStatusBadge(lead.status)}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
              {editing ? (
                <SimpleSelect
                  value={updateData.stage || lead.stage}
                  onChange={(e) => handleFieldChange('stage', e.target.value as LeadStage)}
                >
                  {Object.entries(LEAD_STAGE_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </SimpleSelect>
              ) : (
                <div>{getStageBadge(lead.stage)}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
              {editing ? (
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={updateData.score || lead.score || ''}
                  onChange={(e) => handleFieldChange('score', e.target.value ? Number(e.target.value) : undefined)}
                />
              ) : (
                <p className="text-gray-900">{lead.score ? `${lead.score}/100` : 'Not scored'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Next Follow-up
              </label>
              {editing ? (
                <Input
                  type="datetime-local"
                  value={updateData.next_followup || lead.next_followup || ''}
                  onChange={(e) => handleFieldChange('next_followup', e.target.value)}
                />
              ) : (
                <p className="text-gray-900">
                  {lead.next_followup ? formatDateTime(lead.next_followup) : 'Not scheduled'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Contacted</label>
              <p className="text-gray-900">
                {lead.last_contacted ? formatDateTime(lead.last_contacted) : 'Never'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Budget & Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Budget & Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Budget</label>
                {editing ? (
                  <Input
                    type="number"
                    value={updateData.budget_min || lead.budget_min || ''}
                    onChange={(e) => handleFieldChange('budget_min', e.target.value ? Number(e.target.value) : undefined)}
                  />
                ) : (
                  <p className="text-gray-900">
                    {lead.budget_min ? formatCurrency(lead.budget_min) : 'Not specified'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Budget</label>
                {editing ? (
                  <Input
                    type="number"
                    value={updateData.budget_max || lead.budget_max || ''}
                    onChange={(e) => handleFieldChange('budget_max', e.target.value ? Number(e.target.value) : undefined)}
                  />
                ) : (
                  <p className="text-gray-900">
                    {lead.budget_max ? formatCurrency(lead.budget_max) : 'Not specified'}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                Preferred Location
              </label>
              {editing ? (
                <Input
                  value={updateData.preferred_location || lead.preferred_location || ''}
                  onChange={(e) => handleFieldChange('preferred_location', e.target.value)}
                />
              ) : (
                <p className="text-gray-900">{lead.preferred_location || 'Not specified'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Unit Types</label>
              <div className="flex flex-wrap gap-1">
                {lead.preferred_unit_types?.map((type) => (
                  <Badge key={type} variant="outline">{type}</Badge>
                )) || <p className="text-gray-500">Not specified</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project & Unit Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Project & Unit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Associated Project</label>
              <p className="text-gray-900">
                {lead.project_id ? `Project ID: ${lead.project_id}` : 'No project associated'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specific Unit</label>
              <p className="text-gray-900">
                {lead.unit_id ? `Unit ID: ${lead.unit_id}` : 'No specific unit'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notes & Requirements */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Notes & Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
              {editing ? (
                <Textarea
                  value={updateData.requirements || lead.requirements || ''}
                  onChange={(e) => handleFieldChange('requirements', e.target.value)}
                  rows={3}
                />
              ) : (
                <p className="text-gray-900 whitespace-pre-wrap">
                  {lead.requirements || 'No requirements specified'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              {editing ? (
                <Textarea
                  value={updateData.notes || lead.notes || ''}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                  rows={3}
                />
              ) : (
                <p className="text-gray-900 whitespace-pre-wrap">
                  {lead.notes || 'No notes'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium">Created</span>
                <span className="text-sm text-gray-600">{formatDateTime(lead.created_at)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium">Last Updated</span>
                <span className="text-sm text-gray-600">{formatDateTime(lead.updated_at)}</span>
              </div>
              {lead.last_contacted && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Last Contacted</span>
                  <span className="text-sm text-gray-600">{formatDateTime(lead.last_contacted)}</span>
                </div>
              )}
              {lead.next_followup && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium">Next Follow-up</span>
                  <span className="text-sm text-orange-600">{formatDateTime(lead.next_followup)}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
