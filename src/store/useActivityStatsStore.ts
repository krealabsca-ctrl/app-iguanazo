import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Diario de actividad. Cuenta artículos leídos y segundos escuchados HOY.
 * Se persiste en AsyncStorage. Cada vez que cambia el día, los contadores
 * se resetean (manteniendo el día anterior para histórico futuro si quiere
 * extenderse).
 */

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

interface ActivityStatsState {
  date: string;
  /** IDs únicos de artículos abiertos hoy (para no contar reaperturas). */
  articleIdsToday: string[];
  /** Total de segundos de audio (TTS / podcast / pulso) escuchados hoy. */
  listenSecondsToday: number;

  recordArticleRead: (articleId: string) => void;
  addListenSeconds: (seconds: number) => void;
  /** Llama esta función antes de leer los contadores para asegurar el día actual. */
  rolloverIfNeeded: () => void;
}

const initial = (): { date: string; articleIdsToday: string[]; listenSecondsToday: number } => ({
  date: todayKey(),
  articleIdsToday: [],
  listenSecondsToday: 0,
});

export const useActivityStatsStore = create<ActivityStatsState>()(
  persist(
    (set, get) => ({
      ...initial(),

      recordArticleRead: (articleId) => {
        get().rolloverIfNeeded();
        const list = get().articleIdsToday;
        if (list.includes(articleId)) return;
        set({ articleIdsToday: [...list, articleId] });
      },

      addListenSeconds: (seconds) => {
        if (seconds <= 0) return;
        get().rolloverIfNeeded();
        set({ listenSecondsToday: get().listenSecondsToday + seconds });
      },

      rolloverIfNeeded: () => {
        const t = todayKey();
        if (get().date !== t) {
          set({ date: t, articleIdsToday: [], listenSecondsToday: 0 });
        }
      },
    }),
    {
      name: 'laiguana-activity-stats',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        date: s.date,
        articleIdsToday: s.articleIdsToday,
        listenSecondsToday: s.listenSecondsToday,
      }),
    },
  ),
);

/**
 * Devuelve el contador de horas/minutos formateado para la UI.
 *   3600 → "1h"
 *   5400 → "1h 30m"
 *   45 segundos → "<1m"
 */
export function formatListenTime(totalSeconds: number): string {
  if (totalSeconds < 60) return '<1m';
  const minutes = Math.floor(totalSeconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remMin = minutes % 60;
  if (remMin === 0) return `${hours}h`;
  return `${hours}h ${remMin}m`;
}
