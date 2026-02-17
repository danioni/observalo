import type { BloqueSupply } from "@/types";
import { DATOS_HOLDERS } from "@/data/holders";

// Constantes fundamentales de Bitcoin
export const BTC_CAP = 21_000_000;
export const BTC_CIRCULANTE = 19_820_000;
export const BTC_NO_MINADO = BTC_CAP - BTC_CIRCULANTE; // ~1,180,000
export const BTC_PERDIDO = 3_700_000; // Estimación conservadora (Chainalysis, Glassnode)
// Incluye: ~1.1M de Satoshi, llaves perdidas, envíos a burn addresses, hardware destruido

export const POBLACION_MUNDIAL = 8_200_000_000;
export const ADULTOS_MUNDIAL = 5_500_000_000;

// Sumas dinámicas desde holders.ts
function sumarCategoria(cat: string): number {
  return DATOS_HOLDERS.filter(h => h.categoria === cat).reduce((s, h) => s + h.btc, 0);
}

export const BTC_ETFS = sumarCategoria("etf");
export const BTC_TREASURIES = sumarCategoria("treasury");
export const BTC_GOBIERNOS = sumarCategoria("gobierno");
export const BTC_PROTOCOLOS = sumarCategoria("protocolo");
export const BTC_EXCHANGES = sumarCategoria("exchange");
export const BTC_MINEROS = sumarCategoria("minero");

export const BTC_INSTITUCIONAL = BTC_ETFS + BTC_TREASURIES + BTC_MINEROS;

export const BTC_SOBERANO = BTC_CAP
  - BTC_NO_MINADO
  - BTC_PERDIDO
  - BTC_ETFS
  - BTC_TREASURIES
  - BTC_MINEROS
  - BTC_GOBIERNOS
  - BTC_PROTOCOLOS
  - BTC_EXCHANGES;

/**
 * Desglose completo del supply de 21M BTC.
 * Todos los bloques suman exactamente 21,000,000.
 */
export const BLOQUES_SUPPLY: BloqueSupply[] = [
  {
    nombre: "Supply soberano",
    btc: BTC_SOBERANO,
    categoria: "soberano",
    color: "#22c55e",
    descripcion: "BTC en autocustodia por individuos — el verdadero supply libre",
  },
  {
    nombre: "Exchanges",
    btc: BTC_EXCHANGES,
    categoria: "exchange",
    color: "#06b6d4",
    descripcion: "BTC en custodia de exchanges — propiedad de usuarios pero no soberanos",
  },
  {
    nombre: "ETFs al contado",
    btc: BTC_ETFS,
    categoria: "institucional",
    color: "#818cf8",
    descripcion: "ETFs spot de Bitcoin (BlackRock, Fidelity, Grayscale, etc.)",
  },
  {
    nombre: "Treasuries corporativas",
    btc: BTC_TREASURIES + BTC_MINEROS,
    categoria: "institucional",
    color: "#f0b429",
    descripcion: "Empresas públicas y mineros que acumulan BTC en balance",
  },
  {
    nombre: "Gobiernos",
    btc: BTC_GOBIERNOS,
    categoria: "gobierno",
    color: "#ef4444",
    descripcion: "BTC en poder de estados — mayoritariamente incautados",
  },
  {
    nombre: "Protocolos",
    btc: BTC_PROTOCOLOS,
    categoria: "institucional",
    color: "#f97316",
    descripcion: "BTC bloqueado en protocolos (WBTC, cbBTC, Lightning, etc.)",
  },
  {
    nombre: "Perdido para siempre",
    btc: BTC_PERDIDO,
    categoria: "perdido",
    color: "#3d4450",
    descripcion: "Llaves perdidas, monedas de Satoshi, hardware destruido (~3.7M BTC)",
  },
  {
    nombre: "No minado aún",
    btc: BTC_NO_MINADO,
    categoria: "no_minado",
    color: "#2a3040",
    descripcion: "BTC que aún no se ha emitido — se liberará gradualmente hasta ~2140",
  },
];

/**
 * Pasos del embudo de escasez.
 * Cada paso resta un bloque del total anterior.
 */
export const EMBUDO = [
  { etiqueta: "Cap máximo", btc: BTC_CAP, resta: 0, color: "#e0e8f0" },
  { etiqueta: "No minado aún", btc: BTC_CIRCULANTE, resta: BTC_NO_MINADO, color: "#2a3040" },
  { etiqueta: "Perdido para siempre", btc: BTC_CIRCULANTE - BTC_PERDIDO, resta: BTC_PERDIDO, color: "#3d4450" },
  { etiqueta: "Institucional (ETFs + corp.)", btc: BTC_CIRCULANTE - BTC_PERDIDO - BTC_INSTITUCIONAL, resta: BTC_INSTITUCIONAL, color: "#818cf8" },
  { etiqueta: "Protocolos + gobiernos", btc: BTC_CIRCULANTE - BTC_PERDIDO - BTC_INSTITUCIONAL - BTC_PROTOCOLOS - BTC_GOBIERNOS, resta: BTC_PROTOCOLOS + BTC_GOBIERNOS, color: "#ef4444" },
  { etiqueta: "Exchanges (custodia)", btc: BTC_SOBERANO, resta: BTC_EXCHANGES, color: "#06b6d4" },
];
