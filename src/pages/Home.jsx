import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllPosts, initDB } from '../database';
import { supabase } from '../supabase';
import { SkeletonPostList } from '../components/SkeletonPost';
import AdminQuickActions from '../components/AdminQuickActions';
import Tag from '../components/Tag';
import PopularPosts from '../components/PopularPosts';
import './Home.css';

// ─── Busca de usuários por @username ─────────────────────────────────────────
async function searchUsers(query) {
  if (!query || query.length < 1) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
    .limit(12);
  if (error) { console.error(error); return []; }
  return data || [];
}

export default function Home() {
  const [posts, setPosts]                   = useState([]);
  const [filteredPosts, setFilteredPosts]   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [searchTerm, setSearchTerm]         = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [layout, setLayout]                 = useState('list');
  const [searchParams, setSearchParams]     = useSearchParams();
  const selectedTag                         = searchParams.get('tag');
  const [showTagSearch, setShowTagSearch]   = useState(false);
  const [allTags, setAllTags]               = useState([]);
  const [postsPerPage]                      = useState(12);
  const [currentPage, setCurrentPage]       = useState(1);

  // ── Busca de usuários ──
  const [userResults, setUserResults]       = useState([]);
  const [userLoading, setUserLoading]       = useState(false);
  const userSearchTimer                     = useRef(null);

  // Modo @ ativo: searchTerm começa com "@"
  const isUserSearch = searchTerm.startsWith('@');
  const userQuery    = isUserSearch ? searchTerm.slice(1) : '';

  // ── Carregar posts (declarada fora para ser usada como onRefresh) ─────────
  async function loadPosts() {
    try {
      await initDB();
      const allPosts = await getAllPosts();
      setPosts(allPosts);
      setFilteredPosts(allPosts);

      const tagsSet = new Set();
      allPosts.forEach(post => {
        if (post.tags) post.tags.forEach(tag => tagsSet.add(tag));
      });
      setAllTags(Array.from(tagsSet).sort());
    } catch (err) {
      console.error('Erro ao carregar posts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  // ── Debounce busca de usuários ────────────────────────────────────────────
  useEffect(() => {
    if (!isUserSearch) { setUserResults([]); return; }

    clearTimeout(userSearchTimer.current);

    if (userQuery.length === 0) {
      // "@" sozinho — mostra todos (até 12)
      setUserLoading(true);
      userSearchTimer.current = setTimeout(async () => {
        const results = await searchUsers('');
        setUserResults(results);
        setUserLoading(false);
      }, 200);
      return;
    }

    setUserLoading(true);
    userSearchTimer.current = setTimeout(async () => {
      const results = await searchUsers(userQuery);
      setUserResults(results);
      setUserLoading(false);
    }, 300);

    return () => clearTimeout(userSearchTimer.current);
  }, [searchTerm, isUserSearch, userQuery]);

  // ── Filtrar posts ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (isUserSearch) return; // modo usuário, não filtra posts

    const tagSearchMatch = searchTerm.match(/^\/tags?\s*(.*)$/i);

    if (tagSearchMatch) {
      const tagQuery = tagSearchMatch[1].trim();
      if (tagQuery === '') { setShowTagSearch(true); return; }
      setShowTagSearch(false);
      const searchTags = tagQuery.split(',').map(t => t.trim()).filter(t => t);
      const filtered = posts.filter(post => {
        if (!post.tags || post.tags.length === 0) return false;
        return searchTags.some(st =>
          post.tags.some(pt => pt.toLowerCase().includes(st.toLowerCase()))
        );
      });
      setFilteredPosts(filtered);
      setCurrentPage(1);
      return;
    }

    setShowTagSearch(false);
    let filtered = posts;

    if (selectedTag) {
      filtered = filtered.filter(post => post.tags && post.tags.includes(selectedTag));
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(post => {
        const matchTitle   = post.title.toLowerCase().includes(q);
        const matchContent = post.content.toLowerCase().includes(q);
        const matchTags    = post.tags && post.tags.some(tag => tag.toLowerCase().includes(q));
        return matchTitle || matchContent || matchTags;
      });
    }

    setFilteredPosts(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedTag, posts, isUserSearch]);

  const clearTagFilter = () => setSearchParams({});

  const handleTagClick = (tag) => {
    setSearchTerm('');
    setShowTagSearch(false);
    setSearchParams({ tag });
  };

  // Paginação
  const indexOfLastPost  = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts     = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const hasMore          = filteredPosts.length > indexOfLastPost;

  const loadMore = () => {
    setCurrentPage(prev => prev + 1);
    window.scrollTo({
      top: document.querySelector('.posts-container')?.offsetTop - 100 || 0,
      behavior: 'smooth',
    });
  };

  // ─── Avatar helper ───────────────────────────────────────────────────────
  function userAvatar(u) {
    return u.avatar_url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        u.full_name || u.username || 'U'
      )}&background=d4512e&color=fff&size=128`;
  }

  // ── Loading / erro ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="container">
        <div className="hero">
          <h1 className="hero-title">Moura's Notes</h1>
          <p className="hero-subtitle">
            Um espaço para compartilhar pensamentos, aprendizados e explorações técnicas
          </p>
        </div>
        <div className={`posts-container ${layout}`}>
          <SkeletonPostList count={3} layout={layout} />
        </div>
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
              <li>Verifique as políticas RLS</li>
              <li>Abra o console (F12) para mais detalhes</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="hero">
        <h1 className="hero-title">Moura's Notes</h1>
        <p className="hero-subtitle">
          Um espaço para compartilhar pensamentos, aprendizados e explorações técnicas
        </p>
      </div>

      {/* ── Barra de controles ── */}
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
            placeholder="Pesquisar posts, /tag ou @usuário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setSearchExpanded(true)}
            onBlur={() => { if (!searchTerm) setSearchExpanded(false); }}
          />
        </div>

        <div className="layout-toggle">
          <button
            className={`layout-btn ${layout === 'list' ? 'active' : ''}`}
            onClick={() => setLayout('list')}
            title="Lista"
          >☰</button>
          <button
            className={`layout-btn ${layout === 'grid' ? 'active' : ''}`}
            onClick={() => setLayout('grid')}
            title="Grade"
          >⊞</button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          MODO @ — grade de usuários
      ══════════════════════════════════════════════════ */}
      {isUserSearch && (
        <div className="user-search-section">
          <p className="user-search-hint">
            {userQuery
              ? `Buscando usuários por "@${userQuery}"`
              : 'Mostrando todos os usuários — continue digitando para filtrar'}
          </p>

          {userLoading ? (
            <div className="user-search-loading">Buscando...</div>
          ) : userResults.length === 0 ? (
            <div className="user-search-empty">
              Nenhum usuário encontrado para "@{userQuery}".
            </div>
          ) : (
            <div className="user-search-grid">
              {userResults.map(u => (
                <Link
                  to={`/profile/${u.username}`}
                  key={u.id}
                  className="user-search-card"
                  onClick={() => setSearchTerm('')}
                >
                  <img
                    src={userAvatar(u)}
                    alt={u.username}
                    className="user-search-avatar"
                  />
                  <div className="user-search-info">
                    <span className="user-search-name">
                      {u.full_name || u.username}
                    </span>
                    <span className="user-search-username">@{u.username}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODO NORMAL — posts
      ══════════════════════════════════════════════════ */}
      {!isUserSearch && (
        <>
          {selectedTag && (
            <div className="active-filter">
              <span className="filter-label">Filtrando por tag:</span>
              <Tag name={selectedTag} clickable={false} />
              <button onClick={clearTagFilter} className="clear-filter">
                × Limpar filtro
              </button>
            </div>
          )}

          {showTagSearch && (
            <div className="tag-search-panel">
              <h3>🏷️ Todas as Tags</h3>
              <p className="tag-search-hint">Clique em uma tag para filtrar os posts</p>
              <div className="all-tags-grid">
                {allTags.length > 0
                  ? allTags.map(tag => (
                    <Tag key={tag} name={tag} onClick={handleTagClick} />
                  ))
                  : <p className="no-tags">Nenhuma tag criada ainda</p>
                }
              </div>
            </div>
          )}

          {!showTagSearch && <PopularPosts limit={6} />}

          <div className={`posts-container ${layout}`}>
            {filteredPosts.length === 0 ? (
              <div className="empty-state">
                {searchTerm ? (
                  <>
                    <p>Nenhum post encontrado para "{searchTerm}"</p>
                    <button className="clear-search" onClick={() => setSearchTerm('')}>
                      Limpar pesquisa
                    </button>
                  </>
                ) : (
                  <>
                    <p>Nenhum post publicado ainda.</p>
                    <p className="empty-hint">
                      Os posts criados na área administrativa aparecerão aqui.
                    </p>
                  </>
                )}
              </div>
            ) : (
              currentPosts.map(post => (
                <article key={post.id} className="post-card">
                  {/* Barra de admin — visível somente para o admin */}
                  <AdminQuickActions post={post} onRefresh={loadPosts} />

                  <div className="post-content">
                    <h2 className="post-title">
                      <Link to={`/post/${post.slug}`}>{post.title}</Link>
                    </h2>

                    {post.image && (
                      <div className="post-image">
                        <img src={post.image} alt={post.title} />
                      </div>
                    )}

                    <div className="post-meta">
                      {new Date(post.created_at).toLocaleDateString('pt-BR', {
                        year: 'numeric', month: 'long', day: 'numeric',
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

          {filteredPosts.length > 0 && hasMore && (
            <div className="load-more-container">
              <button onClick={loadMore} className="load-more-btn">
                Carregar mais posts →
              </button>
              <p className="load-more-hint">
                Mostrando {currentPosts.length} de {filteredPosts.length} posts
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}