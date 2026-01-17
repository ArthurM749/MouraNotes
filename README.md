# Blog Pessoal - Textos Técnicos & Reflexões

Um site pessoal minimalista para publicar textos técnicos e reflexivos, com suporte a Markdown e imagens. Os dados são armazenados no **Supabase** (PostgreSQL na nuvem) - acessíveis de qualquer lugar! ☁️

## 🎯 Características

- ✍️ Editor de posts com suporte a Markdown
- 🖼️ Upload de imagens locais (convertidas para base64)
- 🔒 Área administrativa protegida por senha
- ☁️ **Banco de dados na nuvem (Supabase/PostgreSQL)**
- 🌍 **Dados sincronizados entre dispositivos**
- 📱 Design responsivo e elegante
- 🎨 Tipografia editorial com foco em legibilidade
- 🌙 Modo escuro/claro com alternância suave
- ⚡ Deploy fácil no Vercel
- 🆓 **100% gratuito** (Supabase free tier)
- 🔓 **Sem 2FA obrigatório!**

## 📁 Estrutura do Projeto

```
blog-pessoal/
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Cabeçalho com navegação
│   │   ├── ThemeToggle.jsx     # Botão dark/light mode
│   │   └── *.css
│   ├── pages/
│   │   ├── Home.jsx            # Listagem de posts
│   │   ├── Post.jsx            # Página individual do post
│   │   ├── Admin.jsx           # Área administrativa
│   │   └── *.css
│   ├── supabase.js             # Configuração do Supabase
│   ├── database.js             # Funções de banco de dados
│   ├── App.jsx                 # Componente principal
│   ├── main.jsx                # Entry point
│   └── index.css               # Estilos globais
├── SUPABASE-CONFIG.md          # ⭐ GUIA DE CONFIGURAÇÃO
├── DEPLOY-VERCEL.md            # Guia de deploy
├── DARK-MODE.md                # Sobre modo escuro
├── .env.example                # Template de variáveis
└── README.md                   # Este arquivo
```

## 🚀 Como Executar

### ⚠️ ETAPA 1: Configurar Supabase (OBRIGATÓRIO!)

O projeto usa Supabase para armazenar dados na nuvem. **Sem isso, o site não funcionará!**

**📖 Leia o guia completo:** [SUPABASE-CONFIG.md](./SUPABASE-CONFIG.md)

**Resumo super rápido:**
1. Crie conta no [Supabase](https://supabase.com) (grátis, **sem 2FA obrigatório**!)
2. Crie um novo projeto
3. Crie a tabela `posts` (use o SQL fornecido)
4. Configure políticas de segurança (RLS)
5. Obtenha URL e chave anon
6. Cole em `src/supabase.js`

**Tempo estimado:** 5-10 minutos

### ETAPA 2: Instalar e Executar

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build
```

O site estará disponível em `http://localhost:5173`

## 🔐 Acesso Administrativo

1. Acesse `/admin`
2. Senha padrão: `admin123`
3. **IMPORTANTE**: Altere a senha em `src/pages/Admin.jsx` na linha 6:

```javascript
const ADMIN_PASSWORD = 'sua-senha-segura-aqui';
```

## 📝 Como Usar

### Criar um Post

1. Acesse `/admin` e faça login
2. Preencha o formulário:
   - **Título**: Nome do post
   - **Imagem**: Upload opcional (convertida para base64)
   - **Conteúdo**: Escreva em Markdown
3. Clique em "Publicar Post"
4. **Instantaneamente**, o post fica visível para todos! ✨

### Editar um Post

1. Na área admin, clique no ícone ✏️ ao lado do post
2. Modifique o conteúdo
3. Clique em "Atualizar Post"

### Excluir um Post

1. Na área admin, clique no ícone 🗑️
2. Confirme a exclusão

## 📖 Markdown Suportado

O editor suporta toda a sintaxe Markdown padrão:

```markdown
# Título 1
## Título 2
### Título 3

**Negrito** e *itálico*

- Lista
- De itens

1. Lista
2. Numerada

[Link](https://exemplo.com)

![Imagem](url)

`código inline`

```javascript
// Bloco de código
const exemplo = "código";
```

> Citação
```

Veja mais em: [EXEMPLO-POST.md](./EXEMPLO-POST.md)

## ☁️ Por que Supabase?

### Vantagens

✅ **Open-source** - Você pode hospedar você mesmo  
✅ **PostgreSQL** - Banco de dados relacional poderoso  
✅ **Sem 2FA obrigatório** - Sua escolha!  
✅ **Interface visual linda** - Gerenciar dados é fácil  
✅ **SQL direto** - Faça queries quando quiser  
✅ **Realtime** - Updates instantâneos (se quiser)  
✅ **Storage integrado** - Para uploads de imagens  
✅ **Autenticação** - Se quiser implementar depois  
✅ **Gratuito** - 500MB DB + 1GB storage  

### Limites do Plano Gratuito

- **Database**: 500 MB
- **Storage**: 1 GB
- **Bandwidth**: 2 GB/mês
- **Requests**: Ilimitado (rate limiting justo)

**Perfeito para um blog pessoal!**

## 🎨 Personalização

### Cores e Tipografia

Edite as variáveis CSS em `src/index.css`:

```css
:root {
  --color-bg: #faf8f5;
  --color-text: #1a1a1a;
  --color-accent: #d4512e;
  /* ... */
}

[data-theme="dark"] {
  --color-bg: #1a1a1a;
  --color-text: #e8e6e3;
  --color-accent: #ff6b4a;
  /* ... */
}
```

### Fontes

O projeto usa:
- **Crimson Pro** - Títulos e corpo
- **JetBrains Mono** - Código

Para alterar, modifique em `index.html` e `src/index.css`.

### Nome do Site

Edite em `src/components/Header.jsx`:

```jsx
<span className="logo-text">Seu Nome Aqui</span>
```

## 🌐 Deploy no Vercel

**📖 Guia completo:** [DEPLOY-VERCEL.md](./DEPLOY-VERCEL.md)

**Resumo:**

1. **Configure Supabase** (obrigatório primeiro!)
2. Faça push do código para GitHub
3. Importe no [Vercel](https://vercel.com)
4. Configure variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy! 🚀

**Configuração automática:**
- Framework: Vite ✅
- Build: `npm run build` ✅
- Output: `dist` ✅

## 🔒 Segurança

### Row Level Security (RLS)

O Supabase usa RLS para controlar acesso. Configure em:
**Dashboard > Authentication > Policies**

**Para desenvolvimento:**
```sql
-- Permitir tudo (apenas para testes!)
CREATE POLICY "Allow all" ON posts
FOR ALL TO public
USING (true) WITH CHECK (true);
```

**Para produção (recomendado):**
```sql
-- Leitura pública, escrita protegida
CREATE POLICY "Public read" ON posts
FOR SELECT TO public USING (true);

-- Escrita apenas com autenticação
CREATE POLICY "Auth write" ON posts
FOR ALL TO authenticated
USING (true) WITH CHECK (true);
```

### Variáveis de Ambiente

Crie `.env` na raiz:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave
```

**Nunca commite** `.env` no Git!

## 🛠️ Tecnologias

- **React 18** - Framework UI
- **Vite** - Build tool ultra-rápido
- **React Router** - Roteamento
- **Supabase** - Banco PostgreSQL na nuvem
- **Marked** - Parser de Markdown
- **CSS Variables** - Temas dinâmicos

## 🔍 Gerenciar Posts no Supabase

### Via Interface

1. Abra [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. **Table Editor** > `posts`
4. Veja, edite ou delete posts diretamente!

### Via SQL

No **SQL Editor**, faça queries:

```sql
-- Ver todos
SELECT * FROM posts ORDER BY created_at DESC;

-- Buscar específico
SELECT * FROM posts WHERE slug = 'meu-post';

-- Deletar
DELETE FROM posts WHERE id = 1;
```

## ❓ Troubleshooting

**Posts não aparecem**
- Verifique se configurou o Supabase corretamente
- Abra o console (F12) e veja erros
- Verifique se criou a tabela `posts`

**Erro: "Failed to fetch"**
- URL ou chave incorreta em `src/supabase.js`
- Verifique no Dashboard do Supabase

**Erro: "violates row-level security policy"**
- Configure as políticas RLS (veja SUPABASE-CONFIG.md)

**Build falha no Vercel**
- Configure as variáveis de ambiente
- Verifique se todas as dependências estão no package.json

**Imagem muito grande**
- Imagens base64 consomem ~33% mais espaço
- Use imagens otimizadas (<500KB recomendado)
- Considere Supabase Storage para imagens grandes

## 📈 Próximos Passos (Opcional)

Para um blog mais avançado:

1. **Supabase Auth** - Login real com Google/Email
2. **Supabase Storage** - Upload de imagens na nuvem
3. **Realtime subscriptions** - Updates ao vivo
4. **Full-text search** - Busca nos posts
5. **Analytics** - Rastreamento de visitantes
6. **SEO** - Meta tags, sitemap
7. **PWA** - App instalável

Mas o setup atual já é **totalmente funcional**! 🎉

## 📄 Licença

Projeto de uso pessoal e educacional.

---

**Desenvolvido para portfólio pessoal** 🚀

**Dúvidas?** Leia os arquivos:
- [SUPABASE-CONFIG.md](./SUPABASE-CONFIG.md) - Setup do banco
- [DEPLOY-VERCEL.md](./DEPLOY-VERCEL.md) - Deploy online
- [DARK-MODE.md](./DARK-MODE.md) - Modo escuro
- [EXEMPLO-POST.md](./EXEMPLO-POST.md) - Exemplos Markdown

**Supabase > Firebase** para este projeto! 😎