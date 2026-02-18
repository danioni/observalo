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
    // BTC held (in units matching the supply snapshots)
    const btc = {
      "<1":     1_600_000 + t * 200_000 + Math.sin(t * Math.PI * 3) * 30_000,
      "1-10":   2_500_000 + t * 300_000 + Math.sin(t * Math.PI * 2.5) * 50_000,
      "10-100": 4_200_000 + t * 200_000 + Math.cos(t * Math.PI * 2) * 60_000,
      "100-1K": 4_100_000 + t * 100_000 + Math.sin(t * Math.PI * 1.5) * 80_000,
      "1K-10K": 4_800_000 - t * 300_000 + Math.cos(t * Math.PI * 1) * 70_000,
      ">10K":   2_800_000 - t * 500_000 + Math.sin(t * Math.PI * 0.8) * 50_000,
    };

    // Addresses (rough realistic counts)
    const dir = {
      "dir_<1":     38_000_000 + t * 12_000_000 + Math.sin(t * Math.PI * 3) * 500_000,
      "dir_1-10":   800_000    + t * 150_000    + Math.sin(t * Math.PI * 2.5) * 20_000,
      "dir_10-100": 145_000    + t * 15_000     + Math.cos(t * Math.PI * 2) * 3_000,
      "dir_100-1K": 15_500     + t * 1_500      + Math.sin(t * Math.PI * 1.5) * 300,
      "dir_1K-10K": 2_050      + t * 100        + Math.cos(t * Math.PI * 1) * 30,
      "dir_>10K":   105        - t * 5          + Math.sin(t * Math.PI * 0.8) * 3,
    };

    meses.push({
      fecha: etiqueta,
      idx: i,
      ...btc,
      ...dir,
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

export const BANDAS_DIR: `dir_${BandaDistribucion}`[] = [
  "dir_<1", "dir_1-10", "dir_10-100", "dir_100-1K", "dir_1K-10K", "dir_>10K",
];

export const NOMBRES_DIST: Record<string, string> = {
  "<1":     "< 1 BTC",
  "1-10":   "1 – 10 BTC",
  "10-100": "10 – 100 BTC",
  "100-1K": "100 – 1K BTC",
  "1K-10K": "1K – 10K BTC",
  ">10K":   "> 10K BTC",
  "dir_<1":     "< 1 BTC",
  "dir_1-10":   "1 – 10 BTC",
  "dir_10-100": "10 – 100 BTC",
  "dir_100-1K": "100 – 1K BTC",
  "dir_1K-10K": "1K – 10K BTC",
  "dir_>10K":   "> 10K BTC",
};
