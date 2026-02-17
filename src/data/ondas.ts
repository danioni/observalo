import { DatosOndas, BandaOndas } from "@/types";

export const DATOS_ONDAS: DatosOndas[] = (() => {
  const meses: DatosOndas[] = [];
  const fechaBase = new Date(2020, 0, 1);
  for (let i = 0; i < 73; i++) {
    const d = new Date(fechaBase);
    d.setMonth(d.getMonth() + i);
    const etiqueta = d.toLocaleDateString("es-CL", { year: "2-digit", month: "short" });
    const ciclo = i / 72;
    const halving = Math.max(0, (i - 48) / 24);
    meses.push({
      fecha: etiqueta,
      idx: i,
      "<1m": 8 + Math.sin(ciclo * Math.PI * 4) * 3 + (halving > 0 ? halving * 2 : 0),
      "1-3m": 7 + Math.sin(ciclo * Math.PI * 3) * 2,
      "3-6m": 8 + Math.cos(ciclo * Math.PI * 2.5) * 2.5,
      "6-12m": 10 + Math.sin(ciclo * Math.PI * 2) * 3,
      "1-2a": 14 + Math.cos(ciclo * Math.PI * 1.5) * 4,
      "2-3a": 12 + Math.sin(ciclo * Math.PI * 1) * 3,
      "3-5a": 15 + Math.cos(ciclo * Math.PI * 0.8) * 4,
      "5-7a": 11 + Math.sin(ciclo * Math.PI * 0.5) * 2 + halving * 3,
      "7-10a": 8 + ciclo * 5,
      "10a+": 7 + ciclo * 8,
    });
  }
  return meses;
})();

export const COLORES_ONDAS = [
  "#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e",
  "#14b8a6", "#06b6d4", "#3b82f6", "#8b5cf6", "#a855f7",
];

export const BANDAS: BandaOndas[] = [
  "<1m", "1-3m", "3-6m", "6-12m", "1-2a",
  "2-3a", "3-5a", "5-7a", "7-10a", "10a+",
];

export const NOMBRES_BANDAS: Record<string, string> = {
  "<1m": "< 1 mes",
  "1-3m": "1-3 meses",
  "3-6m": "3-6 meses",
  "6-12m": "6-12 meses",
  "1-2a": "1-2 años",
  "2-3a": "2-3 años",
  "3-5a": "3-5 años",
  "5-7a": "5-7 años",
  "7-10a": "7-10 años",
  "10a+": "10+ años",
};
