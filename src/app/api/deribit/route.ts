import { NextResponse } from "next/server";
import { cachedFetch } from "@/lib/cache";
import type { ApiEnvelope } from "@/types";

const TIMEOUT = 12_000;

interface DeribitInstrument {
  instrument_name: string;
  open_interest: number;
  underlying_price?: number;
  mark_price?: number;
}

async function fetchDeribit(): Promise<DeribitInstrument[]> {
  const res = await fetch(
    "https://deribit.com/api/v2/public/get_book_summary_by_currency?currency=BTC&kind=option",
    { signal: AbortSignal.timeout(TIMEOUT) }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
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

  return NextResponse.json(envelope);
}
