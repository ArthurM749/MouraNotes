import './SkeletonPost.css';

/* ─────────────────────────────────────────────
   SKELETON HOME — lista e grid (existente)
───────────────────────────────────────────── */
export default function SkeletonPost({ layout = 'list' }) {
  if (layout === 'grid') {
    return (
      <div className="skeleton-post skeleton-grid">
        <div className="skeleton-image" />
        <div className="skeleton-content">
          <div className="skeleton-title" />
          <div className="skeleton-meta" />
          <div className="skeleton-text" />
          <div className="skeleton-text short" />
        </div>
      </div>
    );
  }

  return (
    <div className="skeleton-post skeleton-list">
      <div className="skeleton-title large" />
      <div className="skeleton-meta" />
      <div className="skeleton-text" />
      <div className="skeleton-text" />
      <div className="skeleton-text short" />
    </div>
  );
}

export function SkeletonPostList({ count = 3, layout = 'list' }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonPost key={i} layout={layout} />
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────
   SKELETON PROFILE
───────────────────────────────────────────── */
export function SkeletonProfile() {
  return (
    <>
      {/* Header do perfil */}
      <div className="skeleton-profile-header">
        <div className="skeleton-profile-inner">
          <div className="skeleton-avatar" />
          <div className="skeleton-profile-info">
            {/* Nome */}
            <div className="skeleton-block" style={{ height: '1.875rem', width: '50%' }} />
            {/* Username */}
            <div className="skeleton-block" style={{ height: '1rem', width: '30%' }} />
            {/* Bio */}
            <div className="skeleton-block" style={{ height: '0.9rem', width: '80%' }} />
            <div className="skeleton-block" style={{ height: '0.9rem', width: '65%' }} />
            {/* Stats */}
            <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
              {[60, 80, 70].map((w, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div className="skeleton-block" style={{ height: '1.5rem', width: `${w}px` }} />
                  <div className="skeleton-block" style={{ height: '0.75rem', width: '50px' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="skeleton-tabs">
        <div className="skeleton-tab" style={{ width: '110px' }} />
      </div>

      {/* Grid de posts */}
      <div className="skeleton-profile-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div className="skeleton-profile-card" key={i}>
            <div className="skeleton-card-img" />
            <div className="skeleton-card-body">
              <div className="skeleton-block" style={{ height: '1rem', width: '85%' }} />
              <div className="skeleton-block" style={{ height: '0.85rem', width: '60%' }} />
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem' }}>
                <div className="skeleton-block" style={{ height: '1.2rem', width: '50px', borderRadius: '4px' }} />
                <div className="skeleton-block" style={{ height: '1.2rem', width: '60px', borderRadius: '4px' }} />
              </div>
              <div className="skeleton-block" style={{ height: '0.75rem', width: '45%', marginTop: '0.25rem' }} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   SKELETON MY POSTS
───────────────────────────────────────────── */
export function SkeletonMyPosts({ count = 5 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton-my-post-item" key={i}>
          {/* Miniatura */}
          <div className="skeleton-thumb" />

          {/* Corpo */}
          <div className="skeleton-my-post-body">
            {/* Título + badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="skeleton-block" style={{ height: '1.0625rem', width: '55%' }} />
              <div className="skeleton-block" style={{ height: '1rem', width: '70px', borderRadius: '4px' }} />
            </div>
            {/* Meta */}
            <div className="skeleton-block" style={{ height: '0.8125rem', width: '35%' }} />
            {/* Tags */}
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <div className="skeleton-block" style={{ height: '1.2rem', width: '52px', borderRadius: '5px' }} />
              <div className="skeleton-block" style={{ height: '1.2rem', width: '64px', borderRadius: '5px' }} />
            </div>
          </div>

          {/* Botões de ação */}
          <div className="skeleton-my-post-actions">
            <div className="skeleton-btn" />
            <div className="skeleton-btn" />
            <div className="skeleton-btn" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SKELETON LIKED POSTS
───────────────────────────────────────────── */
export function SkeletonLikedPosts({ count = 6 }) {
  return (
    <div className="skeleton-liked-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton-liked-card" key={i}>
          <div className="skeleton-card-img" />
          <div className="skeleton-card-body">
            <div className="skeleton-block" style={{ height: '1rem', width: '88%' }} />
            <div className="skeleton-block" style={{ height: '0.875rem', width: '70%' }} />
            <div className="skeleton-block" style={{ height: '0.875rem', width: '55%' }} />
            {/* Tags */}
            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem' }}>
              <div className="skeleton-block" style={{ height: '1.2rem', width: '52px', borderRadius: '4px' }} />
              <div className="skeleton-block" style={{ height: '1.2rem', width: '64px', borderRadius: '4px' }} />
            </div>
            {/* Meta */}
            <div className="skeleton-block" style={{ height: '0.75rem', width: '50%', marginTop: '0.25rem' }} />
          </div>
        </div>
      ))}
    </div>
  );
}