import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  fetchChannelPlaylists,
  fetchLiveStreams,
  fetchPlaylistItems,
  isYoutubeConfigured,
  LiveStreamsResult,
  YoutubePlaylist,
  YoutubeVideo,
} from '@/api/youtube';
import { fetchCurrentLive, CurrentLive } from '@/api/youtubeLive';
import { YOUTUBE_CONFIG } from '@/config/youtube';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface YoutubeState {
  configured: boolean;

  liveStatus: Status;
  liveError: string | null;
  liveData: LiveStreamsResult | null;
  liveFetchedAt: number | null;
  currentLive: CurrentLive | null;

  playlistsStatus: Status;
  playlistsError: string | null;
  playlists: YoutubePlaylist[];
  playlistsFetchedAt: number | null;

  itemsByPlaylist: Record<string, YoutubeVideo[]>;
  itemsStatusByPlaylist: Record<string, Status>;
  itemsErrorByPlaylist: Record<string, string | null>;

  loadLive: (force?: boolean) => Promise<void>;
  loadPlaylists: (force?: boolean) => Promise<void>;
  loadPlaylistItems: (playlistId: string, force?: boolean) => Promise<void>;
}

const STALE_MS = 5 * 60 * 1000;

function describeError(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Error desconocido';
}

export const useYoutubeStore = create<YoutubeState>()(
  persist(
    (set, get) => ({
  configured: isYoutubeConfigured(),

  liveStatus: 'idle',
  liveError: null,
  liveData: null,
  liveFetchedAt: null,
  currentLive: null,

  playlistsStatus: 'idle',
  playlistsError: null,
  playlists: [],
  playlistsFetchedAt: null,

  itemsByPlaylist: {},
  itemsStatusByPlaylist: {},
  itemsErrorByPlaylist: {},

  loadLive: async (force = false) => {
    const state = get();
    if (!state.configured) {
      set({ liveStatus: 'error', liveError: 'youtube-not-configured' });
      return;
    }
    if (state.liveStatus === 'loading') return;
    if (
      !force &&
      state.liveStatus === 'success' &&
      state.liveFetchedAt &&
      Date.now() - state.liveFetchedAt < STALE_MS
    ) {
      return;
    }
    set({ liveStatus: 'loading', liveError: null });
    try {
      const [data, scraped] = await Promise.all([
        fetchLiveStreams(),
        fetchCurrentLive(YOUTUBE_CONFIG.channelHandle).catch(() => null),
      ]);
      set({
        liveStatus: 'success',
        liveData: data,
        currentLive: scraped,
        liveFetchedAt: Date.now(),
        liveError: null,
      });
    } catch (err) {
      // API failed — still try the public live scrape as a fallback.
      const scraped = await fetchCurrentLive(YOUTUBE_CONFIG.channelHandle).catch(() => null);
      if (scraped?.videoId) {
        set({
          liveStatus: 'success',
          currentLive: scraped,
          liveFetchedAt: Date.now(),
          liveError: null,
        });
      } else {
        set({ liveStatus: 'error', liveError: describeError(err) });
      }
    }
  },

  loadPlaylists: async (force = false) => {
    const state = get();
    if (!state.configured) {
      set({ playlistsStatus: 'error', playlistsError: 'youtube-not-configured' });
      return;
    }
    if (state.playlistsStatus === 'loading') return;
    if (
      !force &&
      state.playlistsStatus === 'success' &&
      state.playlistsFetchedAt &&
      Date.now() - state.playlistsFetchedAt < STALE_MS
    ) {
      return;
    }
    set({ playlistsStatus: 'loading', playlistsError: null });
    try {
      const playlists = await fetchChannelPlaylists();
      set({
        playlistsStatus: 'success',
        playlists,
        playlistsFetchedAt: Date.now(),
        playlistsError: null,
      });
    } catch (err) {
      set({ playlistsStatus: 'error', playlistsError: describeError(err) });
    }
  },

  loadPlaylistItems: async (playlistId, force = false) => {
    const state = get();
    if (!state.configured) {
      set({
        itemsStatusByPlaylist: { ...state.itemsStatusByPlaylist, [playlistId]: 'error' },
        itemsErrorByPlaylist: {
          ...state.itemsErrorByPlaylist,
          [playlistId]: 'youtube-not-configured',
        },
      });
      return;
    }
    const currentStatus = state.itemsStatusByPlaylist[playlistId];
    if (currentStatus === 'loading') return;
    if (!force && currentStatus === 'success' && state.itemsByPlaylist[playlistId]?.length) return;
    set({
      itemsStatusByPlaylist: { ...state.itemsStatusByPlaylist, [playlistId]: 'loading' },
      itemsErrorByPlaylist: { ...state.itemsErrorByPlaylist, [playlistId]: null },
    });
    try {
      const items = await fetchPlaylistItems(playlistId, 25);
      set((s) => ({
        itemsByPlaylist: { ...s.itemsByPlaylist, [playlistId]: items },
        itemsStatusByPlaylist: { ...s.itemsStatusByPlaylist, [playlistId]: 'success' },
        itemsErrorByPlaylist: { ...s.itemsErrorByPlaylist, [playlistId]: null },
      }));
    } catch (err) {
      set((s) => ({
        itemsStatusByPlaylist: { ...s.itemsStatusByPlaylist, [playlistId]: 'error' },
        itemsErrorByPlaylist: { ...s.itemsErrorByPlaylist, [playlistId]: describeError(err) },
      }));
    }
  },
    }),
    {
      name: 'laiguana-youtube-cache',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        playlists: state.playlists,
        itemsByPlaylist: state.itemsByPlaylist,
      }),
      merge: (persisted, current) => {
        const p = (persisted as Partial<YoutubeState>) || {};
        return {
          ...current,
          playlists: p.playlists ?? current.playlists,
          itemsByPlaylist: p.itemsByPlaylist ?? current.itemsByPlaylist,
        };
      },
    },
  ),
);
