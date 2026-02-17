import { NextResponse } from "next/server";
import { cachedFetch } from "@/lib/cache";
import type { ApiEnvelope } from "@/types";

// --- CoinGlass types ---
interface CoinGlassResponse {
  code: string;
  data: {
    time_list: number[];
    price_list: number[];
    data_map: Record<string, number[]>;
  };
}

// --- BGeometrics types ---
interface BGeometricsNetflow {
  d: string;
  unixTs: number;
  exchangeNetflowBtc: number;
}

interface BGeometricsReserve {
  d: string;
  unixTs: number;
  exchangeReserveBtc: number;
}

// --- Output types ---
export interface FlujosApiItem {
  d: string; // YYYY-MM-DD
  fecha: string;
  flujoNeto: number;
  reserva: number;
}

interface FlujosData {
  diarios: FlujosApiItem[];
  semanales: FlujosApiItem[];
}

function toFecha(d: string): string {
  return new Date(d + "T12:00:00Z").toLocaleDateString("es-CL", {
    year: "2-digit", month: "short", day: "numeric", timeZone: "UTC",
  });
}

function buildWeekly(diarios: FlujosApiItem[]): FlujosApiItem[] {
  const semanales: FlujosApiItem[] = [];
  for (let i = 0; i < diarios.length; i += 7) {
    const week = diarios.slice(i, i + 7);
    if (week.length === 0) continue;
    semanales.push({
      d: week[0].d,
      fecha: week[0].fecha,
      flujoNeto: Math.round(week.reduce((s, x) => s + x.flujoNeto, 0)),
      reserva: week[week.length - 1].reserva,
    });
  }
  return semanales;
}

// --- BGeometrics: historical data (2012 – early 2024) ---
async function fetchBGeometrics(): Promise<FlujosApiItem[]> {
  const [nfRes, resRes] = await Promise.all([
    fetch("https://bitcoin-data.com/v1/exchange-netflow-btc?size=5000", {
      signal: AbortSignal.timeout(20000),
    }),
    fetch("https://bitcoin-data.com/v1/exchange-reserve-btc?size=5000", {
      signal: AbortSignal.timeout(20000),
    }),
  ]);

  if (!nfRes.ok || !resRes.ok) return [];

  const rawNf: BGeometricsNetflow[] = await nfRes.json();
  const rawRes: BGeometricsReserve[] = await resRes.json();

  // Build reserve lookup
  const reserveMap = new Map<string, number>();
  for (const r of rawRes) {
    reserveMap.set(r.d, Math.round(r.exchangeReserveBtc));
  }

  const diarios: FlujosApiItem[] = [];
  let lastReserve = rawRes.length > 0 ? Math.round(rawRes[0].exchangeReserveBtc) : 0;

  for (const nf of rawNf) {
    const reserve = reserveMap.get(nf.d) ?? lastReserve;
    lastReserve = reserve;
    diarios.push({
      d: nf.d,
      fecha: toFecha(nf.d),
      flujoNeto: Math.round(nf.exchangeNetflowBtc),
      reserva: reserve,
    });
  }

  return diarios;
}

// --- CoinGlass: recent data (feb 2024 – today) ---
async function fetchCoinGlass(): Promise<FlujosApiItem[]> {
  const apiKey = process.env.COINGLASS_API_KEY;
  if (!apiKey) return [];

  const res = await fetch(
    "https://open-api-v4.coinglass.com/api/exchange/balance/chart?symbol=BTC",
    {
      headers: { "CG-API-KEY": apiKey },
      signal: AbortSignal.timeout(20000),
    },
  );

  if (!res.ok) return [];
  const json: CoinGlassResponse = await res.json();
  if (json.code !== "0" || !json.data?.time_list?.length) return [];

  const { time_list, data_map } = json.data;
  const exchanges = Object.keys(data_map);
  const seen = new Set<string>();
  const diarios: FlujosApiItem[] = [];

  for (let i = 0; i < time_list.length; i++) {
    const d = new Date(time_list[i]).toISOString().substring(0, 10);
    if (seen.has(d)) continue;
    seen.add(d);

    let total = 0;
    for (const ex of exchanges) total += data_map[ex]?.[i] ?? 0;
    const reserva = Math.round(total);
    const flujoNeto = diarios.length > 0
      ? Math.round(reserva - diarios[diarios.length - 1].reserva)
      : 0;

    diarios.push({ d, fecha: toFecha(d), flujoNeto, reserva });
  }

  return diarios;
}

async function fetchFlujos(): Promise<FlujosData> {
  // Fetch both sources in parallel
  const [bgData, cgData] = await Promise.all([
    fetchBGeometrics().catch(() => [] as FlujosApiItem[]),
    fetchCoinGlass().catch(() => [] as FlujosApiItem[]),
  ]);

  let diarios: FlujosApiItem[];

  if (cgData.length > 0 && bgData.length > 0) {
    // Merge: BGeometrics up to where CoinGlass starts, then CoinGlass
    const cgStart = cgData[0].d;
    const bgPrefix = bgData.filter(d => d.d < cgStart);
    diarios = [...bgPrefix, ...cgData];
  } else if (cgData.length > 0) {
    diarios = cgData;
  } else if (bgData.length > 0) {
    diarios = bgData;
  } else {
    throw new Error("Both data sources failed");
  }

  return { diarios, semanales: buildWeekly(diarios) };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const debug = url.searchParams.get("debug");

  const result = await cachedFetch("flujos", fetchFlujos);

  if (!result) {
    const envelope: ApiEnvelope<FlujosData> = {
      data: null, status: "unavailable", stale: false,
      lastSuccessAt: null, source: "bitcoin-data.com + coinglass.com",
      message: "Sin datos de flujos disponibles.",
    };
    return NextResponse.json(envelope, { status: 503 });
  }

  if (debug) {
    const d = result.data;
    return NextResponse.json({
      totalDiarios: d.diarios.length,
      totalSemanales: d.semanales.length,
      firstDiario: d.diarios[0],
      lastDiarios: d.diarios.slice(-5),
      stale: result.stale,
    });
  }

  const envelope: ApiEnvelope<FlujosData> = {
    data: result.data, status: result.status, stale: result.stale,
    lastSuccessAt: result.lastSuccessAt, source: "bitcoin-data.com + coinglass.com",
  };
  return NextResponse.json(envelope);
}
