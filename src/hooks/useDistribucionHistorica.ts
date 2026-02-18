"use client";

import { useMemo } from "react";
import type { DatosDistribucionHistorica } from "@/types";
import type { DistHistApiItem } from "@/app/api/distribucion/route";
import { DATOS_DIST_HIST } from "@/data/distribucion-historica";
import { useFetchApi } from "./useFetchApi";

function apiToDatos(items: DistHistApiItem[]): DatosDistribucionHistorica[] {
  return items.map((item, idx) => ({
    fecha: item.fecha,
    idx,
    "<1": item["<1"],
    "1-10": item["1-10"],
    "10-100": item["10-100"],
    "100-1K": item["100-1K"],
    "1K-10K": item["1K-10K"],
    ">10K": item[">10K"],
    "dir_<1": item["dir_<1"] ?? 0,
    "dir_1-10": item["dir_1-10"] ?? 0,
    "dir_10-100": item["dir_10-100"] ?? 0,
    "dir_100-1K": item["dir_100-1K"] ?? 0,
    "dir_1K-10K": item["dir_1K-10K"] ?? 0,
    "dir_>10K": item["dir_>10K"] ?? 0,
  }));
}

export function useDistribucionHistorica() {
  const { data, cargando, error, stale, lastSuccessAt, reintentar } =
    useFetchApi<DistHistApiItem[]>("/api/distribucion");

  const datos = useMemo(() => {
    if (!data?.length) return cargando ? [] : DATOS_DIST_HIST;
    return apiToDatos(data);
  }, [data, cargando]);

  const esReal = !!data?.length;

  return { datos, esReal, cargando, error, stale, lastSuccessAt, reintentar };
}
