import { NextResponse } from "next/server";
import { cachedFetch, cdnHeaders } from "@/lib/cache";
import type { ApiEnvelope } from "@/types";

const TIMEOUT = 15_000;

interface PricePoint {
  x: number; // unix timestamp (seconds)
  y: number; // USD price
}

interface BlockchainResponse {
  values: PricePoint[];
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
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
    }
    if (i < retries) await new Promise(r => setTimeout(r, 500 * (i + 1)));
  }
  throw lastErr ?? new Error("fetch failed");
}

async function fetchPrecio(): Promise<PricePoint[]> {
  const res = await fetchWithRetry(
    "https://api.blockchain.info/charts/market-price?timespan=all&format=json&sampled=false"
  );
  const json: BlockchainResponse = await res.json();
  return json.values || [];
}

export async function GET() {
  const result = await cachedFetch("precio-historico", fetchPrecio);

  if (!result) {
    const envelope: ApiEnvelope<PricePoint[]> = {
      data: null,
      status: "unavailable",
      stale: false,
      lastSuccessAt: null,
      source: "blockchain.info",
      message: "No se pudo obtener precio histórico de Bitcoin.",
    };
    return NextResponse.json(envelope, { status: 503 });
  }

  const envelope: ApiEnvelope<PricePoint[]> = {
    data: result.data,
    status: result.status,
    stale: result.stale,
    lastSuccessAt: result.lastSuccessAt,
    source: "blockchain.info",
  };

  return NextResponse.json(envelope, { headers: cdnHeaders(60, 300) });
}
