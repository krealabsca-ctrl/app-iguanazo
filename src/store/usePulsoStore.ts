import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Article } from '@/types';
import { useArticlesStore } from '@/store/useArticlesStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { getGreeting, selectTop5News } from '@/utils/dailyDigest';
import { SpeechQueue, SpeechChunk, splitIntoSentences } from '@/utils/speech';

const PULSO_STORAGE_KEY = 'last5NewsListenedAt';

interface PulsoChunk extends SpeechChunk {
  meta: { articleIndex: number };
}

interface PulsoState {
  showPulsoBar: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  isModalOpen: boolean;
  currentArticleIndex: number;
  topArticles: Article[];
  playbackRate: number;
  lastListenedAt: number | null;
  checkShouldShowBar: () => Promise<void>;
  dismissBar: () => void;
  playPulso: () => void;
  pausePulso: () => void;
  stopPulso: () => void;
  closeModal: () => void;
  openModal: () => void;
  setPlaybackRate: (rate: number) => void;
}

const queue = new SpeechQueue();

function buildChunks(articles: Article[]): PulsoChunk[] {
  const ordinals = ['primera', 'segunda', 'tercera', 'cuarta', 'quinta'];
  const greeting = getGreeting();
  const chunks: PulsoChunk[] = [];
  // Intro con calidez y muletillas venezolanas.
  chunks.push({
    text: `${greeting}, mi gente. Aquí en La Iguana les traemos las cinco noticias más importantes del momento. ¡Pendientes con esto!`,
    meta: { articleIndex: 0 },
  });
  articles.forEach((article, i) => {
    const isLast = i === articles.length - 1 && articles.length > 1;
    const ord = ordinals[i] || `noticia número ${i + 1}`;
    let lead: string;
    if (i === 0) lead = 'Arrancamos con la primera noticia';
    else if (isLast) lead = `Y para cerrar, la ${ord} noticia`;
    else lead = `Seguimos con la ${ord} noticia`;
    chunks.push({ text: `${lead}: ${article.title}.`, meta: { articleIndex: i } });
    splitIntoSentences(article.excerpt).forEach((s) =>
      chunks.push({ text: s, meta: { articleIndex: i } }),
    );
  });
  chunks.push({
    text: 'Y hasta aquí las cinco noticias de hoy. Sigan pendientes con La Iguana, que aquí no se les escapa nada. ¡Un abrazo, cuídense!',
    meta: { articleIndex: Math.max(0, articles.length - 1) },
  });
  return chunks;
}

export const usePulsoStore = create<PulsoState>((set, get) => ({
  showPulsoBar: true,
  isPlaying: false,
  isPaused: false,
  isModalOpen: false,
  currentArticleIndex: 0,
  topArticles: [],
  playbackRate: 1,
  lastListenedAt: null,

  checkShouldShowBar: async () => {
    try {
      const stored = await AsyncStorage.getItem(PULSO_STORAGE_KEY);
      if (stored) set({ lastListenedAt: Number(stored) });
    } catch {}
  },

  dismissBar: () => set({ showPulsoBar: false }),

  playPulso: () => {
    const state = get();
    if (state.isPaused && queue.hasContent) {
      queue.resume();
      set({ isPlaying: true, isPaused: false });
      return;
    }
    if (state.isPlaying) return;

    const wpState = useArticlesStore.getState();
    const source = wpState.articlesAll.length > 0 ? wpState.articlesAll : wpState.articles;
    const topArticles = selectTop5News(source);
    if (topArticles.length === 0) return;

    const trackingOn = useHistoryStore.getState().isTrackingEnabled;
    if (trackingOn) {
      AsyncStorage.setItem(PULSO_STORAGE_KEY, Date.now().toString()).catch(() => {});
    }
    set({
      lastListenedAt: trackingOn ? Date.now() : null,
      topArticles,
      isPlaying: true,
      isPaused: false,
      currentArticleIndex: 0,
    });

    queue.start(buildChunks(topArticles), {
      rate: state.playbackRate,
      onProgress: (chunk) => {
        const idx = (chunk.meta as { articleIndex?: number } | undefined)?.articleIndex;
        if (typeof idx === 'number') set({ currentArticleIndex: idx });
      },
      onComplete: () => set({ isPlaying: false, isPaused: false, currentArticleIndex: 0 }),
      onError: () => set({ isPlaying: false, isPaused: false }),
    });
  },

  pausePulso: () => {
    queue.pause();
    set({ isPlaying: false, isPaused: true });
  },

  stopPulso: () => {
    queue.stop();
    set({ isPlaying: false, isPaused: false, currentArticleIndex: 0 });
  },

  setPlaybackRate: (rate) => {
    set({ playbackRate: rate });
    queue.setRate(rate);
  },

  closeModal: () => set({ isModalOpen: false }),
  openModal: () => {
    const wpState = useArticlesStore.getState();
    const source = wpState.articlesAll.length > 0 ? wpState.articlesAll : wpState.articles;
    set({ isModalOpen: true, topArticles: selectTop5News(source) });
  },
}));
