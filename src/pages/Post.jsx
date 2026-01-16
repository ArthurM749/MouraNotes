import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { marked } from 'marked';
import { getPostBySlug, initDB } from '../database';
import './Post.css';

export default function Post() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      await initDB();
      const foundPost = getPostBySlug(slug);
      setPost(foundPost);
      setLoading(false);
    }
    loadPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Carregando...</div>
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

  return (
    <div className="container">
      <article className="post-article">
        <Link to="/" className="back-link">← Todos os posts</Link>
        
        <header className="post-header">
          <h1 className="article-title">{post.title}</h1>
          <div className="article-meta">
            <time>
              {new Date(post.created_at).toLocaleDateString('pt-BR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </div>
        </header>

        {post.image && (
          <div className="article-image">
            <img src={post.image} alt={post.title} />
          </div>
        )}

        <div 
          className="article-content"
          dangerouslySetInnerHTML={{ __html: marked(post.content) }}
        />
      </article>
    </div>
  );
}