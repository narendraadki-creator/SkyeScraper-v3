import React from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { promotionService } from '../services/promotionService';
import { projectService } from '../services/projectService';

export const CreatePromotionPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation() as any;
  const projectId = searchParams.get('projectId');

  const [title, setTitle] = React.useState('');
  const [shortMessage, setShortMessage] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [discountPercent, setDiscountPercent] = React.useState<number | ''>('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [schedule, setSchedule] = React.useState(false);
  const [sendAt, setSendAt] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [online, setOnline] = React.useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [projectName, setProjectName] = React.useState<string | null>(location?.state?.projectName || null);

  React.useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load project name if projectId provided
  React.useEffect(() => {
    if (!projectId || projectName) return;
    (async () => {
      try {
        if (!online) return; // avoid network on offline
        const project = await projectService.getProject(projectId);
        if (project && project.name) setProjectName(project.name);
      } catch {
        // ignore
      }
    })();
  }, [projectId, projectName, online]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!online) {
        setError('You are offline. Please check your internet connection and try again.');
        return;
      }
      setSaving(true);
      setError(null);
      await promotionService.createPromotion({
        project_id: projectId,
        title,
        short_message: shortMessage || undefined,
        description: description || undefined,
        discount_percentage: typeof discountPercent === 'number' ? discountPercent : undefined,
        start_date: startDate,
        end_date: endDate,
        send_at: schedule ? sendAt : null,
        is_scheduled: schedule,
      });
      // Success: go back to a relevant page
      navigate('/developer');
    } catch (err: any) {
      setError(err.message || 'Failed to create promotion');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-wrapper">
      <section className="page-header">
        <div className="container-narrow">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button className="btn-ghost" onClick={() => navigate('/developer')}>
              Back
            </button>
            <div style={{ flex: 1 }}></div>
          </div>
          <h1 className="page-title">Create Promotion</h1>
          <p className="page-subtitle">{projectId ? `Project: ${projectName || 'Loading...'}` : 'Share an offer with agents'}</p>
        </div>
      </section>
      <main className="section-content">
        <div className="container-narrow">
          {!online && (
            <div className="card-professional" style={{ padding: '12px', marginBottom: 12, borderLeft: '4px solid #CBA135' }}>
              You are offline. Saving promotions requires internet connectivity.
            </div>
          )}
          <form onSubmit={handleSubmit} className="card-professional" style={{ padding: 'var(--space-sm)' }}>
            {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}

            <div style={{ display: 'grid', gap: 16 }}>
              <label>
                <div className="kv-label">Title</div>
                <input value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: '100%', padding: 10, border: '1px solid var(--color-border-subtle)', borderRadius: 8 }} />
              </label>
              <label>
                <div className="kv-label">Short Message</div>
                <input value={shortMessage} onChange={(e) => setShortMessage(e.target.value)} maxLength={160} placeholder="For notifications (<=160 chars)" style={{ width: '100%', padding: 10, border: '1px solid var(--color-border-subtle)', borderRadius: 8 }} />
              </label>
              <label>
                <div className="kv-label">Description</div>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} style={{ width: '100%', padding: 10, border: '1px solid var(--color-border-subtle)', borderRadius: 8 }} />
              </label>
              <label>
                <div className="kv-label">Discount %</div>
                <input type="number" min={0} max={100} value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value === '' ? '' : Number(e.target.value))} style={{ width: '100%', padding: 10, border: '1px solid var(--color-border-subtle)', borderRadius: 8 }} />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <label>
                  <div className="kv-label">Start Date</div>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required style={{ width: '100%', padding: 10, border: '1px solid var(--color-border-subtle)', borderRadius: 8 }} />
                </label>
                <label>
                  <div className="kv-label">End Date</div>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required style={{ width: '100%', padding: 10, border: '1px solid var(--color-border-subtle)', borderRadius: 8 }} />
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input id="schedule" type="checkbox" checked={schedule} onChange={(e) => setSchedule(e.target.checked)} />
                <label htmlFor="schedule">Schedule send</label>
                {schedule && (
                  <input type="datetime-local" value={sendAt} onChange={(e) => setSendAt(e.target.value)} style={{ padding: 10, border: '1px solid var(--color-border-subtle)', borderRadius: 8 }} />
                )}
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving || !online}>{saving ? 'Saving...' : 'Create Promotion'}</button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreatePromotionPage;


