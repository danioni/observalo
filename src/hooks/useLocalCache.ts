"use client";

import { useCallback, useMemo } from "react";

/**
 * Hook for localStorage caching with TTL.
 * Returns a stable memoized object with get/set/clear functions.
 */
export function useLocalCache<T>(key: string, ttl: number): {
  get: () => T | null;
  set: (data: T) => void;
  clear: () => void;
} {
  const get = useCallback((): T | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const { data, ts } = JSON.parse(raw);
      if (Date.now() - ts > ttl) {
        localStorage.removeItem(key);
        return null;
      }
      return data as T;
    } catch {
      return null;
    }
  }, [key, ttl]);

  const set = useCallback((data: T): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
    } catch {
      /* quota exceeded */
    }
  }, [key]);

  const clear = useCallback((): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  }, [key]);

  return useMemo(() => ({ get, set, clear }), [get, set, clear]);
}
