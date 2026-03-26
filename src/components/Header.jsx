import { useState } from 'react';
import { Link } from 'react-router-dom';
import Settings from './Settings';
import UserMenu from './UserMenu';
import './Header.css';

export default function Header() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <header className="header">
        <div className="header-container">
          <Link to="/" className="logo">
            <span className="logo-text">Moura's Notes</span>
          </Link>
          <nav className="nav">
            <Link to="/" className="nav-link">Início</Link>
            <Link to="/admin" className="nav-link">Admin</Link>
            <button
              className="settings-btn"
              onClick={() => setShowSettings(true)}
              aria-label="Configurações"
              title="Configurações"
            >
              ≡
            </button>
            <UserMenu />
          </nav>
        </div>
      </header>

      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}