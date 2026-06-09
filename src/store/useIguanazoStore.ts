import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface IguanazoState {
  savedArticles: string[];
  save: (articleId: string) => void;
  unsave: (articleId: string) => void;
  toggle: (articleId: string) => void;
  isSaved: (articleId: string) => boolean;
  clearAll: () => void;
  getCount: () => number;
}

export const useIguanazoStore = create<IguanazoState>()(
  persist(
    (set, get) => ({
      savedArticles: [],
      save: (articleId) =>
        set((state) => ({
          savedArticles: state.savedArticles.includes(articleId)
            ? state.savedArticles
            : [articleId, ...state.savedArticles],
        })),
      unsave: (articleId) =>
        set((state) => ({ savedArticles: state.savedArticles.filter((id) => id !== articleId) })),
      toggle: (articleId) => {
        if (get().isSaved(articleId)) get().unsave(articleId);
        else get().save(articleId);
      },
      isSaved: (articleId) => get().savedArticles.includes(articleId),
      clearAll: () => set({ savedArticles: [] }),
      getCount: () => get().savedArticles.length,
    }),
    { name: 'iguanazo-saved', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
