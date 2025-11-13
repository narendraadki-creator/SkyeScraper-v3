import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Loading } from '../components/ui/Loading';
import { adminService } from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';
import type { SystemAnalytics } from '../types/admin';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Building,
  Target,
  Activity,
  ArrowLeft,
  AlertTriangle,
  Clock,
  Award,
  UserCheck,
  Eye
} from 'lucide-react';

export const AdminAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    loadAnalytics();
  }, [role, navigate]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await adminService.getSystemAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    trend?: { value: number; isPositive: boolean };
    subtitle?: string;
  }> = ({ title, value, icon, color, trend, subtitle }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center mt-1">
                {trend.isPositive ? (
                  <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1 text-red-500" />
                )}
                <span className={`text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ProgressBar: React.FC<{
    label: string;
    value: number;
    total: number;
    color: string;
  }> = ({ label, value, total, color }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{label}</span>
          <span className="font-medium">{value} ({percentage.toFixed(1)}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${color}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
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
        <Loading size="lg" text="Loading analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Analytics</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadAnalytics}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
            <p className="text-gray-600">Analytics data is not available at the moment.</p>
          </CardContent>
        </Card>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">System Analytics</h1>
              <p className="text-gray-600">Comprehensive system performance and usage analytics</p>
            </div>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Organizations"
            value={analytics.organizations.total}
            icon={<Users className="w-6 h-6 text-white" />}
            color="bg-blue-500"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Total Projects"
            value={analytics.projects.total}
            icon={<Building className="w-6 h-6 text-white" />}
            color="bg-green-500"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Total Leads"
            value={analytics.leads.total}
            icon={<Target className="w-6 h-6 text-white" />}
            color="bg-purple-500"
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard
            title="Conversion Rate"
            value={`${analytics.leads.conversion_rate.toFixed(1)}%`}
            icon={<TrendingUp className="w-6 h-6 text-white" />}
            color="bg-orange-500"
            trend={{ value: 5, isPositive: true }}
          />
        </div>

        {/* Organization Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Organization Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ProgressBar
                  label="Developers"
                  value={analytics.organizations.developers}
                  total={analytics.organizations.total}
                  color="bg-blue-500"
                />
                <ProgressBar
                  label="Agents"
                  value={analytics.organizations.agents}
                  total={analytics.organizations.total}
                  color="bg-green-500"
                />
                <ProgressBar
                  label="Active Organizations"
                  value={analytics.organizations.active}
                  total={analytics.organizations.total}
                  color="bg-green-500"
                />
                <ProgressBar
                  label="Pending Organizations"
                  value={analytics.organizations.pending}
                  total={analytics.organizations.total}
                  color="bg-yellow-500"
                />
                <ProgressBar
                  label="Suspended Organizations"
                  value={analytics.organizations.suspended}
                  total={analytics.organizations.total}
                  color="bg-red-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Project Creation Methods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ProgressBar
                  label="Manual Creation"
                  value={analytics.projects.by_creation_method.manual}
                  total={analytics.projects.total}
                  color="bg-blue-500"
                />
                <ProgressBar
                  label="AI Assisted"
                  value={analytics.projects.by_creation_method.ai_assisted}
                  total={analytics.projects.total}
                  color="bg-purple-500"
                />
                <ProgressBar
                  label="Admin Created"
                  value={analytics.projects.by_creation_method.admin}
                  total={analytics.projects.total}
                  color="bg-red-500"
                />
                <ProgressBar
                  label="Published Projects"
                  value={analytics.projects.published}
                  total={analytics.projects.total}
                  color="bg-green-500"
                />
                <ProgressBar
                  label="Draft Projects"
                  value={analytics.projects.draft}
                  total={analytics.projects.total}
                  color="bg-yellow-500"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lead Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Lead Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ProgressBar
                  label="New Leads"
                  value={analytics.leads.by_status.new}
                  total={analytics.leads.total}
                  color="bg-blue-500"
                />
                <ProgressBar
                  label="Contacted"
                  value={analytics.leads.by_status.contacted}
                  total={analytics.leads.total}
                  color="bg-yellow-500"
                />
                <ProgressBar
                  label="Qualified"
                  value={analytics.leads.by_status.qualified}
                  total={analytics.leads.total}
                  color="bg-green-500"
                />
                <ProgressBar
                  label="Proposal"
                  value={analytics.leads.by_status.proposal}
                  total={analytics.leads.total}
                  color="bg-purple-500"
                />
                <ProgressBar
                  label="Negotiation"
                  value={analytics.leads.by_status.negotiation}
                  total={analytics.leads.total}
                  color="bg-orange-500"
                />
                <ProgressBar
                  label="Closed Won"
                  value={analytics.leads.by_status.closed_won}
                  total={analytics.leads.total}
                  color="bg-green-600"
                />
                <ProgressBar
                  label="Closed Lost"
                  value={analytics.leads.by_status.closed_lost}
                  total={analytics.leads.total}
                  color="bg-red-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-blue-800">Average Response Time</p>
                    <p className="text-2xl font-bold text-blue-900">{analytics.performance.avg_response_time}h</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-green-800">Conversion Rate</p>
                    <p className="text-2xl font-bold text-green-900">{analytics.leads.conversion_rate.toFixed(1)}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-purple-800">Total Units</p>
                    <p className="text-2xl font-bold text-purple-900">{analytics.units.total.toLocaleString()}</p>
                  </div>
                  <Building className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Top Performing Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.performance.top_performing_agents.length > 0 ? (
                  analytics.performance.top_performing_agents.map((agent, index) => (
                    <div key={agent.agent_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{agent.agent_name}</p>
                          <p className="text-sm text-gray-500">{agent.leads_count} leads</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{agent.conversion_rate.toFixed(1)}%</p>
                        <p className="text-sm text-gray-500">conversion</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <UserCheck className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No agent performance data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Top Projects by Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.performance.top_projects.length > 0 ? (
                  analytics.performance.top_projects.map((project, index) => (
                    <div key={project.project_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 truncate">{project.project_name}</p>
                          <p className="text-sm text-gray-500">{project.views_count} views</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-600">{project.leads_count}</p>
                        <p className="text-sm text-gray-500">leads</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Building className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No project engagement data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Unit Analytics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Unit Inventory Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{analytics.units.total.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Total Units</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{analytics.units.available.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{analytics.units.sold.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Sold</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{analytics.units.held.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Held</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
