import { useState, useEffect } from 'react';
import { isFavorite as isFavoritePost, removeFavorite, addFavorite } from '../lib/favorite';
import { PostWithCounts } from '../types/blog';
import { Heart } from 'lucide-react';
import styled from 'styled-components';

const StatButton = styled.button<{ isFavorite?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.isFavorite ? '#ef4444' : '#6b7280'};
  background: ${props => props.isFavorite ? 'rgba(239, 68, 68, 0.1)' : 'transparent'};
  border: none;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.isFavorite ? 'rgba(239, 68, 68, 0.2)' : '#f3f4f6'};
    transform: translateY(-1px);
  }

  svg {
    transition: transform 0.2s;
  }

  &:hover svg {
    transform: scale(1.1);
  }
`;

export default function FavoriteButton({ post }: {post: PostWithCounts}) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setIsFavorite(isFavoritePost(post.id));
  }, [post.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isFavorite) {
      removeFavorite(post.id);
    } else {
      addFavorite(post);
    }
    setIsFavorite(!isFavorite);
  };

  return (
    <StatButton
      onClick={toggleFavorite}
      isFavorite={isFavorite} 
    >
      <Heart size={16}/>
    </StatButton>
  );
}