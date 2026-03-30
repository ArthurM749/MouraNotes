/**
 * renderMath.js
 *
 * Processa fórmulas LaTeX dentro do markdown usando o KaTeX
 * carregado via CDN no index.html (window.katex).
 * Não requer instalação via npm.
 *
 * Sintaxe suportada:
 *   Inline : $E = mc^2$
 *   Bloco  : $$\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$
 */

export function renderWithMath(markdown, markedFn) {
    if (!markdown) return '';
  
    // Se o KaTeX do CDN ainda não carregou, renderiza sem fórmulas
    const katex = window.katex;
    if (!katex) return markedFn(markdown);
  
    const stored = [];
  
    function stash(tex, display) {
      const token = `\x02MATH${stored.length}\x03`;
      stored.push({ tex: tex.trim(), display });
      return token;
    }
  
    // 1. Extrai blocos $$...$$ antes que o marked quebre os símbolos
    let processed = markdown.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) =>
      stash(tex, true)
    );
  
    // 2. Extrai inline $...$
    processed = processed.replace(/\$([^\n$]+?)\$/g, (_, tex) =>
      stash(tex, false)
    );
  
    // 3. Roda o marked no markdown sem fórmulas
    let html = markedFn(processed);
  
    // 4. Restaura as fórmulas com HTML do KaTeX
    html = html.replace(/\x02MATH(\d+)\x03/g, (_, idx) => {
      const { tex, display } = stored[parseInt(idx, 10)];
      try {
        return katex.renderToString(tex, {
          displayMode: display,
          throwOnError: false,
          strict: false,
        });
      } catch {
        return display
          ? `<pre>$$${tex}$$</pre>`
          : `<code>$${tex}$</code>`;
      }
    });
  
    return html;
  }