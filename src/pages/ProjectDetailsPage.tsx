// Project details page - shows complete project information

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { fileService } from '../services/fileService';
import { Badge } from '../components/ui/Badge';
import { Loading } from '../components/ui/Loading';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { projectService } from '../services/projectService';
import { useAuth } from '../contexts/AuthContext';
import { unitService } from '../services/unitService';
import { FileList } from '../components/files/FileList';
import { ArrowLeft, Edit, Trash2, MapPin, Calendar, Building, Share2, Upload } from 'lucide-react';
import type { Project } from '../types/project';
import type { Unit } from '../types/unit';

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { activeTab?: 'details' | 'floor' | 'location' | 'units' | 'payment' | 'files' } };
  const { role } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'floor' | 'location' | 'units' | 'payment' | 'files'>('details');
  // quick import state not needed; we'll invoke native file picker directly
  const [fileListKey, setFileListKey] = useState(0);
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitsLoading, setUnitsLoading] = useState<boolean>(false);
  const [unitsError, setUnitsError] = useState<string | null>(null);
  const [latestHeaders, setLatestHeaders] = useState<string[] | null>(null);
  // In-app confirm for header mismatch
  const [formatDialog, setFormatDialog] = useState<{ isOpen: boolean; message: string }>(
    { isOpen: false, message: '' }
  );
  const [pendingImport, setPendingImport] = useState<{
    file: File;
    preview: any;
    columnMapping: Record<string, string>;
  } | null>(null);
  
  // Confirmation dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'delete' | 'archive';
  }>({
    isOpen: false,
    type: 'delete',
  });

  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id]);

  // Honor requested tab when navigated with state from other pages (e.g., Edit page "Files" button)
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state?.activeTab]);

  const fetchUnits = async () => {
    if (!id) return;
    try {
      setUnitsLoading(true);
      setUnitsError(null);
      const data = await unitService.getUnits(id);
      setUnits(data);
      // Try to pull display config from latest import (for exact column order)
      const history = await unitService.getImportHistory(id);
      if (history && history.length > 0) {
        const latest = history[0];
        const display = (latest as any)?.column_mapping?.display_config;
        if (display && Array.isArray(display) && display.length > 0) {
          setLatestHeaders(display.map((d: any) => d.source));
        }
      }
    } catch (e: any) {
      setUnitsError(e?.message || 'Failed to load units');
    } finally {
      setUnitsLoading(false);
    }
  };

  // Load units when opening Units tab or when project id changes
  useEffect(() => {
    if (!id) return;
    if (activeTab !== 'units') return;
    fetchUnits();
  }, [id, activeTab]);

  const handleQuickImportUnits = async () => {
    if (!id) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files && target.files[0];
      if (!file) return;
      try {
        setUnitsLoading(true);
        // Upload to storage first (so file shows in Files tab)
        await unitService.uploadImportFile(file, id);
        // Parse the file
        const preview = await unitService.processImportFile(file);
        // Header validation from 2nd import onwards
        const normalize = (arr: string[]) => arr.map(h => h.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[^a-z0-9 _-]/g, ''));
        if (latestHeaders && latestHeaders.length > 0) {
          const oldNorm = normalize(latestHeaders);
          const newNorm = normalize(preview.columns);
          const sameLength = oldNorm.length === newNorm.length;
          const sameOrder = sameLength && oldNorm.every((h, i) => h === newNorm[i]);
          if (!sameOrder) {
            // Build mapping before asking
            const columnMapping: Record<string, string> = {};
            preview.columns.forEach((col: string) => {
              const suggested = (preview as any).suggestedMapping?.[col];
              columnMapping[col] = suggested || `custom_fields.${col}`;
            });
            setUnitsLoading(false);
            setPendingImport({ file, preview, columnMapping });
            setFormatDialog({
              isOpen: true,
              message:
                'The Excel headers differ from the last imported format for this project.\n\n' +
                'If you continue, the existing unit structure will be overwritten to match the new format.'
            });
            return;
          }
        }
        // Build simple mapping using suggested mapping
        const columnMapping: Record<string, string> = {};
        preview.columns.forEach((col: string) => {
          const suggested = (preview as any).suggestedMapping?.[col];
          columnMapping[col] = suggested || `custom_fields.${col}`;
        });
        // Build display config to persist exact header/order
        (preview as any).displayConfig = preview.columns.map((col: string) => ({
          source: col,
          label: col,
          type: 'text'
        }));
        const importOptions = { strategy: 'replace', updateExisting: true, skipErrors: false, validateData: true } as any;
        await unitService.importUnits(id, preview as any, columnMapping, importOptions, null);
        // Also create a project file record so it appears under Files
        try { await fileService.uploadFile(file, id, 'unit_data'); } catch {}
        // Update immediate headers for this session
        setLatestHeaders(preview.columns);
        await fetchUnits();
        setFileListKey(prev => prev + 1); // refresh Files tab
      } catch (err) {
        console.error('Quick import failed:', err);
        setUnitsError(err instanceof Error ? err.message : 'Import failed');
      } finally {
        setUnitsLoading(false);
      }
    };
    input.click();
  };

  // Execute pending import after confirmation
  const confirmHeaderOverwrite = async () => {
    if (!id || !pendingImport) { setFormatDialog({ isOpen: false, message: '' }); return; }
    try {
      setUnitsLoading(true);
      const { file, preview, columnMapping } = pendingImport;
      (preview as any).displayConfig = preview.columns.map((col: string) => ({ source: col, label: col, type: 'text' }));
      const importOptions = { strategy: 'replace', updateExisting: true, skipErrors: false, validateData: true } as any;
      await unitService.importUnits(id, preview as any, columnMapping, importOptions, null);
      try { await fileService.uploadFile(file, id, 'unit_data'); } catch {}
      setLatestHeaders(preview.columns);
      await fetchUnits();
      setFileListKey(prev => prev + 1);
    } catch (err) {
      console.error('Confirmed import failed:', err);
      setUnitsError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setUnitsLoading(false);
      setPendingImport(null);
      setFormatDialog({ isOpen: false, message: '' });
    }
  };

  // no-op

  // Build dynamic table columns from units (standard + custom_fields)
  const dynamicColumns = React.useMemo(() => {
    // Build columns strictly from database-stored custom_fields (native headers)
    // Preserve first-seen order across units
    const orderedKeys: string[] = [];
    const seen: Record<string, boolean> = {};
    units.forEach(u => {
      const cf = (u as any).custom_fields || {};
      Object.keys(cf).forEach(k => {
        if (!seen[k]) { seen[k] = true; orderedKeys.push(k); }
      });
    });

    return { customHeaders: orderedKeys };
  }, [units]);

  const loadProject = async (projectId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await projectService.getProject(projectId);
      
      setProject(result);
    } catch (err) {
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = () => {
    setConfirmDialog({
      isOpen: true,
      type: 'delete',
    });
  };


  const handleArchiveProject = () => {
    setConfirmDialog({
      isOpen: true,
      type: 'archive',
    });
  };

  const handleConfirmAction = async () => {
    if (!project) return;

    try {
      if (confirmDialog.type === 'delete') {
        await projectService.deleteProject(project.id);

        navigate('/projects');
      } else if (confirmDialog.type === 'archive') {
        await projectService.updateProject(project.id, { status: 'archived' } as any);

        // Reload the project to get updated data
        await loadProject(project.id);
      }
      
      // Close dialog
      setConfirmDialog({
        isOpen: false,
        type: 'delete',
      });
    } catch (err) {
      setError(`Failed to ${confirmDialog.type} project`);
    }
  };

  const handleCloseDialog = () => {
    setConfirmDialog({
      isOpen: false,
      type: 'delete',
    });
  };

  // Creation method badge unused in redesigned layout

  // Status badge unused in redesigned layout

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text="Loading project..." />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <div className="text-red-500 mb-4">
              <Trash2 className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Project Not Found
            </h3>
            <p className="text-gray-600 mb-4">
              {error || 'The project you are looking for does not exist.'}
            </p>
            <Button onClick={() => navigate('/projects')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <section className="page-header">
        <div className="container-narrow">
          {/* Hero banner */}
          <div className="hero-banner" style={{ backgroundImage: `url(${project.featured_image || ''})` }}>
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <div className="hero-meta">
                <MapPin className="w-4 h-4" /> {project.location}
                <span className="status-badge" style={{ marginLeft: 12 }}>
                  {project.status === 'published' ? 'Available' : project.status === 'draft' ? 'Coming Soon' : 'Archived'}
                </span>
              </div>
              <h1 className="page-title" style={{ color: '#fff', margin: 0 }}>{project.name}</h1>
            </div>
          </div>

          {/* Stats row under hero */}
          <div className="stats-row">
            <div className="stat-card"><div className="stat-label">Starting Price</div><div className="stat-value">{project.starting_price ? `${project.starting_price.toLocaleString()} AED` : 'On Request'}</div></div>
            <div className="stat-card"><div className="stat-label">Possession</div><div className="stat-value">{project.completion_date ? new Date(project.completion_date).toLocaleDateString() : '—'}</div></div>
            <div className="stat-card"><div className="stat-label">Type</div><div className="stat-value">{project.project_type || '—'}</div></div>
            <div className="stat-card"><div className="stat-label">Bedrooms</div><div className="stat-value">{project.custom_attributes?.bedrooms || '—'}</div></div>
            <div className="stat-card"><div className="stat-label">Status</div><div className="stat-value">{project.status}</div></div>
          </div>

          {/* Utility actions */}
          <div className="flex items-center justify-between" style={{ marginTop: 'var(--space-sm)' }}>
            <Button onClick={() => navigate('/developer', { replace: true })} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
              <div className="flex gap-2">
              <Button onClick={() => navigate(`/projects/${project.id}/edit`)} variant="outline" title="Edit Project Details">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
          </div>
        </div>
      </section>

        {/* Tab Navigation */}
        <div className="container-narrow" style={{ marginTop: 'var(--space-sm)' }}>
          <div className="tabs-modern">
            <button className="tab-pill" aria-selected={activeTab==='details'} onClick={() => setActiveTab('details')}>Details</button>
            <button className="tab-pill" aria-selected={activeTab==='floor'} onClick={() => setActiveTab('floor')}>Floor Plan</button>
            <button className="tab-pill" aria-selected={activeTab==='location'} onClick={() => setActiveTab('location')}>Location</button>
            <button className="tab-pill" aria-selected={activeTab==='units'} onClick={() => setActiveTab('units')}>Units</button>
            <button className="tab-pill" aria-selected={activeTab==='payment'} onClick={() => setActiveTab('payment')}>Payment Plan</button>
            <button className="tab-pill" aria-selected={activeTab==='files'} onClick={() => setActiveTab('files')}>Files</button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div className="container-narrow" style={{ marginTop: 'var(--space-lg)' }}>
                {project.description && (
              <div className="section-card mb-6">
                <div className="section-title">Project Description</div>
                <div className="divider"></div>
                <p className="text-gray-800">{project.description}</p>
                  </div>
                )}
            {project.amenities && project.amenities.length > 0 && (
              <div className="section-card">
                <div className="section-title">Amenities</div>
                <div className="divider"></div>
                <div className="flex flex-wrap gap-2">{project.amenities.map((a, i) => (<Badge key={i} variant="default">{a}</Badge>))}</div>
                  </div>
            )}
            {/* Timeline inside Details */}
            <div className="section-card mt-6">
              <div className="section-title">Timeline</div>
              <div className="divider"></div>
                  <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created</p>
                    <p className="text-gray-900">{new Date(project.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                {project.completion_date && (
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Completion Date</p>
                      <p className="text-gray-900">{new Date(project.completion_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                {project.handover_date && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Handover Date</p>
                      <p className="text-gray-900">{new Date(project.handover_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                {project.published_at && (
                  <div className="flex items-center gap-3">
                    <Share2 className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Published</p>
                      <p className="text-gray-900">{new Date(project.published_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                    </div>
                    </div>
                  </div>
        )}

        {activeTab === 'floor' && (
          <div className="container-narrow" style={{ marginTop: 'var(--space-lg)' }}>
            <div className="section-title">Floor Plans</div>
            {project.floor_plan_urls && project.floor_plan_urls.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {project.floor_plan_urls.map((url, idx) => (
                  <div key={idx} className="section-card"><img src={url} alt={`Floor plan ${idx+1}`} style={{ width: '100%', borderRadius: 8 }} /></div>
                    ))}
                  </div>
            ) : (<p>No floor plans available.</p>)}
          </div>
            )}

        {activeTab === 'location' && (
          <div className="container-narrow" style={{ marginTop: 'var(--space-lg)' }}>
            <div className="section-card mb-6">
              <div className="section-title">Location</div>
              <div className="divider"></div>
              {project.address && (<div className="kv"><div className="kv-label">Address</div><div className="kv-value">{project.address}</div></div>)}
            </div>
            {project.connectivity && project.connectivity.length > 0 && (
              <div className="section-card mb-6">
                <div className="section-title">Connectivity</div>
                <div className="divider"></div>
                <div className="flex flex-wrap gap-2">{project.connectivity.map((c, i) => (<Badge key={i} variant="default">{c}</Badge>))}</div>
              </div>
            )}
            {project.landmarks && project.landmarks.length > 0 && (
              <div className="section-card">
                <div className="section-title">Nearby Landmarks</div>
                <div className="divider"></div>
                <div className="space-y-2">{project.landmarks.map((lm, i) => (<div key={i} className="flex justify-between items-center"><span className="font-medium">{lm.name}</span><span className="text-sm text-gray-600">{lm.distance}</span></div>))}</div>
              </div>
            )}
                  </div>
                )}
                
        {activeTab === 'payment' && (
          <div className="container-narrow" style={{ marginTop: 'var(--space-lg)' }}>
            <div className="section-title">Payment Plans</div>
            {project.payment_plans && project.payment_plans.length > 0 ? (
              <div className="space-y-4">{project.payment_plans.map((plan, idx) => (<div key={idx} className="section-card"><div className="section-title" style={{marginBottom:0}}>{plan.name}</div><div className="divider"></div>{plan.description && (<p className="mb-2 text-gray-700">{plan.description}</p>)}<p className="text-sm text-gray-600">{plan.terms}</p></div>))}</div>
            ) : (<p>No payment plan data.</p>)}
          </div>
        )}

        {activeTab === 'units' && (
          <div className="container-narrow" style={{ marginTop: 'var(--space-lg)' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Availability</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleQuickImportUnits}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Units
                </Button>
              </div>
            </div>
            {unitsLoading && <div>Loading availability...</div>}
            {unitsError && <div style={{ color: 'red' }}>{unitsError}</div>}
            {!unitsLoading && !unitsError && (
              <div className="table-wrap">
                <table className="table-pro">
                  <thead>
                    <tr>
                      {(latestHeaders || dynamicColumns.customHeaders).map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {units.length === 0 && (
                      <tr><td colSpan={(latestHeaders || dynamicColumns.customHeaders).length}>No units found.</td></tr>
                    )}
                    {units.map((u) => {
                      const cf = (u as any).custom_fields || {};
                      return (
                        <tr key={u.id}>
                          {(latestHeaders || dynamicColumns.customHeaders).map(h => (
                            <td key={h}>{cf[h] !== undefined && cf[h] !== null && String(cf[h]).trim() !== '' ? String(cf[h]) : '—'}</td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {formatDialog.isOpen && createPortal(
              <div
                style={{
                  position: 'fixed',
                  left: 0,
                  top: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px',
                  zIndex: 2147483647,
                }}
              >
                <div style={{ background: '#fff', borderRadius: 12, maxWidth: 640, width: '100%', padding: 24 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Header format changed</h3>
                  <p style={{ color: '#374151', whiteSpace: 'pre-line', marginBottom: 16 }}>{formatDialog.message}</p>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <Button variant="outline" onClick={() => { setFormatDialog({ isOpen: false, message: '' }); setPendingImport(null); }}>Cancel</Button>
                    <Button onClick={confirmHeaderOverwrite}>Proceed</Button>
                  </div>
                </div>
              </div>,
              document.body
            )}
          </div>
        )}

        {activeTab === 'files' && (
          <div className="container-narrow" style={{ marginTop: 'var(--space-lg)' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Brochures & Documents</h2>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={() => document.getElementById('pdp-upload-brochure')?.click()}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Brochure
                </Button>
                <Button variant="outline" onClick={() => document.getElementById('pdp-upload-floor')?.click()}>
                  Upload Floor Plan
                </Button>
                <Button variant="outline" onClick={() => document.getElementById('pdp-upload-image')?.click()}>
                  Upload Image
                </Button>
                <Button variant="outline" onClick={() => document.getElementById('pdp-upload-document')?.click()}>
                  Upload Document
                </Button>
              </div>
            </div>

            <FileList
              key={fileListKey}
              projectId={project.id}
              projectName={project.name}
              canDelete={true}
              onUpdate={() => setFileListKey(prev => prev + 1)}
            />
          </div>
        )}

        {/* Hidden inputs to invoke native pickers for Files tab */}
        <input id="pdp-upload-brochure" type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={() => setFileListKey(prev => prev + 1)} />
        <input id="pdp-upload-floor" type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={() => setFileListKey(prev => prev + 1)} />
        <input id="pdp-upload-image" type="file" accept="image/*" style={{ display: 'none' }} onChange={() => setFileListKey(prev => prev + 1)} />
        <input id="pdp-upload-document" type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={() => setFileListKey(prev => prev + 1)} />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={handleCloseDialog}
          onConfirm={handleConfirmAction}
          title={confirmDialog.type === 'delete' ? 'Delete Project' : 'Archive Project'}
          message={
            confirmDialog.type === 'delete'
              ? `Are you sure you want to delete "${project?.name}"? This action cannot be undone.`
              : `Are you sure you want to archive "${project?.name}"? It will be hidden from agents but can be restored later.`
          }
          confirmText={confirmDialog.type === 'delete' ? 'Delete' : 'Archive'}
          cancelText="Cancel"
          type={confirmDialog.type === 'delete' ? 'danger' : 'warning'}
        />
    </div>
  );
};
