import { useState } from 'react';
import './ShareButtons.css';

export default function ShareButtons({ url, title, position = 'start' }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = encodeURIComponent(url || window.location.href);
  const shareTitle = encodeURIComponent(title || document.title);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url || window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
    <div className={`share-buttons share-${position}`}>
      <div className="share-label">Compartilhar</div>
      
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="share-btn"
          aria-label={`Compartilhar no ${link.name}`}
          title={link.name}
          style={{ '--share-color': link.color }}
        >
          <span className="share-icon">{link.icon}</span>
        </a>
      ))}

      <button
        onClick={handleCopyLink}
        className="share-btn"
        aria-label="Copiar link"
        title={copied ? 'Link copiado!' : 'Copiar link'}
        style={{ '--share-color': '#6c6c6c' }}
      >
        <span className="share-icon">{copied ? '✓' : '🔗'}</span>
      </button>

      {copied && <div className="copy-tooltip">Link copiado!</div>}
    </div>
  );
}