import type { LocalStorage } from '../types/blog';

const STORAGE_KEY = 'blog_data';

export function getStorageData(): LocalStorage {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    return { likes: [] };
  }
  return JSON.parse(data);
}

export function setStorageData(data: LocalStorage): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function toggleLike(postId: number): boolean {
  const data = getStorageData();
  const isLiked = data.likes.includes(postId);
  
  if (isLiked) {
    data.likes = data.likes.filter(id => id !== postId);
  } else {
    data.likes.push(postId);
  }
  
  setStorageData(data);
  return !isLiked;
}

export function isPostLiked(postId: number): boolean {
  const data = getStorageData();
  return data.likes.includes(postId);
}