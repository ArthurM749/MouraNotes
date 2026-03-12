import { useState } from 'react';
import './ShareDropdown.css';

export default function ShareDropdown({ url, title }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = encodeURIComponent(url || window.location.href);
  const shareTitle = encodeURIComponent(title || document.title);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url || window.location.href);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 1500);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const shareLinks = [
    {
      name: 'Twitter',
      icon: '𝕏',
      url: `https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`,
      color: '#000000'
    },
    {
      name: 'LinkedIn',
      icon: 'in',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
      color: '#0A66C2'
    },
    {
      name: 'WhatsApp',
      icon: '📱',
      url: `https://wa.me/?text=${shareTitle}%20${shareUrl}`,
      color: '#25D366'
    }
  ];

  return (
    <div className="share-dropdown">
      <button
        className="share-trigger"
        onClick={() => setIsOpen(!isOpen)}
        title="Compartilhar"
        aria-label="Compartilhar post"
      >
        ⋮
      </button>

      {isOpen && (
        <>
          <div className="share-overlay" onClick={() => setIsOpen(false)} />
          <div className="share-menu">
            <div className="share-menu-header">Compartilhar</div>
            
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="share-menu-item"
                onClick={() => setIsOpen(false)}
              >
                <span className="share-menu-icon">{link.icon}</span>
                <span className="share-menu-text">{link.name}</span>
              </a>
            ))}

            <button
              onClick={handleCopyLink}
              className="share-menu-item"
            >
              <span className="share-menu-icon">{copied ? '✓' : '🔗'}</span>
              <span className="share-menu-text">{copied ? 'Link copiado!' : 'Copiar link'}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}