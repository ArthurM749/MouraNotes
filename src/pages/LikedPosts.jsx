import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { getLikedPosts } from '../database.admin';
import Tag from '../components/Tag';
import { SkeletonLikedPosts } from '../components/SkeletonPost';
import './LikedPosts.css';

export default function LikedPosts() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!authLoading && !user) navigate('/');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) loadLiked();
  }, [user]);

  useEffect(() => {
    if (!search.trim()) { setFiltered(posts); return; }
    const q = search.toLowerCase();
    setFiltered(
      posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
      )
    );
  }, [search, posts]);

  async function loadLiked() {
    setLoading(true);
    const data = await getLikedPosts(user.id);
    setPosts(data);
    setFiltered(data);
    setLoading(false);
  }

  /* ── SKELETON LOADING ── */
  if (authLoading || loading) {
    return (
      <div className="container">
        <div className="liked-posts-page">
          <SkeletonLikedPosts />
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="liked-posts-page">
        <div className="liked-posts-header">
          <h1>❤️ Posts Curtidos</h1>
          <p>
            {posts.length} post{posts.length !== 1 ? 's' : ''} curtido
            {posts.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="liked-posts-controls">
          <div className="liked-search">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Buscar por título ou tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-liked">
            <span className="big-icon">💔</span>
            {search ? (
              <p>
                Nenhum post curtido encontrado para "{search}".{' '}
                <button
                  onClick={() => setSearch('')}
                  style={{
                    background: 'none', border: 'none',
                    color: 'var(--color-accent)', cursor: 'pointer',
                    fontWeight: 600, fontSize: 'inherit',
                  }}
                >
                  Limpar
                </button>
              </p>
            ) : (
              <p>
                Você ainda não curtiu nenhum post.{' '}
                <Link to="/">Explorar posts</Link>
              </p>
            )}
          </div>
        ) : (
          <div className="liked-grid">
            {filtered.map((post) => (
              <Link to={`/post/${post.slug}`} key={post.id} className="liked-card">
                {post.image ? (
                  <img src={post.image} alt={post.title} className="liked-card-img" />
                ) : (
                  <div className="liked-card-img-placeholder" />
                )}
                <div className="liked-card-body">
                  <h3 className="liked-card-title">{post.title}</h3>
                  {post.content && (
                    <p className="liked-card-excerpt">
                      {post.content.substring(0, 120).replace(/[#*`]/g, '')}…
                    </p>
                  )}
                  {post.tags && post.tags.length > 0 && (
                    <div className="liked-card-tags">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Tag key={tag} name={tag} small clickable={false} />
                      ))}
                    </div>
                  )}
                  <div className="liked-card-meta">
                    <span className="liked-heart">❤️</span>
                    <span>
                      {new Date(post.created_at).toLocaleDateString('pt-BR', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                    {post.views > 0 && (
                      <><span>·</span><span>👁️ {post.views}</span></>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}