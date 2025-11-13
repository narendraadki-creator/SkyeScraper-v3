import React from 'react';
import { useNavigate } from 'react-router-dom';
import { promotionService } from '../services/promotionService';
import { projectService } from '../services/projectService';
import type { Promotion } from '../types/promotion';

export const DeveloperPromotionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [promotions, setPromotions] = React.useState<Promotion[]>([]);
  const [status, setStatus] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [projectNameById, setProjectNameById] = React.useState<Record<string, string>>({});
  // No popups for publish/delete per requirement

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [data, projects] = await Promise.all([
        promotionService.listPromotions({ status: status || undefined }),
        projectService.listProjects()
      ]);
      setPromotions(data);
      const map: Record<string, string> = {};
      (projects || []).forEach((proj: any) => { if (proj?.id) map[proj.id] = proj.name; });
      setProjectNameById(map);
    } catch (e: any) {
      setError(e?.message || 'Failed to load promotions');
    } finally {
      setLoading(false);
    }
  }, [status]);

  React.useEffect(() => { load(); }, [load]);

  const publish = async (id: string) => {
    await promotionService.updatePromotion(id, { status: 'active' });
    await load();
  };

  const pause = async (id: string) => {
    await promotionService.updatePromotion(id, { status: 'paused' });
    await load();
  };

  const complete = async (id: string) => {
    await promotionService.updatePromotion(id, { status: 'completed' });
    await load();
  };

  const remove = async (id: string) => {
    await promotionService.deletePromotion(id);
    await load();
  };

  return (
    <div className="page-wrapper">
      <section className="page-header">
        <div className="container-narrow">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button className="btn-ghost" onClick={() => navigate('/developer')}>Back</button>
            <div style={{ flex: 1 }}></div>
          </div>
          <h1 className="page-title">Promotions</h1>
          <p className="page-subtitle">Create, schedule, and manage your campaigns</p>
        </div>
      </section>
      <section className="filter-section">
        <div className="container-narrow">
          <div className="filter-bar">
            <div className="flex items-center gap-2">
              <label style={{ color: 'var(--color-text-muted)' }}>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-border-subtle)', background: 'var(--color-white)' }}>
                <option value="">All</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div></div>
          </div>
        </div>
      </section>
      <main className="section-content">
        <div className="container-narrow">
          {loading && <div>Loading...</div>}
          {error && <div style={{ color: 'red' }}>{error}</div>}
          {!loading && !error && (
            <div className="grid grid-2">
              {promotions.map((p) => (
                <div
                  key={p.id}
                  className="card-professional"
                  style={{ padding: 'var(--space-sm)', cursor: 'pointer' }}
                  onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                >
                  <div className="section-title" style={{ marginBottom: 8 }}>{p.title}</div>
                  <div className="kv"><span className="kv-label">Project</span><span className="kv-value">{p.project_id ? (projectNameById[p.project_id] || p.project_id) : 'All Projects'}</span></div>
                  <div className="kv"><span className="kv-label">Status</span><span className="kv-value">{p.status}</span></div>
                  <div className="kv"><span className="kv-label">Date</span><span className="kv-value">{p.start_date} → {p.end_date}</span></div>
                  {p.short_message && <div className="kv"><span className="kv-label">Short</span><span className="kv-value">{p.short_message}</span></div>}

                  {expandedId === p.id && (
                    <div style={{ marginTop: 12 }}>
                      {p.description && (
                        <div className="kv" style={{ alignItems: 'flex-start' }}>
                          <span className="kv-label">Description</span>
                          <span className="kv-value">{p.description}</span>
                        </div>
                      )}
                      {p.terms_conditions && (
                        <div className="kv" style={{ alignItems: 'flex-start' }}>
                          <span className="kv-label">Terms</span>
                          <span className="kv-value">{p.terms_conditions}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }} onClick={(e) => e.stopPropagation()}>
                    {p.status === 'draft' && (
                      <button className="btn-primary" onClick={() => publish(p.id)}>Publish</button>
                    )}
                    {p.status === 'active' && (
                      <>
                        <button className="btn-secondary" onClick={() => pause(p.id)}>Pause</button>
                        <button className="btn-secondary" onClick={() => complete(p.id)}>Complete</button>
                      </>
                    )}
                    <button className="btn-secondary" onClick={() => navigate(`/promotions/create?projectId=${p.project_id || ''}`)}>Duplicate</button>
                    <button className="btn-ghost" onClick={() => remove(p.id)}>Delete</button>
                  </div>
                </div>
              ))}
              {promotions.length === 0 && (
                <div className="card-professional" style={{ padding: 'var(--space-sm)' }}>
                  No promotions found.
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DeveloperPromotionsPage;


