import { create } from 'zustand';

interface LivePlayerState {
  /** True while the live stream player has a valid videoId loaded on the live tab. */
  isActive: boolean;
  /** The live YouTube videoId currently playing (or null). */
  videoId: string | null;
  /** The current live program title to show in the floating mini player. */
  title: string;
  /** Thumbnail to render in the mini player when minimized. */
  thumbnailUrl: string | null;
  /** When true, the user explicitly dismissed the floating mini player. */
  isDismissed: boolean;

  setLive: (info: { videoId: string | null; title: string; thumbnailUrl: string | null }) => void;
  clear: () => void;
  dismiss: () => void;
  restore: () => void;
}

export const useLivePlayerStore = create<LivePlayerState>((set) => ({
  isActive: false,
  videoId: null,
  title: '',
  thumbnailUrl: null,
  isDismissed: false,

  setLive: ({ videoId, title, thumbnailUrl }) =>
    set({
      isActive: Boolean(videoId),
      videoId: videoId || null,
      title: title || '',
      thumbnailUrl: thumbnailUrl || null,
      // Reset the dismissed flag whenever a new live source comes in.
      isDismissed: false,
    }),
  clear: () => set({ isActive: false, videoId: null, title: '', thumbnailUrl: null }),
  dismiss: () => set({ isDismissed: true }),
  restore: () => set({ isDismissed: false }),
}));
