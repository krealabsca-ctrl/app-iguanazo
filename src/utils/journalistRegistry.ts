import { Journalist, Article } from '@/types';
import { mockJournalists } from '@/api/mocks';

export function collectJournalists(byId: Record<string, Article>): Journalist[] {
  const map = new Map<string, Journalist>();
  for (const j of mockJournalists) map.set(j.id, j);
  for (const article of Object.values(byId)) {
    const a = article.author;
    if (a && !map.has(a.id)) map.set(a.id, a);
  }
  return Array.from(map.values());
}

export function findJournalist(
  id: string,
  byId: Record<string, Article>,
): Journalist | undefined {
  const fromMock = mockJournalists.find((j) => j.id === id);
  if (fromMock) return fromMock;
  for (const article of Object.values(byId)) {
    if (article.author?.id === id) return article.author;
  }
  return undefined;
}
