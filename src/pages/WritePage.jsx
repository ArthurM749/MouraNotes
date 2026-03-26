import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import {
  createPost,
  updatePost,
  generateSlug,
  initDB,
} from '../database';
import { supabase } from '../supabase';
import ImageUploader from '../components/ImageUploader';
import MarkdownEditor from '../components/MarkdownEditor';
import './WritePage.css';

export default function WritePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [formData, setFormData] = useState({
    title: '', content: '', image: '',
    tags: '', collection: '', collectionOrder: '', status: 'published',
  });
  const [loading, setLoading]         = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [success, setSuccess]         = useState('');
  const [error, setError]             = useState('');
  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) navigate('/');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    async function init() {
      await initDB();
      if (editId) {
        const { data } = await supabase
          .from('posts').select('*').eq('id', editId).single();
        if (data) {
          if (data.author_id !== user?.id) { navigate('/my-posts'); return; }
          setEditingPost(data);
          setFormData({
            title:           data.title              || '',
            content:         data.content            || '',
            image:           data.image              || '',
            tags:            data.tags ? data.tags.join(', ') : '',
            collection:      data.collection         || '',
            collectionOrder: data.collection_order   || '',
            status:          data.status             || 'published',
          });
        }
      }
      setPageLoading(false);
    }
    if (user) init();
  }, [user, editId, navigate]);

  function set(field, val) {
    setFormData((prev) => ({ ...prev, [field]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Título e conteúdo são obrigatórios.'); return;
    }
    setLoading(true);
    const slug            = generateSlug(formData.title);
    const tagsArray       = formData.tags
      ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
    const collectionOrder = formData.collectionOrder
      ? parseInt(formData.collectionOrder) : null;

    let result;
    if (editingPost) {
      result = await updatePost(
        editingPost.id, formData.title, slug, formData.content,
        formData.image || null, tagsArray,
        formData.collection || null, collectionOrder, formData.status
      );
    } else {
      result = await createPost(
        formData.title, slug, formData.content,
        formData.image || null, tagsArray,
        formData.collection || null, collectionOrder,
        formData.status, user.id
      );
    }
    setLoading(false);
    if (result) {
      setSuccess(
        editingPost ? 'Post atualizado!' :
        formData.status === 'draft' ? 'Rascunho salvo!' : 'Post publicado!'
      );
      setTimeout(() => {
        navigate(formData.status === 'draft' ? '/my-posts' : `/post/${result.slug}`);
      }, 1100);
    } else {
      setError('Erro ao salvar post. Tente novamente.');
    }
  }

  if (authLoading || pageLoading) {
    return (
      <div className="write-page-outer">
        <p style={{ color: 'var(--color-text-secondary)' }}>Carregando...</p>
      </div>
    );
  }

  const submitLabel =
    loading ? 'Salvando...' :
    editingPost ? 'Atualizar Post' :
    formData.status === 'draft' ? 'Salvar Rascunho' : 'Publicar Post';

  return (
    <div className="write-page-outer">

      <div className="write-header">
        <button className="write-back-btn" onClick={() => navigate(-1)}>← Voltar</button>
        <h1>{editingPost ? 'Editar Post' : 'Novo Post'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="write-form">

        {/* ── COLUNA ESQUERDA ── */}
        <div className="write-sidebar">
          <div className="write-section">
            <h2>Título</h2>
            <div className="write-field">
              <input type="text" className="write-input"
                placeholder="Dê um título ao seu post"
                value={formData.title}
                onChange={(e) => set('title', e.target.value)} required />
            </div>
          </div>

          <div className="write-section">
            <h2>Imagem de Capa</h2>
            <ImageUploader
              onImageUploaded={(url) => set('image', url)}
              currentImage={formData.image} />
          </div>

          <div className="write-section">
            <h2>Detalhes</h2>

            <div className="write-field">
              <label>Tags</label>
              <input type="text" className="write-input"
                placeholder="React, JavaScript..."
                value={formData.tags}
                onChange={(e) => set('tags', e.target.value)} />
              <p className="write-field-hint">Separe por vírgula.</p>
            </div>

            <div className="write-row">
              <div className="write-field">
                <label>Coleção</label>
                <input type="text" className="write-input"
                  placeholder="Nome da série"
                  value={formData.collection}
                  onChange={(e) => set('collection', e.target.value)} />
              </div>
              <div className="write-field">
                <label>Ordem</label>
                <input type="number" className="write-input"
                  placeholder="1" min="1"
                  value={formData.collectionOrder}
                  onChange={(e) => set('collectionOrder', e.target.value)} />
              </div>
            </div>

            <div className="write-field">
              <label>Visibilidade</label>
              <div className="write-status-group">
                {[
                  { value: 'published', label: '✅ Publicar' },
                  { value: 'draft',     label: '📝 Rascunho' },
                ].map((opt) => (
                  <label key={opt.value}
                    className={`write-status-option ${formData.status === opt.value ? 'checked' : ''}`}>
                    <input type="radio" name="status" value={opt.value}
                      checked={formData.status === opt.value}
                      onChange={(e) => set('status', e.target.value)} />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── COLUNA DIREITA ── */}
        <div className="write-editor-col">

          {/* Barra de ações — TOPO da coluna direita */}
          <div className="write-editor-topbar">
            <div className="write-actions">
              <button type="submit" className="write-submit-btn" disabled={loading}>
                {submitLabel}
              </button>
              <button type="button" className="write-cancel-btn"
                onClick={() => navigate('/my-posts')} disabled={loading}>
                Cancelar
              </button>
            </div>
            {error   && <div className="write-error"  >{error}</div>}
            {success && <div className="write-success">{success}</div>}
          </div>

          {/* Editor */}
          <div className="write-section write-section-editor">
            <h2>Conteúdo</h2>
            <MarkdownEditor
              value={formData.content}
              onChange={(val) => set('content', val)}
              placeholder="Escreva seu post aqui..." />
          </div>
        </div>

      </form>
    </div>
  );
}