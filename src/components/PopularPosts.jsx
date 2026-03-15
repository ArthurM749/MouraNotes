import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllPosts } from '../database';
import './PopularPosts.css';

export default function PopularPosts({ limit = 6, showInSidebar = false }) {
  const [popularPosts, setPopularPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPopularPosts() {
      try {
        const allPosts = await getAllPosts();
        
        // Ordenar por views (maior para menor)
        const sorted = allPosts
          .filter(post => post.views > 0)
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, limit);
        
        setPopularPosts(sorted);
      } catch (error) {
        console.error('Erro ao carregar posts populares:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPopularPosts();
  }, [limit]);

  if (loading) {
    return null;
  }

  if (popularPosts.length === 0) {
    return null;
  }

  return (
    <div className={`popular-posts ${showInSidebar ? 'sidebar' : ''}`}>
      <h3 className="popular-title">
        🔥 Mais Populares
      </h3>
      
      <div className="popular-list">
        {popularPosts.map((post, index) => (
          <Link 
            key={post.id} 
            to={`/post/${post.slug}`}
            className="popular-item"
          >
            <span className="popular-rank">#{index + 1}</span>
            <div className="popular-content">
              <h4 className="popular-item-title">{post.title}</h4>
              <div className="popular-meta">
                <span className="popular-views">
                  👁️ {post.views} {post.views === 1 ? 'visualização' : 'visualizações'}
                </span>
                <span className="popular-date">
                  {new Date(post.created_at).toLocaleDateString('pt-BR', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}