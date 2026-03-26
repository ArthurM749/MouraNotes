import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { getPostsByAuthor, deletePost } from '../database';
import Tag from '../components/Tag';
import './MyPosts.css';

export default function MyPosts() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && !user) navigate('/');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) loadPosts();
  }, [user]);

  useEffect(() => {
    let result = posts;

    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    setFiltered(result);
  }, [search, statusFilter, posts]);

  async function loadPosts() {
    setLoading(true);
    const data = await getPostsByAuthor(user.id, true); // incluir rascunhos
    setPosts(data);
    setFiltered(data);
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;
    const ok = await deletePost(id);
    if (ok) setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  const counts = {
    all: posts.length,
    published: posts.filter((p) => p.status === 'published').length,
    draft: posts.filter((p) => p.status === 'draft').length,
    hidden: posts.filter((p) => p.status === 'hidden').length,
  };

  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);

  if (authLoading || loading) {
    return (
      <div className="container">
        <div className="my-posts-page">
          <p style={{ color: 'var(--color-text-secondary)' }}>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="my-posts-page">
        {/* Header */}
        <div className="my-posts-header">
          <h1>Meus Posts</h1>
          <Link to="/write" className="create-post-btn">
            ✏️ Criar Post
          </Link>
        </div>

        {/* Stats */}
        <div className="my-posts-stats">
          <span className="stat-chip">
            📄 <strong>{counts.all}</strong> total
          </span>
          <span className="stat-chip">
            ✅ <strong>{counts.published}</strong> publicados
          </span>
          {counts.draft > 0 && (
            <span className="stat-chip">
              📝 <strong>{counts.draft}</strong> rascunhos
            </span>
          )}
          <span className="stat-chip">
            👁️ <strong>{totalViews}</strong> visualizações
          </span>
        </div>

        {/* Controles */}
        <div className="my-posts-controls">
          <div className="my-posts-search">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Buscar por título ou tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos ({counts.all})</option>
            <option value="published">Publicados ({counts.published})</option>
            <option value="draft">Rascunhos ({counts.draft})</option>
            {counts.hidden > 0 && (
              <option value="hidden">Ocultos ({counts.hidden})</option>
            )}
          </select>
        </div>

        {/* Lista */}
        {filtered.length === 0 ? (
          <div className="empty-my-posts">
            {search ? (
              <>
                <p>Nenhum post encontrado para "{search}".</p>
                <button
                  className="create-post-btn"
                  onClick={() => setSearch('')}
                  style={{ display: 'inline-flex' }}
                >
                  Limpar busca
                </button>
              </>
            ) : (
              <>
                <p>Você ainda não tem posts.</p>
                <Link to="/write" className="create-post-btn">
                  ✏️ Criar meu primeiro post
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="my-posts-list">
            {filtered.map((post) => (
              <div key={post.id} className="my-post-item">
                {post.image && (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="my-post-thumb"
                  />
                )}

                <div className="my-post-body">
                  <div className="my-post-title-row">
                    <Link
                      to={`/post/${post.slug}`}
                      className="my-post-title"
                    >
                      {post.title}
                    </Link>
                    <span className={`status-badge status-${post.status}`}>
                      {post.status === 'published'
                        ? 'Publicado'
                        : post.status === 'draft'
                        ? 'Rascunho'
                        : 'Oculto'}
                    </span>
                  </div>

                  <div className="my-post-meta">
                    {new Date(post.created_at).toLocaleDateString('pt-BR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                    {' · '}
                    {post.views || 0} visualizações
                  </div>

                  {post.tags && post.tags.length > 0 && (
                    <div className="my-post-tags">
                      {post.tags.slice(0, 4).map((tag) => (
                        <Tag key={tag} name={tag} small clickable={false} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="my-post-actions">
                  <Link
                    to={`/write?edit=${post.id}`}
                    className="action-btn"
                  >
                    ✏️ Editar
                  </Link>
                  <Link
                    to={`/post/${post.slug}`}
                    className="action-btn"
                    target="_blank"
                  >
                    👁️ Ver
                  </Link>
                  <button
                    className="action-btn danger"
                    onClick={() => handleDelete(post.id)}
                  >
                    🗑️ Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}