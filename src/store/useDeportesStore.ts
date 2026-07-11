import { create } from 'zustand';
import { Article } from '@/types';
import { fetchArticles } from '@/api/wp';

// Categoría "Deportes y Salud" en el WordPress de laiguana.tv.
// https://www.laiguana.tv/articulos/category/deportes-y-salud/
const DEPORTES_CATEGORY_ID = 118476;
const STALE_MS = 5 * 60 * 1000;

type Status = 'idle' | 'loading' | 'success' | 'error';

interface DeportesState {
  items: Article[];
  status: Status;
  lastFetchedAt: number;
  load: (force?: boolean) => Promise<void>;
}

export const useDeportesStore = create<DeportesState>((set, get) => ({
  items: [],
  status: 'idle',
  lastFetchedAt: 0,
  load: async (force = false) => {
    const { status, items, lastFetchedAt } = get();
    if (status === 'loading') return;
    if (!force && items.length > 0 && Date.now() - lastFetchedAt < STALE_MS) return;
    set({ status: 'loading' });
    try {
      const fetched = await fetchArticles({ categories: [DEPORTES_CATEGORY_ID], perPage: 8 });
      set({ items: fetched, status: 'success', lastFetchedAt: Date.now() });
    } catch {
      set({ status: 'error' });
    }
  },
}));
