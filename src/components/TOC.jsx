import { useState, useEffect } from 'react';
import './TOC.css';

export default function TOC({ content }) {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    // Extrair headings do conteúdo HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    const headingElements = tempDiv.querySelectorAll('h2, h3');
    const headingsData = Array.from(headingElements).map((heading, index) => {
      const id = `heading-${index}`;
      const level = heading.tagName.toLowerCase();
      const text = heading.textContent;
      
      return { id, level, text };
    });

    setHeadings(headingsData);

    // Adicionar IDs aos headings reais na página
    setTimeout(() => {
      const realHeadings = document.querySelectorAll('.post-body h2, .post-body h3');
      realHeadings.forEach((heading, index) => {
        heading.id = `heading-${index}`;
      });
    }, 100);
  }, [content]);

  useEffect(() => {
    // Observar quais headings estão visíveis
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -80% 0px'
      }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      headings.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [headings]);

  const scrollToHeading = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className="toc-sidebar">
      <div className="toc-content">
        <h4 className="toc-title">📑 Índice</h4>
        <ul className="toc-list">
          {headings.map(({ id, level, text }) => (
            <li
              key={id}
              className={`toc-item toc-${level} ${activeId === id ? 'active' : ''}`}
            >
              <button
                onClick={() => scrollToHeading(id)}
                className="toc-link"
              >
                {text}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}