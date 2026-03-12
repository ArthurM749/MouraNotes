import './SkeletonPost.css';

export default function SkeletonPost({ layout = 'list' }) {
  if (layout === 'grid') {
    return (
      <div className="skeleton-post skeleton-grid">
        <div className="skeleton-image"></div>
        <div className="skeleton-content">
          <div className="skeleton-title"></div>
          <div className="skeleton-meta"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-text short"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="skeleton-post skeleton-list">
      <div className="skeleton-title large"></div>
      <div className="skeleton-meta"></div>
      <div className="skeleton-text"></div>
      <div className="skeleton-text"></div>
      <div className="skeleton-text short"></div>
    </div>
  );
}

// Componente para mostrar múltiplos skeletons
export function SkeletonPostList({ count = 3, layout = 'list' }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonPost key={index} layout={layout} />
      ))}
    </>
  );
}