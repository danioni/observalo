"use client";

import { useState, useEffect } from "react";
import { FLUJOS_DIARIOS, FLUJOS_SEMANALES } from "@/data/flujos";

interface FlujoApiItem {
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

function apiToFlujoLocal(items: FlujoApiItem[], startDate: string): FlujoLocal[] {
  const base = new Date(startDate);
  return items.map((item, i) => {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    const absNeto = Math.abs(item.flujoNeto);
    return {
      fecha: d,
      etDia: d.toLocaleDateString("es-CL", { year: "numeric", month: "short", day: "numeric" }),
      etCorta: item.fecha,
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
  return items.map((item, i) => ({
    fecha: new Date(2021, 0, 1 + i * 7),
    etDia: item.fecha,
    etCorta: item.fecha,
    numSem: i,
    mes: 0,
    flujoNeto: item.flujoNeto,
    entrada: item.flujoNeto > 0 ? Math.abs(item.flujoNeto) : 0,
    salida: item.flujoNeto < 0 ? Math.abs(item.flujoNeto) : 0,
    reserva: item.reserva,
  }));
}

export function useFlujosData() {
  const [diarios, setDiarios] = useState(FLUJOS_DIARIOS);
  const [semanales, setSemanales] = useState(FLUJOS_SEMANALES);
  const [esReal, setEsReal] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch("/api/flujos")
      .then((r) => r.ok ? r.json() : null)
      .then((json) => {
        if (json?.data) {
          if (json.data.diarios?.length) {
            setDiarios(apiToFlujoLocal(json.data.diarios, "2021-01-01"));
          }
          if (json.data.semanales?.length) {
            setSemanales(apiToFlujosSemanales(json.data.semanales));
          }
          setEsReal(true);
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  return { diarios, semanales, esReal, cargando };
}
