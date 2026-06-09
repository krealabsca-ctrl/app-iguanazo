import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Article } from '@/types';
import { fetchArticles } from '@/api/wp';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface CategoryCacheEntry {
  articles: Article[];
  fetchedAt: number;
}

interface ArticlesState {
  articles: Article[];
  articlesAll: Article[];
  byId: Record<string, Article>;
  categoryId: number | null;
  status: Status;
  error: string | null;
  lastFetchedAt: number | null;
  load: () => Promise<void>;
  setCategory: (id: number | null) => Promise<void>;
  refresh: () => Promise<void>;
  getById: (id: string) => Article | undefined;
}

const STALE_MS = 5 * 60 * 1000;
const cache: Record<string, CategoryCacheEntry> = {};

function keyFor(id: number | null): string {
  return id == null ? 'all' : String(id);
}

function mergeById(existing: Record<string, Article>, articles: Article[]) {
  const next = { ...existing };
  for (const a of articles) next[a.id] = a;
  return next;
}

const MAX_BYID_ENTRIES = 500;

function trimById(map: Record<string, Article>): Record<string, Article> {
  const entries = Object.entries(map);
  if (entries.length <= MAX_BYID_ENTRIES) return map;
  const sorted = entries.sort((a, b) => {
    const ta = new Date(b[1].publishedAt).getTime();
    const tb = new Date(a[1].publishedAt).getTime();
    return ta - tb;
  });
  return Object.fromEntries(sorted.slice(0, MAX_BYID_ENTRIES));
}

export const useArticlesStore = create<ArticlesState>()(
  persist(
    (set, get) => {
  const applyResult = (categoryId: number | null, articles: Article[]) => {
    const state = get();
    const isAll = categoryId == null;
    set({
      articles,
      articlesAll: isAll ? articles : state.articlesAll,
      byId: trimById(mergeById(state.byId, articles)),
      status: 'success',
      error: null,
      lastFetchedAt: Date.now(),
      categoryId,
    });
  };

  const fetchFor = async (categoryId: number | null, force: boolean) => {
    const key = keyFor(categoryId);
    const cached = cache[key];
    if (!force && cached && Date.now() - cached.fetchedAt < STALE_MS) {
      applyResult(categoryId, cached.articles);
      return;
    }
    set({ status: 'loading', error: null, categoryId });
    try {
      const articles = await fetchArticles({
        perPage: 30,
        categories: categoryId ? [categoryId] : undefined,
      });
      cache[key] = { articles, fetchedAt: Date.now() };
      applyResult(categoryId, articles);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      set({ status: 'error', error: message });
    }
  };

  return {
    articles: [],
    articlesAll: [],
    byId: {},
    categoryId: null,
    status: 'idle',
    error: null,
    lastFetchedAt: null,

    load: async () => {
      const state = get();
      if (state.status === 'loading') return;
      await fetchFor(state.categoryId, false);
    },

    setCategory: async (id) => {
      if (get().categoryId === id && get().status === 'success') {
        const cached = cache[keyFor(id)];
        if (cached && Date.now() - cached.fetchedAt < STALE_MS) return;
      }
      await fetchFor(id, false);
    },

    refresh: async () => {
      await fetchFor(get().categoryId, true);
    },

    getById: (id) => get().byId[id] ?? get().articles.find((a) => a.id === id),
  };
    },
    {
      name: 'laiguana-articles-cache',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ byId: state.byId }),
      merge: (persisted, current) => ({
        ...current,
        byId: (persisted as { byId?: Record<string, Article> })?.byId ?? current.byId,
      }),
    },
  ),
);
