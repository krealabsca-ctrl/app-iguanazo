import { create } from 'zustand';
import { Article } from '@/types';
import { fetchArticles } from '@/api/wp';

// Categoría "Economía e Internacional" en el WordPress de laiguana.tv.
// https://www.laiguana.tv/articulos/category/economia-e-internacional/
const ECONOMIA_CATEGORY_ID = 56773;
const STALE_MS = 5 * 60 * 1000;

type Status = 'idle' | 'loading' | 'success' | 'error';

interface EconomiaState {
  items: Article[];
  status: Status;
  lastFetchedAt: number;
  load: (force?: boolean) => Promise<void>;
}

export const useEconomiaStore = create<EconomiaState>((set, get) => ({
  items: [],
  status: 'idle',
  lastFetchedAt: 0,
  load: async (force = false) => {
    const { status, items, lastFetchedAt } = get();
    if (status === 'loading') return;
    if (!force && items.length > 0 && Date.now() - lastFetchedAt < STALE_MS) return;
    set({ status: 'loading' });
    try {
      const fetched = await fetchArticles({ categories: [ECONOMIA_CATEGORY_ID], perPage: 8 });
      set({ items: fetched, status: 'success', lastFetchedAt: Date.now() });
    } catch {
      set({ status: 'error' });
    }
  },
}));
