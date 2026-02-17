"use client";

import { useMemo } from "react";
import type { Holder } from "@/types";
import { DATOS_HOLDERS } from "@/data/holders";
import type { HoldersApiData } from "@/app/api/holders/route";
import { useFetchApi } from "./useFetchApi";

// Mapeo de claves ETF de BGeometrics → tickers en nuestros datos
const ETF_MAP: Record<string, string> = {
  ibit: "IBIT",
  fbtc: "FBTC",
  gbtc: "GBTC",
  bitb: "BITB",
  arkb: "ARKB",
  hodl: "HODL",
  btco: "BTCO",
  ezbc: "EZBC",
  brrr: "BRRR",
  btcw: "BTCW",
};

function mergeApiData(base: Holder[], api: HoldersApiData): Holder[] {
  const updated = base.map((h) => ({ ...h }));

  // Actualizar ETFs con datos reales
  if (api.etfHoldings) {
    for (const [apiKey, btc] of Object.entries(api.etfHoldings)) {
      const ticker = ETF_MAP[apiKey.toLowerCase()];
      if (!ticker) continue;
      const idx = updated.findIndex((h) => h.ticker === ticker && h.categoria === "etf");
      if (idx >= 0) {
        updated[idx].btc = btc;
      }
    }
  }

  return updated;
}

export function useHoldersData() {
  const { data, cargando, error, stale, lastSuccessAt, reintentar } = useFetchApi<HoldersApiData>("/api/holders");

  const datos = useMemo(() => {
    if (data?.etfHoldings) return mergeApiData(DATOS_HOLDERS, data);
    return DATOS_HOLDERS;
  }, [data]);

  const esReal = !!data?.etfHoldings;

  return { datos, esReal, cargando, error, stale, lastSuccessAt, reintentar };
}
