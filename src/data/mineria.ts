import { HistorialMineria } from "@/types";
import { supplyAtDate, rewardAtDate } from "@/lib/supply";

/**
 * Historia completa de minería Bitcoin: enero 2009 — presente.
 * Hashrate y dificultad son estimaciones históricas plausibles por era.
 * El suministro es cálculo determinístico exacto.
 */

// Hashrate histórico por era (EH/s) — basado en datos públicos conocidos
// Fuentes: blockchain.com, bitinfocharts, Cambridge Bitcoin Electricity Index
function hashrateParaMes(year: number, month: number): number {
  const t = year + month / 12;

  // 2009: CPU mining, ~0.000004 - 0.00001 EH/s
  if (t < 2010) return parseFloat((0.000004 + (t - 2009) * 0.000006).toFixed(6));
  // 2010: CPU/GPU transition
  if (t < 2011) return parseFloat((0.00001 + (t - 2010) * 0.00009).toFixed(6));
  // 2011: GPU era, ~0.0001 - 0.01 EH/s
  if (t < 2012) return parseFloat((0.0001 + (t - 2011) * 0.01).toFixed(5));
  // 2012: Late GPU / early FPGA
  if (t < 2013) return parseFloat((0.01 + (t - 2012) * 0.1).toFixed(4));
  // 2013: ASIC revolution
  if (t < 2014) return parseFloat((0.1 + (t - 2013) * 5).toFixed(2));
  // 2014: ASIC dominance
  if (t < 2015) return parseFloat((5 + (t - 2014) * -1.5).toFixed(1)) || 0.3;
  if (t < 2014.5) return parseFloat((5 + (t - 2014) * -2).toFixed(1));
  // Corrección: crecimiento exponencial más realista
  if (t < 2015) return parseFloat(Math.max(0.3, 3 + (t - 2014) * 0.5).toFixed(1));
  // 2015-2016: Estabilización y crecimiento
  if (t < 2016) return parseFloat((1 + (t - 2015) * 1.5).toFixed(1));
  if (t < 2017) return parseFloat((2.5 + (t - 2016) * 4).toFixed(1));
  // 2017-2018: Boom
  if (t < 2018) return parseFloat((6 + (t - 2017) * 30).toFixed(0));
  if (t < 2019) return parseFloat((36 + (t - 2018) * 10 + Math.sin((t - 2018) * 6) * 5).toFixed(0));
  // 2019-2020: Maduración
  if (t < 2020) return Math.round(45 + (t - 2019) * 70 + Math.sin((t - 2019) * 4) * 10);
  // 2020-2021: Pre-China ban
  if (t < 2021) return Math.round(115 + (t - 2020) * 50 + Math.sin((t - 2020) * 3) * 15);
  // 2021: China ban crash mid-year then recovery
  if (t < 2021.5) return Math.round(165 + (t - 2021) * 40);
  if (t < 2021.75) return Math.round(85 + (t - 2021.5) * 200); // post-ban crash & recovery
  if (t < 2022) return Math.round(180 + (t - 2021.75) * 80);
  // 2022: Steady growth post-China recovery
  if (t < 2023) return Math.round(200 + (t - 2022) * 150 + Math.sin((t - 2022) * 4) * 15);
  // 2023-2024: Nuevos ATH
  if (t < 2024) return Math.round(400 + (t - 2023) * 250 + Math.sin((t - 2023) * 5) * 20);
  // 2024-2025: Post-halving boom
  if (t < 2025) return Math.round(600 + (t - 2024) * 250 + Math.sin((t - 2024) * 4) * 25);
  // 2025+
  return Math.round(800 + (t - 2025) * 150 + Math.sin((t - 2025) * 3) * 20);
}

// Dificultad histórica (Trillones) — correlacionada con hashrate
function dificultadParaMes(year: number, month: number): number {
  const t = year + month / 12;

  if (t < 2010) return parseFloat((0.000000001 + (t - 2009) * 0.00000001).toExponential(2));
  if (t < 2011) return parseFloat((0.00000001 + (t - 2010) * 0.0000001).toFixed(9));
  if (t < 2012) return parseFloat((0.0000001 + (t - 2011) * 0.000002).toFixed(7));
  if (t < 2013) return parseFloat((0.000002 + (t - 2012) * 0.00005).toFixed(6));
  if (t < 2014) return parseFloat((0.00005 + (t - 2013) * 0.005).toFixed(5));
  if (t < 2015) return parseFloat((0.005 + (t - 2014) * 0.03).toFixed(4));
  if (t < 2016) return parseFloat((0.035 + (t - 2015) * 0.03).toFixed(4));
  if (t < 2017) return parseFloat((0.065 + (t - 2016) * 0.15).toFixed(3));
  if (t < 2018) return parseFloat((0.2 + (t - 2017) * 2.8).toFixed(1));
  if (t < 2019) return parseFloat((3 + (t - 2018) * 3 + Math.sin((t - 2018) * 5) * 0.5).toFixed(1));
  if (t < 2020) return parseFloat((6 + (t - 2019) * 7).toFixed(1));
  if (t < 2021) return parseFloat((13 + (t - 2020) * 10).toFixed(1));
  if (t < 2022) return parseFloat((20 + (t - 2021) * 10 + Math.sin((t - 2021) * 3) * 3).toFixed(1));
  if (t < 2023) return parseFloat((28 + (t - 2022) * 22).toFixed(1));
  if (t < 2024) return parseFloat((52 + (t - 2023) * 30).toFixed(1));
  if (t < 2025) return parseFloat((80 + (t - 2024) * 40).toFixed(1));
  return parseFloat((120 + (t - 2025) * 30).toFixed(1));
}

// Comisiones como % del ingreso minero — simuladas con patrones históricos
function comisionesParaMes(year: number, month: number): number {
  const t = year + month / 12;
  // Eventos conocidos de alta congestión
  // Dec 2017: ~30%, Jun 2019: spike, May 2021: spike, Apr 2024: Ordinals/Runes
  let base = 1.5;
  // 2017 bubble
  if (t >= 2017.9 && t < 2018.1) base = 25 + Math.sin((t - 2017.9) * 15) * 8;
  else if (t >= 2017.5 && t < 2018.3) base = 5 + (t - 2017.5) * 15;
  // 2021 bull
  else if (t >= 2021.3 && t < 2021.5) base = 12 + Math.sin((t - 2021.3) * 10) * 5;
  // 2023 Ordinals
  else if (t >= 2023.4 && t < 2023.6) base = 8 + Math.sin((t - 2023.4) * 10) * 4;
  // 2024 Runes launch
  else if (t >= 2024.3 && t < 2024.45) base = 35 + Math.sin((t - 2024.3) * 20) * 10;
  // Baseline varies by era
  else if (t < 2015) base = 0.3 + Math.sin(t * 2) * 0.2;
  else if (t < 2020) base = 1 + Math.sin(t * 3) * 1;
  else base = 2 + Math.sin(t * 4) * 1.5;

  return parseFloat(Math.max(0.1, base).toFixed(1));
}

export const HISTORIAL_MINERIA: HistorialMineria[] = (() => {
  const datos: HistorialMineria[] = [];
  const now = new Date();
  const start = new Date(2009, 0, 1);

  const d = new Date(start);
  while (d <= now) {
    const year = d.getFullYear();
    const month = d.getMonth();
    const fechaRaw = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const fecha = d.toLocaleDateString("es-CL", { year: "2-digit", month: "short" });

    const { supply, blockHeight } = supplyAtDate(d);

    datos.push({
      fecha,
      fechaRaw,
      hashrate: hashrateParaMes(year, month),
      dificultad: dificultadParaMes(year, month),
      pctComisiones: comisionesParaMes(year, month),
      recompensa: rewardAtDate(d),
      suministro: supply,
      bloque: blockHeight,
    });

    d.setMonth(d.getMonth() + 1);
  }

  return datos;
})();

/** Proyección de recompensa por bloque hasta ~2044 (para chart extendido) */
export const RECOMPENSA_PROYECTADA: { fecha: string; fechaRaw: string; recompensa: number; proyectado?: boolean }[] = (() => {
  const datos: { fecha: string; fechaRaw: string; recompensa: number; proyectado?: boolean }[] = [];
  const now = new Date();
  const start = new Date(2009, 0, 1);
  const end = new Date(2045, 0, 1);

  const d = new Date(start);
  while (d <= end) {
    const year = d.getFullYear();
    const month = d.getMonth();
    const fechaRaw = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const fecha = d.toLocaleDateString("es-CL", { year: "2-digit", month: "short" });

    datos.push({
      fecha,
      fechaRaw,
      recompensa: rewardAtDate(d),
      proyectado: d > now,
    });

    d.setMonth(d.getMonth() + 1);
  }

  return datos;
})();

/** Suministro acumulado con proyección hasta ~2044 */
export interface SuministroProyectado {
  fecha: string;
  fechaRaw: string;
  suministro: number;
  suministroReal: number | null;   // gold area (historical)
  suministroProy: number | null;   // gray area (projection)
  recompensa: number;
  bloque: number;
  proyectado: boolean;
}

export const SUMINISTRO_PROYECTADO: SuministroProyectado[] = (() => {
  const datos: SuministroProyectado[] = [];
  const now = new Date();
  const start = new Date(2009, 0, 1);
  const end = new Date(2045, 0, 1);

  const d = new Date(start);
  while (d <= end) {
    const year = d.getFullYear();
    const month = d.getMonth();
    const fechaRaw = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const fecha = d.toLocaleDateString("es-CL", { year: "2-digit", month: "short" });
    const { supply, blockHeight, reward } = supplyAtDate(d);
    const esProy = d > now;

    datos.push({
      fecha,
      fechaRaw,
      suministro: supply,
      suministroReal: esProy ? null : supply,
      suministroProy: esProy ? supply : null,
      recompensa: reward,
      bloque: blockHeight,
      proyectado: esProy,
    });

    d.setMonth(d.getMonth() + 1);
  }

  // Bridge: set the last historical point's projection value too,
  // so the gray area connects seamlessly to the gold area
  const lastReal = datos.filter(d => !d.proyectado);
  if (lastReal.length > 0) {
    const bridge = lastReal[lastReal.length - 1];
    bridge.suministroProy = bridge.suministro;
  }

  return datos;
})();
