import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { SimpleSelect } from '../ui/SimpleSelect';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Loading } from '../ui/Loading';
import { leadService } from '../../services/leadService';
import { LEAD_STATUS_CONFIG, LEAD_STAGE_CONFIG } from '../../types/lead';
import type { Lead, LeadFilters, LeadStatus, LeadStage } from '../../types/lead';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Target, 
  Search, 
  Filter,
  Phone,
  Mail,
  MapPin,
  DollarSign
} from 'lucide-react';

interface LeadDashboardProps {
  onLeadSelect?: (lead: Lead) => void;
}

export const LeadDashboard: React.FC<LeadDashboardProps> = ({
  onLeadSelect,
}) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    byStatus: {} as Record<string, number>,
    byStage: {} as Record<string, number>,
    thisMonth: 0,
    conversionRate: 0,
  });
  const [filters, setFilters] = useState<LeadFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadLeads();
    loadStats();
  }, [filters, currentPage]);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const response = await leadService.getLeads(
        { ...filters, search: searchTerm },
        currentPage,
        20
      );
      setLeads(response.leads);
      setTotalPages(Math.ceil(response.total / 20));
    } catch (error) {
      console.error('Failed to load leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await leadService.getLeadStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleFilterChange = (key: keyof LeadFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadLeads();
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && leads.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="lg" text="Loading leads..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{stats.thisMonth}</p>
              </div>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.conversionRate.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Won Leads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.byStatus.won || 0}</p>
              </div>
              <Target className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Lead Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <SimpleSelect
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
              >
                <option value="">All Statuses</option>
                {Object.entries(LEAD_STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </SimpleSelect>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
              <SimpleSelect
                value={filters.stage || ''}
                onChange={(e) => handleFilterChange('stage', e.target.value || undefined)}
              >
                <option value="">All Stages</option>
                {Object.entries(LEAD_STAGE_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </SimpleSelect>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <Input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => handleFilterChange('date_from', e.target.value || undefined)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <Input
                type="date"
                value={filters.date_to || ''}
                onChange={(e) => handleFilterChange('date_to', e.target.value || undefined)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search leads by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button variant="outline" onClick={handleSearch}>
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loading text="Loading leads..." />
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
              <p className="text-gray-600">Browse projects to create leads for your clients.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => onLeadSelect?.(lead)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {lead.first_name} {lead.last_name}
                        </h3>
                        {getStatusBadge(lead.status)}
                        {getStageBadge(lead.stage)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {lead.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {lead.phone}
                          </div>
                        )}
                        {lead.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {lead.email}
                          </div>
                        )}
                        {lead.preferred_location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {lead.preferred_location}
                          </div>
                        )}
                        {(lead.budget_min || lead.budget_max) && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {lead.budget_min && lead.budget_max
                              ? `${formatCurrency(lead.budget_min)} - ${formatCurrency(lead.budget_max)}`
                              : lead.budget_min
                              ? `From ${formatCurrency(lead.budget_min)}`
                              : `Up to ${formatCurrency(lead.budget_max!)}`
                            }
                          </div>
                        )}
                      </div>

                      {lead.requirements && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {lead.requirements}
                        </p>
                      )}
                    </div>

                    <div className="text-right text-sm text-gray-500">
                      <p>Created {formatDate(lead.created_at)}</p>
                      {lead.next_followup && (
                        <p className="text-orange-600">
                          Follow-up: {formatDate(lead.next_followup)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
