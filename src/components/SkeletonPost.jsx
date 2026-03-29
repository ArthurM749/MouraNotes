import './SkeletonPost.css';

/* ─── Post genérico (Home) ────────────────────────────────────── */
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

/* ─── Meus Posts ──────────────────────────────────────────────── */
function SkeletonMyPostItem() {
  return (
    <div className="sk-my-item">
      <div className="skel-block sk-my-thumb" />
      <div className="sk-my-body">
        <div className="sk-my-title-row">
          <div className="skel-block sk-my-title" />
          <div className="skel-block sk-my-badge" />
        </div>
        <div className="skel-block sk-my-meta" />
        <div className="sk-tag-row">
          <div className="skel-block sk-tag" />
          <div className="skel-block sk-tag" />
        </div>
      </div>
      <div className="sk-my-actions">
        <div className="skel-block sk-action-btn" />
        <div className="skel-block sk-action-btn" />
        <div className="skel-block sk-action-btn" />
      </div>
    </div>
  );
}

export function SkeletonMyPosts() {
  return (
    <div className="sk-my-posts">
      <div className="sk-my-header">
        <div className="skel-block sk-page-title" />
        <div className="skel-block sk-create-btn" />
      </div>
      <div className="sk-chip-row">
        <div className="skel-block sk-chip" />
        <div className="skel-block sk-chip" />
        <div className="skel-block sk-chip" />
        <div className="skel-block sk-chip" />
      </div>
      <div className="sk-controls-row">
        <div className="skel-block sk-search-bar" />
        <div className="skel-block sk-select" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonMyPostItem key={i} />
      ))}
    </div>
  );
}

/* ─── Posts Curtidos ──────────────────────────────────────────── */
function SkeletonLikedCard() {
  return (
    <div className="sk-card">
      <div className="skel-block sk-card-img" />
      <div className="sk-card-body">
        <div className="skel-block sk-card-title" />
        <div className="skel-block sk-card-title short" />
        <div className="skel-block sk-card-line" />
        <div className="skel-block sk-card-line short" />
        <div className="sk-tag-row">
          <div className="skel-block sk-tag" />
          <div className="skel-block sk-tag" />
        </div>
        <div className="skel-block sk-card-meta" />
      </div>
    </div>
  );
}

export function SkeletonLikedPosts() {
  return (
    <div className="sk-liked-posts">
      <div className="sk-page-header">
        <div className="skel-block sk-page-title" />
        <div className="skel-block sk-page-sub" />
      </div>
      <div className="skel-block sk-search-bar" style={{ marginBottom: '2rem' }} />
      <div className="sk-cards-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonLikedCard key={i} />
        ))}
      </div>
    </div>
  );
}

/* ─── Perfil ──────────────────────────────────────────────────── */
export function SkeletonProfile() {
  return (
    <div className="sk-profile">
      {/* Bloco do perfil */}
      <div className="sk-profile-header">
        <div className="skel-block sk-avatar" />
        <div className="sk-profile-info">
          <div className="sk-profile-name-row">
            <div className="skel-block sk-profile-name" />
            <div className="skel-block sk-profile-btn" />
          </div>
          <div className="skel-block sk-profile-handle" />
          <div className="skel-block sk-profile-bio" />
          <div className="skel-block sk-profile-bio short" />
          <div className="sk-profile-stats">
            {[0, 1, 2].map((i) => (
              <div key={i} className="sk-profile-stat-item">
                <div className="skel-block sk-stat-val" />
                <div className="skel-block sk-stat-lbl" />
              </div>
            ))}
          </div>
          <div className="sk-tag-row">
            <div className="skel-block sk-profile-link" />
            <div className="skel-block sk-profile-link short" />
          </div>
        </div>
      </div>

      {/* Tab */}
      <div className="sk-tabs-bar">
        <div className="skel-block sk-tab-item" />
      </div>

      {/* Grid de posts do perfil */}
      <div className="sk-cards-grid">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="sk-card">
            <div className="skel-block sk-card-img" />
            <div className="sk-card-body">
              <div className="skel-block sk-card-title" />
              <div className="skel-block sk-card-line" />
              <div className="skel-block sk-card-line short" />
              <div className="skel-block sk-card-meta" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}