import { supabase } from './supabase';

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