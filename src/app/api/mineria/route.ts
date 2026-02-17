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

function buildMineria(hashrates: BGeometricsHashrate[], difficulties: BGeometricsDifficulty[]): MineriaApiItem[] {
  // Build difficulty lookup by month
  const diffMap = new Map<string, number>();
  for (const d of difficulties) {
    const month = d.d.substring(0, 7);
    // Take last value per month
    diffMap.set(month, parseFloat(d.difficulty) / 1e12);
  }

  // Sample hashrate monthly
  const monthly: MineriaApiItem[] = [];
  let lastMonth = "";
  for (const h of hashrates) {
    const month = h.d.substring(0, 7);
    if (month !== lastMonth) {
      const d = new Date(h.d);
      // Halving date: April 2024, block reward went from 6.25 to 3.125
      const halvingDate = new Date(2024, 3, 20);
      const fecha = d.toLocaleDateString("es-CL", { year: "2-digit", month: "short" });
      monthly.push({
        fecha,
        hashrate: Math.round(parseFloat(h.hashrate) / 1e18),
        dificultad: parseFloat((diffMap.get(month) ?? 0).toFixed(1)),
        recompensa: d >= halvingDate ? 3.125 : 6.25,
      });
      lastMonth = month;
    }
  }

  return monthly;
}

async function fetchMineria(): Promise<MineriaApiItem[]> {
  const [hashrateRes, difficultyRes] = await Promise.all([
    fetch("https://bitcoin-data.com/v1/hashrate?startday=2023-07-01&size=1000", {
      signal: AbortSignal.timeout(15000),
    }),
    fetch("https://bitcoin-data.com/v1/difficulty?startday=2023-07-01&size=1000", {
      signal: AbortSignal.timeout(15000),
    }),
  ]);

  if (!hashrateRes.ok) throw new Error(`Hashrate API returned ${hashrateRes.status}`);
  if (!difficultyRes.ok) throw new Error(`Difficulty API returned ${difficultyRes.status}`);

  const hashrates: BGeometricsHashrate[] = await hashrateRes.json();
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
