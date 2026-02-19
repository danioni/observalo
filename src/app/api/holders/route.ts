import { NextResponse } from "next/server";
import { cachedFetch, cdnHeaders } from "@/lib/cache";
import type { ApiEnvelope } from "@/types";

interface BGeometricsEtf {
  d: string;
  [key: string]: string | number;
}

export interface HoldersApiData {
  etfHoldings: Record<string, number> | null;
  exchangeReserve: number | null;
}

async function fetchHoldersData(): Promise<HoldersApiData> {
  const result: HoldersApiData = { etfHoldings: null, exchangeReserve: null };

  // Intentar obtener datos de ETF de BGeometrics
  try {
    const etfRes = await fetch(
      "https://bitcoin-data.com/v1/btc-etf?size=1",
      { signal: AbortSignal.timeout(10000) }
    );
    if (etfRes.ok) {
      const raw: BGeometricsEtf[] = await etfRes.json();
      if (raw.length > 0) {
        const last = raw[raw.length - 1];
        const holdings: Record<string, number> = {};
        for (const [key, val] of Object.entries(last)) {
          if (key !== "d" && key !== "unixTs" && typeof val === "number" && val > 0) {
            holdings[key] = Math.round(val);
          }
        }
        if (Object.keys(holdings).length > 0) {
          result.etfHoldings = holdings;
        }
      }
    }
  } catch {
    // Silently fail — frontend will use static data
  }

  // Obtener última reserva de exchanges (reutilizar datos existentes)
  try {
    const reserveRes = await fetch(
      "https://bitcoin-data.com/v1/exchange-reserve-btc?size=1",
      { signal: AbortSignal.timeout(10000) }
    );
    if (reserveRes.ok) {
      const raw = await reserveRes.json();
      if (Array.isArray(raw) && raw.length > 0) {
        const last = raw[raw.length - 1];
        if (last.exchangeReserveBtc) {
          result.exchangeReserve = Math.round(last.exchangeReserveBtc);
        }
      }
    }
  } catch {
    // Silently fail
  }

  return result;
}

export async function GET() {
  const result = await cachedFetch("holders", fetchHoldersData);

  if (!result) {
    const envelope: ApiEnvelope<HoldersApiData> = {
      data: null, status: "unavailable", stale: false,
      lastSuccessAt: null, source: "bitcoin-data.com",
      message: "Sin datos de holders disponibles.",
    };
    return NextResponse.json(envelope, { status: 503 });
  }

  const envelope: ApiEnvelope<HoldersApiData> = {
    data: result.data, status: result.status, stale: result.stale,
    lastSuccessAt: result.lastSuccessAt, source: "bitcoin-data.com",
  };
  return NextResponse.json(envelope, { headers: cdnHeaders(3600, 7200) });
}
