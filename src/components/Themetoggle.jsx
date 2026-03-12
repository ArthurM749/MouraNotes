import { useEffect, useState } from 'react';
import './ThemeToggle.css';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Verificar preferência salva ou preferência do sistema
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const defaultTheme = prefersDark ? 'dark' : 'light';
      setTheme(defaultTheme);
      document.documentElement.setAttribute('data-theme', defaultTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <button 
      className="theme-toggle" 
      onClick={toggleTheme}
      aria-label="Alternar tema"
      title={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}