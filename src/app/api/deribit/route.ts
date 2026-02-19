import { NextResponse } from "next/server";
import { cachedFetch, cdnHeaders } from "@/lib/cache";
import type { ApiEnvelope } from "@/types";

const TIMEOUT = 12_000;

interface DeribitInstrument {
  instrument_name: string;
  open_interest: number;
  underlying_price?: number;
  mark_price?: number;
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

async function fetchDeribit(): Promise<DeribitInstrument[]> {
  const res = await fetchWithRetry(
    "https://www.deribit.com/api/v2/public/get_book_summary_by_currency?currency=BTC&kind=option"
  );
  const json = await res.json();
  const result: DeribitInstrument[] = (json.result || []).map(
    (item: { instrument_name: string; open_interest: number; underlying_price?: number; mark_price?: number }) => ({
      instrument_name: item.instrument_name,
      open_interest: item.open_interest || 0,
      underlying_price: item.underlying_price,
      mark_price: item.mark_price,
    })
  );
  return result;
}

export async function GET() {
  const result = await cachedFetch("deribit-options", fetchDeribit);

  if (!result) {
    const envelope: ApiEnvelope<DeribitInstrument[]> = {
      data: null,
      status: "unavailable",
      stale: false,
      lastSuccessAt: null,
      source: "deribit.com",
      message: "No se pudo obtener datos de opciones de Deribit.",
    };
    return NextResponse.json(envelope, { status: 503 });
  }

  const envelope: ApiEnvelope<DeribitInstrument[]> = {
    data: result.data,
    status: result.status,
    stale: result.stale,
    lastSuccessAt: result.lastSuccessAt,
    source: "deribit.com",
  };

  return NextResponse.json(envelope, { headers: cdnHeaders(60, 300) });
}
