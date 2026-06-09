export interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

export interface Journalist {
  id: string;
  slug: string;
  name: string;
  role: string;
  bio: string;
  avatarUrl: string;
  programIds: string[];
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  body: string;
  category: Category;
  tags: string[];
  author: Journalist;
  publishedAt: string;
  updatedAt: string;
  imageUrl: string;
  imageCaption?: string;
  readingTimeMinutes: number;
  audioUrl?: string;
  isBreaking: boolean;
  isExclusive: boolean;
  relatedArticleIds: string[];
  url: string;
}

export interface Program {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  schedule: string;
  hostIds: string[];
  episodeCount: number;
}

export interface Episode {
  id: string;
  programId: string;
  title: string;
  description: string;
  publishedAt: string;
  videoUrl: string;
  audioUrl?: string;
  thumbnailUrl: string;
  durationSeconds: number;
}

export interface Quote {
  symbol: string;
  label: string;
  value: number;
  change: number;
  updatedAt: string;
}

export interface LiveStream {
  isLive: boolean;
  streamUrl?: string;
  currentProgram?: Program;
  viewerCount?: number;
  upcomingPrograms: Program[];
}
