import type { DatosDistribucionHistorica, BandaDistribucion } from "@/types";

/**
 * Datos sintéticos de distribución histórica por cohorte de balance.
 * Modela tendencias conocidas: descentralización gradual (retail crece, mega decrece).
 * Se usa como fallback si la API de BGeometrics no responde.
 */
export const DATOS_DIST_HIST: DatosDistribucionHistorica[] = (() => {
  const meses: DatosDistribucionHistorica[] = [];
  const fechaBase = new Date(2020, 0, 1);

  for (let i = 0; i < 73; i++) {
    const d = new Date(fechaBase);
    d.setMonth(d.getMonth() + i);
    const etiqueta = d.toLocaleDateString("es-CL", { year: "2-digit", month: "short" });
    const t = i / 72; // 0→1 normalizado

    // Tendencias realistas:
    // - <1 BTC: crece lento (más retail entra)
    // - 1-10: crece moderado
    // - 10-100: estable con leve crecimiento
    // - 100-1K: estable
    // - 1K-10K: decrece levemente (acumuladores se consolidan)
    // - >10K: decrece (Satoshi coins se redistribuyen, exchanges pierden dominio)
    meses.push({
      fecha: etiqueta,
      idx: i,
      "<1":     8.2  + t * 1.2  + Math.sin(t * Math.PI * 3) * 0.3,
      "1-10":   12.5 + t * 1.0  + Math.sin(t * Math.PI * 2.5) * 0.4,
      "10-100": 21.0 + t * 0.8  + Math.cos(t * Math.PI * 2) * 0.5,
      "100-1K": 20.5 + t * 0.3  + Math.sin(t * Math.PI * 1.5) * 0.6,
      "1K-10K": 23.8 - t * 1.2  + Math.cos(t * Math.PI * 1) * 0.5,
      ">10K":   14.0 - t * 2.1  + Math.sin(t * Math.PI * 0.8) * 0.4,
    });
  }
  return meses;
})();

export const BANDAS_DIST: BandaDistribucion[] = [
  "<1", "1-10", "10-100", "100-1K", "1K-10K", ">10K",
];

export const COLORES_DIST = [
  "#4a6274",  // <1 BTC     — azul oscuro
  "#6b93a1",  // 1-10 BTC   — azul medio
  "#7db0b8",  // 10-100 BTC — teal
  "#92cdd4",  // 100-1K     — teal claro
  "#a8e4eb",  // 1K-10K     — celeste
  "#f0b429",  // >10K       — gold (acento)
];

export const NOMBRES_DIST: Record<string, string> = {
  "<1":     "< 1 BTC",
  "1-10":   "1 – 10 BTC",
  "10-100": "10 – 100 BTC",
  "100-1K": "100 – 1K BTC",
  "1K-10K": "1K – 10K BTC",
  ">10K":   "> 10K BTC",
};
