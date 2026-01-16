# 🚀 GUIA RÁPIDO - Blog Pessoal

## ⚡ Início Rápido

```bash
cd blog-pessoal
npm install
npm run dev
```

Acesse: `http://localhost:5173`

## 🔐 Primeiro Acesso

1. Vá para `/admin`
2. Senha padrão: `admin123`
3. **ALTERE A SENHA** em `src/pages/Admin.jsx` linha 6

## ✨ Funcionalidades

- ✅ Criar, editar e excluir posts
- ✅ Suporte completo a Markdown
- ✅ Upload de imagens locais
- ✅ Banco de dados SQLite no navegador
- ✅ Design minimalista e responsivo
- ✅ Zero configuração de backend

## 📝 Como Criar um Post

1. Acesse `/admin`
2. Preencha título e conteúdo (em Markdown)
3. (Opcional) Faça upload de uma imagem
4. Clique em "Publicar Post"

## 💡 Dicas Importantes

### Segurança
- Altere a senha padrão em `src/pages/Admin.jsx`
- A autenticação é básica, ideal para uso pessoal

### Armazenamento
- Dados salvos no localStorage do navegador
- Imagens convertidas para base64
- Limite: ~5-10MB (depende do navegador)

### Backup
Para fazer backup dos seus posts:

```javascript
// No console do navegador (F12)
console.log(localStorage.getItem('blog-database'));
// Copie o resultado e salve em um arquivo
```

Para restaurar:

```javascript
localStorage.setItem('blog-database', 'seu-backup-aqui');
```

## 🎨 Personalização

### Cores
Edite `src/index.css`:

```css
:root {
  --color-accent: #d4512e;  /* Cor de destaque */
  --color-bg: #faf8f5;      /* Fundo */
  --color-text: #1a1a1a;    /* Texto */
}
```

### Fontes
Altere em `index.html` e `src/index.css`

### Título do Site
Edite `src/components/Header.jsx`

## 📦 Deploy

### Vercel (Recomendado)
```bash
npm run build
# Faça deploy da pasta dist/
```

### Netlify
- Configure: Build command: `npm run build`
- Output directory: `dist`

## 🐛 Problemas Comuns

**Posts não aparecem após criar**
- Verifique se salvou o post
- Atualize a página

**Erro ao fazer upload de imagem**
- Imagens muito grandes podem exceder o localStorage
- Reduza o tamanho da imagem antes do upload

**Perdi meus dados**
- Os dados ficam no navegador
- Se limpou cache/localStorage, os dados foram perdidos
- Faça backups regulares!

## 📚 Recursos

- [Guia de Markdown](https://www.markdownguide.org/)
- [Documentação React](https://react.dev/)
- Exemplo de post: veja `EXEMPLO-POST.md`

---

**Pronto para começar!** 🎉

Qualquer dúvida, consulte o `README.md` completo.