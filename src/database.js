import { supabase } from './supabase';

// ================================================
// INICIALIZAÇÃO
// ================================================

export async function initDB() {
  return true;
}

// ================================================
// POSTS
// ================================================

// Buscar todos os posts (só publicados por padrão)
export async function getAllPosts(includesDrafts = false) {
  try {
    let query = supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!includesDrafts) {
      query = query.eq('status', 'published');
    }

    const { data, error } = await query;

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

// Buscar posts de um autor específico
export async function getPostsByAuthor(authorId, includesDrafts = false) {
  try {
    let query = supabase
      .from('posts')
      .select('*')
      .eq('author_id', authorId)
      .order('created_at', { ascending: false });

    if (!includesDrafts) {
      query = query.eq('status', 'published');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar posts do autor:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar posts do autor:', error);
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
      if (error.code === 'PGRST116') return null;
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
export async function createPost(
  title,
  slug,
  content,
  image = null,
  tags = [],
  collection = null,
  collectionOrder = null,
  status = 'published',
  authorId = null
) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          title,
          slug,
          content,
          image: image || null,
          tags: tags || [],
          collection: collection || null,
          collection_order: collectionOrder || null,
          status: status || 'published',
          author_id: authorId || null,
          views: 0,
        },
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
export async function updatePost(
  id,
  title,
  slug,
  content,
  image = null,
  tags = [],
  collection = null,
  collectionOrder = null,
  status = 'published'
) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .update({
        title,
        slug,
        content,
        image: image || null,
        tags: tags || [],
        collection: collection || null,
        collection_order: collectionOrder || null,
        status: status || 'published',
        updated_at: new Date().toISOString(),
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

// Buscar posts por tag
export async function getPostsByTag(tag) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .contains('tags', [tag])
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar posts por tag:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar posts por tag:', error);
    return [];
  }
}

// Buscar posts de uma coleção
export async function getPostsByCollection(collection) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('collection', collection)
      .eq('status', 'published')
      .order('collection_order', { ascending: true });

    if (error) {
      console.error('Erro ao buscar posts da coleção:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar posts da coleção:', error);
    return [];
  }
}

// Incrementar visualizações
export async function incrementViews(id) {
  try {
    const { error } = await supabase.rpc('increment_views', { post_id: id });

    if (error) {
      console.error('Erro ao incrementar visualizações:', error);
    }
  } catch (error) {
    console.error('Erro ao incrementar visualizações:', error);
  }
}

// Buscar posts relacionados (mesmas tags)
export async function getRelatedPosts(postId, tags, limit = 3) {
  try {
    if (!tags || tags.length === 0) return [];

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .neq('id', postId)
      .overlaps('tags', tags)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar posts relacionados:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar posts relacionados:', error);
    return [];
  }
}

// Buscar todas as tags únicas
export async function getAllTags() {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('tags')
      .eq('status', 'published');

    if (error) {
      console.error('Erro ao buscar tags:', error);
      return [];
    }

    const allTags = new Set();
    data.forEach((post) => {
      if (post.tags) {
        post.tags.forEach((tag) => allTags.add(tag));
      }
    });

    return Array.from(allTags).sort();
  } catch (error) {
    console.error('Erro ao buscar tags:', error);
    return [];
  }
}