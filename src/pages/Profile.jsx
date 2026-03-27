import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useAdmin } from '../AdminContext';
import {
  getProfileByUsername,
  followUser,
  unfollowUser,
  isFollowing,
  getFollowers,
  getFollowing,
} from '../Auth';
import { getPostsByAuthor } from '../database';
import Tag from '../components/Tag';
import './Profile.css';

export default function Profile() {
  const { username } = useParams();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();

  const [profile, setProfile]               = useState(null);
  const [posts, setPosts]                   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [following, setFollowing]           = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [activeTab, setActiveTab]           = useState('posts');

  const isOwnProfile = user && profile && user.id === profile.id;

  useEffect(() => { loadProfile(); }, [username]);

  async function loadProfile() {
    setLoading(true);
    const { success, data } = await getProfileByUsername(username);
    if (!success || !data) { setLoading(false); return; }

    setProfile(data);

    const userPosts = await getPostsByAuthor(data.id);
    setPosts(userPosts || []);

    const followersResult = await getFollowers(data.id);
    const followingResult = await getFollowing(data.id);
    if (followersResult.success) setFollowersCount(followersResult.count || 0);
    if (followingResult.success) setFollowingCount(followingResult.count || 0);

    if (user && user.id !== data.id) {
      const isFollowingUser = await isFollowing(user.id, data.id);
      setFollowing(isFollowingUser);
    }

    setLoading(false);
  }

  async function handleFollowToggle() {
    if (!user) return;
    if (following) {
      const result = await unfollowUser(user.id, profile.id);
      if (result.success) { setFollowing(false); setFollowersCount((p) => p - 1); }
    } else {
      const result = await followUser(user.id, profile.id);
      if (result.success) { setFollowing(true); setFollowersCount((p) => p + 1); }
    }
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="profile-loading">Carregando perfil...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="profile-not-found">
            <h2>Usuário não encontrado</h2>
            <Link to="/" className="back-link">← Voltar para início</Link>
          </div>
        </div>
      </div>
    );
  }

  const getAvatarUrl = () =>
    profile.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      profile.full_name || profile.username
    )}&size=200&background=d4512e&color=fff`;

  return (
    <div className="profile-page">
      <div className="container">

        <div className="profile-header">
          <div className="profile-header-content">
            <img src={getAvatarUrl()} alt={profile.username} className="profile-avatar" />

            <div className="profile-info">
              <div className="profile-name-row">
                <h1 className="profile-name">
                  {profile.full_name || profile.username}
                </h1>

                {isOwnProfile ? (
                  /* ── Botões visíveis apenas no próprio perfil ── */
                  <div className="profile-owner-actions">
                    <Link to="/edit-profile" className="edit-profile-btn">
                      Editar Perfil
                    </Link>

                    {/* Botão Admin — só aparece para a conta admin */}
                    {isAdmin && (
                      <Link to="/admin/dashboard" className="admin-profile-btn">
                        ⚙️ Admin
                      </Link>
                    )}
                  </div>
                ) : user ? (
                  <button
                    className={`follow-btn ${following ? 'following' : ''}`}
                    onClick={handleFollowToggle}
                  >
                    {following ? 'Seguindo' : 'Seguir'}
                  </button>
                ) : null}
              </div>

              <p className="profile-username">@{profile.username}</p>

              {profile.bio && <p className="profile-bio">{profile.bio}</p>}

              <div className="profile-stats">
                <div className="profile-stat">
                  <span className="stat-value">{posts.length}</span>
                  <span className="stat-label">Posts</span>
                </div>
                <div className="profile-stat">
                  <span className="stat-value">{followersCount}</span>
                  <span className="stat-label">Seguidores</span>
                </div>
                <div className="profile-stat">
                  <span className="stat-value">{followingCount}</span>
                  <span className="stat-label">Seguindo</span>
                </div>
              </div>

              <div className="profile-links">
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer"
                    className="profile-link">
                    🌐 {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
                {profile.location && (
                  <span className="profile-link">📍 {profile.location}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Posts ({posts.length})
          </button>
        </div>

        {activeTab === 'posts' && (
          <div className="profile-posts">
            {posts.length === 0 ? (
              <div className="no-posts"><p>Nenhum post publicado ainda.</p></div>
            ) : (
              <div className="posts-grid">
                {posts.map((post) => (
                  <Link to={`/post/${post.slug}`} key={post.id} className="post-card">
                    {post.image && (
                      <img src={post.image} alt={post.title} className="post-card-image" />
                    )}
                    <div className="post-card-content">
                      <h3 className="post-card-title">{post.title}</h3>
                      {post.content && (
                        <p className="post-card-excerpt">
                          {post.content.substring(0, 150).replace(/[#*`]/g, '')}...
                        </p>
                      )}
                      {post.tags && post.tags.length > 0 && (
                        <div className="post-card-tags">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Tag key={tag} name={tag} small clickable={false} />
                          ))}
                        </div>
                      )}
                      <div className="post-card-meta">
                        <span>{new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                        <span>•</span>
                        <span>{post.views || 0} visualizações</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}