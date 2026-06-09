import { Article, Category, Journalist } from '@/types';

const WP_BASE = 'https://www.laiguana.tv/wp-json/wp/v2';

const CATEGORY_PALETTE: Record<string, { name: string; color: string }> = {
  'politica-y-geopolitica': { name: 'Política y Geopolítica', color: '#DC2626' },
  'analisis-y-opinion': { name: 'Análisis y Opinión', color: '#c82022' },
  'economia-e-internacional': { name: 'Economía e Internacional', color: '#EAB308' },
  'sucesos-y-eventos': { name: 'Sucesos y Eventos', color: '#0A0A0A' },
  'cultura-y-tecnologia': { name: 'Cultura y Tecnología', color: '#2563EB' },
  'deportes-y-salud': { name: 'Deportes y Salud', color: '#EA580C' },
  'virales-y-farandula': { name: 'Virales y Farándula', color: '#9333EA' },
  iguanazos: { name: 'Iguanazos', color: '#0EA5E9' },
  destacados: { name: 'Destacados', color: '#DC2626' },
  general: { name: 'Actualidad', color: '#525252' },
};

interface WpTerm {
  id: number;
  slug: string;
  name: string;
  taxonomy: 'category' | 'post_tag';
}

interface WpAuthor {
  id: number;
  name: string;
  slug: string;
  description?: string;
  avatar_urls?: Record<string, string>;
}

interface WpMedia {
  source_url?: string;
  media_details?: {
    sizes?: Record<string, { source_url: string; width?: number; height?: number }>;
  };
  caption?: { rendered?: string };
}

interface WpPost {
  id: number;
  slug: string;
  link: string;
  date: string;
  modified: string;
  sticky?: boolean;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  jetpack_featured_media_url?: string;
  _embedded?: {
    author?: WpAuthor[];
    'wp:featuredmedia'?: WpMedia[];
    'wp:term'?: WpTerm[][];
  };
}

function decodeEntities(input: string): string {
  if (!input) return '';
  return input
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, '’')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8230;/g, '…')
    .replace(/&hellip;/g, '…')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&aacute;/g, 'á')
    .replace(/&eacute;/g, 'é')
    .replace(/&iacute;/g, 'í')
    .replace(/&oacute;/g, 'ó')
    .replace(/&uacute;/g, 'ú')
    .replace(/&ntilde;/g, 'ñ')
    .replace(/&Aacute;/g, 'Á')
    .replace(/&Eacute;/g, 'É')
    .replace(/&Iacute;/g, 'Í')
    .replace(/&Oacute;/g, 'Ó')
    .replace(/&Uacute;/g, 'Ú')
    .replace(/&Ntilde;/g, 'Ñ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function stripHtml(html: string): string {
  if (!html) return '';
  return decodeEntities(
    html
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<\/(p|div|h\d|li|br)>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ''),
  )
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
}

function pickCategory(terms: WpTerm[][] | undefined): Category {
  const cats = (terms?.[0] || []).filter((t) => t.taxonomy === 'category');
  const preferred = cats.find((c) => c.slug !== 'general' && c.slug !== 'sin-categoria') || cats[0];
  if (!preferred) {
    return { id: '0', slug: 'general', name: 'Actualidad', color: CATEGORY_PALETTE.general.color };
  }
  const palette = CATEGORY_PALETTE[preferred.slug];
  return {
    id: String(preferred.id),
    slug: preferred.slug,
    name: palette?.name || decodeEntities(preferred.name),
    color: palette?.color || '#525252',
  };
}

function pickTags(terms: WpTerm[][] | undefined): string[] {
  const flat = (terms || []).flat();
  return flat
    .filter((t) => t.taxonomy === 'post_tag')
    .map((t) => decodeEntities(t.name));
}

function pickAuthor(post: WpPost): Journalist {
  const a = post._embedded?.author?.[0];
  if (!a || (a as unknown as { code?: string }).code) {
    return {
      id: 'wp-author-0',
      slug: 'redaccion',
      name: 'Redacción Laiguana',
      role: 'Equipo editorial',
      bio: '',
      avatarUrl: `https://ui-avatars.com/api/?name=Laiguana&background=15803D&color=fff&size=200`,
      programIds: [],
    };
  }
  const avatar =
    a.avatar_urls?.['96'] ||
    a.avatar_urls?.['48'] ||
    a.avatar_urls?.['24'] ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&background=15803D&color=fff&size=200`;
  return {
    id: `wp-author-${a.id}`,
    slug: a.slug,
    name: decodeEntities(a.name),
    role: 'Periodista',
    bio: decodeEntities(a.description || ''),
    avatarUrl: avatar,
    programIds: [],
  };
}

function pickImage(post: WpPost): { url: string; caption?: string } {
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  const sizes = media?.media_details?.sizes;
  const url =
    sizes?.large?.source_url ||
    sizes?.medium_large?.source_url ||
    sizes?.medium?.source_url ||
    media?.source_url ||
    post.jetpack_featured_media_url ||
    '';
  return { url, caption: media?.caption?.rendered ? stripHtml(media.caption.rendered) : undefined };
}

function readingTime(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function mapPost(post: WpPost): Article {
  const title = stripHtml(post.title.rendered);
  const excerpt = stripHtml(post.excerpt.rendered).replace(/\[…\]$/u, '').trim();
  const body = stripHtml(post.content.rendered);
  const image = pickImage(post);
  return {
    id: String(post.id),
    slug: post.slug,
    title,
    excerpt,
    body,
    category: pickCategory(post._embedded?.['wp:term']),
    tags: pickTags(post._embedded?.['wp:term']),
    author: pickAuthor(post),
    publishedAt: post.date,
    updatedAt: post.modified || post.date,
    imageUrl: image.url,
    imageCaption: image.caption,
    readingTimeMinutes: readingTime(body || excerpt),
    isBreaking: Boolean(post.sticky),
    isExclusive: false,
    relatedArticleIds: [],
    url: post.link,
  };
}

export async function fetchArticles(
  opts: { page?: number; perPage?: number; categories?: number[] } = {},
): Promise<Article[]> {
  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 30;
  const params = new URLSearchParams({
    _embed: 'true',
    per_page: String(perPage),
    page: String(page),
  });
  if (opts.categories && opts.categories.length > 0) {
    params.set('categories', opts.categories.join(','));
  }
  const url = `${WP_BASE}/posts?${params.toString()}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`WP REST request failed: ${res.status}`);
  }
  const posts: WpPost[] = await res.json();
  return posts.map(mapPost);
}

export const WP_CATEGORY_IDS = {
  politica: 56774,
  analisis: 56771,
  economia: 56773,
  sucesos: 56775,
  cultura: 56772,
  deportes: 118476,
  virales: 56776,
} as const;
