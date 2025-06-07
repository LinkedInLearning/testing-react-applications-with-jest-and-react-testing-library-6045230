import { PostWithCounts } from "../types/blog";

// Define the shape of favorites data in localStorage
type FavoritesStorage = Record<number, PostWithCounts>;

const addFavorite = (post: PostWithCounts) => {
  const favorites = getFavoritesRaw();
  favorites[post.id] = post;
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

const removeFavorite = (postId: number) => {
  const favorites = getFavoritesRaw();
  delete favorites[postId];
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

const getFavorites = () => {
  const favorites = getFavoritesRaw();
  return Object.values(favorites);
}

// Helper to safely parse localStorage data
const getFavoritesRaw = (): FavoritesStorage => {
  const storedFavorites = localStorage.getItem('favorites');
  try {
    return storedFavorites ? (JSON.parse(storedFavorites)) as FavoritesStorage : {};
  } catch (error) {
    console.error('Failed to parse favorites', error);
    return {};
  }
};

 const isFavorite = (postId: number) => {
  const favorites = getFavoritesRaw();
  return !!favorites[postId];
}

export {addFavorite, removeFavorite, getFavorites, isFavorite}
