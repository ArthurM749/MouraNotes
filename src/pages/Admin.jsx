import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { marked } from 'marked';
import { getAllPosts, createPost, updatePost, deletePost, initDB, generateSlug } from '../database';
import { verifyAdminPassword, updateAdminPassword } from '../Auth';
import './Admin.css';

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: ''
  });
  const [showPreview, setShowPreview] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordChangeData, setPasswordChangeData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    // Verificar se já está autenticado
    const isAuth = sessionStorage.getItem('admin-auth') === 'true';
    setAuthenticated(isAuth);
    
    if (isAuth) {
      loadPosts();
    }
  }, []);

  async function loadPosts() {
    await initDB();
    const allPosts = await getAllPosts();
    setPosts(allPosts);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError('');
    
    const isValid = await verifyAdminPassword(password);
    
    if (isValid) {
      setAuthenticated(true);
      sessionStorage.setItem('admin-auth', 'true');
      setPassword('');
      loadPosts();
    } else {
      setLoginError('Senha incorreta!');
      setPassword('');
    }
  }

  function handleLogout() {
    setAuthenticated(false);
    sessionStorage.removeItem('admin-auth');
    setPassword('');
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    
    if (passwordChangeData.new !== passwordChangeData.confirm) {
      alert('As senhas não conferem!');
      return;
    }

    if (passwordChangeData.new.length < 6) {
      alert('A nova senha deve ter pelo menos 6 caracteres!');
      return;
    }

    const result = await updateAdminPassword(
      passwordChangeData.current,
      passwordChangeData.new
    );

    if (result.success) {
      alert('Senha alterada com sucesso!');
      setShowPasswordChange(false);
      setPasswordChangeData({ current: '', new: '', confirm: '' });
    } else {
      alert(result.error || 'Erro ao alterar senha');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      alert('Preencha título e conteúdo!');
      return;
    }

    const slug = generateSlug(formData.title);

    if (editingPost) {
      await updatePost(editingPost.id, formData.title, slug, formData.content, formData.image || null);
      setEditingPost(null);
    } else {
      await createPost(formData.title, slug, formData.content, formData.image || null);
    }

    setFormData({ title: '', content: '', image: '' });
    await loadPosts();
  }

  function handleEdit(post) {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      image: post.image || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleDelete(id) {
    if (confirm('Tem certeza que deseja excluir este post?')) {
      await deletePost(id);
      await loadPosts();
    }
  }

  function handleCancel() {
    setEditingPost(null);
    setFormData({ title: '', content: '', image: '' });
  }

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  }

  if (!authenticated) {
    return (
      <div className="admin-container">
        <div className="login-card">
          <h1>Área Administrativa</h1>
          <p className="login-subtitle">Digite a senha para acessar</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              className="input-field"
              autoFocus
            />
            {loginError && <p className="login-error">{loginError}</p>}
            <button type="submit" className="btn btn-primary">
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Administração</h1>
        <div className="header-buttons">
          <button onClick={() => setShowPasswordChange(!showPasswordChange)} className="btn btn-secondary">
            🔑 Trocar Senha
          </button>
          <button onClick={handleLogout} className="btn btn-secondary">
            Sair
          </button>
        </div>
      </div>

      {showPasswordChange && (
        <div className="password-change-modal">
          <div className="password-change-card">
            <h2>Alterar Senha</h2>
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label>Senha Atual</label>
                <input
                  type="password"
                  value={passwordChangeData.current}
                  onChange={(e) => setPasswordChangeData({...passwordChangeData, current: e.target.value})}
                  className="input-field"
                  placeholder="Digite a senha atual"
                  required
                />
              </div>
              <div className="form-group">
                <label>Nova Senha</label>
                <input
                  type="password"
                  value={passwordChangeData.new}
                  onChange={(e) => setPasswordChangeData({...passwordChangeData, new: e.target.value})}
                  className="input-field"
                  placeholder="Digite a nova senha (mín. 6 caracteres)"
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirmar Nova Senha</label>
                <input
                  type="password"
                  value={passwordChangeData.confirm}
                  onChange={(e) => setPasswordChangeData({...passwordChangeData, confirm: e.target.value})}
                  className="input-field"
                  placeholder="Digite novamente a nova senha"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Alterar Senha
                </button>
                <button type="button" onClick={() => {
                  setShowPasswordChange(false);
                  setPasswordChangeData({ current: '', new: '', confirm: '' });
                }} className="btn btn-secondary">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-content">
        <div className="posts-section">
          <h2>Posts Publicados ({posts.length})</h2>
          
          {posts.length === 0 ? (
            <p className="empty-message">Nenhum post publicado ainda.</p>
          ) : (
            <div className="posts-list">
              {posts.map(post => (
                <div key={post.id} className="post-item">
                  <div className="post-item-content">
                    <h3>
                      <Link to={`/post/${post.slug}`} className="post-item-link" target="_blank" rel="noopener noreferrer">
                        {post.title}
                      </Link>
                    </h3>
                    <p className="post-item-date">
                      {new Date(post.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="post-item-actions">
                    <button onClick={() => handleEdit(post)} className="btn-icon" title="Editar">
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(post.id)} className="btn-icon delete" title="Excluir">
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-section-large">
          <h2>{editingPost ? 'Editar Post' : 'Novo Post'}</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Título</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-field"
                placeholder="Digite o título do post"
              />
            </div>

            <div className="form-group">
              <label>Imagem (opcional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="input-field"
              />
              {formData.image && (
                <div className="image-preview">
                  <img src={formData.image} alt="Preview" />
                </div>
              )}
            </div>

            <div className="form-group">
              <div className="editor-header">
                <label>Conteúdo (Markdown)</label>
                <div className="editor-tabs">
                  <button
                    type="button"
                    className={`tab-button ${!showPreview ? 'active' : ''}`}
                    onClick={() => setShowPreview(false)}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    type="button"
                    className={`tab-button ${showPreview ? 'active' : ''}`}
                    onClick={() => setShowPreview(true)}
                  >
                    👁️ Preview
                  </button>
                </div>
              </div>
              
              <div className="editor-container">
                {!showPreview ? (
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="textarea-field editor-textarea"
                    placeholder="Digite o conteúdo em Markdown..."
                    rows="20"
                  />
                ) : (
                  <div 
                    className="markdown-preview"
                    dangerouslySetInnerHTML={{ __html: marked(formData.content || '*Nenhum conteúdo ainda...*') }}
                  />
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingPost ? 'Atualizar Post' : 'Publicar Post'}
              </button>
              {editingPost && (
                <button type="button" onClick={handleCancel} className="btn btn-secondary">
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}