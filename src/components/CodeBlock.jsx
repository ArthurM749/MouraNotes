import { useEffect, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';
import 'prismjs/plugins/line-numbers/prism-line-numbers';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-markdown';
import './CodeBlock.css';

export default function CodeBlock({ code, language = 'javascript', showLineNumbers = true }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar código:', err);
    }
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-header">
        <span className="code-language">{language}</span>
        <button 
          className="copy-code-btn" 
          onClick={handleCopy}
          title="Copiar código"
        >
          {copied ? '✓ Copiado!' : '📋 Copiar'}
        </button>
      </div>
      <pre className={showLineNumbers ? 'line-numbers' : ''}>
        <code className={`language-${language}`}>
          {code}
        </code>
      </pre>
    </div>
  );
}

// Hook para processar blocos de código no conteúdo Markdown
export function useCodeHighlighting(contentRef) {
  useEffect(() => {
    if (!contentRef.current) return;

    const codeBlocks = contentRef.current.querySelectorAll('pre code');
    
    codeBlocks.forEach((block) => {
      // Adicionar classe line-numbers ao pre
      if (block.parentElement) {
        block.parentElement.classList.add('line-numbers');
      }

      // Detectar linguagem
      const classes = block.className.split(' ');
      const langClass = classes.find(cls => cls.startsWith('language-'));
      
      if (langClass) {
        const lang = langClass.replace('language-', '');
        
        // Criar header com botão de copiar
        if (!block.parentElement.previousElementSibling?.classList.contains('code-header')) {
          const header = document.createElement('div');
          header.className = 'code-header';
          
          const langSpan = document.createElement('span');
          langSpan.className = 'code-language';
          langSpan.textContent = lang;
          
          const copyBtn = document.createElement('button');
          copyBtn.className = 'copy-code-btn';
          copyBtn.textContent = '📋 Copiar';
          copyBtn.title = 'Copiar código';
          copyBtn.onclick = async () => {
            try {
              await navigator.clipboard.writeText(block.textContent || '');
              copyBtn.textContent = '✓ Copiado!';
              setTimeout(() => {
                copyBtn.textContent = '📋 Copiar';
              }, 2000);
            } catch (err) {
              console.error('Erro ao copiar:', err);
            }
          };
          
          header.appendChild(langSpan);
          header.appendChild(copyBtn);
          block.parentElement.parentElement.insertBefore(header, block.parentElement);
        }
      }
    });

    // Aplicar highlight
    Prism.highlightAll();
  }, [contentRef]);
}