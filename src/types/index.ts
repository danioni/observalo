export interface DatosDistribucion {
  cohorte: string;
  rango: string;
  direcciones: number;
  btcRetenido: number;
  pctSupply: number;
  color: string;
}

export interface DatosDistribucionConLog extends DatosDistribucion {
  dirLog: number;
}

export interface DatosOndas {
  fecha: string;
  idx: number;
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

export interface FlujosDiarios {
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

export interface FlujosSemanales {
  fecha: Date;
  etDia: string;
  etCorta: string;
  mes: number;
  flujoNeto: number;
  entrada: number;
  salida: number;
  reserva: number;
}

export interface HistorialMineria {
  fecha: string;
  hashrate: number;
  dificultad: number;
  pctComisiones: number;
  recompensa: number;
}

export interface DatosVivosMineria {
  hashrate: string | null;
  dificultad: string | null;
  comisiones: {
    fastestFee: number;
    halfHourFee: number;
    hourFee: number;
    economyFee: number;
    minimumFee: number;
  } | null;
  bloque: {
    height: number;
    tx_count: number;
    size: number;
  } | null;
  ajuste: {
    diffChange: number;
  } | null;
}

export interface Pestana {
  id: string;
  etiqueta: string;
  icono: string;
}

export type BandaOndas = "<1m" | "1-3m" | "3-6m" | "6-12m" | "1-2a" | "2-3a" | "3-5a" | "5-7a" | "7-10a" | "10a+";

export type CategoriaHolder = "treasury" | "minero" | "etf" | "exchange" | "gobierno" | "protocolo";

export interface Holder {
  nombre: string;
  ticker?: string;
  categoria: CategoriaHolder;
  btc: number;
  pais: string;
  color: string;
}

export type CategoriaSupply = "no_minado" | "perdido" | "institucional" | "exchange" | "gobierno" | "soberano";

export interface BloqueSupply {
  nombre: string;
  btc: number;
  categoria: CategoriaSupply;
  color: string;
  descripcion: string;
}
