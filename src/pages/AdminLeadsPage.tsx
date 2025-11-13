import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SimpleSelect } from '../components/ui/SimpleSelect';
import { Badge } from '../components/ui/Badge';
import { Loading } from '../components/ui/Loading';
import { LeadDetailView } from '../components/leads/LeadDetailView';
import { adminService } from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';
import type { AdminLead, AdminLeadFilters } from '../types/admin';
import type { Lead, LeadStatus, LeadStage } from '../types/lead';
import {
  Target,
  Search,
  Filter,
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  Edit,
  ArrowLeft,
  MoreVertical,
  AlertTriangle,
  DollarSign,
  Clock,
  Eye
} from 'lucide-react';

export const AdminLeadsPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AdminLeadFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

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
    loadLeads();
  }, [role, navigate, filters]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllLeads(filters);
      setLeads(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads');
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

  const handleFilterChange = (key: keyof AdminLeadFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const handleLeadSelect = (lead: AdminLead) => {
    // Convert AdminLead to Lead type for LeadDetailView
    const leadForDetail: Lead = {
      id: lead.id,
      organization_id: lead.organization_id,
      project_id: lead.project_id,
      unit_id: undefined, // AdminLead doesn't have unit_id
      first_name: lead.first_name,
      last_name: lead.last_name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      status: lead.status as LeadStatus,
      stage: 'inquiry' as LeadStage, // Default stage
      budget_min: undefined,
      budget_max: undefined,
      preferred_unit_types: undefined,
      preferred_location: undefined,
      requirements: undefined,
      assigned_to: lead.agent_id,
      notes: undefined,
      next_followup: undefined,
      last_contacted: lead.last_contact_date,
      score: undefined,
      created_by: '', // AdminLead doesn't have created_by
      created_at: lead.created_at,
      updated_at: lead.updated_at
    };
    setSelectedLead(leadForDetail);
  };

  const handleLeadUpdate = (updatedLead: Lead) => {
    setSelectedLead(updatedLead);
    // Refresh the leads list
    loadLeads();
  };

  const handleCloseDetail = () => {
    setSelectedLead(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'blue';
      case 'contacted': return 'yellow';
      case 'qualified': return 'green';
      case 'proposal': return 'purple';
      case 'negotiation': return 'orange';
      case 'closed_won': return 'green';
      case 'closed_lost': return 'red';
      default: return 'gray';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'website': return 'blue';
      case 'referral': return 'green';
      case 'social_media': return 'purple';
      case 'advertisement': return 'orange';
      case 'direct': return 'gray';
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

    return new Date(dateString).toLocaleDateString('en-AE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
        <Loading size="lg" text="Loading leads..." />
      </div>
    );
  }

  // Show lead detail view if a lead is selected
  if (selectedLead) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LeadDetailView
            leadId={selectedLead.id}
            onClose={handleCloseDetail}
            onUpdate={handleLeadUpdate}
          />
        </div>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Lead Monitoring</h1>
              <p className="text-gray-600">Monitor all leads across the system</p>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lead Status</label>
                <SimpleSelect
                  value={filters.lead_status || ''}
                  onChange={(e) => handleFilterChange('lead_status', e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="closed_won">Closed Won</option>
                  <option value="closed_lost">Closed Lost</option>
                </SimpleSelect>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <SimpleSelect
                  value={filters.source || ''}
                  onChange={(e) => handleFilterChange('source', e.target.value)}
                >
                  <option value="">All Sources</option>
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                  <option value="social_media">Social Media</option>
                  <option value="advertisement">Advertisement</option>
                  <option value="direct">Direct</option>
                </SimpleSelect>
              </div>

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

        {/* Leads List */}
        {leads.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
              <p className="text-gray-600">Try adjusting your search criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => (
              <Card key={lead.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-2 flex-wrap">
                      <Badge 
                        variant="outline" 
                        className={`border-${getStatusColor(lead.status)}-200 text-${getStatusColor(lead.status)}-700`}
                      >
                        {lead.status.replace('_', ' ')}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`border-${getSourceColor(lead.source)}-200 text-${getSourceColor(lead.source)}-700`}
                      >
                        {lead.source.replace('_', ' ')}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Lead Information */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Lead Information
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Name:</span>
                          <span>{lead.first_name} {lead.last_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{lead.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{lead.phone}</span>
                        </div>
                        {(lead.budget_min || lead.budget_max) && (
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span>
                              {lead.budget_min && formatCurrency(lead.budget_min)}
                              {lead.budget_min && lead.budget_max && ' - '}
                              {lead.budget_max && formatCurrency(lead.budget_max)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Project Information */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Project Information
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Project:</span>
                          <span className="truncate">{lead.project_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Organization:</span>
                          <span className="truncate">{lead.organization_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Agent:</span>
                          <span>{lead.agent_name}</span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Information */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Timeline
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>Created: {formatDateTime(lead.created_at)}</span>
                        </div>
                        {lead.last_contact_date && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>Last Contact: {formatDateTime(lead.last_contact_date)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>Updated: {formatDateTime(lead.updated_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleLeadSelect(lead)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleLeadSelect(lead)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit Lead
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
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{leads.length}</div>
                <div className="text-sm text-gray-500">Total Leads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {leads.filter(l => l.status === 'new').length}
                </div>
                <div className="text-sm text-gray-500">New</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {leads.filter(l => l.status === 'contacted').length}
                </div>
                <div className="text-sm text-gray-500">Contacted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {leads.filter(l => l.status === 'qualified').length}
                </div>
                <div className="text-sm text-gray-500">Qualified</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {leads.filter(l => l.status === 'closed_won').length}
                </div>
                <div className="text-sm text-gray-500">Won</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {leads.filter(l => l.status === 'closed_lost').length}
                </div>
                <div className="text-sm text-gray-500">Lost</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
