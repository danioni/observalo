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

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (compatible; Observalo/1.0)",
  Accept: "application/json",
};

async function fetchWithRetry(url: string, retries = 2): Promise<Response> {
  let lastErr: Error | null = null;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(TIMEOUT),
        headers: HEADERS,
      });
      if (res.ok) return res;
      // 403/451 = geo-block, don't retry
      if (res.status === 403 || res.status === 451) throw new Error(`HTTP ${res.status} (blocked)`);
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
    }
    if (i < retries) await new Promise(r => setTimeout(r, 500 * (i + 1)));
  }
  throw lastErr ?? new Error("fetch failed");
}

async function fetchBinanceOI(): Promise<BinanceOIData> {
  const [histRes, actualRes] = await Promise.all([
    fetchWithRetry(
      "https://fapi.binance.com/futures/data/openInterestHist?symbol=BTCUSDT&period=1d&limit=90"
    ),
    fetchWithRetry(
      "https://fapi.binance.com/fapi/v1/openInterest?symbol=BTCUSDT"
    ),
  ]);

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
