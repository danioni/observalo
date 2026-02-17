"use client";

import { useState, useEffect } from "react";
import type { Holder } from "@/types";
import { DATOS_HOLDERS } from "@/data/holders";
import type { HoldersApiData } from "@/app/api/holders/route";

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
  const [datos, setDatos] = useState<Holder[]>(DATOS_HOLDERS);
  const [esReal, setEsReal] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch("/api/holders")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.data) {
          const apiData: HoldersApiData = json.data;
          if (apiData.etfHoldings) {
            setDatos(mergeApiData(DATOS_HOLDERS, apiData));
            setEsReal(true);
          }
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  return { datos, esReal, cargando };
}
