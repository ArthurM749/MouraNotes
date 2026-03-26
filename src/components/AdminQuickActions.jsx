/**
 * AdminQuickActions
 * Renderiza uma barra de ações rápidas visível SOMENTE para o admin.
 *
 * Props:
 *   post       – objeto post (obrigatório para ações de post)
 *   onRefresh  – callback para recarregar dados após uma ação
 *
 * Uso em Post.jsx e Home.jsx:
 *   import AdminQuickActions from '../components/AdminQuickActions';
 *   <AdminQuickActions post={post} onRefresh={loadPosts} />
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../AdminContext';
import {
  adminHidePost,
  adminUnhidePost,
  adminDeletePost,
  adminToggleCommentsLock,
  adminSendMessage,
  logAdminAction,
} from '../database.admin';
import { useAuth } from '../AuthContext';
import './AdminQuickActions.css';

function ConfirmBox({ prompt, onConfirm, onCancel }) {
  const [value, setValue] = useState('');
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 99999, padding: '1rem',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'var(--color-bg)', borderRadius: 10, padding: '1.5rem',
          maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p style={{ marginBottom: '1rem', fontWeight: 600 }}>{prompt}</p>
        <textarea
          style={{
            width: '100%', padding: '0.65rem', border: '1px solid var(--color-border)',
            borderRadius: 7, background: 'var(--color-bg)', color: 'var(--color-text)',
            fontSize: '0.9rem', fontFamily: 'var(--font-serif)', resize: 'vertical',
            minHeight: 80, boxSizing: 'border-box', marginBottom: '1rem',
          }}
          placeholder="Motivo (opcional)..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '0.6rem 1.1rem', border: '1px solid var(--color-border)',
              borderRadius: 7, background: 'transparent', cursor: 'pointer',
              color: 'var(--color-text)', fontFamily: 'var(--font-serif)',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(value)}
            style={{
              padding: '0.6rem 1.25rem', border: 'none', borderRadius: 7,
              background: '#dc2626', color: 'white', cursor: 'pointer',
              fontWeight: 600, fontFamily: 'var(--font-serif)',
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminQuickActions({ post, onRefresh }) {
  const { isAdmin } = useAdmin();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(null); // { action, prompt }

  if (!isAdmin || !post) return null;

  async function execute(action, reason = '') {
    setConfirm(null);
    const adminId = user?.id;

    switch (action) {
      case 'hide':
        await adminHidePost(post.id);
        await logAdminAction(adminId, 'post', post.id, 'hide', reason);
        if (reason && post.author_id) {
          await adminSendMessage(post.author_id, 'Post ocultado',
            `Seu post "${post.title}" foi ocultado temporariamente. Motivo: ${reason}`, 'warning');
        }
        break;

      case 'unhide':
        await adminUnhidePost(post.id);
        await logAdminAction(adminId, 'post', post.id, 'unhide');
        break;

      case 'delete':
        await adminDeletePost(post.id);
        if (reason && post.author_id) {
          await adminSendMessage(post.author_id, 'Post removido',
            `Seu post "${post.title}" foi removido. Motivo: ${reason}`, 'delete');
        }
        await logAdminAction(adminId, 'post', post.id, 'delete', reason);
        navigate('/');
        return;

      case 'lock':
        await adminToggleCommentsLock(post.id, !post.comments_locked);
        await logAdminAction(adminId, 'post', post.id, post.comments_locked ? 'unlock_comments' : 'lock_comments');
        break;

      default:
        break;
    }

    onRefresh?.();
  }

  const isHidden = post.status === 'hidden';

  return (
    <>
      <div className="admin-quick-bar">
        <span className="admin-quick-bar-label">👑 Admin</span>

        <a
          href={`/write?edit=${post.id}`}
          className="aq-btn"
        >
          ✏️ Editar
        </a>

        <button
          className="aq-btn warn"
          onClick={() =>
            setConfirm({
              action: isHidden ? 'unhide' : 'hide',
              prompt: isHidden
                ? 'Tornar este post visível novamente?'
                : 'Ocultar este post? Informe o motivo para notificar o autor.',
            })
          }
        >
          {isHidden ? '👁️ Exibir' : '🙈 Ocultar'}
        </button>

        <button
          className="aq-btn"
          onClick={() => execute('lock')}
          title={post.comments_locked ? 'Desbloquear comentários' : 'Travar comentários'}
        >
          {post.comments_locked ? '🔓 Comentários' : '🔒 Comentários'}
        </button>

        <button
          className="aq-btn danger"
          onClick={() =>
            setConfirm({
              action: 'delete',
              prompt: `Excluir "${post.title}"? O autor será notificado. Informe o motivo.`,
            })
          }
        >
          🗑️ Excluir
        </button>
      </div>

      {confirm && (
        <ConfirmBox
          prompt={confirm.prompt}
          onConfirm={(reason) => execute(confirm.action, reason)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
}