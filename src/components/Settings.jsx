import { useState, useEffect } from 'react';
import './Settings.css';

const THEMES = [
  { id: 'light', name: 'Claro', icon: '☀️' },
  { id: 'dark', name: 'Escuro', icon: '🌙' },
  { id: 'sepia', name: 'Sépia', icon: '📜' },
  { id: 'contrast', name: 'Alto Contraste', icon: '◐' },
  { id: 'reading', name: 'Modo Leitura', icon: '📖' }
];

const FONT_SIZES = [
  { id: 'small', label: 'A-', size: '14px' },
  { id: 'medium', label: 'A', size: '16px' },
  { id: 'large', label: 'A+', size: '18px' }
];

export default function Settings({ isOpen, onClose }) {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [fontSize, setFontSize] = useState('medium');

  useEffect(() => {
    // Carregar preferências salvas
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedFontSize = localStorage.getItem('fontSize') || 'medium';
    
    setCurrentTheme(savedTheme);
    setFontSize(savedFontSize);
    
    applyTheme(savedTheme);
    applyFontSize(savedFontSize);
  }, []);

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
  };

  const applyFontSize = (size) => {
    const sizeObj = FONT_SIZES.find(s => s.id === size);
    if (sizeObj) {
      document.documentElement.style.fontSize = sizeObj.size;
    }
  };

  const handleThemeChange = (themeId) => {
    setCurrentTheme(themeId);
    applyTheme(themeId);
    localStorage.setItem('theme', themeId);
  };

  const handleFontSizeChange = (sizeId) => {
    setFontSize(sizeId);
    applyFontSize(sizeId);
    localStorage.setItem('fontSize', sizeId);
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal" onClick={onClose}>
      <div className="settings-content" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>⚙️ Configurações</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="settings-body">
          {/* Temas */}
          <section className="settings-section">
            <h3>Tema</h3>
            <div className="theme-grid">
              {THEMES.map(theme => (
                <button
                  key={theme.id}
                  className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
                  onClick={() => handleThemeChange(theme.id)}
                >
                  <span className="theme-icon">{theme.icon}</span>
                  <span className="theme-name">{theme.name}</span>
                  {currentTheme === theme.id && <span className="check">✓</span>}
                </button>
              ))}
            </div>
          </section>

          {/* Tamanho da Fonte */}
          <section className="settings-section">
            <h3>Tamanho da Fonte</h3>
            <div className="font-size-controls">
              {FONT_SIZES.map(size => (
                <button
                  key={size.id}
                  className={`font-size-btn ${fontSize === size.id ? 'active' : ''}`}
                  onClick={() => handleFontSizeChange(size.id)}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </section>

          {/* Info */}
          <section className="settings-section">
            <p className="settings-info">
              💡 Suas preferências são salvas automaticamente e aplicadas em todas as páginas.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}