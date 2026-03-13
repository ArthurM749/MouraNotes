import { Link } from 'react-router-dom';
import './Tag.css';

// Cores pastéis suaves e confortáveis
const TAG_COLORS = [
  '#A8D5E2', // Azul pastel
  '#B4E7CE', // Verde pastel
  '#DCC6E0', // Roxo pastel
  '#FFD8BE', // Laranja pastel
  '#FFF4A3', // Amarelo pastel
  '#FFB3BA'  // Rosa pastel
];

// Função para obter cor consistente para uma tag
function getTagColor(tagName) {
  // Hash simples para gerar índice consistente
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % TAG_COLORS.length;
  return TAG_COLORS[index];
}

export default function Tag({ name, clickable = true, small = false, onClick }) {
  const color = getTagColor(name);
  
  const tagClass = `tag ${small ? 'tag-small' : ''}`;
  
  if (!clickable) {
    return (
      <span className={tagClass} style={{ backgroundColor: color }}>
        {name}
      </span>
    );
  }

  // Se tem onClick customizado, usar ele
  if (onClick) {
    return (
      <button 
        onClick={() => onClick(name)}
        className={tagClass}
        style={{ backgroundColor: color }}
      >
        {name}
      </button>
    );
  }

  return (
    <Link 
      to={`/?tag=${encodeURIComponent(name)}`} 
      className={tagClass}
      style={{ backgroundColor: color }}
    >
      {name}
    </Link>
  );
}