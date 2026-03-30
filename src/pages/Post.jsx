import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { marked } from 'marked';
import { renderWithMath } from '../utils/renderMath';
import { getPostBySlug, initDB, incrementViews } from '../database';
import { supabase } from '../supabase';
import Tag from '../components/Tag';
import TOC from '../components/TOC';
import ShareButtons from '../components/ShareButtons';
import ShareDropdown from '../components/ShareDropdown';
import LikeButton from '../components/LikeButton';
import RelatedPosts from '../components/RelatedPosts';
import CollectionNav from '../components/CollectionNav';
import { useCodeHighlighting } from '../components/CodeBlock';
import { SkeletonPostList } from '../components/SkeletonPost';
import AdminQuickActions from '../components/AdminQuickActions';
import './Post.css';

export default function Post() {
  const { slug }            = useParams();
  const [post, setPost]     = useState(null);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const contentRef = useRef(null);

  useCodeHighlighting(contentRef);

  // Lightbox: captura cliques em imagens do conteúdo
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    function handleImgClick(e) {
      if (e.target.tagName === 'IMG') setLightboxSrc(e.target.src);
    }
    el.addEventListener('click', handleImgClick);
    return () => el.removeEventListener('click', handleImgClick);
  });

  useEffect(() => {
    let cancelled = false;

    async function loadPost() {
      try {
        await initDB();
        const foundPost = await getPostBySlug(slug);

        if (cancelled) return;

        setPost(foundPost ?? null);

        if (foundPost?.author_id) {
          // Busca nome do autor — erro silencioso se perfil não existir
          const { data } = await supabase
            .from('profiles')
            .select('username, full_name, avatar_url')
            .eq('id', foundPost.author_id)
            .maybeSingle();

          if (!cancelled) setAuthor(data ?? null);
        }

        if (foundPost) {
          incrementViews(foundPost.id); // fire-and-forget
        }
      } catch (err) {
        console.error('[Post] loadPost error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPost();
    return () => { cancelled = true; };
  }, [slug]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="container">
        <div className="post-article">
          <div className="skeleton-back-link" />
          <SkeletonPostList count={1} layout="list" />
        </div>
      </div>
    );
  }

  /* ── Not found ── */
  if (!post) {
    return (
      <div className="container">
        <div className="not-found">
          <h1>Post não encontrado</h1>
          <p>O post que você está procurando não existe.</p>
          <Link to="/" className="back-link">← Voltar para o início</Link>
        </div>
      </div>
    );
  }

  const htmlContent = renderWithMath(post.content || '', marked);
  const currentUrl  = window.location.href;

  // Exibe sempre pelo @username; se não tiver, usa o full_name como fallback
  const authorUsername = author?.username || null;
  const authorName     = author?.full_name || author?.username || null;

  return (
    <div className="container post-container">
      <TOC content={htmlContent} />

      <article className="post-article">
        <Link to="/" className="back-link">← Todos os posts</Link>

        {/* Barra de ações rápidas — visível somente para o admin */}
        <AdminQuickActions post={post} onRefresh={() => window.location.reload()} />

        <header className="post-header">
          <div className="title-row">
            <h1 className="article-title">{post.title}</h1>
            <ShareDropdown url={currentUrl} title={post.title} />
          </div>

          {/* ── Autor ── */}
          {authorUsername && (
            <div className="article-author">
              <Link
                to={`/profile/${authorUsername}`}
                className="author-link"
              >
                <img
                  src={
                    author.avatar_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=d4512e&color=fff&size=48`
                  }
                  alt={authorUsername}
                  className="author-avatar"
                />
                <span>
                  Autor: <strong>@{authorUsername}</strong>
                </span>
              </Link>
            </div>
          )}

          <div className="article-meta">
            <time>
              Publicado em{' '}
              {new Date(post.created_at).toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            {post.updated_at && post.updated_at !== post.created_at && (
              <time className="updated-date">
                &nbsp;• Atualizado em{' '}
                {new Date(post.updated_at).toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            )}
            {post.views > 0 && (
              <span className="views-count">
                &nbsp;• 👁️ {post.views}{' '}
                {post.views === 1 ? 'visualização' : 'visualizações'}
              </span>
            )}
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="tags-container">
              {post.tags.map((tag) => (
                <Tag key={tag} name={tag} />
              ))}
            </div>
          )}
        </header>

        {post.image && (
          <div className="article-image">
            <img src={post.image} alt={post.title} />
          </div>
        )}

        <div
          ref={contentRef}
          className="article-content post-body"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        <CollectionNav currentPost={post} />

        <div className="post-actions">
          <LikeButton postId={post.id} />
        </div>

        <ShareButtons url={currentUrl} title={post.title} position="end" />

        <RelatedPosts
          currentPostId={post.id}
          tags={post.tags}
          limit={3}
        />
      </article>

      {/* ── Lightbox ── */}
      {lightboxSrc && (
        <div
          className="lightbox-overlay"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            className="lightbox-close"
            onClick={() => setLightboxSrc(null)}
            aria-label="Fechar"
          >×</button>
          <img
            src={lightboxSrc}
            alt="Imagem ampliada"
            className="lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}