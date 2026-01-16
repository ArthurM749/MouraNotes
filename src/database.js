const DB_NAME = 'blog-database';

function getDatabase() {
  const data = localStorage.getItem(DB_NAME);
  if (!data) {
    return { posts: [], nextId: 1 };
  }
  return JSON.parse(data);
}

function saveDatabase(db) {
  localStorage.setItem(DB_NAME, JSON.stringify(db));
}

export async function initDB() {
  // Garantir que o banco existe
  if (!localStorage.getItem(DB_NAME)) {
    saveDatabase({ posts: [], nextId: 1 });
  }
  return true;
}

export function getAllPosts() {
  const db = getDatabase();
  return db.posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function getPostBySlug(slug) {
  const db = getDatabase();
  return db.posts.find(post => post.slug === slug) || null;
}

export function createPost(title, slug, content, image = null) {
  const db = getDatabase();
  
  // Verificar se slug já existe
  if (db.posts.some(post => post.slug === slug)) {
    throw new Error('Já existe um post com este título (slug duplicado)');
  }
  
  const newPost = {
    id: db.nextId,
    title,
    slug,
    content,
    image,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  db.posts.push(newPost);
  db.nextId += 1;
  saveDatabase(db);
  
  return newPost;
}

export function updatePost(id, title, slug, content, image = null) {
  const db = getDatabase();
  const index = db.posts.findIndex(post => post.id === id);
  
  if (index === -1) {
    throw new Error('Post não encontrado');
  }
  
  // Verificar se o novo slug já existe em outro post
  const existingPost = db.posts.find(post => post.slug === slug && post.id !== id);
  if (existingPost) {
    throw new Error('Já existe outro post com este título (slug duplicado)');
  }
  
  db.posts[index] = {
    ...db.posts[index],
    title,
    slug,
    content,
    image,
    updated_at: new Date().toISOString()
  };
  
  saveDatabase(db);
  return db.posts[index];
}

export function deletePost(id) {
  const db = getDatabase();
  db.posts = db.posts.filter(post => post.id !== id);
  saveDatabase(db);
}

export function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}