import {
  getStorageData,
  setStorageData,
  toggleLike,
  isPostLiked
} from './storage';

import { describe, it, expect, beforeEach, vi } from 'vitest';

const STORAGE_KEY = 'blog_data';
let store: Map<string, string>;
describe('storage utilities', () => {
  beforeEach(() => {
    store = new Map<string, string>();

    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => store.get(key) ?? null),
      setItem: vi.fn((key, value) => store.set(key, value)),
      removeItem: vi.fn((key) => store.delete(key)),
      clear: vi.fn(() => store.clear())
    });
  });

  it('getStorageData returns empty likes when nothing stored', () => {
    const data = getStorageData();
    expect(data).toEqual({ likes: [] });
  });

  it('getStorageData returns parsed likes when stored', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ likes: [1, 2] }));
    const data = getStorageData();
    expect(data).toEqual({ likes: [1, 2] });
  });

  it('setStorageData stores the correct stringified data', () => {
    const data = { likes: [5, 6] };
    setStorageData(data);
    expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(data));
  });

  it('toggleLike adds like when not liked', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ likes: [] }));
    const result = toggleLike(3);
    expect(result).toBe(true);

    const updated = JSON.parse(store.get(STORAGE_KEY)!);
    expect(updated.likes).toContain(3);
  });

  it('toggleLike removes like when already liked', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ likes: [3] }));
    const result = toggleLike(3);
    expect(result).toBe(false);
    const updated = JSON.parse(store.get(STORAGE_KEY)!);
    expect(updated.likes).not.toContain(3);
  });

  it('isPostLiked returns true if liked', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ likes: [99] }));
    expect(isPostLiked(99)).toBe(true);
  });

  it('isPostLiked returns false if not liked', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ likes: [1, 2, 3] }));
    expect(isPostLiked(4)).toBe(false);
  });
});
