import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRelatedPosts } from '../database';
import './RelatedPosts.css';

export default function RelatedPosts({ currentPostId, tags, limit = 3 }) {
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRelatedPosts() {
      if (!currentPostId || !tags || tags.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const posts = await getRelatedPosts(currentPostId, tags, limit);
        setRelatedPosts(posts);
      } catch (error) {
        console.error('Erro ao carregar posts relacionados:', error);
      } finally {
        setLoading(false);
      }
    }

    loadRelatedPosts();
  }, [currentPostId, tags, limit]);

  if (loading) {
    return null;
  }

  if (relatedPosts.length === 0) {
    return null;
  }

  return (
    <div className="related-posts">
      <h3 className="related-title">Você também pode gostar</h3>
      <div className="related-grid">
        {relatedPosts.map((post) => (
          <Link 
            key={post.id} 
            to={`/post/${post.slug}`}
            className="related-card"
          >
            {post.image && (
              <div className="related-image">
                <img src={post.image} alt={post.title} loading="lazy" />
              </div>
            )}
            <div className="related-content">
              <h4 className="related-card-title">{post.title}</h4>
              <p className="related-date">
                {new Date(post.created_at).toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
              {post.tags && post.tags.length > 0 && (
                <div className="related-tags">
                  {post.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="related-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}