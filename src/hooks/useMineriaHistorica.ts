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
    pctComisiones: 0, // Not available from this API
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
          const apiStart = apiData[0]?.fechaRaw;

          if (apiStart) {
            // Merge: static data for pre-API period + API data for the rest
            const staticPrefix = HISTORIAL_MINERIA.filter(
              d => (d.fechaRaw ?? "") < apiStart
            );

            // Enrich API data with simulated pctComisiones from static data
            const staticByFecha = new Map(
              HISTORIAL_MINERIA.map(d => [d.fechaRaw, d.pctComisiones])
            );

            const enrichedApi = apiData.map((item, i) => ({
              ...item,
              pctComisiones: staticByFecha.get(item.fechaRaw)
                ?? parseFloat(Math.max(0.5, 2 + Math.sin(i / 4) * 3 + Math.sin(i * 0.3) * 1.5).toFixed(1)),
            }));

            setDatos([...staticPrefix, ...enrichedApi]);
          } else {
            setDatos(apiData);
          }
          setEsReal(true);
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  return { datos, esReal, cargando };
}
