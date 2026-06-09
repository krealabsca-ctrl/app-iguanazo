import { YOUTUBE_CONFIG, isYoutubeConfigured } from '@/config/youtube';

const BASE = 'https://www.googleapis.com/youtube/v3';

export type LiveStatus = 'live' | 'upcoming' | 'completed' | 'none';

export interface YoutubeVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  channelTitle: string;
  videoUrl: string;
  embedUrl: string;
  liveStatus: LiveStatus;
  durationSeconds?: number;
  scheduledStartTime?: string;
}

export interface YoutubePlaylist {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  itemCount: number;
  publishedAt: string;
}

interface ChannelInfo {
  channelId: string;
  uploadsPlaylistId: string;
  title: string;
  thumbnailUrl: string;
}

let cachedChannel: ChannelInfo | null = null;
let channelPromise: Promise<ChannelInfo> | null = null;

class YoutubeConfigError extends Error {
  constructor() {
    super('Configurá EXPO_PUBLIC_YOUTUBE_API_KEY en .env y reiniciá Metro.');
    this.name = 'YoutubeConfigError';
  }
}

function ensureKey() {
  if (!isYoutubeConfigured()) throw new YoutubeConfigError();
}

async function ytFetch<T>(path: string, params: Record<string, string>): Promise<T> {
  ensureKey();
  const usp = new URLSearchParams({ ...params, key: YOUTUBE_CONFIG.apiKey });
  const res = await fetch(`${BASE}/${path}?${usp.toString()}`);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`YouTube ${path} ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

export async function resolveChannel(): Promise<ChannelInfo> {
  if (cachedChannel) return cachedChannel;
  if (channelPromise) return channelPromise;
  channelPromise = (async () => {
    const data = await ytFetch<any>('channels', {
      part: 'contentDetails,snippet',
      forHandle: `@${YOUTUBE_CONFIG.channelHandle}`,
    });
    const item = data.items?.[0];
    if (!item) throw new Error(`Canal @${YOUTUBE_CONFIG.channelHandle} no encontrado`);
    const info: ChannelInfo = {
      channelId: item.id,
      uploadsPlaylistId: item.contentDetails.relatedPlaylists.uploads,
      title: item.snippet.title,
      thumbnailUrl:
        item.snippet.thumbnails?.high?.url ||
        item.snippet.thumbnails?.medium?.url ||
        item.snippet.thumbnails?.default?.url ||
        '',
    };
    cachedChannel = info;
    return info;
  })();
  try {
    return await channelPromise;
  } finally {
    channelPromise = null;
  }
}

function pickThumb(thumbs: Record<string, { url: string }> | undefined): string {
  if (!thumbs) return '';
  return (
    thumbs.maxres?.url ||
    thumbs.high?.url ||
    thumbs.medium?.url ||
    thumbs.standard?.url ||
    thumbs.default?.url ||
    ''
  );
}

function parseIsoDuration(iso: string): number {
  const m = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return 0;
  const [, h, mi, s] = m;
  return (Number(h) || 0) * 3600 + (Number(mi) || 0) * 60 + (Number(s) || 0);
}

async function attachDurations(videos: YoutubeVideo[]): Promise<YoutubeVideo[]> {
  const ids = videos.map((v) => v.id).filter(Boolean);
  if (ids.length === 0) return videos;
  const batches: string[][] = [];
  for (let i = 0; i < ids.length; i += 50) batches.push(ids.slice(i, i + 50));
  const durationMap: Record<string, number> = {};
  await Promise.all(
    batches.map(async (batch) => {
      const data = await ytFetch<any>('videos', {
        part: 'contentDetails,liveStreamingDetails',
        id: batch.join(','),
      });
      for (const item of data.items || []) {
        const d = parseIsoDuration(item.contentDetails?.duration || '');
        if (d > 0) durationMap[item.id] = d;
      }
    }),
  );
  return videos.map((v) =>
    durationMap[v.id] ? { ...v, durationSeconds: durationMap[v.id] } : v,
  );
}

async function searchStreams(
  channelId: string,
  eventType: 'live' | 'upcoming' | 'completed',
  maxResults = 15,
): Promise<YoutubeVideo[]> {
  const data = await ytFetch<any>('search', {
    part: 'snippet',
    channelId,
    type: 'video',
    eventType,
    order: eventType === 'completed' ? 'date' : 'date',
    maxResults: String(maxResults),
  });
  return (data.items || []).map((item: any): YoutubeVideo => ({
    id: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    publishedAt: item.snippet.publishedAt,
    thumbnailUrl: pickThumb(item.snippet.thumbnails),
    channelTitle: item.snippet.channelTitle,
    videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    embedUrl: `https://www.youtube.com/embed/${item.id.videoId}?playsinline=1&rel=0`,
    liveStatus: eventType,
  }));
}

export interface LiveStreamsResult {
  live: YoutubeVideo[];
  upcoming: YoutubeVideo[];
  completed: YoutubeVideo[];
  channel: ChannelInfo;
}

export async function fetchLiveStreams(): Promise<LiveStreamsResult> {
  const channel = await resolveChannel();
  const [live, upcoming, completedRaw] = await Promise.all([
    searchStreams(channel.channelId, 'live', 5).catch(() => []),
    searchStreams(channel.channelId, 'upcoming', 10).catch(() => []),
    searchStreams(channel.channelId, 'completed', 15).catch(() => []),
  ]);
  const completed = await attachDurations(completedRaw);
  return { live, upcoming, completed, channel };
}

export async function fetchChannelPlaylists(): Promise<YoutubePlaylist[]> {
  const channel = await resolveChannel();
  const data = await ytFetch<any>('playlists', {
    part: 'snippet,contentDetails',
    channelId: channel.channelId,
    maxResults: '50',
  });
  return (data.items || []).map((p: any): YoutubePlaylist => ({
    id: p.id,
    title: p.snippet.title,
    description: p.snippet.description,
    thumbnailUrl: pickThumb(p.snippet.thumbnails),
    itemCount: p.contentDetails.itemCount,
    publishedAt: p.snippet.publishedAt,
  }));
}

export async function fetchPlaylistItems(playlistId: string, maxResults = 25): Promise<YoutubeVideo[]> {
  const data = await ytFetch<any>('playlistItems', {
    part: 'snippet,contentDetails',
    playlistId,
    maxResults: String(maxResults),
  });
  const items: YoutubeVideo[] = (data.items || [])
    .filter((it: any) => it.contentDetails?.videoId)
    .map((it: any): YoutubeVideo => {
      const videoId = it.contentDetails.videoId;
      return {
        id: videoId,
        title: it.snippet.title,
        description: it.snippet.description,
        publishedAt: it.contentDetails.videoPublishedAt || it.snippet.publishedAt,
        thumbnailUrl: pickThumb(it.snippet.thumbnails),
        channelTitle: it.snippet.channelTitle || it.snippet.videoOwnerChannelTitle || '',
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        embedUrl: `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0`,
        liveStatus: 'none',
      };
    });
  return attachDurations(items);
}

export { isYoutubeConfigured };
