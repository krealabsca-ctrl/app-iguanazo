export const YOUTUBE_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_YOUTUBE_API_KEY || '',
  channelHandle: 'laiguanatv-television',
};

export const isYoutubeConfigured = () => YOUTUBE_CONFIG.apiKey.length > 0;
