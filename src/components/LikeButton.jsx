import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { likePost, unlikePost, hasUserLikedPost, getPostLikes } from '../Auth';
import './LikeButton.css';

export default function LikeButton({ postId }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    loadLikes();
  }, [postId, user]);

  const loadLikes = async () => {
    // Obter total de curtidas
    const { success, count } = await getPostLikes(postId);
    if (success) {
      setLikesCount(count);
    }

    // Verificar se usuário curtiu
    if (user) {
      const userLiked = await hasUserLikedPost(postId, user.id);
      setLiked(userLiked);
    }
  };

  const handleClick = async () => {
    if (!user) {
      // Mostrar modal de login
      setShowAuthModal(true);
      return;
    }

    setLoading(true);

    if (liked) {
      const result = await unlikePost(postId, user.id);
      if (result.success) {
        setLiked(false);
        setLikesCount(prev => prev - 1);
      }
    } else {
      const result = await likePost(postId, user.id);
      if (result.success) {
        setLiked(true);
        setLikesCount(prev => prev + 1);
      }
    }

    setLoading(false);
  };

  return (
    <button
      className={`like-button ${liked ? 'liked' : ''} ${loading ? 'loading' : ''}`}
      onClick={handleClick}
      disabled={loading}
      title={liked ? 'Descurtir' : 'Curtir'}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" className="like-icon">
        {liked ? (
          <path 
            fill="currentColor" 
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          />
        ) : (
          <path 
            fill="currentColor" 
            d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"
          />
        )}
      </svg>
      <span className="like-count">{likesCount}</span>
    </button>
  );
}