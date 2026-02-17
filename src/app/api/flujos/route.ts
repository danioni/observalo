import { NextResponse } from "next/server";
import { cachedFetch } from "@/lib/cache";

interface CoinGlassResponse {
  code: string;
  data: {
    time_list: number[];
    price_list: number[];
    data_map: Record<string, number[]>;
  };
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

function buildFlujos(timeList: number[], reservas: number[]): FlujosData {
  const diarios: FlujosApiItem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < timeList.length; i++) {
    // Use UTC to avoid timezone offset issues
    const date = new Date(timeList[i]);
    const d = date.toISOString().substring(0, 10);

    // Skip duplicate dates (CoinGlass sometimes has duplicates)
    if (seen.has(d)) continue;
    seen.add(d);

    const fecha = new Date(d + "T12:00:00Z").toLocaleDateString("es-CL", {
      year: "2-digit",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
    const reserva = Math.round(reservas[i]);
    const flujoNeto = diarios.length > 0
      ? Math.round(reserva - diarios[diarios.length - 1].reserva)
      : 0;

    diarios.push({ d, fecha, flujoNeto, reserva });
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

async function fetchFlujos(): Promise<FlujosData> {
  const apiKey = process.env.COINGLASS_API_KEY;
  if (!apiKey) throw new Error("COINGLASS_API_KEY not configured");

  const res = await fetch(
    "https://open-api-v4.coinglass.com/api/exchange/balance/chart?symbol=BTC",
    {
      headers: { "CG-API-KEY": apiKey },
      signal: AbortSignal.timeout(20000),
    },
  );

  if (!res.ok) throw new Error(`CoinGlass API returned ${res.status}`);
  const json: CoinGlassResponse = await res.json();
  if (json.code !== "0" || !json.data?.time_list?.length) {
    throw new Error(`CoinGlass API error: code ${json.code}`);
  }

  const { time_list, data_map } = json.data;
  const exchanges = Object.keys(data_map);

  // Sum all exchanges per day for total reserve
  const reservas = time_list.map((_, i) => {
    let total = 0;
    for (const ex of exchanges) {
      total += data_map[ex]?.[i] ?? 0;
    }
    return total;
  });

  return buildFlujos(time_list, reservas);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const debug = url.searchParams.get("debug");

  const result = await cachedFetch("flujos", fetchFlujos);
  if (!result) {
    return NextResponse.json(
      { error: "No data available", fallback: true },
      { status: 503 },
    );
  }

  if (debug) {
    const d = result.data;
    return NextResponse.json({
      totalDiarios: d.diarios.length,
      totalSemanales: d.semanales.length,
      firstDiario: d.diarios[0],
      lastDiarios: d.diarios.slice(-10),
      lastSemanales: d.semanales.slice(-5),
      fromCache: result.fromCache,
    });
  }

  return NextResponse.json({
    data: result.data,
    fromCache: result.fromCache,
    source: "coinglass.com",
  });
}
