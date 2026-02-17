"use client";

import { useState, useEffect, useMemo } from "react";
import type { HistorialMineria } from "@/types";
import type { MineriaApiItem } from "@/app/api/mineria/route";
import { HISTORIAL_MINERIA } from "@/data/mineria";
import { useFetchApi } from "./useFetchApi";

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
  const { data, cargando, error, stale, lastSuccessAt, reintentar } = useFetchApi<MineriaApiItem[]>("/api/mineria");

  const datos = useMemo(() => {
    if (!data?.length) return HISTORIAL_MINERIA;

    const apiData = apiToHistorial(data);

    // Enrich with pctComisiones from static data where available
    const staticByFecha = new Map(
      HISTORIAL_MINERIA.map(d => [d.fechaRaw, d])
    );
    return apiData.map((item, i) => ({
      ...item,
      pctComisiones: staticByFecha.get(item.fechaRaw)?.pctComisiones
        ?? parseFloat(Math.max(0.5, 2 + Math.sin(i / 4) * 3 + Math.sin(i * 0.3) * 1.5).toFixed(1)),
    }));
  }, [data]);

  const esReal = !!data?.length;

  return { datos, esReal, cargando, error, stale, lastSuccessAt, reintentar };
}
