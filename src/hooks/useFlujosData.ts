"use client";

import { useState, useEffect } from "react";
import { FLUJOS_DIARIOS, FLUJOS_SEMANALES } from "@/data/flujos";

interface FlujoApiItem {
  d: string; // YYYY-MM-DD
  fecha: string;
  flujoNeto: number;
  reserva: number;
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
  // Iniciar vacío — no mostrar datos simulados mientras se carga la API
  const [diarios, setDiarios] = useState<FlujoLocal[]>([]);
  const [semanales, setSemanales] = useState<FlujoLocal[]>([]);
  const [esReal, setEsReal] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch("/api/flujos")
      .then((r) => r.ok ? r.json() : null)
      .then((json) => {
        if (json?.data) {
          if (json.data.diarios?.length) {
            setDiarios(apiToFlujoLocal(json.data.diarios));
          }
          if (json.data.semanales?.length) {
            setSemanales(apiToFlujosSemanales(json.data.semanales));
          }
          setEsReal(true);
        } else {
          // API falló — usar fallback estático
          setDiarios(FLUJOS_DIARIOS as FlujoLocal[]);
          setSemanales(FLUJOS_SEMANALES.map((s, i) => ({ ...s, numSem: i })) as FlujoLocal[]);
        }
      })
      .catch(() => {
        // Error de red — usar fallback estático
        setDiarios(FLUJOS_DIARIOS as FlujoLocal[]);
        setSemanales(FLUJOS_SEMANALES.map((s, i) => ({ ...s, numSem: i })) as FlujoLocal[]);
      })
      .finally(() => setCargando(false));
  }, []);

  return { diarios, semanales, esReal, cargando };
}
