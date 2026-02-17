"use client";

import { useState, useEffect } from "react";
import { DatosVivosMineria } from "@/types";

export function useMempoolData() {
  const [vivo, setVivo] = useState<DatosVivosMineria | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [hR, dR, fR, bR] = await Promise.all([
          fetch("https://mempool.space/api/v1/mining/hashrate/1m").then(r => r.ok ? r.json() : null).catch(() => null),
          fetch("https://mempool.space/api/v1/mining/difficulty-adjustments/1").then(r => r.ok ? r.json() : null).catch(() => null),
          fetch("https://mempool.space/api/v1/fees/recommended").then(r => r.ok ? r.json() : null).catch(() => null),
          fetch("https://mempool.space/api/v1/blocks/").then(r => r.ok ? r.json() : null).catch(() => null),
        ]);
        setVivo({
          hashrate: hR?.currentHashrate ? (hR.currentHashrate / 1e18).toFixed(0) : null,
          dificultad: hR?.currentDifficulty ? (hR.currentDifficulty / 1e12).toFixed(2) : null,
          comisiones: fR,
          bloque: bR?.[0] || null,
          ajuste: dR?.[0] || null,
        });
      } catch {
        // silently fail — fallback to historical data
      }
      setCargando(false);
    })();
  }, []);

  return { vivo, cargando };
}
