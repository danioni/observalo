import { NextResponse } from "next/server";
import { cachedFetch, cdnHeaders } from "@/lib/cache";
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
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept: "application/json",
};

/** Try multiple Binance endpoints — fapi often blocked from cloud IPs */
async function fetchUrl(urls: string[]): Promise<Response> {
  let lastErr: Error | null = null;
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(TIMEOUT),
        headers: HEADERS,
      });
      if (res.ok) return res;
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
    }
  }
  throw lastErr ?? new Error("all endpoints failed");
}

async function fetchBinanceOI(): Promise<BinanceOIData> {
  const [histRes, actualRes] = await Promise.all([
    fetchUrl([
      "https://fapi.binance.com/futures/data/openInterestHist?symbol=BTCUSDT&period=1d&limit=90",
      "https://www.binance.com/futures/data/openInterestHist?symbol=BTCUSDT&period=1d&limit=90",
    ]),
    fetchUrl([
      "https://fapi.binance.com/fapi/v1/openInterest?symbol=BTCUSDT",
      "https://www.binance.com/fapi/v1/openInterest?symbol=BTCUSDT",
    ]),
  ]);

  const hist: OIHistEntry[] = await histRes.json();
  const actual: OIActual = await actualRes.json();

  return { hist, actual };
}

// Force Vercel to run this in a specific region (US-East, less likely to be blocked)
export const runtime = "nodejs";
export const preferredRegion = "iad1";

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

  return NextResponse.json(envelope, { headers: cdnHeaders(60, 300) });
}
