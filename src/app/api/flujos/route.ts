import { NextResponse } from "next/server";
import { cachedFetch } from "@/lib/cache";

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

export interface FlujosApiItem {
  d: string; // raw date YYYY-MM-DD
  fecha: string;
  flujoNeto: number;
  reserva: number;
}

interface FlujosData {
  diarios: FlujosApiItem[];
  semanales: FlujosApiItem[];
}

function buildFlujos(netflows: BGeometricsNetflow[], reserves: BGeometricsReserve[]): FlujosData {
  // Build a reserve lookup by date
  const reserveMap = new Map<string, number>();
  for (const r of reserves) {
    reserveMap.set(r.d, Math.round(r.exchangeReserveBtc));
  }

  // Find the last date that has reserve data to avoid trailing zeros
  const lastReserveDate = reserves.length > 0 ? reserves[reserves.length - 1].d : "";

  // Build daily data — only include days up to the last reserve data point
  const diarios: FlujosApiItem[] = [];
  let lastReserve = reserves.length > 0 ? Math.round(reserves[0].exchangeReserveBtc) : 0;
  for (const nf of netflows) {
    // Stop if we're past the last date with reserve data
    if (lastReserveDate && nf.d > lastReserveDate) break;
    const reserve = reserveMap.get(nf.d) ?? lastReserve;
    lastReserve = reserve;
    const d = new Date(nf.d);
    const fecha = d.toLocaleDateString("es-CL", { year: "2-digit", month: "short", day: "numeric" });
    diarios.push({
      d: nf.d,
      fecha,
      flujoNeto: Math.round(nf.exchangeNetflowBtc),
      reserva: reserve,
    });
  }

  // Aggregate weekly
  const semanales: FlujosApiItem[] = [];
  for (let i = 0; i < diarios.length; i += 7) {
    const week = diarios.slice(i, i + 7);
    if (week.length === 0) continue;
    semanales.push({
      d: week[0].d,
      fecha: week[0].fecha,
      flujoNeto: Math.round(week.reduce((s, d) => s + d.flujoNeto, 0)),
      reserva: week[week.length - 1].reserva,
    });
  }

  return { diarios, semanales };
}

const START_DATE = "2011-01-01";

async function fetchFlujos(): Promise<FlujosData> {
  const [netflowRes, reserveRes] = await Promise.all([
    fetch(`https://bitcoin-data.com/v1/exchange-netflow-btc?startday=${START_DATE}&size=5000`, {
      signal: AbortSignal.timeout(15000),
    }),
    fetch(`https://bitcoin-data.com/v1/exchange-reserve-btc?startday=${START_DATE}&size=5000`, {
      signal: AbortSignal.timeout(15000),
    }),
  ]);

  if (!netflowRes.ok) throw new Error(`Netflow API returned ${netflowRes.status}`);
  if (!reserveRes.ok) throw new Error(`Reserve API returned ${reserveRes.status}`);

  const rawNetflows: BGeometricsNetflow[] = await netflowRes.json();
  const rawReserves: BGeometricsReserve[] = await reserveRes.json();

  // The API may ignore startday — filter server-side to ensure correct range
  const netflows = rawNetflows.filter(n => n.d >= START_DATE);
  const reservesFiltered = rawReserves.filter(r => r.d >= START_DATE);

  // Truncate reserves at the point where data becomes corrupt
  // (e.g., reserve drops by >50% day-to-day when already at scale)
  const reserves: BGeometricsReserve[] = [];
  for (let i = 0; i < reservesFiltered.length; i++) {
    const cur = reservesFiltered[i].exchangeReserveBtc;
    if (i > 0) {
      const prev = reservesFiltered[i - 1].exchangeReserveBtc;
      if (prev > 100_000 && cur < prev * 0.5) break;
    }
    reserves.push(reservesFiltered[i]);
  }

  return buildFlujos(netflows, reserves);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const debug = url.searchParams.get("debug");

  const result = await cachedFetch("flujos", fetchFlujos);
  if (!result) {
    return NextResponse.json({ error: "No data available", fallback: true }, { status: 503 });
  }

  if (debug) {
    const d = result.data;
    const lastDiarios = d.diarios.slice(-10);
    const lastSemanales = d.semanales.slice(-5);
    return NextResponse.json({
      totalDiarios: d.diarios.length,
      totalSemanales: d.semanales.length,
      firstDiario: d.diarios[0],
      lastDiarios,
      lastSemanales,
      fromCache: result.fromCache,
    });
  }

  return NextResponse.json({
    data: result.data,
    fromCache: result.fromCache,
    source: "bitcoin-data.com",
  });
}
