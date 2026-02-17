import { NextResponse } from "next/server";
import { cachedFetch } from "@/lib/cache";
import type { ApiEnvelope } from "@/types";

interface BGeometricsHodlWave {
  d: string;
  unixTs: string;
  age_0d_1d: string;
  age_1d_1w: string;
  age_1w_1m: string;
  age_1m_3m: string;
  age_3m_6m: string;
  age_6m_1y: string;
  age_1y_2y: string;
  age_2y_3y: string;
  age_3y_4y: string;
  age_4y_5y: string;
  age_5y_7y: string;
  age_7y_10y: string;
  age_10y: string;
}

export interface OndasApiItem {
  fecha: string;
  "<1m": number;
  "1-3m": number;
  "3-6m": number;
  "6-12m": number;
  "1-2a": number;
  "2-3a": number;
  "3-5a": number;
  "5-7a": number;
  "7-10a": number;
  "10a+": number;
}

function mapToOndas(raw: BGeometricsHodlWave[]): OndasApiItem[] {
  // The API may ignore startday — filter server-side
  const filtered = raw.filter(r => r.d >= "2020-01-01");

  // Sample: take ~1 entry per month
  const monthly: BGeometricsHodlWave[] = [];
  let lastMonth = "";
  for (const r of filtered) {
    const month = r.d.substring(0, 7); // "YYYY-MM"
    if (month !== lastMonth) {
      monthly.push(r);
      lastMonth = month;
    }
  }

  const p = (v: string) => {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n * 100;
  };

  return monthly
    .map((r) => {
      const d = new Date(r.d);
      const fecha = d.toLocaleDateString("es-CL", { year: "2-digit", month: "short" });
      const item: OndasApiItem = {
        fecha,
        "<1m": p(r.age_0d_1d) + p(r.age_1d_1w) + p(r.age_1w_1m),
        "1-3m": p(r.age_1m_3m),
        "3-6m": p(r.age_3m_6m),
        "6-12m": p(r.age_6m_1y),
        "1-2a": p(r.age_1y_2y),
        "2-3a": p(r.age_2y_3y),
        "3-5a": p(r.age_3y_4y) + p(r.age_4y_5y),
        "5-7a": p(r.age_5y_7y),
        "7-10a": p(r.age_7y_10y),
        "10a+": p(r.age_10y),
      };
      return item;
    })
    .filter((item) => {
      // Discard entries where bands don't sum to ~100% (corrupt data)
      const total = item["<1m"] + item["1-3m"] + item["3-6m"] + item["6-12m"]
        + item["1-2a"] + item["2-3a"] + item["3-5a"] + item["5-7a"]
        + item["7-10a"] + item["10a+"];
      return total > 90 && total < 110;
    });
}

async function fetchOndas(): Promise<OndasApiItem[]> {
  const res = await fetch(
    "https://bitcoin-data.com/v1/realized-cap-hodl-waves?startday=2020-01-01&size=2200",
    { signal: AbortSignal.timeout(15000) }
  );
  if (!res.ok) throw new Error(`BGeometrics returned ${res.status}`);
  const raw: BGeometricsHodlWave[] = await res.json();
  return mapToOndas(raw);
}

export async function GET() {
  const result = await cachedFetch("ondas", fetchOndas);

  if (!result) {
    const envelope: ApiEnvelope<OndasApiItem[]> = {
      data: null, status: "unavailable", stale: false,
      lastSuccessAt: null, source: "bitcoin-data.com",
      message: "Sin datos de ondas HODL disponibles.",
    };
    return NextResponse.json(envelope, { status: 503 });
  }

  const envelope: ApiEnvelope<OndasApiItem[]> = {
    data: result.data, status: result.status, stale: result.stale,
    lastSuccessAt: result.lastSuccessAt, source: "bitcoin-data.com",
  };
  return NextResponse.json(envelope);
}
