import { supabase } from './supabase';

// ================================================
// AUTENTICAÇÃO COM SUPABASE AUTH
// ================================================

// Login com Google
export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro no login com Google:', error);
    return { success: false, error: error.message };
  }
}

// Login com GitHub
export async function signInWithGithub() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin
      }
    });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro no login com GitHub:', error);
    return { success: false, error: error.message };
  }
}

// Registro com Email e Senha
export async function signUpWithEmail(email, password, username, fullName) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName,
        }
      }
    });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro no registro:', error);
    return { success: false, error: error.message };
  }
}

// Login com Email e Senha
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

// Logout
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

// Obter usuário atual
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

// Obter sessão atual
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

// Resetar senha (enviar email)
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

// Atualizar senha do usuário logado
export async function updatePassword(newPassword) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    return { success: false, error: error.message };
  }
}

// ================================================
// PERFIS
// ================================================

// Obter perfil do usuário
export async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    return { success: false, error: error.message };
  }
}

// Obter perfil por username
export async function getProfileByUsername(username) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    return { success: false, error: error.message };
  }
}

// Atualizar perfil
export async function updateProfile(userId, updates) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
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

// Upload de avatar
export async function uploadAvatar(userId, file) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload do arquivo
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Atualizar perfil com nova URL
    await updateProfile(userId, { avatar_url: publicUrl });

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Erro ao fazer upload de avatar:', error);
    return { success: false, error: error.message };
  }
}

// ================================================
// CURTIDAS
// ================================================

// Curtir post
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

// Descurtir post
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

// Verificar se usuário curtiu post
export async function hasUserLikedPost(postId, userId) {
  try {
    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();
    
    return !error && data !== null;
  } catch (error) {
    return false;
  }
}

// Obter curtidas de um post
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

// ================================================
// SEGUIR
// ================================================

// Seguir usuário
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

// Deixar de seguir usuário
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

// Verificar se usuário segue outro
export async function isFollowing(followerId, followingId) {
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();
    
    return !error && data !== null;
  } catch (error) {
    return false;
  }
}

// Obter seguidores de um usuário
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

// Obter quem o usuário segue
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

// ================================================
// FUNÇÕES ANTIGAS DO ADMIN (MANTIDAS)
// ================================================

// Hash de senha usando SHA-256 (Web Crypto API)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Verificar senha do admin
export async function verifyAdminPassword(password) {
  try {
    const hashedPassword = await hashPassword(password);
    
    const { data, error } = await supabase
      .from('admin_config')
      .select('password_hash')
      .eq('id', 1)
      .single();

    if (error) {
      console.error('Erro ao verificar senha:', error);
      return false;
    }

    return data && data.password_hash === hashedPassword;
  } catch (error) {
    console.error('Erro ao verificar senha:', error);
    return false;
  }
}

// Atualizar senha do admin
export async function updateAdminPassword(currentPassword, newPassword) {
  try {
    // Verificar senha atual
    const isValid = await verifyAdminPassword(currentPassword);
    if (!isValid) {
      return { success: false, error: 'Senha atual incorreta' };
    }

    // Criar hash da nova senha
    const hashedPassword = await hashPassword(newPassword);

    // Atualizar no banco
    const { error } = await supabase
      .from('admin_config')
      .update({ password_hash: hashedPassword })
      .eq('id', 1);

    if (error) {
      console.error('Erro ao atualizar senha:', error);
      return { success: false, error: 'Erro ao salvar nova senha' };
    }

    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    return { success: false, error: 'Erro ao processar senha' };
  }
}

// Verificar se senha já está configurada
export async function isPasswordConfigured() {
  try {
    const { data, error } = await supabase
      .from('admin_config')
      .select('password_hash')
      .eq('id', 1)
      .single();

    if (error) {
      return false;
    }

    return data && data.password_hash;
  } catch (error) {
    console.error('Erro ao verificar configuração:', error);
    return false;
  }
}