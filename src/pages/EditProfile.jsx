import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { updateProfile, uploadAvatar } from '../Auth';
import { supabase } from '../supabase';
import './EditProfile.css';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();

  const [loading, setLoading]   = useState(false);
  const [message, setMessage]   = useState('');
  const [error, setError]       = useState('');
  const [avatarFile, setAvatarFile]     = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  /* ── Dados do perfil ── */
  const [formData, setFormData] = useState({
    full_name: '',
    username:  '',
    bio:       '',
    website:   '',
    location:  '',
  });

  /* ── Troca de senha ── */
  const [pwData, setPwData] = useState({
    newPassword:     '',
    confirmPassword: '',
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState('');
  const [pwError,   setPwError]   = useState('');
  const [showPw,    setShowPw]    = useState(false);

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        username:  profile.username  || '',
        bio:       profile.bio       || '',
        website:   profile.website   || '',
        location:  profile.location  || '',
      });
      setAvatarPreview(profile.avatar_url || '');
    }
  }, [profile, user, navigate]);

  /* ── Handlers de perfil ── */
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Imagem deve ter no máximo 5 MB'); return; }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (avatarFile) {
        const uploadResult = await uploadAvatar(user.id, avatarFile);
        if (!uploadResult.success) throw new Error(uploadResult.error);
      }
      const result = await updateProfile(user.id, formData);
      if (result.success) {
        setMessage('Perfil atualizado com sucesso!');
        await refreshProfile();
        setTimeout(() => navigate(`/profile/${formData.username}`), 1500);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  /* ── Handler de senha ── */
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwMessage('');

    if (pwData.newPassword.length < 6) {
      setPwError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (pwData.newPassword !== pwData.confirmPassword) {
      setPwError('As senhas não coincidem.');
      return;
    }

    setPwLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: pwData.newPassword,
      });
      if (error) throw error;
      setPwMessage('Senha atualizada com sucesso!');
      setPwData({ newPassword: '', confirmPassword: '' });
      setShowPw(false);
    } catch (err) {
      setPwError(err.message || 'Erro ao atualizar senha.');
    } finally {
      setPwLoading(false);
    }
  };

  const getAvatarUrl = () =>
    avatarPreview ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      formData.full_name || formData.username || 'User'
    )}&size=200&background=d4512e&color=fff`;

  return (
    <div className="edit-profile-page">
      <div className="container">
        <div className="edit-profile-header">
          <button onClick={() => navigate(-1)} className="back-btn">← Voltar</button>
          <h1>Editar Perfil</h1>
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-form">

          {/* ── Avatar ── */}
          <div className="form-section">
            <label className="section-label">Foto de Perfil</label>
            <div className="avatar-upload">
              <img src={getAvatarUrl()} alt="Avatar" className="avatar-preview" />
              <div className="avatar-upload-controls">
                <label htmlFor="avatar-input" className="upload-btn">Mudar Foto</label>
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="avatar-input"
                />
                <p className="upload-hint">JPG, PNG ou GIF. Máx 5 MB.</p>
              </div>
            </div>
          </div>

          {/* ── Informações básicas ── */}
          <div className="form-section">
            <label className="section-label">Informações Básicas</label>

            <div className="form-group">
              <label htmlFor="full_name">Nome Completo</label>
              <input
                id="full_name" name="full_name" type="text"
                value={formData.full_name} onChange={handleChange}
                placeholder="Seu nome completo"
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username" name="username" type="text"
                value={formData.username} onChange={handleChange}
                placeholder="seu_username"
                pattern="[a-zA-Z0-9_-]+"
                title="Apenas letras, números, _ e -"
                required
              />
              <p className="field-hint">Apenas letras, números, _ e -</p>
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio" name="bio"
                value={formData.bio} onChange={handleChange}
                placeholder="Conte um pouco sobre você..."
                rows="4" maxLength="200"
              />
              <p className="field-hint">{formData.bio.length}/200 caracteres</p>
            </div>
          </div>

          {/* ── Links ── */}
          <div className="form-section">
            <label className="section-label">Links</label>

            <div className="form-group">
              <label htmlFor="website">Website</label>
              <input
                id="website" name="website" type="url"
                value={formData.website} onChange={handleChange}
                placeholder="https://seu-site.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Localização</label>
              <input
                id="location" name="location" type="text"
                value={formData.location} onChange={handleChange}
                placeholder="Cidade, País"
              />
            </div>
          </div>

          {/* ── Feedback perfil ── */}
          {error   && <div className="form-error"  >{error}</div>}
          {message && <div className="form-success">{message}</div>}

          {/* ── Ações perfil ── */}
          <div className="form-actions">
            <button type="button" onClick={() => navigate(-1)}
              className="cancel-btn" disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>

        {/* ════════════════════════════════════════
            SEÇÃO DE TROCA DE SENHA
        ════════════════════════════════════════ */}
        <div className="edit-profile-form" style={{ marginTop: '1.5rem' }}>
          <div className="form-section">
            <div className="pw-section-header">
              <label className="section-label" style={{ marginBottom: 0 }}>
                🔒 Segurança
              </label>
              <button
                type="button"
                className="pw-toggle-btn"
                onClick={() => {
                  setShowPw((v) => !v);
                  setPwError('');
                  setPwMessage('');
                }}
              >
                {showPw ? 'Cancelar' : 'Alterar senha'}
              </button>
            </div>

            {!showPw && (
              <p className="field-hint" style={{ marginTop: '0.75rem' }}>
                Clique em "Alterar senha" para definir uma nova senha.
              </p>
            )}

            {showPw && (
              <form onSubmit={handlePasswordChange} className="pw-form">
                <div className="form-group">
                  <label htmlFor="newPassword">Nova Senha</label>
                  <input
                    id="newPassword"
                    type="password"
                    value={pwData.newPassword}
                    onChange={(e) => setPwData({ ...pwData, newPassword: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    required
                    disabled={pwLoading}
                    autoComplete="new-password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={pwData.confirmPassword}
                    onChange={(e) => setPwData({ ...pwData, confirmPassword: e.target.value })}
                    placeholder="Repita a nova senha"
                    required
                    disabled={pwLoading}
                    autoComplete="new-password"
                  />
                </div>

                {pwError   && <div className="form-error"  >{pwError}</div>}
                {pwMessage && <div className="form-success">{pwMessage}</div>}

                <div className="form-actions" style={{ paddingTop: '1rem', borderTop: 'none' }}>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => { setShowPw(false); setPwData({ newPassword: '', confirmPassword: '' }); }}
                    disabled={pwLoading}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="save-btn" disabled={pwLoading}>
                    {pwLoading ? 'Salvando...' : 'Salvar Nova Senha'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}