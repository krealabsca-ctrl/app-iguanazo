const UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

export interface CurrentLive {
  videoId: string | null;
  title: string | null;
  isLive: boolean;
  thumbnailUrl: string | null;
}

function decodeUnicodeEscapes(input: string): string {
  return input
    .replace(/\\u0026/g, '&')
    .replace(/\\u003d/g, '=')
    .replace(/\\u003c/g, '<')
    .replace(/\\u003e/g, '>')
    .replace(/\\\//g, '/')
    .replace(/\\"/g, '"');
}

export async function fetchCurrentLive(handle: string): Promise<CurrentLive> {
  const empty: CurrentLive = { videoId: null, title: null, isLive: false, thumbnailUrl: null };
  try {
    const res = await fetch(`https://www.youtube.com/@${handle}/live`, {
      headers: {
        'User-Agent': UA,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9',
        'Accept-Language': 'es-VE,es;q=0.9,en;q=0.8',
      },
    });
    if (!res.ok) return empty;
    const html = await res.text();

    const isLive = /"isLiveContent":\s*true/.test(html) || /"isLive":\s*true/.test(html);

    // The most reliable signal: the first "videoId" near the player config.
    const videoIdMatch = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    const videoId = videoIdMatch?.[1] ?? null;

    // Title: ytInitialPlayerResponse → videoDetails.title is a string literal.
    let title: string | null = null;
    const detailsTitle = html.match(/"videoDetails":\s*\{[^}]*"title":"((?:[^"\\]|\\.)+)"/);
    if (detailsTitle) {
      title = decodeUnicodeEscapes(detailsTitle[1]);
    } else {
      const runsTitle = html.match(/"title":\s*\{\s*"runs":\s*\[\s*\{\s*"text":"((?:[^"\\]|\\.)+)"/);
      if (runsTitle) title = decodeUnicodeEscapes(runsTitle[1]);
    }

    const thumbnailUrl = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : null;

    return { videoId, title, isLive, thumbnailUrl };
  } catch {
    return empty;
  }
}
