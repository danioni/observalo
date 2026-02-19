import { NextResponse } from "next/server";
import { cachedFetch, cdnHeaders } from "@/lib/cache";
import { supplyAtDate } from "@/lib/supply";
import type { ApiEnvelope } from "@/types";

// mempool.space difficulty adjustment: [timestamp, blockHeight, difficulty, timeRatio]
type MempoolDiffAdj = [number, number, number, number];

export interface MineriaApiItem {
  fecha: string;
  fechaRaw: string;
  hashrate: number;  // EH/s
  dificultad: number; // T (trillions)
  recompensa: number;
  suministro: number;
  bloque: number;
}

/** Convert raw difficulty to trillions */
function difficultyToT(raw: number): number {
  if (raw <= 0) return 0;
  return parseFloat((raw / 1e12).toFixed(2));
}

/** Estimate hashrate in EH/s from difficulty: hashrate = difficulty * 2^32 / 600 */
function difficultyToEH(raw: number): number {
  if (raw <= 0) return 0;
  const hashPerSec = (raw * 4294967296) / 600; // 2^32 = 4294967296
  return parseFloat((hashPerSec / 1e18).toFixed(2));       // H/s → EH/s
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

/** Build monthly items from difficulty map — hashrate derived from difficulty */
function buildFromDiffMap(diffByMonth: Map<string, number>): MineriaApiItem[] {
  const months = Array.from(diffByMonth.keys()).sort();
  return months.map((month) => {
    const d = new Date(month + "-01");
    const fecha = d.toLocaleDateString("es-CL", { year: "2-digit", month: "short" });
    const rawDiff = diffByMonth.get(month) ?? 0;
    const { supply, blockHeight, reward } = supplyAtDate(d);
    return {
      fecha,
      fechaRaw: month + "-01",
      hashrate: difficultyToEH(rawDiff),
      dificultad: difficultyToT(rawDiff),
      recompensa: reward,
      suministro: supply,
      bloque: blockHeight,
    };
  });
}

async function fetchMineria(): Promise<MineriaApiItem[]> {
  const diffRes = await fetch(
    "https://mempool.space/api/v1/mining/difficulty-adjustments?interval=1m",
    { signal: AbortSignal.timeout(15000) },
  );
  if (!diffRes.ok) throw new Error(`mempool.space difficulty returned ${diffRes.status}`);
  const diffAdjs: MempoolDiffAdj[] = await diffRes.json();
  const diffByMonth = buildDiffMap(diffAdjs);
  return buildFromDiffMap(diffByMonth);
}

export async function GET() {
  const result = await cachedFetch("mineria", fetchMineria);

  if (!result) {
    const envelope: ApiEnvelope<MineriaApiItem[]> = {
      data: null, status: "unavailable", stale: false,
      lastSuccessAt: null, source: "mempool.space",
      message: "Sin datos de minería disponibles.",
    };
    return NextResponse.json(envelope, { status: 503 });
  }

  const envelope: ApiEnvelope<MineriaApiItem[]> = {
    data: result.data, status: result.status, stale: result.stale,
    lastSuccessAt: result.lastSuccessAt, source: "mempool.space",
  };
  return NextResponse.json(envelope, { headers: cdnHeaders(300, 600) });
}
