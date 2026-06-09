import { create } from 'zustand';
import { Article } from '@/types';
import { SpeechQueue, splitIntoSentences } from '@/utils/speech';

interface PlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  isVisible: boolean;
  isFullPlayerOpen: boolean;
  currentArticle: Article | null;
  rate: number;
  play: (article: Article) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  togglePlay: (article: Article) => void;
  toggleFullPlayer: () => void;
  closeMiniPlayer: () => void;
  setLoading: (loading: boolean) => void;
  setRate: (rate: number) => void;
}

const queue = new SpeechQueue();

function chunksForArticle(article: Article) {
  const intro = splitIntoSentences(article.title);
  const body = splitIntoSentences(article.body || article.excerpt);
  return [...intro, ...body].map((text) => ({ text }));
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  isPlaying: false,
  isLoading: false,
  isVisible: false,
  isFullPlayerOpen: false,
  currentArticle: null,
  rate: 1.0,

  play: (article) => {
    set({ currentArticle: article, isPlaying: true, isVisible: true, isFullPlayerOpen: false });
    queue.start(chunksForArticle(article), {
      rate: get().rate,
      onComplete: () => set({ isPlaying: false }),
      onError: () => set({ isPlaying: false }),
    });
  },

  pause: () => {
    queue.pause();
    set({ isPlaying: false });
  },

  resume: () => {
    const art = get().currentArticle;
    if (!art) return;
    if (queue.hasContent) {
      queue.resume();
    } else {
      queue.start(chunksForArticle(art), {
        rate: get().rate,
        onComplete: () => set({ isPlaying: false }),
        onError: () => set({ isPlaying: false }),
      });
    }
    set({ isPlaying: true });
  },

  stop: () => {
    queue.stop();
    set({ currentArticle: null, isPlaying: false, isVisible: false, isFullPlayerOpen: false });
  },

  togglePlay: (article) => {
    const state = get();
    if (state.currentArticle?.id === article.id) {
      if (state.isPlaying) state.pause();
      else state.resume();
    } else {
      state.play(article);
    }
  },

  toggleFullPlayer: () => set((state) => ({ isFullPlayerOpen: !state.isFullPlayerOpen })),
  closeMiniPlayer: () => {
    queue.stop();
    set({ isVisible: false, isPlaying: false, currentArticle: null, isFullPlayerOpen: false });
  },
  setLoading: (loading) => set({ isLoading: loading }),
  setRate: (rate) => {
    set({ rate });
    queue.setRate(rate);
  },
}));
