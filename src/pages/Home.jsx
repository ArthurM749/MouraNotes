import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllPosts, initDB } from '../database';
import { SkeletonPostList } from '../components/SkeletonPost';
import Tag from '../components/Tag';
import PopularPosts from '../components/PopularPosts';
import './Home.css';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [layout, setLayout] = useState('list'); // 'list' ou 'grid'
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTag = searchParams.get('tag');
  const [showTagSearch, setShowTagSearch] = useState(false);
  const [allTags, setAllTags] = useState([]);
  const [postsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function loadPosts() {
      try {
        await initDB();
        const allPosts = await getAllPosts();
        setPosts(allPosts);
        setFilteredPosts(allPosts);
        
        // Extrair todas as tags únicas
        const tagsSet = new Set();
        allPosts.forEach(post => {
          if (post.tags) {
            post.tags.forEach(tag => tagsSet.add(tag));
          }
        });
        setAllTags(Array.from(tagsSet).sort());
        
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
    // Detectar busca de tags: /tag, /tag nome, /tag nome1, nome2
    const tagSearchMatch = searchTerm.match(/^\/tags?\s*(.*)$/i);
    
    if (tagSearchMatch) {
      const tagQuery = tagSearchMatch[1].trim();
      
      if (tagQuery === '') {
        // Só /tag - mostrar painel
        setShowTagSearch(true);
        return;
      } else {
        // /tag nome ou /tag nome1, nome2
        setShowTagSearch(false);
        const searchTags = tagQuery.split(',').map(t => t.trim()).filter(t => t);
        
        let filtered = posts.filter(post => {
          if (!post.tags || post.tags.length === 0) return false;
          
          // Verifica se o post tem pelo menos uma das tags buscadas
          return searchTags.some(searchTag => 
            post.tags.some(postTag => 
              postTag.toLowerCase().includes(searchTag.toLowerCase())
            )
          );
        });
        
        setFilteredPosts(filtered);
        setCurrentPage(1);
        return;
      }
    } else {
      setShowTagSearch(false);
    }

    let filtered = posts;

    // Filtrar por tag se selecionada
    if (selectedTag) {
      filtered = filtered.filter(post => 
        post.tags && post.tags.includes(selectedTag)
      );
    }

    // Filtrar por termo de busca
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(post => {
        const matchTitle = post.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchContent = post.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchTags = post.tags && post.tags.some(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return matchTitle || matchContent || matchTags;
      });
    }

    setFilteredPosts(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedTag, posts]);

  const clearTagFilter = () => {
    setSearchParams({});
  };

  const handleTagClick = (tag) => {
    // Limpar campo de pesquisa
    setSearchTerm('');
    setShowTagSearch(false);
    // Aplicar filtro de tag
    setSearchParams({ tag });
  };

  // Paginação
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const hasMore = filteredPosts.length > indexOfLastPost;

  const loadMore = () => {
    setCurrentPage(prev => prev + 1);
    // Scroll suave para os novos posts
    window.scrollTo({ top: document.querySelector('.posts-container').offsetTop - 100, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="container">
        <div className="hero">
          <h1 className="hero-title">Moura's Notes</h1>
          <p className="hero-subtitle">Um espaço para compartilhar pensamentos, aprendizados e explorações técnicas</p>
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
        <h1 className="hero-title">Moura's Notes</h1>
        <p className="hero-subtitle">
          Um espaço para compartilhar pensamentos, aprendizados e explorações técnicas
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
            {allTags.length > 0 ? (
              allTags.map(tag => (
                <Tag key={tag} name={tag} onClick={handleTagClick} />
              ))
            ) : (
              <p className="no-tags">Nenhuma tag criada ainda</p>
            )}
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
          currentPosts.map(post => (
            <article key={post.id} className="post-card">
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
    </div>
  );
}