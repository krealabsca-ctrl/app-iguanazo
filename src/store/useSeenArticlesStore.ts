import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SeenArticlesState {
  seen: Record<string, true>;
  initialized: boolean;
  markSeen: (ids: string[]) => void;
  initializeWith: (ids: string[]) => void;
  reset: () => void;
}

export const useSeenArticlesStore = create<SeenArticlesState>()(
  persist(
    (set) => ({
      seen: {},
      initialized: false,
      markSeen: (ids) =>
        set((state) => {
          if (ids.length === 0) return state;
          const next = { ...state.seen };
          let changed = false;
          for (const id of ids) {
            if (!next[id]) {
              next[id] = true;
              changed = true;
            }
          }
          return changed ? { seen: next } : state;
        }),
      initializeWith: (ids) =>
        set(() => {
          const seen: Record<string, true> = {};
          for (const id of ids) seen[id] = true;
          return { seen, initialized: true };
        }),
      reset: () => set({ seen: {}, initialized: false }),
    }),
    {
      name: 'laiguana-seen-articles',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
