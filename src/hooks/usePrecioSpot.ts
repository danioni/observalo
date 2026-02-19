"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ApiEnvelope } from "@/types";

interface PrecioSpotResult {
  precio: number | null;
  cargando: boolean;
}

const POLL_INTERVAL = 30_000; // 30s

export function usePrecioSpot(): PrecioSpotResult {
  const [precio, setPrecio] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const mountedRef = useRef(true);

  const fetchSpot = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch("/api/precio-spot", { signal: controller.signal });
      clearTimeout(timeout);

      const envelope: ApiEnvelope<{ price: number }> = await res.json();
      if (!mountedRef.current) return;

      if (envelope.data?.price) {
        setPrecio(envelope.data.price);
      }
    } catch {
      // Silently fail — TabPrecio falls back to historical data
    } finally {
      if (mountedRef.current) setCargando(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchSpot();
    const interval = setInterval(fetchSpot, POLL_INTERVAL);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchSpot]);

  return { precio, cargando };
}
