import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ReadingListState {
  list: string[];
  add: (articleId: string) => void;
  remove: (articleId: string) => void;
  isInList: (articleId: string) => boolean;
}

export const useReadingListStore = create<ReadingListState>()(
  persist(
    (set, get) => ({
      list: [],
      add: (articleId) =>
        set((state) => ({
          list: state.list.includes(articleId) ? state.list : [...state.list, articleId],
        })),
      remove: (articleId) =>
        set((state) => ({ list: state.list.filter((id) => id !== articleId) })),
      isInList: (articleId) => get().list.includes(articleId),
    }),
    { name: 'laiguana-reading-list', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
