interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const store = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL = 4 * 60 * 60 * 1000; // 4 hours

export function getCached<T>(key: string): T | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() - entry.timestamp < DEFAULT_TTL) return entry.data;
  return null;
}

export function getStale<T>(key: string): T | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  return entry?.data ?? null;
}

export function setCache<T>(key: string, data: T): void {
  store.set(key, { data, timestamp: Date.now() });
}

export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
): Promise<{ data: T; fromCache: boolean } | null> {
  const cached = getCached<T>(key);
  if (cached) return { data: cached, fromCache: true };

  try {
    const data = await fetcher();
    setCache(key, data);
    return { data, fromCache: false };
  } catch {
    const stale = getStale<T>(key);
    if (stale) return { data: stale, fromCache: true };
    return null;
  }
}
