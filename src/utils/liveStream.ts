export const LIVE_CHANNEL_ID = 'UCCc2H9_eNnU7ucq2n7Sh3Rg';
export const LIVE_CHANNEL_HANDLE = '@laiguanatv';

export const liveStreamLinks = {
  youtubeLivePage: `https://www.youtube.com/${LIVE_CHANNEL_HANDLE}/live`,
  youtubeChannel: `https://www.youtube.com/channel/${LIVE_CHANNEL_ID}`,
  laiguanaWeb: 'https://www.laiguana.tv/en-directo/',
};

export const getLiveEmbedUrl = () =>
  `https://www.youtube.com/embed/live_stream?channel=${LIVE_CHANNEL_ID}&autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`;

export const getLiveWatchUrl = () => liveStreamLinks.youtubeLivePage;
