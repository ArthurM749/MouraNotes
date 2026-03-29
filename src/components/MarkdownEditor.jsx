import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabase';
import './MarkdownEditor.css';
import './ImageUploader.css';

// ── Upload de imagem para Supabase Storage ──────────────────────────────────
async function uploadInlineImage(file) {
  const ext      = file.name.split('.').pop().toLowerCase();
  const fileName = `inline-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const filePath = `posts/${fileName}`;

  const { error } = await supabase.storage
    .from('post-images')
    .upload(filePath, file, { cacheControl: '3600', upsert: false });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('post-images')
    .getPublicUrl(filePath);

  return publicUrl;
}

// ── Botão de imagem com popover ──────────────────────────────────────────────
function ImageToolbarButton({ onInsert }) {
  const [open, setOpen]         = useState(false);
  const [url, setUrl]           = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState('');
  const popoverRef              = useRef(null);
  const fileRef                 = useRef(null);

  // Fecha o popover ao clicar fora
  useEffect(() => {
    if (!open) return;
    function handleOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpen(false);
        setUrl('');
        setError('');
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Selecione uma imagem.'); return; }
    if (file.size > 5 * 1024 * 1024)    { setError('Máximo 5 MB.'); return; }

    setError('');
    setUploading(true);
    try {
      const publicUrl = await uploadInlineImage(file);
      onInsert(publicUrl);
      setOpen(false);
    } catch (err) {
      setError('Erro no upload: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function handleUrlInsert() {
    if (!url.trim()) { setError('Cole uma URL válida.'); return; }
    onInsert(url.trim());
    setUrl('');
    setOpen(false);
  }

  return (
    <div className="img-toolbar-wrap" ref={popoverRef}>
      <button
        type="button"
        className={`img-toolbar-btn ${open ? 'is-active' : ''}`}
        title="Inserir imagem"
        onClick={() => { setOpen(!open); setError(''); setUrl(''); }}
      >
        🖼️
      </button>

      {open && (
        <div className="img-popover">
          <p className="img-popover-title">Inserir imagem</p>

          {/* Upload */}
          <button
            type="button"
            className="img-popover-upload-btn"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? '⏳ Enviando...' : '📁 Upload do computador'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <div className="img-popover-divider"><span>ou cole uma URL</span></div>

          {/* URL */}
          <div className="img-popover-url-row">
            <input
              type="text"
              className="img-popover-input"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlInsert()}
            />
            <button
              type="button"
              className="img-popover-confirm"
              onClick={handleUrlInsert}
            >
              ✓
            </button>
          </div>

          {error && <p className="img-popover-error">{error}</p>}
          <p className="img-popover-hint">PNG, JPG ou WebP · Máx 5 MB</p>
        </div>
      )}
    </div>
  );
}

// ── Editor principal ─────────────────────────────────────────────────────────
export default function MarkdownEditor({ value, onChange, placeholder }) {
  const [mode, setMode]                   = useState('wysiwyg');
  const [markdownContent, setMarkdownContent] = useState(value || '');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || 'Escreva algo incrível...',
      }),
      Typography,
    ],
    content: value || '',
    editorProps: {
      attributes: { class: 'notion-editor' },
    },
    onUpdate: ({ editor }) => {
      const html     = editor.getHTML();
      const markdown = htmlToMarkdown(html);
      onChange(markdown);
    },
  });

  // ── Inserir imagem ──────────────────────────────────────────────────────
  function handleImageInsert(url) {
    if (mode === 'wysiwyg') {
      // Insere como HTML — Tiptap aceita img via insertContent
      editor.chain().focus().insertContent(
        `<img src="${url}" alt="imagem" />`
      ).run();
    } else {
      // Modo markdown: insere na posição do cursor ou no final
      const mdImg    = `\n![imagem](${url})\n`;
      const textarea = document.querySelector('.markdown-textarea');
      if (textarea) {
        const start  = textarea.selectionStart;
        const end    = textarea.selectionEnd;
        const before = markdownContent.slice(0, start);
        const after  = markdownContent.slice(end);
        const newMd  = before + mdImg + after;
        setMarkdownContent(newMd);
        onChange(newMd);
      } else {
        const newMd = markdownContent + mdImg;
        setMarkdownContent(newMd);
        onChange(newMd);
      }
    }
  }

  // ── Conversões HTML ↔ Markdown ──────────────────────────────────────────
  const htmlToMarkdown = (html) => {
    let md = html;
    md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi,  '# $1\n\n');
    md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi,  '## $1\n\n');
    md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi,  '### $1\n\n');
    md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
    md = md.replace(/<b[^>]*>(.*?)<\/b>/gi,    '**$1**');
    md = md.replace(/<em[^>]*>(.*?)<\/em>/gi,  '*$1*');
    md = md.replace(/<i[^>]*>(.*?)<\/i>/gi,    '*$1*');
    md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
    // Imagens inline
    md = md.replace(/<img[^>]+src="([^"]+)"[^>]*(?:alt="([^"]*)")?[^>]*\/?>/gi,
      (_, src, alt) => `![${alt || 'imagem'}](${src})\n`);
    md = md.replace(/<ul[^>]*>/gi,  '');
    md = md.replace(/<\/ul>/gi,     '\n');
    md = md.replace(/<ol[^>]*>/gi,  '');
    md = md.replace(/<\/ol>/gi,     '\n');
    md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
    md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (_, content) => {
      return content.split('\n').map(l => `> ${l.trim()}`).join('\n') + '\n\n';
    });
    md = md.replace(/<pre><code[^>]*>(.*?)<\/code><\/pre>/gis, '```\n$1\n```\n\n');
    md = md.replace(/<hr[^>]*>/gi, '\n---\n\n');
    md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
    md = md.replace(/<[^>]*>/g,   '');
    md = md.replace(/&nbsp;/g,    ' ');
    md = md.replace(/&amp;/g,     '&');
    md = md.replace(/&lt;/g,      '<');
    md = md.replace(/&gt;/g,      '>');
    md = md.replace(/&quot;/g,    '"');
    return md.trim();
  };

  const markdownToHtml = (markdown) => {
    let html = markdown;
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    html = html.replace(/^### (.*$)/gim,     '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim,      '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim,       '<h1>$1</h1>');
    html = html.replace(/^---$/gm,           '<hr>');
    html = html.replace(/\*\*(.*?)\*\*/g,    '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g,        '<em>$1</em>');
    html = html.replace(/`(.*?)`/g,          '<code>$1</code>');
    // Imagens markdown → HTML
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
      '<img src="$2" alt="$1" />');
    html = html.replace(/^> (.*$)/gim,       '<blockquote>$1</blockquote>');
    html = html.replace(/^\- (.*$)/gim,      '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    const lines = html.split('\n');
    html = lines.map(line => {
      line = line.trim();
      if (!line) return '';
      if (line.startsWith('<')) return line;
      return `<p>${line}</p>`;
    }).join('');
    return html;
  };

  useEffect(() => {
    if (editor && value !== htmlToMarkdown(editor.getHTML())) {
      editor.commands.setContent(markdownToHtml(value || ''));
    }
  }, [value]);

  const toggleMode = (newMode) => {
    if (newMode === 'markdown') {
      setMarkdownContent(htmlToMarkdown(editor.getHTML()));
    } else {
      editor.commands.setContent(markdownToHtml(markdownContent));
    }
    setMode(newMode);
  };

  const handleMarkdownChange = (e) => {
    const markdown = e.target.value;
    setMarkdownContent(markdown);
    onChange(markdown);
  };

  if (!editor) {
    return <div className="tiptap-wrapper loading">Carregando editor...</div>;
  }

  return (
    <div className="tiptap-wrapper">
      <div className="editor-mode-bar">
        {/* Seletor de modo */}
        <div className="mode-buttons">
          <button type="button"
            className={`mode-btn ${mode === 'wysiwyg' ? 'active' : ''}`}
            onClick={() => toggleMode('wysiwyg')}>
            📝 Visual
          </button>
          <button type="button"
            className={`mode-btn ${mode === 'markdown' ? 'active' : ''}`}
            onClick={() => toggleMode('markdown')}>
            &lt;/&gt; Markdown
          </button>
        </div>

        {/* Toolbar de formatação (apenas no modo visual) */}
        {mode === 'wysiwyg' && (
          <div className="editor-toolbar">
            <button type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'is-active' : ''}
              title="Negrito (Ctrl+B)">
              <strong>B</strong>
            </button>
            <button type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'is-active' : ''}
              title="Itálico (Ctrl+I)">
              <em>I</em>
            </button>
            <button type="button"
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={editor.isActive('code') ? 'is-active' : ''}
              title="Código inline">
              &lt;/&gt;
            </button>

            <span className="toolbar-divider" />

            <button type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
              title="Título 1">H1</button>
            <button type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
              title="Título 2">H2</button>
            <button type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
              title="Título 3">H3</button>

            <span className="toolbar-divider" />

            <button type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive('bulletList') ? 'is-active' : ''}
              title="Lista">•</button>
            <button type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={editor.isActive('blockquote') ? 'is-active' : ''}
              title="Citação">"</button>
            <button type="button"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Linha horizontal">—</button>

            <span className="toolbar-divider" />

            {/* Botão de imagem */}
            <ImageToolbarButton onInsert={handleImageInsert} />
          </div>
        )}

        {/* No modo markdown, o botão de imagem fica ao lado dos modos */}
        {mode === 'markdown' && (
          <div className="editor-toolbar">
            <ImageToolbarButton onInsert={handleImageInsert} />
          </div>
        )}
      </div>

      {mode === 'wysiwyg' && (
        <EditorContent editor={editor} className="tiptap-editor" />
      )}

      {mode === 'markdown' && (
        <textarea
          value={markdownContent}
          onChange={handleMarkdownChange}
          className="markdown-textarea"
          placeholder={placeholder || 'Digite em Markdown...'}
          rows={20}
        />
      )}
    </div>
  );
}