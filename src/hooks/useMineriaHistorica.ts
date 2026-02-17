"use client";

import { useState, useEffect } from "react";
import { HistorialMineria } from "@/types";
import { HISTORIAL_MINERIA } from "@/data/mineria";

interface MineriaApiItem {
  fecha: string;
  fechaRaw: string;
  hashrate: number;
  dificultad: number;
  recompensa: number;
  suministro: number;
  bloque: number;
}

function apiToHistorial(items: MineriaApiItem[]): HistorialMineria[] {
  return items.map((item) => ({
    fecha: item.fecha,
    fechaRaw: item.fechaRaw,
    hashrate: item.hashrate,
    dificultad: item.dificultad,
    pctComisiones: 0,
    recompensa: item.recompensa,
    suministro: item.suministro,
    bloque: item.bloque,
  }));
}

export function useMineriaHistorica() {
  const [datos, setDatos] = useState<HistorialMineria[]>(HISTORIAL_MINERIA);
  const [esReal, setEsReal] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch("/api/mineria")
      .then((r) => r.ok ? r.json() : null)
      .then((json) => {
        if (json?.data?.length) {
          const apiData = apiToHistorial(json.data);
          const hasHashrate = json.hasHashrate !== false;
          const apiStart = apiData[0]?.fechaRaw;

          // Build lookup maps from static data
          const staticByFecha = new Map(
            HISTORIAL_MINERIA.map(d => [d.fechaRaw, d])
          );

          if (apiStart) {
            // Static prefix for months before API coverage
            const staticPrefix = HISTORIAL_MINERIA.filter(
              d => (d.fechaRaw ?? "") < apiStart
            );

            // Enrich API data with static values where API has gaps
            const enrichedApi = apiData.map((item, i) => {
              const staticItem = staticByFecha.get(item.fechaRaw);
              return {
                ...item,
                // Use static hashrate if API didn't provide it
                hashrate: item.hashrate > 0 ? item.hashrate : (staticItem?.hashrate ?? 0),
                // Use API dificultad (from mempool.space) if available, else static
                dificultad: item.dificultad > 0 ? item.dificultad : (staticItem?.dificultad ?? 0),
                // pctComisiones: not from API, use static or simulated
                pctComisiones: staticItem?.pctComisiones
                  ?? parseFloat(Math.max(0.5, 2 + Math.sin(i / 4) * 3 + Math.sin(i * 0.3) * 1.5).toFixed(1)),
              };
            });

            setDatos([...staticPrefix, ...enrichedApi]);
          } else {
            setDatos(apiData);
          }
          // Mark as real data if we have at least difficulty from mempool.space
          setEsReal(true);
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  return { datos, esReal, cargando };
}
