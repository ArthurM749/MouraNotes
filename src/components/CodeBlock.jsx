import { useEffect } from 'react';

// Hook para processar blocos de código no conteúdo Markdown
export function useCodeHighlighting(contentRef) {
  useEffect(() => {
    if (!contentRef.current) return;

    const codeBlocks = contentRef.current.querySelectorAll('pre code');
    
    codeBlocks.forEach((block) => {
      const pre = block.parentElement;
      if (!pre) return;

      // Adicionar wrapper se não existir
      if (!pre.parentElement?.classList.contains('code-block-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
      }

      const wrapper = pre.parentElement;
      
      // Detectar linguagem
      const classes = block.className.split(' ');
      const langClass = classes.find(cls => cls.startsWith('language-'));
      let lang = 'text';
      
      if (langClass) {
        lang = langClass.replace('language-', '');
      }
      
      // Criar header se não existir
      if (!wrapper.querySelector('.code-header')) {
        const header = document.createElement('div');
        header.className = 'code-header';
        
        const langSpan = document.createElement('span');
        langSpan.className = 'code-language';
        langSpan.textContent = lang;
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-code-btn';
        copyBtn.innerHTML = '📋 Copiar';
        copyBtn.title = 'Copiar código';
        
        copyBtn.onclick = async (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          try {
            const code = block.textContent || '';
            await navigator.clipboard.writeText(code);
            copyBtn.innerHTML = '✓ Copiado!';
            copyBtn.style.color = '#4ade80';
            
            setTimeout(() => {
              copyBtn.innerHTML = '📋 Copiar';
              copyBtn.style.color = '';
            }, 2000);
          } catch (err) {
            console.error('Erro ao copiar:', err);
            copyBtn.innerHTML = '✗ Erro';
            setTimeout(() => {
              copyBtn.innerHTML = '📋 Copiar';
            }, 2000);
          }
        };
        
        header.appendChild(langSpan);
        header.appendChild(copyBtn);
        wrapper.insertBefore(header, pre);
      }

      // Adicionar números de linha
      if (!pre.classList.contains('line-numbers-added')) {
        const lines = (block.textContent || '').split('\n').length;
        const lineNumbersDiv = document.createElement('div');
        lineNumbersDiv.className = 'line-numbers-rows';
        
        for (let i = 1; i <= lines; i++) {
          const lineSpan = document.createElement('span');
          lineNumbersDiv.appendChild(lineSpan);
        }
        
        pre.classList.add('line-numbers');
        pre.classList.add('line-numbers-added');
        pre.appendChild(lineNumbersDiv);
      }
    });
  }, [contentRef]);
}