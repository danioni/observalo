"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ApiEnvelope } from "@/types";

const FETCH_TIMEOUT = 6_000; // 6s max

interface UseFetchApiResult<T> {
  data: T | null;
  cargando: boolean;
  error: string | null;
  stale: boolean;
  lastSuccessAt: string | null;
  reintentar: () => void;
}

/**
 * Generic hook to fetch from our API routes with:
 * - 6s AbortController timeout
 * - Envelope parsing (status/stale/lastSuccessAt)
 * - Error state + retry
 */
export function useFetchApi<T>(url: string): UseFetchApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const [lastSuccessAt, setLastSuccessAt] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    setCargando(true);
    setError(null);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      const envelope: ApiEnvelope<T> = await res.json();

      if (!mountedRef.current) return;

      if (envelope.data !== null && envelope.data !== undefined) {
        setData(envelope.data);
        setStale(envelope.stale);
        setLastSuccessAt(envelope.lastSuccessAt);
        setError(null);
      } else {
        setError(envelope.message ?? "Sin datos disponibles");
      }
    } catch (err) {
      clearTimeout(timeout);
      if (!mountedRef.current) return;
      const msg = err instanceof DOMException && err.name === "AbortError"
        ? "Tiempo de espera agotado (6s)"
        : err instanceof Error ? err.message : "Error de conexión";
      setError(msg);
    } finally {
      if (mountedRef.current) setCargando(false);
    }
  }, [url]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => { mountedRef.current = false; };
  }, [fetchData]);

  const reintentar = useCallback(() => { fetchData(); }, [fetchData]);

  return { data, cargando, error, stale, lastSuccessAt, reintentar };
}
