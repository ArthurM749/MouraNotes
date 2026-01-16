import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllPosts, initDB } from '../database';
import './Home.css';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      await initDB();
      const allPosts = getAllPosts();
      setPosts(allPosts);
      setLoading(false);
    }
    loadPosts();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="hero">
        <h1 className="hero-title">Textos Técnicos & Reflexões</h1>
        <p className="hero-subtitle">
          Um espaço pessoal para compartilhar pensamentos, aprendizados e explorações técnicas
        </p>
      </div>

      <div className="posts-grid">
        {posts.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum post publicado ainda.</p>
            <p className="empty-hint">Os posts criados na área administrativa aparecerão aqui.</p>
          </div>
        ) : (
          posts.map(post => (
            <article key={post.id} className="post-card">
              {post.image && (
                <div className="post-image">
                  <img src={post.image} alt={post.title} />
                </div>
              )}
              <div className="post-content">
                <h2 className="post-title">
                  <Link to={`/post/${post.slug}`}>{post.title}</Link>
                </h2>
                <div className="post-meta">
                  {new Date(post.created_at).toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <p className="post-excerpt">
                  {post.content.substring(0, 200).replace(/[#*`]/g, '')}...
                </p>
                <Link to={`/post/${post.slug}`} className="read-more">
                  Ler mais →
                </Link>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}