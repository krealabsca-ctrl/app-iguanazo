import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useHistoryStore } from '@/store/useHistoryStore';

interface EpisodeProgressState {
  progress: Record<string, number>;
  completed: Record<string, boolean>;
  setProgress: (episodeId: string, seconds: number) => void;
  getProgress: (episodeId: string) => number;
  markComplete: (episodeId: string) => void;
  isComplete: (episodeId: string) => boolean;
  clearAll: () => void;
}

const isTrackingOn = () => useHistoryStore.getState().isTrackingEnabled;

export const useEpisodeProgressStore = create<EpisodeProgressState>()(
  persist(
    (set, get) => ({
      progress: {},
      completed: {},
      setProgress: (episodeId, seconds) => {
        if (!isTrackingOn()) return;
        set((state) => ({ progress: { ...state.progress, [episodeId]: seconds } }));
      },
      getProgress: (episodeId) => get().progress[episodeId] || 0,
      markComplete: (episodeId) => {
        if (!isTrackingOn()) return;
        set((state) => ({ completed: { ...state.completed, [episodeId]: true } }));
      },
      isComplete: (episodeId) => Boolean(get().completed[episodeId]),
      clearAll: () => set({ progress: {}, completed: {} }),
    }),
    { name: 'laiguana-episode-progress', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
