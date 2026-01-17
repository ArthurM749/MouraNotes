import { supabase } from './supabase';

// Inicialização não é necessária com Supabase
export async function initDB() {
  // Supabase inicializa automaticamente
  return true;
}

// Buscar todos os posts
export async function getAllPosts() {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar posts:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    return [];
  }
}

// Buscar post por slug
export async function getPostBySlug(slug) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Post não encontrado
        return null;
      }
      console.error('Erro ao buscar post:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar post:', error);
    return null;
  }
}

// Criar novo post
export async function createPost(title, slug, content, image = null) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          title,
          slug,
          content,
          image: image || null
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar post:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao criar post:', error);
    return null;
  }
}

// Atualizar post
export async function updatePost(id, title, slug, content, image = null) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .update({
        title,
        slug,
        content,
        image: image || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar post:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao atualizar post:', error);
    return null;
  }
}

// Deletar post
export async function deletePost(id) {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar post:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao deletar post:', error);
    return false;
  }
}

// Gerar slug a partir do título
export function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}