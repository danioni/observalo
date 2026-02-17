import { NextResponse } from "next/server";
import { cachedFetch } from "@/lib/cache";

interface BGeometricsHashrate {
  d: string;
  unixTs: string;
  hashrate: string;
}

interface BGeometricsDifficulty {
  d: string;
  unixTs: string;
  difficulty: string;
}

export interface MineriaApiItem {
  fecha: string;
  hashrate: number;
  dificultad: number;
  recompensa: number;
}

function parseHashrateToEH(raw: string): number {
  const n = parseFloat(raw);
  // If already in EH/s range (100-2000), return as-is
  if (n > 50 && n < 5000) return Math.round(n);
  // If in H/s (very large number), convert to EH/s
  if (n > 1e15) return Math.round(n / 1e18);
  // If in TH/s range
  if (n > 1e6) return Math.round(n / 1e6);
  return Math.round(n);
}

function parseDifficultyToT(raw: string): number {
  const n = parseFloat(raw);
  // If already in T range (10-200), return as-is
  if (n > 5 && n < 500) return parseFloat(n.toFixed(1));
  // If raw difficulty value (very large), convert to T
  if (n > 1e9) return parseFloat((n / 1e12).toFixed(1));
  return parseFloat(n.toFixed(1));
}

function buildMineria(hashrates: BGeometricsHashrate[], difficulties: BGeometricsDifficulty[]): MineriaApiItem[] {
  // Build difficulty lookup by month
  const diffMap = new Map<string, number>();
  for (const d of difficulties) {
    const month = d.d.substring(0, 7);
    diffMap.set(month, parseDifficultyToT(d.difficulty));
  }

  // Sample hashrate monthly
  const monthly: MineriaApiItem[] = [];
  let lastMonth = "";
  for (const h of hashrates) {
    const month = h.d.substring(0, 7);
    if (month !== lastMonth) {
      const d = new Date(h.d);
      const halvingDate = new Date(2024, 3, 20);
      const fecha = d.toLocaleDateString("es-CL", { year: "2-digit", month: "short" });
      monthly.push({
        fecha,
        hashrate: parseHashrateToEH(h.hashrate),
        dificultad: diffMap.get(month) ?? 0,
        recompensa: d >= halvingDate ? 3.125 : 6.25,
      });
      lastMonth = month;
    }
  }

  return monthly;
}

async function fetchMineria(): Promise<MineriaApiItem[]> {
  // Fetch sequentially to avoid rate limit issues
  const hashrateRes = await fetch(
    "https://bitcoin-data.com/v1/hashrate?startday=2023-07-01&size=1000",
    { signal: AbortSignal.timeout(15000) }
  );
  if (!hashrateRes.ok) throw new Error(`Hashrate API returned ${hashrateRes.status}`);
  const hashrates: BGeometricsHashrate[] = await hashrateRes.json();

  // Small delay between requests to be gentle on rate limit
  await new Promise(r => setTimeout(r, 500));

  const difficultyRes = await fetch(
    "https://bitcoin-data.com/v1/difficulty?startday=2023-07-01&size=1000",
    { signal: AbortSignal.timeout(15000) }
  );
  if (!difficultyRes.ok) throw new Error(`Difficulty API returned ${difficultyRes.status}`);
  const difficulties: BGeometricsDifficulty[] = await difficultyRes.json();

  return buildMineria(hashrates, difficulties);
}

export async function GET() {
  const result = await cachedFetch("mineria", fetchMineria);
  if (!result) {
    return NextResponse.json({ error: "No data available", fallback: true }, { status: 503 });
  }
  return NextResponse.json({
    data: result.data,
    fromCache: result.fromCache,
    source: "bitcoin-data.com",
  });
}
