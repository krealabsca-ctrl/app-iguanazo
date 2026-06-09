import { create } from 'zustand';
import { Episode } from '@/types';

interface EpisodePlayerState {
  isVisible: boolean;
  isExpanded: boolean;
  currentEpisode: Episode | null;
  isPlaying: boolean;
  play: (episode: Episode) => void;
  pause: () => void;
  resume: () => void;
  close: () => void;
  expand: () => void;
  minimize: () => void;
  setPlaying: (playing: boolean) => void;
}

export const useEpisodePlayerStore = create<EpisodePlayerState>((set) => ({
  isVisible: false,
  isExpanded: false,
  currentEpisode: null,
  isPlaying: false,
  play: (episode) =>
    set({ isVisible: true, isExpanded: true, currentEpisode: episode, isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),
  close: () => set({ isVisible: false, isExpanded: false, currentEpisode: null, isPlaying: false }),
  expand: () => set({ isExpanded: true }),
  minimize: () => set({ isExpanded: false }),
  setPlaying: (playing) => set({ isPlaying: playing }),
}));
