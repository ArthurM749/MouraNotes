import { supabase } from './supabase';

// ─── POSTS ────────────────────────────────────────────────────────────────────

export async function adminGetAllPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*, profiles(username, full_name, avatar_url)')
    .order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data || [];
}

export async function adminHidePost(id) {
  const { error } = await supabase
    .from('posts')
    .update({ status: 'hidden', updated_at: new Date().toISOString() })
    .eq('id', id);
  return !error;
}

export async function adminUnhidePost(id) {
  const { error } = await supabase
    .from('posts')
    .update({ status: 'published', updated_at: new Date().toISOString() })
    .eq('id', id);
  return !error;
}

export async function adminDeletePost(id) {
  const { error } = await supabase.from('posts').delete().eq('id', id);
  return !error;
}

export async function adminToggleCommentsLock(id, locked) {
  const { error } = await supabase
    .from('posts')
    .update({ comments_locked: locked })
    .eq('id', id);
  return !error;
}

// ─── USERS ────────────────────────────────────────────────────────────────────

export async function adminGetAllUsers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data || [];
}

export async function adminBanUser(userId, reason, until = null) {
  const { error } = await supabase
    .from('profiles')
    .update({
      is_banned: true,
      banned_until: until,
      ban_reason: reason,
    })
    .eq('id', userId);
  if (!error) await adminSendMessage(userId, reason,
    until
      ? `Sua conta foi suspensa até ${new Date(until).toLocaleDateString('pt-BR')}. Motivo: ${reason}`
      : `Sua conta foi banida permanentemente. Motivo: ${reason}`,
    'ban'
  );
  return !error;
}

export async function adminUnbanUser(userId) {
  const { error } = await supabase
    .from('profiles')
    .update({ is_banned: false, banned_until: null, ban_reason: null })
    .eq('id', userId);
  if (!error) await adminSendMessage(userId, 'Sua conta foi reativada.',
    'Sua suspensão foi removida. Bem-vindo de volta!', 'unban');
  return !error;
}

export async function adminSilenceUser(userId, until, reason) {
  const { error } = await supabase
    .from('profiles')
    .update({ silenced_until: until })
    .eq('id', userId);
  if (!error) await adminSendMessage(userId, reason,
    `Você foi silenciado até ${new Date(until).toLocaleDateString('pt-BR')}. Motivo: ${reason}`,
    'silence'
  );
  return !error;
}

export async function adminAddStrike(userId, reason) {
  // Incrementa strikes e verifica limiar automático
  const { data: profile } = await supabase
    .from('profiles')
    .select('strikes')
    .eq('id', userId)
    .single();

  const currentStrikes = (profile?.strikes || 0) + 1;

  const { error } = await supabase
    .from('profiles')
    .update({ strikes: currentStrikes })
    .eq('id', userId);

  await adminSendMessage(userId, reason,
    `Você recebeu um strike (${currentStrikes}/3). Motivo: ${reason}${
      currentStrikes >= 3 ? '\n\nApós 3 strikes, sua conta será suspensa.' : ''
    }`,
    'strike'
  );

  // Strike automático: 3 strikes = ban de 7 dias
  if (currentStrikes >= 3) {
    const until = new Date();
    until.setDate(until.getDate() + 7);
    await adminBanUser(userId, 'Limite de strikes atingido (3/3).', until.toISOString());
  }

  return !error;
}

export async function adminWarnUser(userId, reason) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('warning_count')
    .eq('id', userId)
    .single();

  const count = (profile?.warning_count || 0) + 1;
  const { error } = await supabase
    .from('profiles')
    .update({ warning_count: count })
    .eq('id', userId);

  await adminSendMessage(userId, reason,
    `Você recebeu uma advertência formal (${count}ª). Motivo: ${reason}`,
    'warning'
  );
  return !error;
}

// ─── MENSAGENS ADMIN ──────────────────────────────────────────────────────────

export async function adminSendMessage(userId, title, body, type = 'info') {
  const { error } = await supabase
    .from('admin_messages')
    .insert([{ user_id: userId, title, body, type }]);
  return !error;
}

export async function adminSendGlobalNotification(title, body) {
  // Busca todos os usuários e envia mensagem para cada um
  const { data: users } = await supabase
    .from('profiles')
    .select('id');
  if (!users) return false;

  const messages = users.map((u) => ({
    user_id: u.id,
    title,
    body,
    type: 'global',
  }));

  const { error } = await supabase.from('admin_messages').insert(messages);
  return !error;
}

export async function getAdminMessages(userId) {
  const { data, error } = await supabase
    .from('admin_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return data || [];
}

export async function markMessageRead(id) {
  await supabase.from('admin_messages').update({ read: true }).eq('id', id);
}

// ─── TICKETS ─────────────────────────────────────────────────────────────────

export async function getSupportTickets(status = null) {
  let query = supabase
    .from('support_tickets')
    .select('*, profiles(username, full_name, avatar_url)')
    .order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) return [];
  return data || [];
}

export async function createSupportTicket(userId, subject, message) {
  const { data, error } = await supabase
    .from('support_tickets')
    .insert([{ user_id: userId, subject, message, status: 'open' }])
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function replyTicket(ticketId, adminReply) {
  const { error } = await supabase
    .from('support_tickets')
    .update({ admin_reply: adminReply, status: 'resolved', resolved_at: new Date().toISOString() })
    .eq('id', ticketId);
  return !error;
}

// ─── TAGS ─────────────────────────────────────────────────────────────────────

export async function adminGetTags() {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name');
  if (error) return [];
  return data || [];
}

export async function adminCreateTag(name, color) {
  const { data, error } = await supabase
    .from('tags')
    .insert([{ name: name.trim(), color }])
    .select()
    .single();
  if (error) return null;
  return data;
}

export async function adminDeleteTag(id) {
  const { error } = await supabase.from('tags').delete().eq('id', id);
  return !error;
}

// ─── AUDIT LOG ────────────────────────────────────────────────────────────────

export async function logAdminAction(adminId, targetType, targetId, action, reason = '') {
  await supabase.from('admin_actions').insert([{
    admin_id: adminId,
    target_type: targetType,
    target_id: String(targetId),
    action,
    reason,
  }]);
}

// ─── STATS ────────────────────────────────────────────────────────────────────

export async function adminGetStats() {
  const [posts, users, likes, tickets] = await Promise.all([
    supabase.from('posts').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('likes').select('id', { count: 'exact', head: true }),
    supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open'),
  ]);
  return {
    posts: posts.count || 0,
    users: users.count || 0,
    likes: likes.count || 0,
    openTickets: tickets.count || 0,
  };
}

// ─── LIKED POSTS (para usuário comum) ────────────────────────────────────────

export async function getLikedPosts(userId) {
  const { data, error } = await supabase
    .from('likes')
    .select('post_id, posts(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return (data || []).map((row) => row.posts).filter(Boolean);
}