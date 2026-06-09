import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritesState {
  favorites: string[];
  add: (articleId: string) => void;
  remove: (articleId: string) => void;
  toggleFavorite: (articleId: string) => void;
  isFavorite: (articleId: string) => boolean;
  getAll: () => string[];
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      add: (articleId) =>
        set((state) => ({
          favorites: state.favorites.includes(articleId)
            ? state.favorites
            : [articleId, ...state.favorites],
        })),
      remove: (articleId) =>
        set((state) => ({ favorites: state.favorites.filter((id) => id !== articleId) })),
      toggleFavorite: (articleId) =>
        set((state) => ({
          favorites: state.favorites.includes(articleId)
            ? state.favorites.filter((id) => id !== articleId)
            : [articleId, ...state.favorites],
        })),
      isFavorite: (articleId) => get().favorites.includes(articleId),
      getAll: () => get().favorites,
    }),
    { name: 'laiguana-favorites', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
