import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import FavoriteButton from './FavoriteButton';
import { isFavorite, removeFavorite, addFavorite } from '../lib/favorite';
import userEvent from '@testing-library/user-event';

// Mock the FavoritesService
vi.mock('../lib/favorite', () => ({
    isFavorite: vi.fn(),
    addFavorite: vi.fn(),
    removeFavorite: vi.fn()
}));

const postWithCounts = {
  id: 1,
  title: 'title',
  commentsCount: 2,
  likesCount: 1,
  isliked: false,
    body: 'body text',
    userId: 1,
  }

describe('FavoriteButton', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders correctly with initial state (not favorited)', () => {
    (isFavorite as Mock).mockReturnValue(false);
    
    render(<FavoriteButton post={postWithCounts} />);
    
    expect(isFavorite).toHaveBeenCalledWith(postWithCounts.id);
  });
  
  it('renders correctly when post is already favorited', () => {
    (isFavorite as Mock).mockReturnValue(true);
    
    render(<FavoriteButton post={postWithCounts} />);
    
    expect(isFavorite).toHaveBeenCalledWith(postWithCounts.id);
  });
  
  it('toggles favorite status when clicked (add to favorites)', async () => {
    const user = userEvent.setup();
    (isFavorite as Mock).mockReturnValue(false);
    
    render(<FavoriteButton post={postWithCounts} />);
    await user.click(screen.getByRole('button'));
    
    expect(addFavorite).toHaveBeenCalledWith(postWithCounts);
  });
  
  it('toggles favorite status when clicked (remove from favorites)', async() => {
    const user = userEvent.setup();
    (isFavorite as Mock).mockReturnValue(true);
    
    render(<FavoriteButton post={postWithCounts} />);
    await user.click(screen.getByRole('button'));
    
    expect(removeFavorite).toHaveBeenCalledWith(postWithCounts.id);
  });
});
