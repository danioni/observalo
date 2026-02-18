import { NextResponse } from "next/server";
import { cachedFetch } from "@/lib/cache";
import type { ApiEnvelope } from "@/types";

export interface DistHistApiItem {
  fecha: string;
  "<1": number;
  "1-10": number;
  "10-100": number;
  "100-1K": number;
  "1K-10K": number;
  ">10K": number;
}

interface RawEntry { d: string; [key: string]: string }

const ENDPOINTS: { key: keyof Omit<DistHistApiItem, "fecha">; url: string; field: string }[] = [
  { key: "<1",     url: "/v1/coins-addr-1-BTC",       field: "coinsAddr1btc" },
  { key: "1-10",   url: "/v1/coins-addr-10-1-BTC",    field: "coinsAddr101btc" },
  { key: "10-100", url: "/v1/coins-addr-100-10-BTC",   field: "coinsAddr10010btc" },
  { key: "100-1K", url: "/v1/coins-addr-1K-100-BTC",   field: "coinsAddr1k100btc" },
  { key: "1K-10K", url: "/v1/coins-addr-10K-1K-BTC",   field: "coinsAddr10k1kbtc" },
  { key: ">10K",   url: "/v1/coins-addr-10K-BTC",      field: "coinsAddr10Kbtc" },
];

async function fetchOne(endpoint: typeof ENDPOINTS[number]): Promise<Map<string, number>> {
  const res = await fetch(
    `https://bitcoin-data.com${endpoint.url}?startday=2020-01-01&size=2200`,
    { signal: AbortSignal.timeout(15000) }
  );
  if (!res.ok) throw new Error(`${endpoint.url} returned ${res.status}`);
  const raw: RawEntry[] = await res.json();

  // Detect the value field: try expected name first, then find dynamically
  let fieldName = endpoint.field;
  if (raw.length > 0 && !(fieldName in raw[0])) {
    const alt = Object.keys(raw[0]).find(k => k !== "d" && k !== "unixTs");
    if (alt) fieldName = alt;
  }

  const map = new Map<string, number>();
  for (const r of raw) {
    if (r.d < "2020-01-01") continue;
    const val = parseFloat(r[fieldName]);
    if (!isNaN(val)) map.set(r.d, val);
  }
  return map;
}

function combine(maps: Map<string, number>[]): DistHistApiItem[] {
  // Collect all dates present in at least the first endpoint
  const dates = [...maps[0].keys()].sort();

  // Sample to ~1 per month
  const monthly: string[] = [];
  let lastMonth = "";
  for (const d of dates) {
    const month = d.substring(0, 7);
    if (month !== lastMonth) {
      monthly.push(d);
      lastMonth = month;
    }
  }

  return monthly.map((d) => {
    const fecha = new Date(d).toLocaleDateString("es-CL", { year: "2-digit", month: "short" });
    return {
      fecha,
      "<1":     maps[0].get(d) ?? 0,
      "1-10":   maps[1].get(d) ?? 0,
      "10-100": maps[2].get(d) ?? 0,
      "100-1K": maps[3].get(d) ?? 0,
      "1K-10K": maps[4].get(d) ?? 0,
      ">10K":   maps[5].get(d) ?? 0,
    };
  }).filter(item => {
    // Discard entries where total is 0 (missing data)
    const total = item["<1"] + item["1-10"] + item["10-100"]
      + item["100-1K"] + item["1K-10K"] + item[">10K"];
    return total > 0;
  });
}

async function fetchDistribucion(): Promise<DistHistApiItem[]> {
  const maps = await Promise.all(ENDPOINTS.map(fetchOne));
  return combine(maps);
}

export async function GET() {
  const result = await cachedFetch("distribucion-hist", fetchDistribucion);

  if (!result) {
    const envelope: ApiEnvelope<DistHistApiItem[]> = {
      data: null, status: "unavailable", stale: false,
      lastSuccessAt: null, source: "bitcoin-data.com",
      message: "Sin datos de distribución histórica disponibles.",
    };
    return NextResponse.json(envelope, { status: 503 });
  }

  const envelope: ApiEnvelope<DistHistApiItem[]> = {
    data: result.data, status: result.status, stale: result.stale,
    lastSuccessAt: result.lastSuccessAt, source: "bitcoin-data.com",
  };
  return NextResponse.json(envelope);
}
