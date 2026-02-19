import { NextResponse } from "next/server";
import { cachedFetch, cdnHeaders } from "@/lib/cache";
import type { ApiEnvelope } from "@/types";

export interface PrecioSpotData {
  price: number;
}

async function fetchBinanceSpot(): Promise<PrecioSpotData> {
  const res = await fetch(
    "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT",
    { signal: AbortSignal.timeout(5000) },
  );
  if (!res.ok) throw new Error(`Binance HTTP ${res.status}`);
  const json: { symbol: string; price: string } = await res.json();
  const price = parseFloat(json.price);
  if (!price || isNaN(price)) throw new Error("Invalid price from Binance");
  return { price };
}

export async function GET() {
  const result = await cachedFetch("precio-spot", fetchBinanceSpot);

  if (!result) {
    const envelope: ApiEnvelope<PrecioSpotData> = {
      data: null,
      status: "unavailable",
      stale: false,
      lastSuccessAt: null,
      source: "binance.com",
      message: "No se pudo obtener el precio spot de Bitcoin.",
    };
    return NextResponse.json(envelope, { status: 503 });
  }

  const envelope: ApiEnvelope<PrecioSpotData> = {
    data: result.data,
    status: result.status,
    stale: result.stale,
    lastSuccessAt: result.lastSuccessAt,
    source: "binance.com",
  };

  return NextResponse.json(envelope, { headers: cdnHeaders(15, 60) });
}
