# 🚀 GUIA RÁPIDO - Blog Pessoal (com Supabase)

## ⚡ Início em 3 Passos

### 1️⃣ Configurar Supabase (5 minutos)

**Obrigatório!** Os dados ficam na nuvem PostgreSQL.

1. Acesse [supabase.com](https://supabase.com)
2. Crie projeto → Crie tabela `posts` (use o SQL)
3. Copie URL e chave → Cole em `src/supabase.js`

**✨ Sem 2FA obrigatório!**

**📖 Detalhes completos:** [SUPABASE-CONFIG.md](./SUPABASE-CONFIG.md)

**SQL para criar tabela:**
```sql
CREATE TABLE posts (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  image TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Permitir tudo (desenvolvimento)
CREATE POLICY "Allow all" ON posts
FOR ALL TO public
USING (true) WITH CHECK (true);
```

### 2️⃣ Instalar e Rodar

```bash
npm install
npm run dev
```

Acesse: `http://localhost:5173`

### 3️⃣ Alterar Senha

Abra `src/pages/Admin.jsx` linha 6:

```javascript
const ADMIN_PASSWORD = 'sua-senha-forte-aqui';
```

## ✨ Recursos

✅ Posts na nuvem (Supabase PostgreSQL)  
✅ Acessível de qualquer dispositivo  
✅ Markdown + imagens  
✅ Modo escuro/claro  
✅ Design minimalista  
✅ **Sem 2FA obrigatório!**  

## 📝 Uso Rápido

1. `/admin` → Login com senha
2. Criar post → Preencher formulário
3. Publicar → Post aparece instantaneamente!

## 🌐 Deploy no Vercel

```bash
# 1. Push para GitHub
git init
git add .
git commit -m "Blog pessoal"
git push

# 2. Importe no Vercel
# 3. Configure variáveis:
#    VITE_SUPABASE_URL
#    VITE_SUPABASE_ANON_KEY
# 4. Deploy!
```

## 💡 Dicas

**Gerenciar posts:**
- Supabase Dashboard > Table Editor > posts
- Veja, edite, delete diretamente no banco!

**Fazer queries SQL:**
- Supabase > SQL Editor
- Rode queries customizadas

**Backup:**
- Automático pelo Supabase!
- Ou exporte no dashboard

**Imagens:**
- Base64 até 500KB funciona bem
- Para maiores, use Supabase Storage

## 🐛 Problemas?

**Posts não aparecem:**
- Configure Supabase primeiro (passo 1)
- Crie a tabela `posts` com SQL
- Configure políticas RLS
- Veja console (F12) para erros

**Erro de permissão:**
- Execute o SQL de política (passo 1)

**Build falha:**
- `npm install` novamente
- Verifique src/supabase.js

## 📚 Documentação

- [README.md](./README.md) - Completo
- [SUPABASE-CONFIG.md](./SUPABASE-CONFIG.md) - Setup Supabase
- [DEPLOY-VERCEL.md](./DEPLOY-VERCEL.md) - Deploy
- [DARK-MODE.md](./DARK-MODE.md) - Modo escuro
- [EXEMPLO-POST.md](./EXEMPLO-POST.md) - Markdown

---

**Pronto para começar!** 🎉

**Supabase > Firebase** para este caso! 😎  
Sem 2FA forçado + SQL + Open-source = ❤️