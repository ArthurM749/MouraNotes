import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllPosts, initDB } from '../database';
import './Home.css';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [layout, setLayout] = useState('list'); // 'list' ou 'grid'

  useEffect(() => {
    async function loadPosts() {
      try {
        await initDB();
        const allPosts = await getAllPosts();
        setPosts(allPosts);
        setFilteredPosts(allPosts);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar posts:', err);
        setError(err.message);
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPosts(filtered);
    }
  }, [searchTerm, posts]);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-state">
          <h2>⚠️ Erro ao carregar posts</h2>
          <p>{error}</p>
          <div className="error-help">
            <p><strong>Possíveis soluções:</strong></p>
            <ul>
              <li>Verifique se configurou o Supabase em <code>src/supabase.js</code></li>
              <li>Certifique-se que criou a tabela <code>posts</code> no Supabase</li>
              <li>Verifique se configurou as políticas RLS</li>
              <li>Abra o console do navegador (F12) para mais detalhes</li>
            </ul>
            <p>📖 Leia <strong>SUPABASE-CONFIG.md</strong> para instruções completas</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="hero">
        <h1 className="hero-title">Notas Técnicas & Ideias</h1>
        <p className="hero-subtitle">
          Um espaço pessoal para compartilhar pensamentos, aprendizados e explorações técnicas
        </p>
      </div>

      <div className="controls-bar">
        <div className={`search-container ${searchExpanded ? 'expanded' : ''}`}>
          <button 
            className="search-icon"
            onMouseEnter={() => setSearchExpanded(true)}
            onClick={() => setSearchExpanded(true)}
            aria-label="Pesquisar"
          >
            🔍
          </button>
          <input
            type="text"
            className="search-input"
            placeholder="Pesquisar posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onBlur={() => {
              if (searchTerm === '') {
                setSearchExpanded(false);
              }
            }}
          />
        </div>

        <div className="layout-toggle">
          <button
            className={`layout-btn ${layout === 'list' ? 'active' : ''}`}
            onClick={() => setLayout('list')}
            title="Visualização em lista"
          >
            ☰
          </button>
          <button
            className={`layout-btn ${layout === 'grid' ? 'active' : ''}`}
            onClick={() => setLayout('grid')}
            title="Visualização em grade"
          >
            ⊞
          </button>
        </div>
      </div>

      <div className={`posts-container ${layout}`}>
        {filteredPosts.length === 0 ? (
          <div className="empty-state">
            {searchTerm ? (
              <>
                <p>Nenhum post encontrado para "{searchTerm}"</p>
                <button 
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                >
                  Limpar pesquisa
                </button>
              </>
            ) : (
              <>
                <p>Nenhum post publicado ainda.</p>
                <p className="empty-hint">Os posts criados na área administrativa aparecerão aqui.</p>
              </>
            )}
          </div>
        ) : (
          filteredPosts.map(post => (
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