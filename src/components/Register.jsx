import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../AuthContext';
import './Login.css';

export default function Register({ isOpen, onClose, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    username: '', fullName: '', email: '', password: '', confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const { signUp, signInWithGithub } = useAuth();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateForm = () => {
    if (formData.username.length < 3)          { setError('Username deve ter no mínimo 3 caracteres'); return false; }
    if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) { setError('Username só pode conter letras, números, _ e -'); return false; }
    if (formData.password.length < 6)          { setError('Senha deve ter no mínimo 6 caracteres'); return false; }
    if (formData.password !== formData.confirmPassword) { setError('As senhas não coincidem'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      const { error } = await signUp(
        formData.email, formData.password, formData.username, formData.fullName
      );
      if (error) throw error;
      alert('Conta criada! Verifique seu email para confirmar.');
      onSwitchToLogin();
    } catch (err) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const handleGithubRegister = async () => {
    setError('');
    setLoading(true);
    try {
      const { error } = await signInWithGithub();
      if (error) throw error;
    } catch (err) {
      setError(err.message || 'Erro ao registrar com GitHub');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>×</button>

        <div className="auth-modal-header">
          <h2>Criar Conta</h2>
          <p>Junte-se ao Moura's Notes</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="reg-username">Username</label>
            <input id="reg-username" name="username" type="text"
              value={formData.username} onChange={handleChange}
              placeholder="seunome" required disabled={loading} />
          </div>

          <div className="form-group">
            <label htmlFor="reg-fullName">Nome</label>
            <input id="reg-fullName" name="fullName" type="text"
              value={formData.fullName} onChange={handleChange}
              placeholder="Seu nome" disabled={loading} />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email</label>
            <input id="reg-email" name="email" type="email"
              value={formData.email} onChange={handleChange}
              placeholder="seu@email.com" required disabled={loading} />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Senha</label>
            <input id="reg-password" name="password" type="password"
              value={formData.password} onChange={handleChange}
              placeholder="••••••••" required disabled={loading} />
          </div>

          <div className="form-group">
            <label htmlFor="reg-confirmPassword">Confirmar Senha</label>
            <input id="reg-confirmPassword" name="confirmPassword" type="password"
              value={formData.confirmPassword} onChange={handleChange}
              placeholder="••••••••" required disabled={loading} />
          </div>

          <button type="submit" className="auth-btn primary" disabled={loading}>
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <div className="auth-divider"><span>ou continue com</span></div>

        <div className="auth-social auth-social-single">
          <button className="auth-btn social github"
            onClick={handleGithubRegister} disabled={loading}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
            </svg>
            Continuar com GitHub
          </button>
        </div>

        <div className="auth-footer">
          Já tem uma conta?{' '}
          <button className="auth-link" onClick={onSwitchToLogin}>Entrar</button>
        </div>
      </div>
    </div>,
    document.body
  );
}