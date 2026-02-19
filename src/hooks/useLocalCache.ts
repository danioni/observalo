"use client";

import { useCallback } from "react";

/**
 * Hook for localStorage caching with TTL.
 * Returns get/set/clear functions scoped to a key + TTL.
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

  return { get, set, clear };
}
