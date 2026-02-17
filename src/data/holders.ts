import type { Holder, CategoriaHolder } from "@/types";

// Colores por categoría
export const COLORES_CATEGORIA: Record<CategoriaHolder, string> = {
  treasury: "#f0b429",
  etf: "#818cf8",
  exchange: "#06b6d4",
  minero: "#22c55e",
  gobierno: "#ef4444",
  protocolo: "#f97316",
};

export const NOMBRES_CATEGORIA: Record<CategoriaHolder, string> = {
  treasury: "Treasuries",
  etf: "ETFs",
  exchange: "Exchanges",
  minero: "Mineros",
  gobierno: "Gobiernos",
  protocolo: "Protocolos",
};

export const ICONO_CATEGORIA: Record<CategoriaHolder, string> = {
  treasury: "◆",
  etf: "◈",
  exchange: "⇄",
  minero: "⛏",
  gobierno: "⚑",
  protocolo: "⬡",
};

// Supply total circulante aprox (feb 2026)
export const BTC_SUPPLY = 19_820_000;

/**
 * Datos curados de los mayores holders identificados de Bitcoin.
 * Fuentes públicas: BitcoinTreasuries.NET, informes SEC, mempool.space.
 * Última actualización: feb 2026 (datos aproximados).
 */
export const DATOS_HOLDERS: Holder[] = [
  // ── TREASURIES (empresas públicas) ─────────────────────────
  { nombre: "Strategy", ticker: "MSTR", categoria: "treasury", btc: 478_740, pais: "US", color: COLORES_CATEGORIA.treasury },
  { nombre: "Marathon Digital", ticker: "MARA", categoria: "treasury", btc: 46_376, pais: "US", color: COLORES_CATEGORIA.treasury },
  { nombre: "Twenty One Capital", ticker: "XXI", categoria: "treasury", btc: 43_514, pais: "US", color: COLORES_CATEGORIA.treasury },
  { nombre: "Metaplanet", ticker: "MPJPY", categoria: "treasury", btc: 35_102, pais: "JP", color: COLORES_CATEGORIA.treasury },
  { nombre: "Bitcoin Standard Treasury", ticker: "CEPO", categoria: "treasury", btc: 30_021, pais: "US", color: COLORES_CATEGORIA.treasury },
  { nombre: "Bullish", ticker: "BLSH", categoria: "treasury", btc: 24_300, pais: "US", color: COLORES_CATEGORIA.treasury },
  { nombre: "Riot Platforms", ticker: "RIOT", categoria: "treasury", btc: 18_005, pais: "US", color: COLORES_CATEGORIA.treasury },
  { nombre: "Coinbase Global", ticker: "COIN", categoria: "treasury", btc: 15_389, pais: "US", color: COLORES_CATEGORIA.treasury },
  { nombre: "Hut 8 Mining", ticker: "HUT", categoria: "treasury", btc: 13_696, pais: "US", color: COLORES_CATEGORIA.treasury },
  { nombre: "CleanSpark", ticker: "CLSK", categoria: "treasury", btc: 13_513, pais: "US", color: COLORES_CATEGORIA.treasury },
  { nombre: "Tesla", ticker: "TSLA", categoria: "treasury", btc: 11_509, pais: "US", color: COLORES_CATEGORIA.treasury },
  { nombre: "Block Inc.", ticker: "XYZ", categoria: "treasury", btc: 8_780, pais: "US", color: COLORES_CATEGORIA.treasury },
  { nombre: "Galaxy Digital", ticker: "GLXY", categoria: "treasury", btc: 6_894, pais: "US", color: COLORES_CATEGORIA.treasury },
  { nombre: "GameStop", ticker: "GME", categoria: "treasury", btc: 4_710, pais: "US", color: COLORES_CATEGORIA.treasury },
  { nombre: "Gemini Space Station", ticker: "GEMI", categoria: "treasury", btc: 4_002, pais: "US", color: COLORES_CATEGORIA.treasury },
  { nombre: "Capital B", ticker: "ALCPB", categoria: "treasury", btc: 2_834, pais: "FR", color: COLORES_CATEGORIA.treasury },
  { nombre: "DeFi Technologies", ticker: "DEFI", categoria: "treasury", btc: 2_452, pais: "CA", color: COLORES_CATEGORIA.treasury },

  // ── ETFs SPOT US ───────────────────────────────────────────
  { nombre: "BlackRock (IBIT)", ticker: "IBIT", categoria: "etf", btc: 590_000, pais: "US", color: COLORES_CATEGORIA.etf },
  { nombre: "Fidelity (FBTC)", ticker: "FBTC", categoria: "etf", btc: 210_000, pais: "US", color: COLORES_CATEGORIA.etf },
  { nombre: "Grayscale (GBTC)", ticker: "GBTC", categoria: "etf", btc: 195_000, pais: "US", color: COLORES_CATEGORIA.etf },
  { nombre: "Bitwise (BITB)", ticker: "BITB", categoria: "etf", btc: 48_000, pais: "US", color: COLORES_CATEGORIA.etf },
  { nombre: "Ark/21Shares (ARKB)", ticker: "ARKB", categoria: "etf", btc: 52_000, pais: "US", color: COLORES_CATEGORIA.etf },
  { nombre: "Grayscale Mini (BTC)", ticker: "BTC", categoria: "etf", btc: 38_000, pais: "US", color: COLORES_CATEGORIA.etf },
  { nombre: "VanEck (HODL)", ticker: "HODL", categoria: "etf", btc: 16_000, pais: "US", color: COLORES_CATEGORIA.etf },
  { nombre: "Invesco (BTCO)", ticker: "BTCO", categoria: "etf", btc: 12_500, pais: "US", color: COLORES_CATEGORIA.etf },
  { nombre: "Franklin (EZBC)", ticker: "EZBC", categoria: "etf", btc: 10_500, pais: "US", color: COLORES_CATEGORIA.etf },
  { nombre: "Valkyrie (BRRR)", ticker: "BRRR", categoria: "etf", btc: 8_200, pais: "US", color: COLORES_CATEGORIA.etf },
  { nombre: "WisdomTree (BTCW)", ticker: "BTCW", categoria: "etf", btc: 3_800, pais: "US", color: COLORES_CATEGORIA.etf },

  // ── EXCHANGES ──────────────────────────────────────────────
  { nombre: "Binance", categoria: "exchange", btc: 570_000, pais: "KY", color: COLORES_CATEGORIA.exchange },
  { nombre: "Coinbase Custody", categoria: "exchange", btc: 830_000, pais: "US", color: COLORES_CATEGORIA.exchange },
  { nombre: "Bitfinex", categoria: "exchange", btc: 290_000, pais: "VG", color: COLORES_CATEGORIA.exchange },
  { nombre: "Kraken", categoria: "exchange", btc: 130_000, pais: "US", color: COLORES_CATEGORIA.exchange },
  { nombre: "OKX", categoria: "exchange", btc: 95_000, pais: "SC", color: COLORES_CATEGORIA.exchange },
  { nombre: "Gemini", categoria: "exchange", btc: 52_000, pais: "US", color: COLORES_CATEGORIA.exchange },
  { nombre: "Bitstamp", categoria: "exchange", btc: 32_000, pais: "LU", color: COLORES_CATEGORIA.exchange },

  // ── MINEROS PÚBLICOS ───────────────────────────────────────
  // Nota: MARA, Riot, Hut8, CleanSpark ya están como treasury (cotizan en bolsa).
  // Aquí van mineros que no están listados arriba.
  { nombre: "IREN (Iris Energy)", ticker: "IREN", categoria: "minero", btc: 5_700, pais: "AU", color: COLORES_CATEGORIA.minero },
  { nombre: "Bitfarms", ticker: "BITF", categoria: "minero", btc: 1_827, pais: "CA", color: COLORES_CATEGORIA.minero },
  { nombre: "Cipher Mining", ticker: "CIFR", categoria: "minero", btc: 1_500, pais: "US", color: COLORES_CATEGORIA.minero },
  { nombre: "Bitdeer", ticker: "BTDR", categoria: "minero", btc: 943, pais: "SG", color: COLORES_CATEGORIA.minero },
  { nombre: "TeraWulf", ticker: "WULF", categoria: "minero", btc: 720, pais: "US", color: COLORES_CATEGORIA.minero },

  // ── GOBIERNOS ──────────────────────────────────────────────
  { nombre: "EE.UU. (incautado)", categoria: "gobierno", btc: 198_000, pais: "US", color: COLORES_CATEGORIA.gobierno },
  { nombre: "China (incautado)", categoria: "gobierno", btc: 190_000, pais: "CN", color: COLORES_CATEGORIA.gobierno },
  { nombre: "Reino Unido (incautado)", categoria: "gobierno", btc: 61_000, pais: "GB", color: COLORES_CATEGORIA.gobierno },
  { nombre: "El Salvador", categoria: "gobierno", btc: 6_089, pais: "SV", color: COLORES_CATEGORIA.gobierno },
  { nombre: "Bután (Druk Holding)", categoria: "gobierno", btc: 11_688, pais: "BT", color: COLORES_CATEGORIA.gobierno },

  // ── PROTOCOLOS ─────────────────────────────────────────────
  { nombre: "WBTC (BitGo)", categoria: "protocolo", btc: 142_000, pais: "US", color: COLORES_CATEGORIA.protocolo },
  { nombre: "cbBTC (Coinbase)", categoria: "protocolo", btc: 28_000, pais: "US", color: COLORES_CATEGORIA.protocolo },
  { nombre: "tBTC (Threshold)", categoria: "protocolo", btc: 4_200, pais: "—", color: COLORES_CATEGORIA.protocolo },
  { nombre: "Lightning Network", categoria: "protocolo", btc: 5_300, pais: "—", color: COLORES_CATEGORIA.protocolo },
];
