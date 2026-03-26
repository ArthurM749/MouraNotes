import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '../AdminContext';
import { useAuth } from '../AuthContext';
import {
  adminGetAllPosts, adminHidePost, adminUnhidePost, adminDeletePost, adminToggleCommentsLock,
  adminGetAllUsers, adminBanUser, adminUnbanUser, adminSilenceUser, adminAddStrike, adminWarnUser,
  adminGetTags, adminCreateTag, adminDeleteTag,
  adminSendMessage, adminSendGlobalNotification,
  getSupportTickets, replyTicket,
  adminGetStats, logAdminAction,
} from '../database.admin';
import Tag from '../components/Tag';
import './AdminDashboard.css';

// ─── MODAL GENÉRICO ──────────────────────────────────────────────────────────
function ConfirmModal({ title, description, fields = [], onConfirm, onCancel, danger = false }) {
  const [values, setValues] = useState(
    Object.fromEntries(fields.map((f) => [f.key, f.default || '']))
  );
  return (
    <div className="admin-modal-overlay" onClick={onCancel}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {description && <p>{description}</p>}
        {fields.map((f) =>
          f.type === 'textarea' ? (
            <textarea
              key={f.key}
              placeholder={f.placeholder || f.label}
              value={values[f.key]}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              required={f.required}
            />
          ) : (
            <input
              key={f.key}
              type={f.type || 'text'}
              placeholder={f.placeholder || f.label}
              value={values[f.key]}
              onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              required={f.required}
            />
          )
        )}
        <div className="admin-modal-actions">
          <button className="modal-cancel-btn" onClick={onCancel}>Cancelar</button>
          <button
            className={`modal-confirm-btn ${danger ? 'danger' : ''}`}
            onClick={() => onConfirm(values)}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TAB: POSTS ──────────────────────────────────────────────────────────────
function PostsTab({ adminId }) {
  const [posts, setPosts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(q ? posts.filter((p) => p.title.toLowerCase().includes(q)) : posts);
  }, [search, posts]);

  async function load() {
    const data = await adminGetAllPosts();
    setPosts(data);
    setFiltered(data);
  }

  function openModal(type, post) { setModal({ type, post }); }
  function closeModal() { setModal(null); }

  async function handleHide(post) {
    const isHidden = post.status === 'hidden';
    await (isHidden ? adminUnhidePost(post.id) : adminHidePost(post.id));
    await logAdminAction(adminId, 'post', post.id, isHidden ? 'unhide' : 'hide');
    load();
  }

  async function handleDelete({ reason }) {
    const { post } = modal;
    await adminDeletePost(post.id);
    if (reason && post.author_id) {
      await adminSendMessage(post.author_id, 'Post removido',
        `Seu post "${post.title}" foi removido. Motivo: ${reason}`, 'delete');
    }
    await logAdminAction(adminId, 'post', post.id, 'delete', reason);
    closeModal();
    load();
  }

  async function handleLockComments(post) {
    await adminToggleCommentsLock(post.id, !post.comments_locked);
    await logAdminAction(adminId, 'post', post.id, post.comments_locked ? 'unlock_comments' : 'lock_comments');
    load();
  }

  const statusColor = { published: 'badge-green', draft: 'badge-yellow', hidden: 'badge-red' };
  const statusLabel = { published: 'Publicado', draft: 'Rascunho', hidden: 'Oculto' };

  return (
    <>
      <div className="admin-search-bar">
        <span>🔍</span>
        <input
          placeholder="Buscar posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Post</th>
              <th>Autor</th>
              <th>Status</th>
              <th>Visualizações</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((post) => (
              <tr key={post.id}>
                <td>
                  <div className="cell-title">
                    <a href={`/post/${post.slug}`} target="_blank" rel="noreferrer">
                      {post.title}
                    </a>
                    <div className="cell-meta">
                      {new Date(post.created_at).toLocaleDateString('pt-BR')}
                      {post.comments_locked && ' · 🔒 comentários bloqueados'}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="cell-meta">
                    {post.profiles?.username || '—'}
                  </div>
                </td>
                <td>
                  <span className={`badge ${statusColor[post.status] || 'badge-gray'}`}>
                    {statusLabel[post.status] || post.status}
                  </span>
                </td>
                <td>{post.views || 0}</td>
                <td>
                  <div className="action-group">
                    <a
                      href={`/write?edit=${post.id}`}
                      className="tbl-btn"
                    >
                      ✏️ Editar
                    </a>
                    <button
                      className="tbl-btn warn"
                      onClick={() => handleHide(post)}
                    >
                      {post.status === 'hidden' ? '👁️ Exibir' : '🙈 Ocultar'}
                    </button>
                    <button
                      className="tbl-btn"
                      onClick={() => handleLockComments(post)}
                    >
                      {post.comments_locked ? '🔓' : '🔒'} Comentários
                    </button>
                    <button
                      className="tbl-btn danger"
                      onClick={() => openModal('delete', post)}
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal?.type === 'delete' && (
        <ConfirmModal
          title={`Excluir "${modal.post.title}"?`}
          description="Informe o motivo (opcional). O autor será notificado."
          fields={[{ key: 'reason', type: 'textarea', placeholder: 'Motivo da exclusão...', label: 'Motivo' }]}
          onConfirm={handleDelete}
          onCancel={closeModal}
          danger
        />
      )}
    </>
  );
}

// ─── TAB: USUÁRIOS ────────────────────────────────────────────────────────────
function UsersTab({ adminId }) {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q
        ? users.filter((u) =>
            u.username?.toLowerCase().includes(q) ||
            u.full_name?.toLowerCase().includes(q)
          )
        : users
    );
  }, [search, users]);

  async function load() {
    const data = await adminGetAllUsers();
    setUsers(data);
    setFiltered(data);
  }

  function openModal(type, user) { setModal({ type, user }); }
  function closeModal() { setModal(null); load(); }

  async function handleBan({ reason, until }) {
    const u = modal.user;
    await adminBanUser(u.id, reason, until || null);
    await logAdminAction(adminId, 'user', u.id, 'ban', reason);
    closeModal();
  }

  async function handleUnban() {
    const u = modal.user;
    await adminUnbanUser(u.id);
    await logAdminAction(adminId, 'user', u.id, 'unban');
    closeModal();
  }

  async function handleSilence({ reason, until }) {
    const u = modal.user;
    await adminSilenceUser(u.id, until, reason);
    await logAdminAction(adminId, 'user', u.id, 'silence', reason);
    closeModal();
  }

  async function handleStrike({ reason }) {
    const u = modal.user;
    await adminAddStrike(u.id, reason);
    await logAdminAction(adminId, 'user', u.id, 'strike', reason);
    closeModal();
  }

  async function handleWarn({ reason }) {
    const u = modal.user;
    await adminWarnUser(u.id, reason);
    await logAdminAction(adminId, 'user', u.id, 'warn', reason);
    closeModal();
  }

  async function handleMessage({ message }) {
    const u = modal.user;
    await adminSendMessage(u.id, 'Mensagem da administração', message, 'info');
    closeModal();
  }

  const avatar = (u) =>
    u.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || u.username || 'U')}&background=d4512e&color=fff&size=64`;

  return (
    <>
      <div className="admin-search-bar">
        <span>🔍</span>
        <input
          placeholder="Buscar usuários..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Status</th>
              <th>Strikes</th>
              <th>Advertências</th>
              <th>Membro desde</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="cell-user">
                    <img src={avatar(u)} alt={u.username} className="cell-user-avatar" />
                    <div>
                      <div className="cell-user-name">{u.full_name || u.username}</div>
                      <div className="cell-user-sub">@{u.username}</div>
                    </div>
                  </div>
                </td>
                <td>
                  {u.is_banned ? (
                    <span className="badge badge-red">Banido</span>
                  ) : u.silenced_until && new Date(u.silenced_until) > new Date() ? (
                    <span className="badge badge-yellow">Silenciado</span>
                  ) : (
                    <span className="badge badge-green">Ativo</span>
                  )}
                </td>
                <td>
                  <span className={`badge ${u.strikes >= 3 ? 'badge-red' : u.strikes > 0 ? 'badge-yellow' : 'badge-gray'}`}>
                    {u.strikes || 0}/3
                  </span>
                </td>
                <td>{u.warning_count || 0}</td>
                <td>
                  <span style={{ fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>
                    {new Date(u.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </td>
                <td>
                  <div className="action-group">
                    <button className="tbl-btn" onClick={() => openModal('message', u)}>
                      💬 Mensagem
                    </button>
                    <button className="tbl-btn warn" onClick={() => openModal('warn', u)}>
                      ⚠️ Advertir
                    </button>
                    <button className="tbl-btn warn" onClick={() => openModal('strike', u)}>
                      🎯 Strike
                    </button>
                    <button className="tbl-btn" onClick={() => openModal('silence', u)}>
                      🔇 Silenciar
                    </button>
                    {u.is_banned ? (
                      <button className="tbl-btn success" onClick={() => openModal('unban', u)}>
                        ✅ Desbanir
                      </button>
                    ) : (
                      <button className="tbl-btn danger" onClick={() => openModal('ban', u)}>
                        🚫 Banir
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modais de usuário */}
      {modal?.type === 'ban' && (
        <ConfirmModal
          title={`Banir @${modal.user.username}?`}
          description="O usuário será notificado com o motivo."
          fields={[
            { key: 'reason', type: 'textarea', placeholder: 'Motivo do ban...', label: 'Motivo', required: true },
            { key: 'until', type: 'date', label: 'Banido até (vazio = permanente)' },
          ]}
          onConfirm={handleBan}
          onCancel={closeModal}
          danger
        />
      )}
      {modal?.type === 'unban' && (
        <ConfirmModal
          title={`Desbanir @${modal.user.username}?`}
          onConfirm={handleUnban}
          onCancel={closeModal}
        />
      )}
      {modal?.type === 'silence' && (
        <ConfirmModal
          title={`Silenciar @${modal.user.username}`}
          fields={[
            { key: 'reason', type: 'textarea', placeholder: 'Motivo...', label: 'Motivo', required: true },
            { key: 'until', type: 'date', label: 'Silenciado até', required: true },
          ]}
          onConfirm={handleSilence}
          onCancel={closeModal}
        />
      )}
      {modal?.type === 'strike' && (
        <ConfirmModal
          title={`Aplicar strike em @${modal.user.username}`}
          description="3 strikes resultam em banimento automático de 7 dias."
          fields={[{ key: 'reason', type: 'textarea', placeholder: 'Motivo do strike...', required: true }]}
          onConfirm={handleStrike}
          onCancel={closeModal}
        />
      )}
      {modal?.type === 'warn' && (
        <ConfirmModal
          title={`Advertir @${modal.user.username}`}
          fields={[{ key: 'reason', type: 'textarea', placeholder: 'Motivo da advertência...', required: true }]}
          onConfirm={handleWarn}
          onCancel={closeModal}
        />
      )}
      {modal?.type === 'message' && (
        <ConfirmModal
          title={`Mensagem para @${modal.user.username}`}
          fields={[{ key: 'message', type: 'textarea', placeholder: 'Escreva sua mensagem...', required: true }]}
          onConfirm={handleMessage}
          onCancel={closeModal}
        />
      )}
    </>
  );
}

// ─── TAB: TAGS ────────────────────────────────────────────────────────────────
function TagsTab() {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [newColor, setNewColor] = useState('#A8D5E2');

  useEffect(() => { load(); }, []);

  async function load() {
    const data = await adminGetTags();
    setTags(data);
  }

  async function handleAdd() {
    if (!newTag.trim()) return;
    await adminCreateTag(newTag.trim(), newColor);
    setNewTag('');
    load();
  }

  async function handleDelete(id) {
    if (confirm('Remover esta tag?')) {
      await adminDeleteTag(id);
      load();
    }
  }

  return (
    <>
      <h3 style={{ marginBottom: '1rem' }}>Tags da plataforma</h3>
      <div className="tags-manage-grid">
        {tags.length === 0 && (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Nenhuma tag cadastrada ainda.
          </p>
        )}
        {tags.map((tag) => (
          <div key={tag.id} className="tag-manage-item">
            <span
              style={{
                display: 'inline-block',
                padding: '0.3rem 0.7rem',
                borderRadius: '5px',
                backgroundColor: tag.color || '#e5e7eb',
                fontSize: '0.8125rem',
                fontWeight: 600,
              }}
            >
              {tag.name}
            </span>
            <button
              className="tag-delete-btn"
              onClick={() => handleDelete(tag.id)}
              title="Remover"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="tag-create-form">
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.35rem', color: 'var(--color-text-secondary)' }}>
            Nova tag
          </label>
          <input
            type="text"
            className="tag-input"
            placeholder="Nome da tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.35rem', color: 'var(--color-text-secondary)' }}>
            Cor
          </label>
          <input
            type="color"
            className="tag-color-input"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
          />
        </div>
        <button className="tag-add-btn" onClick={handleAdd}>
          + Adicionar
        </button>
      </div>
    </>
  );
}

// ─── TAB: MENSAGENS ───────────────────────────────────────────────────────────
function MessagesTab() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ target: 'global', userId: '', title: '', body: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    const { adminGetAllUsers: fn } = await import('../database.admin');
    const data = await fn();
    setUsers(data);
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;
    setSending(true);

    if (form.target === 'global') {
      await adminSendGlobalNotification(form.title, form.body);
    } else {
      await adminSendMessage(form.userId, form.title, form.body, 'info');
    }

    setSent(true);
    setForm({ target: 'global', userId: '', title: '', body: '' });
    setSending(false);
    setTimeout(() => setSent(false), 3000);
  }

  const avatar = (u) =>
    u.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username || 'U')}&background=d4512e&color=fff&size=40`;

  return (
    <div>
      <div className="message-compose">
        <h3>📣 Enviar Notificação</h3>
        <form onSubmit={handleSend}>
          <div className="message-field">
            <label>Destinatário</label>
            <select
              className="message-select"
              value={form.target}
              onChange={(e) => setForm({ ...form, target: e.target.value, userId: '' })}
            >
              <option value="global">🌍 Todos os usuários</option>
              <option value="user">👤 Usuário específico</option>
            </select>
          </div>

          {form.target === 'user' && (
            <div className="message-field">
              <label>Selecionar usuário</label>
              <select
                className="message-select"
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                required
              >
                <option value="">— Escolha um usuário —</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    @{u.username}{u.full_name ? ` · ${u.full_name}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="message-field">
            <label>Título</label>
            <input
              type="text"
              className="message-input"
              placeholder="Assunto da mensagem"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          <div className="message-field">
            <label>Mensagem</label>
            <textarea
              className="message-textarea"
              placeholder="Escreva a mensagem..."
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              required
            />
          </div>

          {sent && (
            <p style={{ color: '#15803d', marginBottom: '1rem', fontSize: '0.9rem' }}>
              ✅ Mensagem enviada com sucesso!
            </p>
          )}

          <button type="submit" className="message-send-btn" disabled={sending}>
            {sending ? 'Enviando...' : '📤 Enviar'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── TAB: TICKETS ─────────────────────────────────────────────────────────────
function TicketsTab() {
  const [tickets, setTickets] = useState([]);
  const [replies, setReplies] = useState({});
  const [filter, setFilter] = useState('open');

  useEffect(() => { load(); }, [filter]);

  async function load() {
    const data = await getSupportTickets(filter || null);
    setTickets(data);
  }

  async function handleReply(ticket) {
    const reply = replies[ticket.id];
    if (!reply?.trim()) return;
    await replyTicket(ticket.id, reply);
    setReplies({ ...replies, [ticket.id]: '' });
    load();
  }

  const statusBadge = { open: 'badge-blue', resolved: 'badge-green' };

  return (
    <>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { val: 'open', label: '📬 Abertos' },
          { val: 'resolved', label: '✅ Resolvidos' },
          { val: '', label: '📋 Todos' },
        ].map((opt) => (
          <button
            key={opt.val}
            className={`tbl-btn ${filter === opt.val ? 'success' : ''}`}
            onClick={() => setFilter(opt.val)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {tickets.length === 0 ? (
        <p style={{ color: 'var(--color-text-secondary)' }}>Nenhum ticket encontrado.</p>
      ) : (
        tickets.map((t) => (
          <div key={t.id} className="ticket-item">
            <div className="ticket-header">
              <h4 className="ticket-subject">{t.subject}</h4>
              <span className={`badge ${statusBadge[t.status] || 'badge-gray'}`}>
                {t.status === 'open' ? 'Aberto' : 'Resolvido'}
              </span>
            </div>
            <div className="ticket-meta">
              @{t.profiles?.username || '?'} ·{' '}
              {new Date(t.created_at).toLocaleDateString('pt-BR', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </div>
            <p className="ticket-message">{t.message}</p>
            {t.admin_reply && (
              <div style={{ padding: '0.75rem', background: 'var(--color-hover)', borderRadius: '7px', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                <strong>Resposta admin:</strong> {t.admin_reply}
              </div>
            )}
            {t.status === 'open' && (
              <div className="ticket-reply-box">
                <input
                  className="ticket-reply-input"
                  placeholder="Responder e resolver..."
                  value={replies[t.id] || ''}
                  onChange={(e) => setReplies({ ...replies, [t.id]: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleReply(t)}
                />
                <button className="tbl-btn success" onClick={() => handleReply(t)}>
                  ✅ Responder
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { isAdmin } = useAdmin();
  const { user } = useAuth();
  const [tab, setTab] = useState('posts');
  const [stats, setStats] = useState({ posts: 0, users: 0, likes: 0, openTickets: 0 });

  useEffect(() => {
    if (isAdmin) adminGetStats().then(setStats);
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="container">
        <div className="admin-guard">
          <h2>🚫 Acesso restrito</h2>
          <p>Esta área é exclusiva do administrador.</p>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'posts',    label: '📄 Posts'    },
    { id: 'users',    label: '👥 Usuários' },
    { id: 'tags',     label: '🏷️ Tags'    },
    { id: 'messages', label: '📣 Mensagens'},
    { id: 'tickets',  label: '🎫 Suporte'  },
  ];

  const statCards = [
    { icon: '📄', label: 'Posts',       number: stats.posts      },
    { icon: '👥', label: 'Usuários',    number: stats.users      },
    { icon: '❤️', label: 'Curtidas',    number: stats.likes      },
    { icon: '🎫', label: 'Tickets abertos', number: stats.openTickets },
  ];

  return (
    <div className="container">
      <div className="admin-dash">
        <div className="admin-dash-header">
          <h1>⚙️ Painel Admin</h1>
          <span className="admin-badge">👑 Administrador</span>
        </div>

        {/* Stats */}
        <div className="admin-stats">
          {statCards.map((c) => (
            <div key={c.label} className="admin-stat-card">
              <span className="stat-icon">{c.icon}</span>
              <span className="stat-number">{c.number}</span>
              <span className="stat-label">{c.label}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`admin-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'posts'    && <PostsTab    adminId={user?.id} />}
        {tab === 'users'    && <UsersTab    adminId={user?.id} />}
        {tab === 'tags'     && <TagsTab />}
        {tab === 'messages' && <MessagesTab />}
        {tab === 'tickets'  && <TicketsTab />}
      </div>
    </div>
  );
}