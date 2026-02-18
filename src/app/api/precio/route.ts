import { NextResponse } from "next/server";
import { cachedFetch } from "@/lib/cache";
import type { ApiEnvelope } from "@/types";

const TIMEOUT = 15_000;

interface PricePoint {
  x: number; // unix timestamp (seconds)
  y: number; // USD price
}

interface BlockchainResponse {
  values: PricePoint[];
}

async function fetchPrecio(): Promise<PricePoint[]> {
  const res = await fetch(
    "https://api.blockchain.info/charts/market-price?timespan=all&format=json&sampled=false",
    { signal: AbortSignal.timeout(TIMEOUT) }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
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

  return NextResponse.json(envelope);
}
