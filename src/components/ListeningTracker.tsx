import { useEffect, useRef } from 'react';

import { usePlayerStore } from '@/store/usePlayerStore';
import { useEpisodePlayerStore } from '@/store/useEpisodePlayerStore';
import { usePulsoStore } from '@/store/usePulsoStore';
import { useActivityStatsStore } from '@/store/useActivityStatsStore';

/**
 * Mount this once at the root layout. Every second it checks whether any of
 * the three audio players (TTS articles, podcast episode, pulso) is playing,
 * and if so, increments the daily listening counter by 1 second.
 *
 * Headless: renders nothing.
 */
export function ListeningTracker(): null {
  const ttsPlaying = usePlayerStore((s) => s.isPlaying);
  const podcastPlaying = useEpisodePlayerStore((s) => s.isPlaying);
  const pulsoPlaying = usePulsoStore((s) => s.isPlaying);
  const addListenSeconds = useActivityStatsStore((s) => s.addListenSeconds);

  // Refs so the interval callback always sees the latest values without
  // having to re-create the timer on every play/pause.
  const anyPlayingRef = useRef(false);
  anyPlayingRef.current = Boolean(ttsPlaying || podcastPlaying || pulsoPlaying);

  useEffect(() => {
    const id = setInterval(() => {
      if (anyPlayingRef.current) addListenSeconds(1);
    }, 1000);
    return () => clearInterval(id);
  }, [addListenSeconds]);

  return null;
}
