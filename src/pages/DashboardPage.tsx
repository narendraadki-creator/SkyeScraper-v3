import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
// UI card imports kept for future use; remove if not needed later
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Plus, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { projectService } from '../services/projectService';
import type { Project } from '../types/project';

const DashboardContent: React.FC = () => {
  const navigate = useNavigate();
  const { organizationId, role } = useAuth();
  const [developerName, setDeveloperName] = React.useState<string>('Developer');
  const [developerLogoUrl, setDeveloperLogoUrl] = React.useState<string | null>(null);
  const [primaryLocation, setPrimaryLocation] = React.useState<string | null>(null);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = React.useState<boolean>(true);
  const [projectsError, setProjectsError] = React.useState<string | null>(null);
  const [sortBy, setSortBy] = React.useState<'price' | 'possession' | 'popularity'>('popularity');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  // Redirect users to role-specific dashboards
  React.useEffect(() => {
    if (role === 'admin') {
      navigate('/admin', { replace: true });
    } else if (role === 'developer' && window.location.pathname === '/dashboard') {
      // Redirect developers from old /dashboard URL to new /developer URL
      navigate('/developer', { replace: true });
    }
    // Note: No redirect for /developer route to avoid interfering with mobile routes
  }, [role, navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  React.useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        // Organization details
        if (organizationId) {
          const { data: org } = await supabase
            .from('organizations')
            .select('name, logo_url')
            .eq('id', organizationId)
            .single();
          if (isMounted && org) {
            setDeveloperName(org.name || 'Developer');
            setDeveloperLogoUrl(org.logo_url || null);
          }
        }

        // Projects for current role/org
        setProjectsLoading(true);
        const data = await projectService.listProjects();
        if (!isMounted) return;
        setProjects(data);

        // Compute primary location
        const counts: Record<string, number> = {};
        data.forEach(p => { if (p.location) counts[p.location] = (counts[p.location] || 0) + 1; });
        const loc = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || null;
        setPrimaryLocation(loc);
      } catch (e: any) {
        if (isMounted) setProjectsError(e?.message || 'Failed to load projects');
      } finally {
        if (isMounted) setProjectsLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [organizationId]);

  const sortedProjects = React.useMemo(() => {
    const copy = [...projects];
    if (sortBy === 'price') {
      return copy.sort((a, b) => (a.starting_price || 0) - (b.starting_price || 0));
    }
    if (sortBy === 'possession') {
      return copy.sort((x, y) => ((
        x.completion_date ? new Date(x.completion_date).getTime() : Number.MAX_SAFE_INTEGER
      ) - (
        y.completion_date ? new Date(y.completion_date).getTime() : Number.MAX_SAFE_INTEGER
      )));
    }
    // popularity default (views_count desc)
    return copy.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
  }, [projects, sortBy]);

  const availabilityLabel = (p: Project) => {
    const units = p.total_units || 0;
    const leads = p.leads_count || 0;
    if (units === 0) return 'Sold Out';
    if (leads >= units * 0.8) return 'Few Units Left';
    return 'Available';
  };

  return (
    <div className="page-wrapper">
      {/* Website-style Page Header */}
      <section className="page-header">
        <div className="container-narrow">
          {developerLogoUrl && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-xs)' }}>
              <img src={developerLogoUrl} alt={developerName} style={{ height: 64, objectFit: 'contain' }} />
            </div>
          )}
          <h1 className="hero-title" style={{ textTransform: 'none' }}>{developerName}</h1>
          <p className="page-subtitle" style={{ marginTop: 'var(--space-2xs)' }}>
            {projects.length} Projects Available{primaryLocation ? ` in ${primaryLocation}` : ''}
          </p>
            </div>
      </section>

      {/* Quick Actions (top) */}
      <section className="filter-section" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
        <div className="container-narrow">
          <div className="filter-bar" style={{ justifyContent: 'space-between' }}>
            <div className="section-title" style={{ fontSize: 'var(--text-heading-3)', fontWeight: 600 }}>Quick Actions</div>
            <div className="flex items-center" style={{ gap: 'var(--space-xs)' }}>
              {role !== 'agent' && (
                <button
                  className="btn-secondary"
                  onClick={() => navigate('/projects/create')}
                >
                  <Plus className="w-4 h-4" style={{ marginRight: 8 }} />
                  Create New Project
                </button>
              )}
              {(role === 'developer' || role === 'admin') && (
                <button
                  className="btn-secondary"
                  onClick={() => navigate('/promotions')}
                >
                  Manage Promotions
                </button>
              )}
              <button className="btn-secondary">
                <Users className="w-4 h-4" style={{ marginRight: 8 }} />
                Add Team Member
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Top toolbar */}
      <section className="filter-section">
        <div className="container-narrow">
          <div className="filter-bar">
            <div className="flex items-center gap-2">
              <label style={{ color: 'var(--color-text-muted)' }}>Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-border-subtle)', background: 'var(--color-white)' }}
              >
                <option value="popularity">Popularity</option>
                <option value="price">Price</option>
                <option value="possession">Possession Date</option>
              </select>
              <div className="flex items-center" style={{ marginLeft: 'var(--space-sm)' }}>
                <button className="btn-ghost" onClick={() => setViewMode('grid')} aria-pressed={viewMode==='grid'}>Grid</button>
                <button className="btn-ghost" onClick={() => setViewMode('list')} aria-pressed={viewMode==='list'}>List</button>
                  </div>
                </div>
            <div className="flex items-center gap-3">
              <Badge variant="default">{role || 'User'}</Badge>
              <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
          </div>
                    </div>
                  </div>
      </section>

      {/* Main Content */}
      <main className="section-content">
        <div className="container-narrow">
          {/* Properties list */}
          <div className="mb-10">
            {projectsLoading && <div>Loading projects...</div>}
            {projectsError && <div style={{ color: 'red' }}>{projectsError}</div>}
            {!projectsLoading && !projectsError && (
              <div className={viewMode === 'grid' ? 'grid grid-3' : 'grid grid-2'}>
                {sortedProjects.map((p) => (
                  <div key={p.id} className="card-professional" style={{ height: '100%' }}>
                    <div className="card-image-container">
                      <img className="card-image" alt={p.name} src={p.featured_image || '/placeholder-project.jpg'} />
                      <div className="card-badge">{availabilityLabel(p)}</div>
                    </div>
                    <div className="card-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <h3 className="card-title" style={{ minHeight: 56 }}>
                        {p.name}
                      </h3>
                      <p className="card-subtitle" style={{ minHeight: 22 }}>{p.project_type || 'Project'}</p>
                      <div className="card-details" style={{ minHeight: 112 }}>
                        <div className="card-detail-item">
                          <div className="card-detail-label">Location</div>
                          <div className="card-detail-value">{p.location}</div>
                  </div>
                        <div className="card-detail-item">
                          <div className="card-detail-label">Starting</div>
                          <div className="card-detail-value">{p.starting_price ? `${p.starting_price.toLocaleString()} AED` : 'On Request'}</div>
                  </div>
                        <div className="card-detail-item">
                          <div className="card-detail-label">Possession</div>
                          <div className="card-detail-value">{p.completion_date ? new Date(p.completion_date).toLocaleDateString() : '—'}</div>
                    </div>
                  </div>
                      <div style={{ display: 'flex', gap: 12, marginTop: 'auto' }}>
                        <button className="btn-primary card-cta" onClick={() => navigate(`/projects/${p.id}`)} style={{ flex: 1, minWidth: 0 }}>
                          View Details
                        </button>
                        {(role === 'developer' || role === 'admin') && (
                          <button className="btn-secondary card-cta" onClick={() => navigate(`/promotions/create?projectId=${p.id}`)} style={{ flex: 1, minWidth: 0 }}>
                            Create Promotion
                          </button>
                        )}
                    </div>
                  </div>
                </div>
                ))}
              </div>
            )}
          </div>

          {/* Removed legacy dashboard sections (Welcome, Stats, Activity, Debug) */}
        </div>
      </main>
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
};
