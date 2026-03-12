import { Link } from 'react-router-dom';
import './Tag.css';

// Cores harmoniosas em ordem: azul, verde, roxo, laranja, amarelo, vermelho
const TAG_COLORS = [
  '#4A90E2', // Azul
  '#7ED321', // Verde
  '#9013FE', // Roxo
  '#F5A623', // Laranja
  '#F8E71C', // Amarelo
  '#D0021B'  // Vermelho
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

export default function Tag({ name, clickable = true, small = false }) {
  const color = getTagColor(name);
  
  const tagClass = `tag ${small ? 'tag-small' : ''}`;
  
  if (!clickable) {
    return (
      <span className={tagClass} style={{ backgroundColor: color }}>
        {name}
      </span>
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