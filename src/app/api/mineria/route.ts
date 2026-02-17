import { NextResponse } from "next/server";
import { cachedFetch } from "@/lib/cache";
import { supplyAtDate } from "@/lib/supply";

interface BGeometricsHashrate {
  d: string;
  unixTs: string;
  hashrate: string;
}

// mempool.space difficulty adjustment: [timestamp, blockHeight, difficulty, timeRatio]
type MempoolDiffAdj = [number, number, number, number];

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
  if (n > 50 && n < 5000) return Math.round(n);
  if (n > 1e15) return Math.round(n / 1e18);
  if (n > 1e6) return Math.round(n / 1e6);
  if (n < 0.001) return parseFloat(n.toFixed(6));
  if (n < 1) return parseFloat(n.toFixed(3));
  return Math.round(n);
}

function difficultyToT(raw: number): number {
  if (raw <= 0) return 0;
  if (raw > 1e9) return parseFloat((raw / 1e12).toFixed(2));
  if (raw < 0.001) return parseFloat(raw.toFixed(9));
  return parseFloat(raw.toFixed(4));
}

/** Build monthly difficulty map from mempool.space adjustments */
function buildDiffMap(diffAdjs: MempoolDiffAdj[]): Map<string, number> {
  const sorted = [...diffAdjs].sort((a, b) => a[0] - b[0]);
  const diffByMonth = new Map<string, number>();
  for (const adj of sorted) {
    const d = new Date(adj[0] * 1000);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    diffByMonth.set(month, adj[2]);
  }

  // Fill gaps — carry forward
  const allMonths = Array.from(diffByMonth.keys()).sort();
  if (allMonths.length > 0) {
    const [fy, fm] = allMonths[0].split("-").map(Number);
    const [ly, lm] = allMonths[allMonths.length - 1].split("-").map(Number);
    let prevDiff = diffByMonth.get(allMonths[0]) ?? 1;
    for (let y = fy; y <= ly; y++) {
      const startM = y === fy ? fm : 1;
      const endM = y === ly ? lm : 12;
      for (let m = startM; m <= endM; m++) {
        const key = `${y}-${String(m).padStart(2, "0")}`;
        if (diffByMonth.has(key)) {
          prevDiff = diffByMonth.get(key)!;
        } else {
          diffByMonth.set(key, prevDiff);
        }
      }
    }
  }
  return diffByMonth;
}

function buildFromHashrate(
  hashrates: BGeometricsHashrate[],
  diffByMonth: Map<string, number>,
): MineriaApiItem[] {
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
        dificultad: difficultyToT(diffByMonth.get(month) ?? 0),
        recompensa: reward,
        suministro: supply,
        bloque: blockHeight,
      });
      lastMonth = month;
    }
  }
  return monthly;
}

/** Fallback: build from difficulty-only (mempool.space) when BGeometrics is rate-limited */
function buildFromDiffOnly(diffByMonth: Map<string, number>): MineriaApiItem[] {
  const months = Array.from(diffByMonth.keys()).sort();
  return months.map((month) => {
    const d = new Date(month + "-01");
    const fecha = d.toLocaleDateString("es-CL", { year: "2-digit", month: "short" });
    const { supply, blockHeight, reward } = supplyAtDate(d);
    return {
      fecha,
      fechaRaw: month + "-01",
      hashrate: 0, // not available without BGeometrics
      dificultad: difficultyToT(diffByMonth.get(month) ?? 0),
      recompensa: reward,
      suministro: supply,
      bloque: blockHeight,
    };
  });
}

async function fetchMineria(): Promise<{ items: MineriaApiItem[]; hasHashrate: boolean }> {
  // Always try mempool.space difficulty first (no rate limit)
  const diffRes = await fetch(
    "https://mempool.space/api/v1/mining/difficulty-adjustments?interval=1m",
    { signal: AbortSignal.timeout(15000) },
  );
  if (!diffRes.ok) throw new Error(`mempool.space difficulty returned ${diffRes.status}`);
  const diffAdjs: MempoolDiffAdj[] = await diffRes.json();
  const diffByMonth = buildDiffMap(diffAdjs);

  // Try BGeometrics hashrate (may be rate limited)
  try {
    const hashrateRes = await fetch(
      "https://bitcoin-data.com/v1/hashrate?size=6000",
      { signal: AbortSignal.timeout(20000) },
    );
    if (hashrateRes.ok) {
      const hashrates: BGeometricsHashrate[] = await hashrateRes.json();
      if (hashrates.length > 0) {
        return { items: buildFromHashrate(hashrates, diffByMonth), hasHashrate: true };
      }
    }
  } catch {
    // BGeometrics failed — continue with diff-only
  }

  // Fallback: difficulty + supply data only (no hashrate)
  return { items: buildFromDiffOnly(diffByMonth), hasHashrate: false };
}

export async function GET() {
  const result = await cachedFetch("mineria", fetchMineria);
  if (!result) {
    return NextResponse.json({ error: "No data available", fallback: true }, { status: 503 });
  }
  return NextResponse.json({
    data: result.data.items,
    fromCache: result.fromCache,
    hasHashrate: result.data.hasHashrate,
    source: result.data.hasHashrate
      ? "bitcoin-data.com + mempool.space"
      : "mempool.space",
  });
}
