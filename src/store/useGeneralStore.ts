import { create } from 'zustand';
import { Article } from '@/types';
import { fetchArticles } from '@/api/wp';

// Categoría "General" en el WordPress de laiguana.tv.
// https://www.laiguana.tv/articulos/category/general/
const GENERAL_CATEGORY_ID = 3;
const STALE_MS = 5 * 60 * 1000;

type Status = 'idle' | 'loading' | 'success' | 'error';

interface GeneralState {
  items: Article[];
  status: Status;
  lastFetchedAt: number;
  load: (force?: boolean) => Promise<void>;
}

export const useGeneralStore = create<GeneralState>((set, get) => ({
  items: [],
  status: 'idle',
  lastFetchedAt: 0,
  load: async (force = false) => {
    const { status, items, lastFetchedAt } = get();
    if (status === 'loading') return;
    if (!force && items.length > 0 && Date.now() - lastFetchedAt < STALE_MS) return;
    set({ status: 'loading' });
    try {
      const fetched = await fetchArticles({ categories: [GENERAL_CATEGORY_ID], perPage: 12 });
      set({ items: fetched, status: 'success', lastFetchedAt: Date.now() });
    } catch {
      set({ status: 'error' });
    }
  },
}));
