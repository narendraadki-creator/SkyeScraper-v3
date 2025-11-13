import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Loading } from '../components/ui/Loading';
import { adminService } from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';
import type { AdminDashboardStats, SystemAnalytics } from '../types/admin';
import {
  Users,
  Building,
  Target,
  BarChart3,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
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
    loadDashboardData();
  }, [role, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, analyticsData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getSystemAnalytics()
      ]);
      setStats(statsData);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
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
        <Loading size="lg" text="Loading admin dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadDashboardData}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    trend?: { value: number; isPositive: boolean };
  }> = ({ title, value, icon, color, trend }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && (
              <div className="flex items-center mt-1">
                <TrendingUp className={`w-4 h-4 mr-1 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`} />
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">System overview and management</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/organizations')}
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Organizations
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/admin/projects')}
              >
                <Building className="w-4 h-4 mr-2" />
                Project Oversight
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/admin/leads')}
              >
                <Target className="w-4 h-4 mr-2" />
                Lead Monitoring
              </Button>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-green-800">Uptime</p>
                    <p className="text-2xl font-bold text-green-900">{stats?.system_health.uptime}%</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-blue-800">Response Time</p>
                    <p className="text-2xl font-bold text-blue-900">{stats?.system_health.response_time}ms</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Error Rate</p>
                    <p className="text-2xl font-bold text-yellow-900">{stats?.system_health.error_rate}%</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Organizations"
            value={stats?.total_organizations || 0}
            icon={<Users className="w-6 h-6 text-white" />}
            color="bg-blue-500"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Total Projects"
            value={stats?.total_projects || 0}
            icon={<Building className="w-6 h-6 text-white" />}
            color="bg-green-500"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Total Leads"
            value={stats?.total_leads || 0}
            icon={<Target className="w-6 h-6 text-white" />}
            color="bg-purple-500"
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard
            title="Total Units"
            value={stats?.total_units || 0}
            icon={<BarChart3 className="w-6 h-6 text-white" />}
            color="bg-orange-500"
            trend={{ value: 5, isPositive: true }}
          />
        </div>

        {/* Detailed Analytics */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Organizations Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Organizations Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Developers</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-blue-200 text-blue-700">
                        {analytics.organizations.developers}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Agents</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-green-200 text-green-700">
                        {analytics.organizations.agents}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-green-200 text-green-700">
                        {analytics.organizations.active}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-yellow-200 text-yellow-700">
                        {analytics.organizations.pending}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Suspended</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-red-200 text-red-700">
                        {analytics.organizations.suspended}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Projects Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Projects Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Published</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-green-200 text-green-700">
                        {analytics.projects.published}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Draft</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-yellow-200 text-yellow-700">
                        {analytics.projects.draft}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Manual Creation</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-blue-200 text-blue-700">
                        {analytics.projects.by_creation_method.manual}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">AI Assisted</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-purple-200 text-purple-700">
                        {analytics.projects.by_creation_method.ai_assisted}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Admin Created</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-red-200 text-red-700">
                        {analytics.projects.by_creation_method.admin}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lead Performance */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Lead Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Leads</span>
                    <span className="font-semibold">{analytics.leads.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Converted</span>
                    <span className="font-semibold text-green-600">{analytics.leads.converted}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Conversion Rate</span>
                    <span className="font-semibold text-blue-600">{analytics.leads.conversion_rate.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Top Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.performance.top_projects.slice(0, 5).map((project, index) => (
                    <div key={project.project_id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <span className="text-sm text-gray-900 truncate">{project.project_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {project.leads_count} leads
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/admin/organizations')}
              >
                <Users className="w-6 h-6" />
                <span className="text-sm">Manage Organizations</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/admin/projects')}
              >
                <Building className="w-6 h-6" />
                <span className="text-sm">Project Oversight</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/admin/leads')}
              >
                <Target className="w-6 h-6" />
                <span className="text-sm">Lead Monitoring</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => navigate('/admin/analytics')}
              >
                <BarChart3 className="w-6 h-6" />
                <span className="text-sm">System Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
