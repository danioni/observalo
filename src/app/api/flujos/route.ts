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

  // Build daily data
  const diarios: FlujosApiItem[] = [];
  let lastReserve = 0;
  for (const nf of netflows) {
    const reserve = reserveMap.get(nf.d) ?? lastReserve;
    lastReserve = reserve;
    const d = new Date(nf.d);
    const fecha = d.toLocaleDateString("es-CL", { month: "short", day: "numeric" });
    diarios.push({
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
      fecha: week[0].fecha,
      flujoNeto: Math.round(week.reduce((s, d) => s + d.flujoNeto, 0)),
      reserva: week[week.length - 1].reserva,
    });
  }

  return { diarios, semanales };
}

async function fetchFlujos(): Promise<FlujosData> {
  const [netflowRes, reserveRes] = await Promise.all([
    fetch("https://bitcoin-data.com/v1/exchange-netflow-btc?startday=2021-01-01&size=2000", {
      signal: AbortSignal.timeout(15000),
    }),
    fetch("https://bitcoin-data.com/v1/exchange-reserve-btc?startday=2021-01-01&size=2000", {
      signal: AbortSignal.timeout(15000),
    }),
  ]);

  if (!netflowRes.ok) throw new Error(`Netflow API returned ${netflowRes.status}`);
  if (!reserveRes.ok) throw new Error(`Reserve API returned ${reserveRes.status}`);

  const netflows: BGeometricsNetflow[] = await netflowRes.json();
  const reserves: BGeometricsReserve[] = await reserveRes.json();

  return buildFlujos(netflows, reserves);
}

export async function GET() {
  const result = await cachedFetch("flujos", fetchFlujos);
  if (!result) {
    return NextResponse.json({ error: "No data available", fallback: true }, { status: 503 });
  }
  return NextResponse.json({
    data: result.data,
    fromCache: result.fromCache,
    source: "bitcoin-data.com",
  });
}
