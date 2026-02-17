"use client";

import { useState, useEffect } from "react";
import { DatosOndas } from "@/types";
import { DATOS_ONDAS } from "@/data/ondas";

interface OndasApiItem {
  fecha: string;
  "<1m": number;
  "1-3m": number;
  "3-6m": number;
  "6-12m": number;
  "1-2a": number;
  "2-3a": number;
  "3-5a": number;
  "5-7a": number;
  "7-10a": number;
  "10a+": number;
}

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
  // Iniciar vacío — no mostrar datos simulados mientras se carga la API
  const [datos, setDatos] = useState<DatosOndas[]>([]);
  const [esReal, setEsReal] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch("/api/ondas")
      .then((r) => r.ok ? r.json() : null)
      .then((json) => {
        if (json?.data?.length) {
          setDatos(apiToDatosOndas(json.data));
          setEsReal(true);
        } else {
          setDatos(DATOS_ONDAS);
        }
      })
      .catch(() => {
        setDatos(DATOS_ONDAS);
      })
      .finally(() => setCargando(false));
  }, []);

  return { datos, esReal, cargando };
}
