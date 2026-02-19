"use client";

import { useMemo } from "react";
import { useFetchApi } from "./useFetchApi";

export interface ValoracionItem {
  d: string;
  fecha: string;
  mvrv: number | null;
  nupl: number | null;
  sopr: number | null;
}

interface ValoracionApiData {
  items: ValoracionItem[];
}

/* ── Simulated fallback data ── */

function generarSimulado(): ValoracionItem[] {
  const items: ValoracionItem[] = [];
  const inicio = new Date("2014-01-01");
  const hoy = new Date();
  const d = new Date(inicio);

  while (d <= hoy) {
    const dayIdx = (d.getTime() - inicio.getTime()) / 86_400_000;
    // Simulate cyclical patterns
    const cycle = Math.sin(dayIdx * 0.0015) * 0.6 + Math.sin(dayIdx * 0.005) * 0.2;
    const mvrv = 1.2 + cycle * 2 + (Math.random() - 0.5) * 0.3;
    const nupl = 0.3 + cycle * 0.4 + (Math.random() - 0.5) * 0.1;
    const sopr = 1.0 + cycle * 0.15 + (Math.random() - 0.5) * 0.05;

    items.push({
      d: d.toISOString().slice(0, 10),
      fecha: d.toLocaleDateString("es-CL", { year: "2-digit", month: "short" }),
      mvrv: Math.max(0.3, mvrv),
      nupl: Math.max(-0.5, Math.min(0.9, nupl)),
      sopr: Math.max(0.5, sopr),
    });
    // Monthly sampling
    d.setMonth(d.getMonth() + 1);
  }
  return items;
}

const DATOS_SIMULADOS = generarSimulado();

export function useValoracionData() {
  const { data, cargando, error, stale, lastSuccessAt, reintentar } = useFetchApi<ValoracionApiData>("/api/valoracion");

  const items = useMemo(() => {
    if (data?.items?.length) return data.items;
    if (cargando) return [];
    return DATOS_SIMULADOS;
  }, [data, cargando]);

  const esReal = !!data?.items?.length;

  return { items, esReal, cargando, error, stale, lastSuccessAt, reintentar };
}
