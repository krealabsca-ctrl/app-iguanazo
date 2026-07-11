// Defaults for La Iguana's official accounts. Used when the body mentions
// a platform by name without including a URL.
export const LAIGUANA_SOCIAL: Record<SocialPlatform, string> = {
  youtube: 'https://www.youtube.com/@laiguanatv-television',
  x: 'https://x.com/laiguanatv',
  instagram: 'https://www.instagram.com/laiguanatv',
  tiktok: 'https://www.tiktok.com/@laiguanatv',
  facebook: 'https://www.facebook.com/laiguanatv',
  threads: 'https://www.threads.net/@laiguanatv',
  telegram: 'https://t.me/LaIguanaTVWeb',
  whatsapp: 'https://whatsapp.com/channel/0029VaHHo0JEKyZNdRC40H1l',
};

export type SocialPlatform =
  | 'youtube'
  | 'x'
  | 'instagram'
  | 'tiktok'
  | 'facebook'
  | 'threads'
  | 'telegram'
  | 'whatsapp';

export type SocialLink = { platform: SocialPlatform; url: string };

// Order in which to render the icons.
export const SOCIAL_ORDER: SocialPlatform[] = [
  'youtube',
  'x',
  'instagram',
  'tiktok',
  'facebook',
  'threads',
  'telegram',
  'whatsapp',
];

const URL_REGEX = /https?:\/\/[^\s)<>"']+/gi;

function classifyUrl(rawUrl: string): SocialPlatform | null {
  const url = rawUrl.toLowerCase();
  if (/youtu\.?be|youtube\.com/.test(url)) return 'youtube';
  if (/twitter\.com|^https?:\/\/x\.com|\/\/x\.com\//.test(url)) return 'x';
  if (/instagram\.com|instagr\.am/.test(url)) return 'instagram';
  if (/tiktok\.com/.test(url)) return 'tiktok';
  if (/facebook\.com|fb\.me|fb\.com/.test(url)) return 'facebook';
  if (/threads\.net/.test(url)) return 'threads';
  if (/t\.me|telegram\.me|telegram\.org/.test(url)) return 'telegram';
  if (/whatsapp\.com|wa\.me/.test(url)) return 'whatsapp';
  return null;
}

/**
 * Extracts a deduplicated list of social platforms with a real URL present
 * in the article body. Plain text mentions of a platform without a URL are
 * ignored — we only surface networks the article is actually linking to.
 */
export function extractSocialLinks(body: string): SocialLink[] {
  if (!body) return [];
  const found = new Map<SocialPlatform, string>();

  const matches = body.match(URL_REGEX) || [];
  for (const raw of matches) {
    const platform = classifyUrl(raw);
    if (!platform) continue;
    if (!found.has(platform)) {
      found.set(platform, raw.replace(/[,.;:)\]]+$/, ''));
    }
  }

  // Preserve canonical order
  return SOCIAL_ORDER.filter((p) => found.has(p)).map((p) => ({
    platform: p,
    url: found.get(p)!,
  }));
}

/**
 * Cleans the article body by removing the noisy "follow us" trailing block —
 * URL lines, "síguenos en", standalone platform mentions, and the
 * "(Laiguana.tv)" tagline — so the SocialFooter can render the same info
 * cleanly as buttons.
 */
export function cleanArticleBody(body: string): string {
  if (!body) return body;
  let text = body;

  // Strip raw URLs
  text = text.replace(URL_REGEX, '');

  // Lines we want to drop entirely (case-insensitive)
  const dropLinePatterns: RegExp[] = [
    /^.*\(?\s*la\s*iguana\.tv\s*\)?\s*$/i,
    /^.*m[aá]s\s+noticias.*la\s*iguana.*$/i,
    /^.*s[ií]guenos.*$/i,
    /^.*estar\s+informado.*$/i,
    /^.*el\s+portal\s+de\s+venezuela.*$/i,
    /^\s*(telegram|whatsapp|youtube|instagram|tiktok|facebook|threads|x)\b.*$/i,
    // Restos del blockquote de Instagram tras quitar el HTML (inglés y español)
    /^.*view\s+this\s+post\s+on\s+instagram.*$/i,
    /^.*ver\s+esta\s+publicaci[oó]n\s+en\s+instagram.*$/i,
    /^.*a\s+post\s+shared\s+by.*$/i,
    /^.*una\s+publicaci[oó]n\s+compartida\s+(de|por).*$/i,
    // Restos de tweets embebidos
    /^pic\.twitter\.com\/\w+$/i,
  ];

  text = text
    .split('\n')
    .map((line) => line.trim()) // normaliza líneas con solo espacios a vacías
    .filter((line) => !dropLinePatterns.some((re) => re.test(line)))
    .join('\n');

  // Colapsa 2+ líneas en blanco consecutivas en una sola
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}
