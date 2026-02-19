interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const store = new Map<string, CacheEntry<unknown>>();

const FRESH_TTL = 60 * 1000;           // 60s — considered fresh
const STALE_TTL = 10 * 60 * 1000;      // 10min — serve stale if fetch fails

export interface CachedResult<T> {
  data: T;
  stale: boolean;
  lastSuccessAt: string;   // ISO 8601
  status: "ok" | "stale" | "unavailable";
}

export function getCached<T>(key: string): CachedResult<T> | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  const age = Date.now() - entry.timestamp;
  if (age < FRESH_TTL) {
    return {
      data: entry.data,
      stale: false,
      lastSuccessAt: new Date(entry.timestamp).toISOString(),
      status: "ok",
    };
  }
  // Between fresh and stale TTL — mark as stale but still usable
  if (age < STALE_TTL) {
    return {
      data: entry.data,
      stale: true,
      lastSuccessAt: new Date(entry.timestamp).toISOString(),
      status: "stale",
    };
  }
  return null;
}

/** Return data regardless of age — last resort on fetch failure */
export function getStale<T>(key: string): CachedResult<T> | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  return {
    data: entry.data,
    stale: true,
    lastSuccessAt: new Date(entry.timestamp).toISOString(),
    status: "stale",
  };
}

export function setCache<T>(key: string, data: T): void {
  store.set(key, { data, timestamp: Date.now() });
}

/* ── CDN Cache Headers (Vercel Edge / L2 cache) ── */

export function cdnHeaders(sMaxAge: number, staleWhileRevalidate: number): HeadersInit {
  return {
    "Cache-Control": `s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
    "CDN-Cache-Control": `s-maxage=${sMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
  };
}

export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
): Promise<CachedResult<T> | null> {
  // Return fresh data immediately
  const cached = getCached<T>(key);
  if (cached && !cached.stale) return cached;

  try {
    const data = await fetcher();
    setCache(key, data);
    return {
      data,
      stale: false,
      lastSuccessAt: new Date().toISOString(),
      status: "ok",
    };
  } catch {
    // Fetch failed — try stale data (any age)
    const stale = getStale<T>(key);
    if (stale) return stale;
    return null;
  }
}
