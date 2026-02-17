import { HistorialMineria } from "@/types";

export const HISTORIAL_MINERIA: HistorialMineria[] = (() => {
  const datos: HistorialMineria[] = [];
  const base = new Date(2023, 6, 1);
  for (let i = 0; i < 30; i++) {
    const d = new Date(base);
    d.setMonth(d.getMonth() + i);
    const et = d.toLocaleDateString("es-CL", { year: "2-digit", month: "short" });
    datos.push({
      fecha: et,
      hashrate: Math.round(420 + i * 22 + Math.sin(i * 0.7) * 15),
      dificultad: parseFloat((52 + i * 3.5 + Math.cos(i * 0.5) * 2).toFixed(1)),
      pctComisiones: parseFloat(Math.max(0.5, 2 + Math.sin(i / 4) * 3 + Math.sin(i * 0.3) * 1.5).toFixed(1)),
      recompensa: i >= 12 ? 3.125 : 6.25,
    });
  }
  return datos;
})();
