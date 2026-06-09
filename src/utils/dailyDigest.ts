import { Article } from '@/types';

export function generateDailyDigestScript(top5News: Article[]): string {
  const greeting = getGreeting();
  const ordinals = ['Primera', 'Segunda', 'Tercera', 'Cuarta', 'Quinta'];
  let script = `${greeting}. Estas son las cinco noticias más importantes de La iguana en este momento.\n\n`;
  top5News.forEach((news, index) => {
    if (index === 4) {
      script += `Y ${ordinals[index].toLowerCase()} noticia: ${news.title}. ${news.excerpt}\n\n`;
    } else {
      script += `${ordinals[index]} noticia: ${news.title}. ${news.excerpt}\n\n`;
    }
  });
  script += 'Estas fueron las cinco noticias más importantes. Continúa informándote en La iguana.';
  return script.trim();
}

export function selectTop5News(articles: Article[]): Article[] {
  const breaking = articles.filter((a) => a.isBreaking);
  const recent = articles
    .filter((a) => !a.isBreaking)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  return [...breaking, ...recent].slice(0, 5);
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export function renderRelativeDate(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min}m`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `hace ${days}d`;
  const months = Math.floor(days / 30);
  return `hace ${months}mo`;
}
