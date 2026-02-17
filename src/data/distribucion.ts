import { DatosDistribucion } from "@/types";

export const DATOS_DISTRIBUCION: DatosDistribucion[] = [
  { cohorte: "Plancton", rango: "< 0.001 BTC", direcciones: 22_847_000, btcRetenido: 1_785, pctSupply: 0.009, color: "#3b4d61" },
  { cohorte: "Camarón", rango: "0.001 – 0.1", direcciones: 15_234_000, btcRetenido: 352_410, pctSupply: 1.68, color: "#4a6274" },
  { cohorte: "Cangrejo", rango: "0.1 – 1", direcciones: 4_127_000, btcRetenido: 1_423_500, pctSupply: 6.78, color: "#5a7a8a" },
  { cohorte: "Pez", rango: "1 – 10", direcciones: 872_000, btcRetenido: 2_648_300, pctSupply: 12.61, color: "#6b93a1" },
  { cohorte: "Tiburón", rango: "10 – 100", direcciones: 148_200, btcRetenido: 4_523_800, pctSupply: 21.54, color: "#7db0b8" },
  { cohorte: "Ballena", rango: "100 – 1K", direcciones: 15_870, btcRetenido: 4_187_200, pctSupply: 19.94, color: "#92cdd4" },
  { cohorte: "Jorobada", rango: "1K – 10K", direcciones: 2_089, btcRetenido: 4_892_100, pctSupply: 23.30, color: "#a8e4eb" },
  { cohorte: "Mega", rango: "> 10K", direcciones: 108, btcRetenido: 2_967_400, pctSupply: 14.13, color: "#f0b429" },
];
