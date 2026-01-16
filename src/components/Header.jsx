import { Link } from 'react-router-dom';
import ThemeToggle from './Themetoggle';
import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-text">Moura's Notes</span>
        </Link>
        <nav className="nav">
          <Link to="/" className="nav-link">Início</Link>
          <Link to="/admin" className="nav-link">Admin</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}