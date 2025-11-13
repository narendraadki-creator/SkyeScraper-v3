import React, { useEffect, useState } from 'react';
import { developerService, type DeveloperWithStats } from '../services/developerService';

function DeveloperCard({ developer }: { developer: DeveloperWithStats }) {
  return (
    <div className="card-professional developer-card">
      <div className="card-image-container">
        <img
          src={developer.logo_url || '/placeholder-developer.jpg'}
          alt={developer.name}
          className="card-image"
        />
        <div className="card-badge">✓ Verified Developer</div>
      </div>

      <div className="card-content">
        <h3 className="card-title">{developer.name}</h3>
        <p className="card-subtitle">{developer.website || developer.primary_location || 'Trusted real estate brand'}</p>

        <div className="card-details">
          <div className="card-detail-item">
            <div className="card-detail-label">Projects</div>
            <div className="card-detail-value">{developer.projects_count}</div>
          </div>
          <div className="card-detail-item">
            <div className="card-detail-label">Location</div>
            <div className="card-detail-value">{developer.primary_location || '—'}</div>
          </div>
          <div className="card-detail-item">
            <div className="card-detail-label">Since</div>
            <div className="card-detail-value">{developer.earliest_possession_date || '—'}</div>
          </div>
        </div>

        <div>
          <div className="card-price-label">Starting from</div>
          <div className="card-price">{developer.min_starting_price ? `${developer.min_starting_price.toLocaleString()} AED` : 'On Request'}</div>
        </div>

        <button className="btn-primary" style={{ width: '100%', marginTop: 'var(--space-xs)' }}>
          View Properties
        </button>
      </div>
    </div>
  );
}

export default function DevelopersPage() {
  const [developers, setDevelopers] = useState<DeveloperWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await developerService.getDevelopersWithStats();
        setDevelopers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load developers');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="page-wrapper">
      <nav className="nav-header" />

      <section className="page-header">
        <div className="container-narrow">
          <h1 className="page-title">Featured Developers</h1>
          <p className="page-subtitle">
            Discover properties from India's most trusted real estate developers
          </p>
        </div>
      </section>

      <section className="filter-section">
        <div className="container-narrow">
          <div className="filter-bar">
            <div style={{ color: 'var(--color-text-muted)' }}>Filters coming soon</div>
          </div>
        </div>
      </section>

      <section className="section-content">
        <div className="container-narrow">
          {loading && <div>Loading developers...</div>}
          {error && <div style={{ color: 'red' }}>{error}</div>}
          {!loading && !error && (
            <div className="grid grid-3">
              {developers.map((dev) => (
                <DeveloperCard key={dev.id} developer={dev} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}






