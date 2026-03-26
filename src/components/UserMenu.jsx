import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import Login from './Login';
import Register from './Register';
import './UserMenu.css';

export default function UserMenu() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const dropdownRef = useRef(null);
  
  const { user, profile, signOut } = useAuth();

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
    setShowDropdown(false);
  };

  const getAvatarUrl = () => {
    if (profile?.avatar_url) {
      return profile.avatar_url;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      profile?.full_name || profile?.username || 'User'
    )}&background=d4512e&color=fff`;
  };

  if (!user) {
    return (
      <>
        <div className="user-menu-guest">
          <button
            className="auth-trigger-btn"
            onClick={() => setShowLogin(true)}
          >
            Entrar
          </button>
          <button
            className="auth-trigger-btn primary"
            onClick={() => setShowRegister(true)}
          >
            Criar Conta
          </button>
        </div>

        <Login
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          onSwitchToRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />

        <Register
          isOpen={showRegister}
          onClose={() => setShowRegister(false)}
          onSwitchToLogin={() => {
            setShowRegister(false);
            setShowLogin(true);
          }}
        />
      </>
    );
  }

  return (
    <div className="user-menu" ref={dropdownRef}>
      <button
        className="user-menu-trigger"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label="Menu do usuário"
      >
        <img
          src={getAvatarUrl()}
          alt={profile?.username || 'User'}
          className="user-avatar"
        />
      </button>

      {showDropdown && (
        <div className="user-dropdown">
          <div className="user-dropdown-header">
            <img
              src={getAvatarUrl()}
              alt={profile?.username || 'User'}
              className="user-dropdown-avatar"
            />
            <div className="user-dropdown-info">
              <div className="user-dropdown-name">
                {profile?.full_name || profile?.username}
              </div>
              <div className="user-dropdown-username">
                @{profile?.username}
              </div>
            </div>
          </div>

          <div className="user-dropdown-divider"></div>

          <div className="user-dropdown-menu">
            <Link
              to={`/profile/${profile?.username}`}
              className="user-dropdown-item"
              onClick={() => setShowDropdown(false)}
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              Meu Perfil
            </Link>

            <Link
              to="/my-posts"
              className="user-dropdown-item"
              onClick={() => setShowDropdown(false)}
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
              </svg>
              Meus Posts
            </Link>

            <Link
              to="/liked-posts"
              className="user-dropdown-item"
              onClick={() => setShowDropdown(false)}
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              Posts Curtidos
            </Link>
          </div>

          <div className="user-dropdown-divider"></div>

          <button
            className="user-dropdown-item logout"
            onClick={handleLogout}
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
            Sair
          </button>
        </div>
      )}
    </div>
  );
}