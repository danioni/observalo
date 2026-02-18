import { NextResponse } from "next/server";
import { cachedFetch } from "@/lib/cache";
import type { ApiEnvelope } from "@/types";

const TIMEOUT = 10_000;

interface OIHistEntry {
  timestamp: number;
  sumOpenInterest: string;
  sumOpenInterestValue: string;
}

interface OIActual {
  openInterest: string;
}

interface BinanceOIData {
  hist: OIHistEntry[];
  actual: OIActual;
}

async function fetchBinanceOI(): Promise<BinanceOIData> {
  const [histRes, actualRes] = await Promise.all([
    fetch(
      "https://fapi.binance.com/futures/data/openInterestHist?symbol=BTCUSDT&period=1d&limit=90",
      { signal: AbortSignal.timeout(TIMEOUT) }
    ),
    fetch(
      "https://fapi.binance.com/fapi/v1/openInterest?symbol=BTCUSDT",
      { signal: AbortSignal.timeout(TIMEOUT) }
    ),
  ]);

  if (!histRes.ok || !actualRes.ok) throw new Error("HTTP error");

  const hist: OIHistEntry[] = await histRes.json();
  const actual: OIActual = await actualRes.json();

  return { hist, actual };
}

export async function GET() {
  const result = await cachedFetch("binance-oi", fetchBinanceOI);

  if (!result) {
    const envelope: ApiEnvelope<BinanceOIData> = {
      data: null,
      status: "unavailable",
      stale: false,
      lastSuccessAt: null,
      source: "binance.com",
      message: "No se pudo obtener interés abierto de Binance Futures.",
    };
    return NextResponse.json(envelope, { status: 503 });
  }

  const envelope: ApiEnvelope<BinanceOIData> = {
    data: result.data,
    status: result.status,
    stale: result.stale,
    lastSuccessAt: result.lastSuccessAt,
    source: "binance.com",
  };

  return NextResponse.json(envelope);
}
