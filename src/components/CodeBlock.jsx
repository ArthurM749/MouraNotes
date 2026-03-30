import { useEffect } from 'react';
import './CodeBlock.css'; // ← ESSENCIAL: sem isso as cores .hljs-* nunca carregam

export function useCodeHighlighting(contentRef) {
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const codeBlocks = el.querySelectorAll('pre code');

    codeBlocks.forEach((block) => {
      const pre = block.parentElement;
      if (!pre) return;

      // ── 1. Wrapper ───────────────────────────────────────────────
      if (!pre.parentElement?.classList.contains('code-block-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
      }

      const wrapper = pre.parentElement;

      // ── 2. Detectar linguagem ────────────────────────────────────
      const langClass = [...block.classList].find(c => c.startsWith('language-'));
      const lang = langClass ? langClass.replace('language-', '') : 'text';

      // ── 3. Contar linhas ANTES do hljs ──────────────────────────
      // O hljs pode normalizar whitespace ao processar — ler o textContent
      // antes garante a contagem correta das linhas originais.
      const shouldAddNumbers = !pre.classList.contains('line-numbers-added');
      let rawLineCount = 0;
      if (shouldAddNumbers) {
        const parts = (block.textContent || '').split('\n');
        // Remove apenas o último elemento se for string vazia (trailing \n)
        if (parts[parts.length - 1] === '') parts.pop();
        rawLineCount = parts.length;
      }

      // ── 4. Syntax highlighting ───────────────────────────────────
      // hljs v11 grava data-highlighted="yes" — nunca sobrescrever esse valor,
      // pois na próxima chamada o hljs detecta "yes" e aborta silenciosamente.
      if (window.hljs && !block.dataset.highlighted) {
        window.hljs.highlightElement(block);
        // Após chamar, hljs já gravou "yes". Não sobrescrever.
      }

      // ── 5. Header (linguagem + botão copiar) ─────────────────────
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
            await navigator.clipboard.writeText(block.textContent || '');
            copyBtn.innerHTML = '✓ Copiado!';
            copyBtn.style.color = '#a3e3a3';
            setTimeout(() => {
              copyBtn.innerHTML = '📋 Copiar';
              copyBtn.style.color = '';
            }, 2000);
          } catch {
            copyBtn.innerHTML = '✗ Erro';
            setTimeout(() => { copyBtn.innerHTML = '📋 Copiar'; }, 2000);
          }
        };

        header.appendChild(langSpan);
        header.appendChild(copyBtn);
        wrapper.insertBefore(header, pre);
      }

      // ── 6. Números de linha ──────────────────────────────────────
      if (shouldAddNumbers) {
        const lineNumbersDiv = document.createElement('div');
        lineNumbersDiv.className = 'line-numbers-rows';
        for (let i = 0; i < rawLineCount; i++) {
          lineNumbersDiv.appendChild(document.createElement('span'));
        }
        pre.classList.add('line-numbers', 'line-numbers-added');
        pre.appendChild(lineNumbersDiv);
      }
    });
  });
}