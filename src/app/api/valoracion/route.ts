import { NextResponse } from "next/server";
import { cachedFetch, cdnHeaders } from "@/lib/cache";
import type { ApiEnvelope } from "@/types";

interface RawNupl {
  d: string;
  unixTs: string;
  nupl: string;
}

interface RawSopr {
  d: string;
  unixTs: string;
  sopr: string;
}

interface RawMvrv {
  d: string;
  unixTs: string;
  mvrv: string;
}

export interface ValoracionItem {
  d: string;       // YYYY-MM-DD
  fecha: string;    // formatted es-CL
  mvrv: number | null;
  nupl: number | null;
  sopr: number | null;
}

export interface ValoracionData {
  items: ValoracionItem[];
}

function toFecha(d: string): string {
  return new Date(d + "T12:00:00Z").toLocaleDateString("es-CL", {
    year: "2-digit", month: "short", timeZone: "UTC",
  });
}

/** Sample to ~1 entry per month to keep payload small */
function sampleMonthly<T extends { d: string }>(data: T[]): T[] {
  const monthly: T[] = [];
  let lastMonth = "";
  for (const r of data) {
    const month = r.d.substring(0, 7);
    if (month !== lastMonth) {
      monthly.push(r);
      lastMonth = month;
    }
  }
  return monthly;
}

async function fetchValoracion(): Promise<ValoracionData> {
  const [mvrvRes, nuplRes, soprRes] = await Promise.all([
    fetch("https://bitcoin-data.com/v1/mvrv?size=5000", {
      signal: AbortSignal.timeout(15000),
    }).catch(() => null),
    fetch("https://bitcoin-data.com/v1/nupl?size=5000", {
      signal: AbortSignal.timeout(15000),
    }).catch(() => null),
    fetch("https://bitcoin-data.com/v1/sopr?size=5000", {
      signal: AbortSignal.timeout(15000),
    }).catch(() => null),
  ]);

  // Parse whatever succeeded
  const mvrvRaw: RawMvrv[] = mvrvRes?.ok ? await mvrvRes.json() : [];
  const nuplRaw: RawNupl[] = nuplRes?.ok ? await nuplRes.json() : [];
  const soprRaw: RawSopr[] = soprRes?.ok ? await soprRes.json() : [];

  if (mvrvRaw.length === 0 && nuplRaw.length === 0 && soprRaw.length === 0) {
    throw new Error("All valuation sources failed");
  }

  // Sample monthly
  const mvrvMonthly = sampleMonthly(mvrvRaw);
  const nuplMonthly = sampleMonthly(nuplRaw);
  const soprMonthly = sampleMonthly(soprRaw);

  // Build lookup maps
  const mvrvMap = new Map(mvrvMonthly.map(r => [r.d.substring(0, 7), parseFloat(r.mvrv)]));
  const nuplMap = new Map(nuplMonthly.map(r => [r.d.substring(0, 7), parseFloat(r.nupl)]));
  const soprMap = new Map(soprMonthly.map(r => [r.d.substring(0, 7), parseFloat(r.sopr)]));

  // Collect all unique months
  const allMonths = new Set<string>();
  for (const m of [mvrvMap, nuplMap, soprMap]) {
    for (const k of m.keys()) allMonths.add(k);
  }

  const sorted = Array.from(allMonths).sort();

  // Only keep data from 2014 onwards (earlier data is too noisy)
  const filtered = sorted.filter(m => m >= "2014-01");

  const items: ValoracionItem[] = filtered.map(month => {
    const d = month + "-01";
    const mvrv = mvrvMap.get(month);
    const nupl = nuplMap.get(month);
    const sopr = soprMap.get(month);
    return {
      d,
      fecha: toFecha(d),
      mvrv: mvrv != null && !isNaN(mvrv) ? mvrv : null,
      nupl: nupl != null && !isNaN(nupl) ? nupl : null,
      sopr: sopr != null && !isNaN(sopr) ? sopr : null,
    };
  });

  return { items };
}

export async function GET() {
  const result = await cachedFetch("valoracion", fetchValoracion);

  if (!result) {
    const envelope: ApiEnvelope<ValoracionData> = {
      data: null, status: "unavailable", stale: false,
      lastSuccessAt: null, source: "bitcoin-data.com",
      message: "Sin datos de valoración disponibles.",
    };
    return NextResponse.json(envelope, { status: 503 });
  }

  const envelope: ApiEnvelope<ValoracionData> = {
    data: result.data, status: result.status, stale: result.stale,
    lastSuccessAt: result.lastSuccessAt, source: "bitcoin-data.com",
  };
  return NextResponse.json(envelope, { headers: cdnHeaders(300, 600) });
}
