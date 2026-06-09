import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PULSO_STORAGE_KEY = 'last5NewsListenedAt';

export interface HistoryItem {
  articleId: string;
  openedAt: number;
  readPercentage: number;
}

interface HistoryState {
  history: HistoryItem[];
  isTrackingEnabled: boolean;
  recordOpen: (articleId: string) => void;
  updateReadPercentage: (articleId: string, pct: number) => void;
  clear: () => void;
  setTrackingEnabled: (enabled: boolean) => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      history: [],
      isTrackingEnabled: true,
      setTrackingEnabled: (enabled) => {
        set({ isTrackingEnabled: enabled });
        if (!enabled) {
          get().clear();
          // Wipe related auto-tracked stores so "Off" really means "off".
          import('@/store/useEpisodeProgressStore')
            .then(({ useEpisodeProgressStore }) => useEpisodeProgressStore.getState().clearAll())
            .catch(() => {});
          import('@/store/usePulsoStore')
            .then(({ usePulsoStore }) => usePulsoStore.setState({ lastListenedAt: null }))
            .catch(() => {});
          AsyncStorage.removeItem(PULSO_STORAGE_KEY).catch(() => {});
        }
      },
      recordOpen: (articleId) => {
        if (!get().isTrackingEnabled) return;
        set((state) => {
          const newItem: HistoryItem = { articleId, openedAt: Date.now(), readPercentage: 0 };
          const filtered = state.history.filter((item) => item.articleId !== articleId);
          return { history: [newItem, ...filtered].slice(0, 100) };
        });
      },
      updateReadPercentage: (articleId, pct) => {
        if (!get().isTrackingEnabled) return;
        set((state) => {
          const idx = state.history.findIndex((i) => i.articleId === articleId);
          if (idx === -1) return state;
          const current = state.history[idx];
          if (pct <= current.readPercentage) return state;
          const next = [...state.history];
          next[idx] = { ...current, readPercentage: pct };
          return { history: next };
        });
      },
      clear: () => set({ history: [] }),
    }),
    { name: 'iguanazo-history', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
