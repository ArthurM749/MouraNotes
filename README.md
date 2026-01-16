# Blog Pessoal - Textos Técnicos & Reflexões

Um site pessoal minimalista para publicar textos técnicos e reflexivos, com suporte a Markdown e imagens locais. Os dados são armazenados localmente no navegador usando SQLite (via SQL.js).

## 🎯 Características

- ✍️ Editor de posts com suporte a Markdown
- 🖼️ Upload de imagens locais (convertidas para base64)
- 🔒 Área administrativa protegida por senha
- 💾 Banco de dados SQLite local (roda no navegador)
- 📱 Design responsivo e elegante
- 🎨 Tipografia editorial com foco em legibilidade
- ⚡ Sem backend necessário - tudo roda no cliente

## 🚀 Como Executar

### Instalação

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build
```

O site estará disponível em `http://localhost:5173`

## 📁 Estrutura do Projeto

```
blog-pessoal/
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Cabeçalho do site
│   │   └── Header.css
│   ├── pages/
│   │   ├── Home.jsx            # Listagem de posts
│   │   ├── Home.css
│   │   ├── Post.jsx            # Página individual do post
│   │   ├── Post.css
│   │   ├── Admin.jsx           # Área administrativa
│   │   └── Admin.css
│   ├── database.js             # Gerenciamento do SQLite
│   ├── App.jsx                 # Componente principal
│   ├── main.jsx                # Entry point
│   └── index.css               # Estilos globais
├── index.html
├── package.json
└── vite.config.js
```

## 🔐 Acesso Administrativo

1. Acesse `/admin`
2. Senha padrão: `admin123`
3. **IMPORTANTE**: Altere a senha em `src/pages/Admin.jsx` na linha 6:

```javascript
const ADMIN_PASSWORD = 'sua-senha-segura-aqui';
```

## 📝 Como Usar

### Criar um Post

1. Acesse `/admin`
2. Digite a senha
3. Preencha o formulário:
   - **Título**: Nome do post
   - **Imagem**: Upload opcional de imagem (será convertida para base64)
   - **Conteúdo**: Escreva em Markdown
4. Clique em "Publicar Post"

### Editar um Post

1. Na área admin, clique no ícone ✏️ ao lado do post
2. Modifique o conteúdo
3. Clique em "Atualizar Post"

### Excluir um Post

1. Na área admin, clique no ícone 🗑️ ao lado do post
2. Confirme a exclusão

## 📖 Markdown Suportado

O editor suporta toda a sintaxe Markdown padrão:

```markdown
# Título 1
## Título 2
### Título 3

**Negrito** e *itálico*

- Lista não ordenada
- Item 2

1. Lista ordenada
2. Item 2

[Link](https://exemplo.com)

![Imagem](url-da-imagem)

`código inline`

```javascript
// Bloco de código
const exemplo = "código";
```

> Citação em bloco
```

## 💾 Armazenamento de Dados

Os dados são armazenados no **localStorage** do navegador usando SQLite (SQL.js):

- **Banco de dados**: Serializado como JSON no localStorage
- **Imagens**: Convertidas para base64 e armazenadas junto aos posts
- **Persistência**: Os dados permanecem mesmo após fechar o navegador

### Backup dos Dados

Para fazer backup, você pode:

1. Abrir o console do navegador (F12)
2. Executar:
```javascript
console.log(localStorage.getItem('blog-database'));
```
3. Copiar e salvar o output em um arquivo `.json`

### Restaurar Dados

```javascript
localStorage.setItem('blog-database', 'conteudo-do-backup');
```

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
```

### Fontes

O projeto usa:
- **Crimson Pro** para títulos e corpo do texto
- **JetBrains Mono** para código

Para alterar, modifique o import no `index.html` e as variáveis CSS.

## 🌐 Deploy

### Vercel / Netlify

1. Faça push do projeto para um repositório Git
2. Conecte no Vercel ou Netlify
3. Configure:
   - Build command: `npm run build`
   - Output directory: `dist`

### GitHub Pages

```bash
npm run build
# Deploy a pasta dist/
```

## ⚠️ Limitações

- **Armazenamento local**: Limitado pelo localStorage do navegador (~5-10MB)
- **Sem sincronização**: Dados ficam apenas no dispositivo local
- **Imagens grandes**: Podem consumir muito espaço quando convertidas para base64
- **Backup manual**: Não há backup automático, você precisa exportar manualmente

## 🛠️ Tecnologias

- React 18
- Vite
- React Router
- SQL.js (SQLite compilado para JavaScript)
- Marked (parser de Markdown)

## 📄 Licença

Projeto de uso pessoal e educacional.

---

**Desenvolvido para portfólio pessoal** 🚀