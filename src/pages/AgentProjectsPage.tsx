import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { SimpleSelect } from '../components/ui/SimpleSelect';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Loading } from '../components/ui/Loading';
import { projectService } from '../services/projectService';
import type { Project } from '../types/project';
import { 
  Search, 
  Filter, 
  MapPin, 
  Building, 
  DollarSign, 
  Calendar,
  Users,
  Plus,
  Eye,
  Star,
  TrendingUp
} from 'lucide-react';

export const AgentProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    project_type: '',
    price_range: '',
    developer: '',
  });
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadProjects();
  }, [filters, sortBy]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      // For agents, we need to get all published projects from all developers
      // This would typically be a different endpoint or service method
      const allProjects = await projectService.listProjects({ status: 'published' });
      setProjects(allProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Filter projects based on search term
    // This would typically be handled by the backend
    loadProjects();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    // Sort projects based on selected criteria
    const sortedProjects = [...projects].sort((a, b) => {
      switch (value) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'price_low':
          return (a.starting_price || 0) - (b.starting_price || 0);
        case 'price_high':
          return (b.starting_price || 0) - (a.starting_price || 0);
        case 'popularity':
          return (b.views_count || 0) - (a.views_count || 0);
        default:
          return 0;
      }
    });
    setProjects(sortedProjects);
  };

  const handleCreateLead = (project: Project) => {
    navigate(`/leads/create/${project.id}`);
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

  const getProjectTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Residential': 'blue',
      'Commercial': 'green',
      'Mixed Use': 'purple',
      'Villa': 'orange',
      'Apartment': 'blue',
    };
    return colors[type] || 'gray';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="lg" text="Loading projects..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Projects</h1>
          <p className="text-gray-600">Discover and explore projects from developers across the UAE</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <SimpleSelect
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                >
                  <option value="">All Locations</option>
                  <option value="dubai">Dubai</option>
                  <option value="abu_dhabi">Abu Dhabi</option>
                  <option value="sharjah">Sharjah</option>
                  <option value="ajman">Ajman</option>
                  <option value="ras_al_khaimah">Ras Al Khaimah</option>
                </SimpleSelect>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                <SimpleSelect
                  value={filters.project_type}
                  onChange={(e) => handleFilterChange('project_type', e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Mixed Use">Mixed Use</option>
                  <option value="Villa">Villa</option>
                  <option value="Apartment">Apartment</option>
                </SimpleSelect>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                <SimpleSelect
                  value={filters.price_range}
                  onChange={(e) => handleFilterChange('price_range', e.target.value)}
                >
                  <option value="">All Prices</option>
                  <option value="under_500k">Under 500K AED</option>
                  <option value="500k_1m">500K - 1M AED</option>
                  <option value="1m_2m">1M - 2M AED</option>
                  <option value="2m_5m">2M - 5M AED</option>
                  <option value="over_5m">Over 5M AED</option>
                </SimpleSelect>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <SimpleSelect
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="popularity">Most Popular</option>
                </SimpleSelect>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Search projects by name, location, or developer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or check back later.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge 
                      variant="outline" 
                      className={`border-${getProjectTypeColor(project.project_type || '')}-200 text-${getProjectTypeColor(project.project_type || '')}-700`}
                    >
                      {project.project_type || 'Residential'}
                    </Badge>
                    {project.is_featured && (
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{project.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {project.location}
                  </div>

                  {project.developer_name && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building className="w-4 h-4" />
                      {project.developer_name}
                    </div>
                  )}

                  {project.starting_price && (
                    <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                      <DollarSign className="w-4 h-4" />
                      From {formatCurrency(project.starting_price)}
                    </div>
                  )}

                  {project.completion_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      Completion: {formatDate(project.completion_date)}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {project.views_count || 0} views
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {project.leads_count || 0} leads
                    </div>
                  </div>

                  {project.description && (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {project.description}
                    </p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleCreateLead(project)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Create Lead
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
