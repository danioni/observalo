"use client";

import { useMemo } from "react";
import { FLUJOS_DIARIOS, FLUJOS_SEMANALES } from "@/data/flujos";
import { useFetchApi } from "./useFetchApi";

interface FlujoApiItem {
  d: string; // YYYY-MM-DD
  fecha: string;
  flujoNeto: number;
  reserva: number;
}

interface FlujosApiData {
  diarios: FlujoApiItem[];
  semanales: FlujoApiItem[];
}

export interface FlujoLocal {
  fecha: Date;
  etDia: string;
  etCorta: string;
  numSem: number;
  mes: number;
  flujoNeto: number;
  entrada: number;
  salida: number;
  reserva: number;
}

function apiToFlujoLocal(items: FlujoApiItem[]): FlujoLocal[] {
  return items.map((item, i) => {
    const d = new Date(item.d + "T00:00:00");
    const absNeto = Math.abs(item.flujoNeto);
    return {
      fecha: d,
      etDia: d.toLocaleDateString("es-CL", { year: "numeric", month: "short", day: "numeric" }),
      etCorta: d.toLocaleDateString("es-CL", { year: "2-digit", month: "short" }),
      numSem: Math.floor(i / 7),
      mes: d.getMonth(),
      flujoNeto: item.flujoNeto,
      entrada: item.flujoNeto > 0 ? absNeto : 0,
      salida: item.flujoNeto < 0 ? absNeto : 0,
      reserva: item.reserva,
    };
  });
}

function apiToFlujosSemanales(items: FlujoApiItem[]): FlujoLocal[] {
  return items.map((item, i) => {
    const d = new Date(item.d + "T00:00:00");
    return {
      fecha: d,
      etDia: d.toLocaleDateString("es-CL", { year: "numeric", month: "short", day: "numeric" }),
      etCorta: d.toLocaleDateString("es-CL", { year: "2-digit", month: "short" }),
      numSem: i,
      mes: d.getMonth(),
      flujoNeto: item.flujoNeto,
      entrada: item.flujoNeto > 0 ? Math.abs(item.flujoNeto) : 0,
      salida: item.flujoNeto < 0 ? Math.abs(item.flujoNeto) : 0,
      reserva: item.reserva,
    };
  });
}

export function useFlujosData() {
  const { data, cargando, error, stale, lastSuccessAt, reintentar } = useFetchApi<FlujosApiData>("/api/flujos");

  const { diarios, semanales } = useMemo(() => {
    if (data?.diarios?.length) {
      return {
        diarios: apiToFlujoLocal(data.diarios),
        semanales: data.semanales?.length ? apiToFlujosSemanales(data.semanales) : [],
      };
    }
    if (cargando) return { diarios: [], semanales: [] };
    // Fallback to static data
    return {
      diarios: FLUJOS_DIARIOS as FlujoLocal[],
      semanales: FLUJOS_SEMANALES.map((s, i) => ({ ...s, numSem: i })) as FlujoLocal[],
    };
  }, [data, cargando]);

  const esReal = !!data?.diarios?.length;

  return { diarios, semanales, esReal, cargando, error, stale, lastSuccessAt, reintentar };
}
