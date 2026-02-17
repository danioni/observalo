import { NextResponse } from "next/server";
import { cachedFetch } from "@/lib/cache";
import { supplyAtDate } from "@/lib/supply";

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
  fechaRaw: string;
  hashrate: number;
  dificultad: number;
  recompensa: number;
  suministro: number;
  bloque: number;
}

function parseHashrateToEH(raw: string): number {
  const n = parseFloat(raw);
  if (isNaN(n) || n <= 0) return 0;
  // If already in EH/s range (100-2000), return as-is
  if (n > 50 && n < 5000) return Math.round(n);
  // If in H/s (very large number), convert to EH/s
  if (n > 1e15) return Math.round(n / 1e18);
  // If in TH/s range
  if (n > 1e6) return Math.round(n / 1e6);
  // Very small values (early Bitcoin or GH/s)
  if (n < 0.001) return parseFloat(n.toFixed(6));
  if (n < 1) return parseFloat(n.toFixed(3));
  return Math.round(n);
}

function parseDifficultyToT(raw: string): number {
  const n = parseFloat(raw);
  if (isNaN(n) || n <= 0) return 0;
  // If already in T range (10-500), return as-is
  if (n > 5 && n < 500) return parseFloat(n.toFixed(1));
  // If raw difficulty value (very large), convert to T
  if (n > 1e9) return parseFloat((n / 1e12).toFixed(1));
  // Small values
  if (n < 0.001) return parseFloat(n.toFixed(9));
  return parseFloat(n.toFixed(4));
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
      const fecha = d.toLocaleDateString("es-CL", { year: "2-digit", month: "short" });
      const fechaRaw = month + "-01";
      const { supply, blockHeight, reward } = supplyAtDate(d);

      monthly.push({
        fecha,
        fechaRaw,
        hashrate: parseHashrateToEH(h.hashrate),
        dificultad: diffMap.get(month) ?? 0,
        recompensa: reward,
        suministro: supply,
        bloque: blockHeight,
      });
      lastMonth = month;
    }
  }

  return monthly;
}

async function fetchMineria(): Promise<MineriaApiItem[]> {
  // Fetch from 2014 onward — BGeometrics likely has reliable data from then
  const hashrateRes = await fetch(
    "https://bitcoin-data.com/v1/hashrate?startday=2014-01-01&size=5000",
    { signal: AbortSignal.timeout(15000) }
  );
  if (!hashrateRes.ok) throw new Error(`Hashrate API returned ${hashrateRes.status}`);
  const hashrates: BGeometricsHashrate[] = await hashrateRes.json();

  // Small delay between requests to be gentle on rate limit
  await new Promise(r => setTimeout(r, 500));

  const difficultyRes = await fetch(
    "https://bitcoin-data.com/v1/difficulty?startday=2014-01-01&size=5000",
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
