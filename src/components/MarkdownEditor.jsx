import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import { useEffect, useState } from 'react';
import './MarkdownEditor.css';

export default function MarkdownEditor({ value, onChange, placeholder }) {
  const [mode, setMode] = useState('wysiwyg');
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
      attributes: {
        class: 'notion-editor',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const markdown = htmlToMarkdown(html);
      onChange(markdown);
    },
  });

  const htmlToMarkdown = (html) => {
    let md = html;
    
    md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
    md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
    md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
    md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
    md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
    md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
    md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
    md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
    md = md.replace(/<ul[^>]*>/gi, '');
    md = md.replace(/<\/ul>/gi, '\n');
    md = md.replace(/<ol[^>]*>/gi, '');
    md = md.replace(/<\/ol>/gi, '\n');
    md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
    md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (match, content) => {
      const lines = content.split('\n');
      return lines.map(line => `> ${line.trim()}`).join('\n') + '\n\n';
    });
    md = md.replace(/<pre><code[^>]*>(.*?)<\/code><\/pre>/gis, '```\n$1\n```\n\n');
    md = md.replace(/<hr[^>]*>/gi, '\n---\n\n');
    md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
    md = md.replace(/<[^>]*>/g, '');
    md = md.replace(/&nbsp;/g, ' ');
    md = md.replace(/&amp;/g, '&');
    md = md.replace(/&lt;/g, '<');
    md = md.replace(/&gt;/g, '>');
    md = md.replace(/&quot;/g, '"');
    
    return md.trim();
  };

  const markdownToHtml = (markdown) => {
    let html = markdown;
    
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/^---$/gm, '<hr>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
    html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
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
      const markdown = htmlToMarkdown(editor.getHTML());
      setMarkdownContent(markdown);
    } else {
      const html = markdownToHtml(markdownContent);
      editor.commands.setContent(html);
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
        <div className="mode-buttons">
          <button
            type="button"
            className={`mode-btn ${mode === 'wysiwyg' ? 'active' : ''}`}
            onClick={() => toggleMode('wysiwyg')}
          >
            📝 Visual
          </button>
          <button
            type="button"
            className={`mode-btn ${mode === 'markdown' ? 'active' : ''}`}
            onClick={() => toggleMode('markdown')}
          >
            &lt;/&gt; Markdown
          </button>
        </div>

        {mode === 'wysiwyg' && (
          <div className="editor-toolbar">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'is-active' : ''}
              title="Bold (Ctrl+B)"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'is-active' : ''}
              title="Italic (Ctrl+I)"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={editor.isActive('code') ? 'is-active' : ''}
              title="Code"
            >
              &lt;/&gt;
            </button>
            <span className="toolbar-divider"></span>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
              title="Heading 1"
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
              title="Heading 2"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
              title="Heading 3"
            >
              H3
            </button>
            <span className="toolbar-divider"></span>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive('bulletList') ? 'is-active' : ''}
              title="Lista"
            >
              •
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={editor.isActive('blockquote') ? 'is-active' : ''}
              title="Citação"
            >
              "
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Linha horizontal"
            >
              —
            </button>
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