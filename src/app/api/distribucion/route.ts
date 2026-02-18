import { NextResponse } from "next/server";
import { cachedFetch } from "@/lib/cache";
import type { ApiEnvelope } from "@/types";

export interface DistHistApiItem {
  fecha: string;
  // BTC held per cohort
  "<1": number;
  "1-10": number;
  "10-100": number;
  "100-1K": number;
  "1K-10K": number;
  ">10K": number;
  // Address count per cohort
  "dir_<1": number;
  "dir_1-10": number;
  "dir_10-100": number;
  "dir_100-1K": number;
  "dir_1K-10K": number;
  "dir_>10K": number;
}

interface RawEntry { d: string; [key: string]: string }

interface EndpointDef { url: string; field: string }

const COINS_ENDPOINTS: EndpointDef[] = [
  { url: "/v1/coins-addr-1-BTC",       field: "coinsAddr1btc" },
  { url: "/v1/coins-addr-10-1-BTC",    field: "coinsAddr101btc" },
  { url: "/v1/coins-addr-100-10-BTC",  field: "coinsAddr10010btc" },
  { url: "/v1/coins-addr-1K-100-BTC",  field: "coinsAddr1k100btc" },
  { url: "/v1/coins-addr-10K-1K-BTC",  field: "coinsAddr10k1kbtc" },
  { url: "/v1/coins-addr-10K-BTC",     field: "coinsAddr10Kbtc" },
];

const BALANCE_ENDPOINTS: EndpointDef[] = [
  { url: "/v1/balance-addr-1-BTC",       field: "balanceAddr1btc" },
  { url: "/v1/balance-addr-10-1-BTC",    field: "balanceAddr101btc" },
  { url: "/v1/balance-addr-100-10-BTC",  field: "balanceAddr10010btc" },
  { url: "/v1/balance-addr-1K-100-BTC",  field: "balanceAddr1k100btc" },
  { url: "/v1/balance-addr-10K-1K-BTC",  field: "balanceAddr10k1kbtc" },
  { url: "/v1/balance-addr-10K-BTC",     field: "balanceAddr10Kbtc" },
];

async function fetchOne(endpoint: EndpointDef): Promise<Map<string, number>> {
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

function combine(coinsMaps: Map<string, number>[], balanceMaps: Map<string, number>[]): DistHistApiItem[] {
  const dates = [...coinsMaps[0].keys()].sort();

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
      "<1":     coinsMaps[0].get(d) ?? 0,
      "1-10":   coinsMaps[1].get(d) ?? 0,
      "10-100": coinsMaps[2].get(d) ?? 0,
      "100-1K": coinsMaps[3].get(d) ?? 0,
      "1K-10K": coinsMaps[4].get(d) ?? 0,
      ">10K":   coinsMaps[5].get(d) ?? 0,
      "dir_<1":     balanceMaps[0].get(d) ?? 0,
      "dir_1-10":   balanceMaps[1].get(d) ?? 0,
      "dir_10-100": balanceMaps[2].get(d) ?? 0,
      "dir_100-1K": balanceMaps[3].get(d) ?? 0,
      "dir_1K-10K": balanceMaps[4].get(d) ?? 0,
      "dir_>10K":   balanceMaps[5].get(d) ?? 0,
    };
  }).filter(item => {
    const total = item["<1"] + item["1-10"] + item["10-100"]
      + item["100-1K"] + item["1K-10K"] + item[">10K"];
    return total > 0;
  });
}

async function fetchDistribucion(): Promise<DistHistApiItem[]> {
  const [coinsMaps, balanceMaps] = await Promise.all([
    Promise.all(COINS_ENDPOINTS.map(fetchOne)),
    Promise.all(BALANCE_ENDPOINTS.map(fetchOne)),
  ]);
  return combine(coinsMaps, balanceMaps);
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
