import { supabase } from './supabase';

// ── Login ──────────────────────────────────────────────────────────────────

export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro no login com Google:', error);
    return { success: false, error: error.message };
  }
}

export async function signInWithGithub() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro no login com GitHub:', error);
    return { success: false, error: error.message };
  }
}

export async function signUpWithEmail(email, password, username, fullName) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, full_name: fullName },
      },
    });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro no registro:', error);
    return { success: false, error: error.message };
  }
}

export async function signInWithEmail(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro no login:', error);
    return { success: false, error: error.message };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erro no logout:', error);
    return { success: false, error: error.message };
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    return null;
  }
}

export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Erro ao obter sessão:', error);
    return null;
  }
}

export async function resetPassword(email) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    return { success: false, error: error.message };
  }
}

export async function updatePassword(newPassword) {
  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    return { success: false, error: error.message };
  }
}

// ── Perfis ─────────────────────────────────────────────────────────────────

export async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // não lança erro se não encontrar
    if (error) throw error;
    return { success: true, data: data ?? null };
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    return { success: false, error: error.message };
  }
}

export async function getProfileByUsername(username) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .maybeSingle();
    if (error) throw error;
    return { success: !!data, data: data ?? null };
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    return { success: false, error: error.message };
  }
}

export async function updateProfile(userId, updates) {
  try {
    // Remove campos undefined/null para não sobrescrever dados existentes
    const clean = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );

    const { data, error } = await supabase
      .from('profiles')
      .update(clean)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return { success: false, error: error.message };
  }
}

// ── Upload de avatar ───────────────────────────────────────────────────────
// IMPORTANTE: o caminho DEVE começar com `{userId}/` para passar na
// política RLS do Storage: (storage.foldername(name))[1] = auth.uid()::text
export async function uploadAvatar(userId, file) {
  try {
    const fileExt  = file.name.split('.').pop().toLowerCase();
    const fileName = `${Date.now()}.${fileExt}`;
    // Pasta obrigatória = userId (a política do Storage valida isso)
    const filePath = `${userId}/${fileName}`;

    // Remove avatar anterior para não acumular arquivos
    const { data: existing } = await supabase.storage
      .from('avatars')
      .list(userId);

    if (existing && existing.length > 0) {
      const oldPaths = existing.map((f) => `${userId}/${f.name}`);
      await supabase.storage.from('avatars').remove(oldPaths);
    }

    // Faz o upload
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (uploadError) throw uploadError;

    // Obtém URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Atualiza avatar_url no perfil
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);

    if (updateError) throw updateError;

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Erro ao fazer upload de avatar:', error);
    return { success: false, error: error.message };
  }
}

// ── Curtidas ───────────────────────────────────────────────────────────────

export async function likePost(postId, userId) {
  try {
    const { data, error } = await supabase
      .from('likes')
      .insert({ post_id: postId, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao curtir post:', error);
    return { success: false, error: error.message };
  }
}

export async function unlikePost(postId, userId) {
  try {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erro ao descurtir post:', error);
    return { success: false, error: error.message };
  }
}

export async function hasUserLikedPost(postId, userId) {
  try {
    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();
    return !error && data !== null;
  } catch {
    return false;
  }
}

export async function getPostLikes(postId) {
  try {
    const { data, error, count } = await supabase
      .from('likes')
      .select('*, profiles(*)', { count: 'exact' })
      .eq('post_id', postId);
    if (error) throw error;
    return { success: true, likes: data, count };
  } catch (error) {
    console.error('Erro ao obter curtidas:', error);
    return { success: false, error: error.message };
  }
}

// ── Seguir ─────────────────────────────────────────────────────────────────

export async function followUser(followerId, followingId) {
  try {
    const { data, error } = await supabase
      .from('follows')
      .insert({ follower_id: followerId, following_id: followingId })
      .select()
      .single();
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao seguir usuário:', error);
    return { success: false, error: error.message };
  }
}

export async function unfollowUser(followerId, followingId) {
  try {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erro ao deixar de seguir:', error);
    return { success: false, error: error.message };
  }
}

export async function isFollowing(followerId, followingId) {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();
    return !error && data !== null;
  } catch {
    return false;
  }
}

export async function getFollowers(userId) {
  try {
    const { data, error, count } = await supabase
      .from('follows')
      .select('follower_id, profiles!follows_follower_id_fkey(*)', { count: 'exact' })
      .eq('following_id', userId);
    if (error) throw error;
    return { success: true, followers: data, count };
  } catch (error) {
    console.error('Erro ao obter seguidores:', error);
    return { success: false, error: error.message };
  }
}

export async function getFollowing(userId) {
  try {
    const { data, error, count } = await supabase
      .from('follows')
      .select('following_id, profiles!follows_following_id_fkey(*)', { count: 'exact' })
      .eq('follower_id', userId);
    if (error) throw error;
    return { success: true, following: data, count };
  } catch (error) {
    console.error('Erro ao obter seguindo:', error);
    return { success: false, error: error.message };
  }
}

// ── Admin (senha hash) ─────────────────────────────────────────────────────

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data    = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray  = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyAdminPassword(password) {
  try {
    const hashedPassword = await hashPassword(password);
    const { data, error } = await supabase
      .from('admin_config')
      .select('password_hash')
      .eq('id', 1)
      .single();
    if (error) return false;
    return data?.password_hash === hashedPassword;
  } catch {
    return false;
  }
}

export async function updateAdminPassword(currentPassword, newPassword) {
  try {
    const isValid = await verifyAdminPassword(currentPassword);
    if (!isValid) return { success: false, error: 'Senha atual incorreta' };

    const hashedPassword = await hashPassword(newPassword);
    const { error } = await supabase
      .from('admin_config')
      .update({ password_hash: hashedPassword })
      .eq('id', 1);

    if (error) return { success: false, error: 'Erro ao salvar nova senha' };
    return { success: true };
  } catch {
    return { success: false, error: 'Erro ao processar senha' };
  }
}

export async function isPasswordConfigured() {
  try {
    const { data, error } = await supabase
      .from('admin_config')
      .select('password_hash')
      .eq('id', 1)
      .single();
    if (error) return false;
    return !!(data?.password_hash);
  } catch {
    return false;
  }
}