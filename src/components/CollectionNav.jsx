import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPostsByCollection } from '../database';
import './CollectionNav.css';

export default function CollectionNav({ currentPost }) {
  const [collectionPosts, setCollectionPosts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [prevPost, setPrevPost] = useState(null);
  const [nextPost, setNextPost] = useState(null);

  useEffect(() => {
    async function loadCollectionPosts() {
      if (!currentPost.collection) {
        return;
      }

      try {
        const posts = await getPostsByCollection(currentPost.collection);
        
        // Ordenar por collection_order
        const sortedPosts = posts.sort((a, b) => 
          (a.collection_order || 0) - (b.collection_order || 0)
        );

        setCollectionPosts(sortedPosts);

        // Encontrar índice do post atual
        const idx = sortedPosts.findIndex(p => p.id === currentPost.id);
        setCurrentIndex(idx);

        // Definir anterior e próximo
        if (idx > 0) {
          setPrevPost(sortedPosts[idx - 1]);
        }
        if (idx < sortedPosts.length - 1) {
          setNextPost(sortedPosts[idx + 1]);
        }
      } catch (error) {
        console.error('Erro ao carregar posts da coleção:', error);
      }
    }

    loadCollectionPosts();
  }, [currentPost]);

  if (!currentPost.collection || collectionPosts.length <= 1) {
    return null;
  }

  const progress = currentIndex >= 0 
    ? ((currentIndex + 1) / collectionPosts.length) * 100 
    : 0;

  return (
    <div className="collection-nav">
      <div className="collection-info">
        <span className="collection-badge">Coleção</span>
        <h4 className="collection-name">{currentPost.collection}</h4>
        <div className="collection-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="progress-text">
            Parte {currentIndex + 1} de {collectionPosts.length}
          </span>
        </div>
      </div>

      <div className="collection-nav-buttons">
        {prevPost ? (
          <Link to={`/post/${prevPost.slug}`} className="nav-btn nav-prev">
            <span className="nav-arrow">←</span>
            <div className="nav-content">
              <span className="nav-label">Anterior</span>
              <span className="nav-title">{prevPost.title}</span>
            </div>
          </Link>
        ) : (
          <div className="nav-btn nav-disabled">
            <span className="nav-arrow">←</span>
            <div className="nav-content">
              <span className="nav-label">Anterior</span>
              <span className="nav-title">—</span>
            </div>
          </div>
        )}

        {nextPost ? (
          <Link to={`/post/${nextPost.slug}`} className="nav-btn nav-next">
            <div className="nav-content">
              <span className="nav-label">Próximo</span>
              <span className="nav-title">{nextPost.title}</span>
            </div>
            <span className="nav-arrow">→</span>
          </Link>
        ) : (
          <div className="nav-btn nav-disabled">
            <div className="nav-content">
              <span className="nav-label">Próximo</span>
              <span className="nav-title">—</span>
            </div>
            <span className="nav-arrow">→</span>
          </div>
        )}
      </div>
    </div>
  );
}