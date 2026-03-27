import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../AuthContext';
import './Login.css';

export default function Login({ isOpen, onClose, onSwitchToRegister }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const { signIn, signInWithGithub } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const { error } = await signInWithGithub();
      if (error) throw error;
    } catch (err) {
      setError(err.message || 'Erro ao fazer login com GitHub');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>×</button>

        <div className="auth-modal-header">
          <h2>Entrar</h2>
          <p>Bem-vindo de volta ao Moura's Notes</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com" required disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Senha</label>
            <input
              id="login-password" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" required disabled={loading}
            />
          </div>

          <button type="submit" className="auth-btn primary" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="auth-divider"><span>ou continue com</span></div>

        <div className="auth-social auth-social-single">
          <button className="auth-btn social github"
            onClick={handleGithubLogin} disabled={loading}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
            </svg>
            Continuar com GitHub
          </button>
        </div>

        <div className="auth-footer">
          Não tem uma conta?{' '}
          <button className="auth-link" onClick={onSwitchToRegister}>Criar conta</button>
        </div>
      </div>
    </div>,
    document.body
  );
}