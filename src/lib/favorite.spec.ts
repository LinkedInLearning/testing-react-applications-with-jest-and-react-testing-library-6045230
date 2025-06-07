import { describe, it, expect, beforeEach, vi } from 'vitest';
import { addFavorite, isFavorite, removeFavorite, getFavorites } from './favorite';

let store: Map<string, string>;
const postWithCounts = {
  id: 1,
  title: 'title',
  commentsCount: 2,
  likesCount: 1,
  isliked: false,
  body: 'body text',
  userId: 1,
}

describe('FavoritesService', () => {

  beforeEach(() => {
    // Clear mock data and function calls before each test
    store = new Map<string, string>();

    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => store.get(key) ?? null),
      setItem: vi.fn((key, value) => store.set(key, value)),
      removeItem: vi.fn((key) => store.delete(key)),
      clear: vi.fn(() => store.clear())
    });

    vi.clearAllMocks();
  });

  it('adds a post to favorites', () => {
    const post = { ...postWithCounts, id: 1, title: 'Test Post' };

    addFavorite(post);

    expect(localStorage.setItem).toHaveBeenCalled();
    expect(isFavorite(1)).toBe(true);
  });

  it('removes a post from favorites', () => {
    // Add a post first
    const post = { ...postWithCounts, id: 1, title: 'Test Post' };
    addFavorite(post);

    // Then remove it
    removeFavorite(1);

    expect(isFavorite(1)).toBe(false);
  });

  it('retrieves all favorite posts', () => {
    const post1 = { ...postWithCounts, id: 1, title: 'Test Post 1', };
    const post2 = { ...postWithCounts, id: 2, title: 'Test Post 2' };


    addFavorite(post1);
    addFavorite(post2);

    const favorites = getFavorites();

    expect(favorites).toHaveLength(2);
    expect(favorites[0].id).toBe(1);
    expect(favorites[1].id).toBe(2);
  });

  it('correctly identifies if a post is favorited', () => {
    const post = { ...postWithCounts, id: 1, title: 'Test Post' };

    expect(isFavorite(1)).toBe(false);

    addFavorite(post);

    expect(isFavorite(1)).toBe(true);
  });

  it('persists favorites to local storage', () => {
    const post = { ...postWithCounts, id: 1, title: 'Test Post' };
    addFavorite(post);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'favorites',
      expect.any(String)
    );

    // Verify the data is in the expected format
    const storedData = JSON.parse(localStorage.getItem('favorites') as string);
    expect(storedData).toEqual({ '1': post });
  });
});