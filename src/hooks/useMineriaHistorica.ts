"use client";

import { useState, useEffect } from "react";
import { HistorialMineria } from "@/types";
import { HISTORIAL_MINERIA } from "@/data/mineria";

interface MineriaApiItem {
  fecha: string;
  hashrate: number;
  dificultad: number;
  recompensa: number;
}

function apiToHistorial(items: MineriaApiItem[]): HistorialMineria[] {
  return items.map((item) => ({
    fecha: item.fecha,
    hashrate: item.hashrate,
    dificultad: item.dificultad,
    pctComisiones: 0, // Not available from this API
    recompensa: item.recompensa,
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
          const realData = apiToHistorial(json.data);
          // Merge: use real hashrate/dificultad but keep simulated pctComisiones from fallback
          const merged = realData.map((item, i) => ({
            ...item,
            pctComisiones: HISTORIAL_MINERIA[i]?.pctComisiones ?? parseFloat(Math.max(0.5, 2 + Math.sin(i / 4) * 3 + Math.sin(i * 0.3) * 1.5).toFixed(1)),
          }));
          setDatos(merged);
          setEsReal(true);
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  return { datos, esReal, cargando };
}
