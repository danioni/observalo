"use client";

import { useMemo } from "react";
import type { DatosOndas } from "@/types";
import type { OndasApiItem } from "@/app/api/ondas/route";
import { DATOS_ONDAS } from "@/data/ondas";
import { useFetchApi } from "./useFetchApi";

function apiToDatosOndas(items: OndasApiItem[]): DatosOndas[] {
  return items.map((item, idx) => ({
    fecha: item.fecha,
    idx,
    "<1m": item["<1m"],
    "1-3m": item["1-3m"],
    "3-6m": item["3-6m"],
    "6-12m": item["6-12m"],
    "1-2a": item["1-2a"],
    "2-3a": item["2-3a"],
    "3-5a": item["3-5a"],
    "5-7a": item["5-7a"],
    "7-10a": item["7-10a"],
    "10a+": item["10a+"],
  }));
}

export function useOndasData() {
  const { data, cargando, error, stale, lastSuccessAt, reintentar } = useFetchApi<OndasApiItem[]>("/api/ondas");

  const datos = useMemo(() => {
    if (!data?.length) return cargando ? [] : DATOS_ONDAS;
    return apiToDatosOndas(data);
  }, [data, cargando]);

  const esReal = !!data?.length;

  return { datos, esReal, cargando, error, stale, lastSuccessAt, reintentar };
}
