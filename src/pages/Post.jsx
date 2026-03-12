import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { marked } from 'marked';
import { getPostBySlug, initDB, incrementViews } from '../database';
import Tag from '../components/Tag';
import TOC from '../components/TOC';
import ShareButtons from '../components/ShareButtons';
import ShareDropdown from '../components/ShareDropdown';
import { SkeletonPostList } from '../components/SkeletonPost';
import './Post.css';

export default function Post() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      await initDB();
      const foundPost = await getPostBySlug(slug);
      setPost(foundPost);
      setLoading(false);
      
      // Incrementar visualizações
      if (foundPost) {
        await incrementViews(foundPost.id);
      }
    }
    loadPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="container">
        <div className="post-article">
          <div className="skeleton-back-link"></div>
          <SkeletonPostList count={1} layout="list" />
        </div>
      </div>
    );
  }

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

  const htmlContent = marked(post.content);
  const currentUrl = window.location.href;

  return (
    <div className="container post-container">
      <TOC content={htmlContent} />
      
      <article className="post-article">
        <Link to="/" className="back-link">← Todos os posts</Link>
        
        <header className="post-header">
          <div className="title-row">
            <h1 className="article-title">{post.title}</h1>
            <ShareDropdown url={currentUrl} title={post.title} />
          </div>
          
          <div className="article-meta">
            <time>
              Publicado em {new Date(post.created_at).toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
            {post.updated_at && post.updated_at !== post.created_at && (
              <time className="updated-date">
                • Atualizado em {new Date(post.updated_at).toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            )}
          </div>
          
          {post.tags && post.tags.length > 0 && (
            <div className="tags-container">
              {post.tags.map(tag => (
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
          className="article-content post-body"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
        
        <ShareButtons url={currentUrl} title={post.title} position="end" />
      </article>
    </div>
  );
}