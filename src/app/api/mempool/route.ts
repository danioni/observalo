import { NextResponse } from "next/server";
import { cachedFetch } from "@/lib/cache";
import type { DatosVivosMineria, ApiEnvelope } from "@/types";

const TIMEOUT = 10_000; // 10s server-side timeout

async function fetchJSON<T>(url: string): Promise<T | null> {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });
  if (!res.ok) return null;
  return res.json() as Promise<T>;
}

interface MempoolHashrate { currentHashrate: number; currentDifficulty: number }
interface MempoolDiffAdj { diffChange: number }
interface MempoolFees { fastestFee: number; halfHourFee: number; hourFee: number; economyFee: number; minimumFee: number }
interface MempoolBlock { height: number; tx_count: number; size: number }

async function fetchMempool(): Promise<DatosVivosMineria> {
  const [hR, dR, fR, bR] = await Promise.all([
    fetchJSON<MempoolHashrate>("https://mempool.space/api/v1/mining/hashrate/1m").catch(() => null),
    fetchJSON<MempoolDiffAdj[]>("https://mempool.space/api/v1/mining/difficulty-adjustments/1").catch(() => null),
    fetchJSON<MempoolFees>("https://mempool.space/api/v1/fees/recommended").catch(() => null),
    fetchJSON<MempoolBlock[]>("https://mempool.space/api/v1/blocks/").catch(() => null),
  ]);

  return {
    hashrate: hR?.currentHashrate ? (hR.currentHashrate / 1e18).toFixed(0) : null,
    dificultad: hR?.currentDifficulty ? (hR.currentDifficulty / 1e12).toFixed(2) : null,
    comisiones: fR ?? null,
    bloque: bR?.[0] ?? null,
    ajuste: dR?.[0] ? { diffChange: dR[0].diffChange } : null,
  };
}

export async function GET() {
  const result = await cachedFetch("mempool-live", fetchMempool);

  if (!result) {
    const envelope: ApiEnvelope<DatosVivosMineria> = {
      data: null,
      status: "unavailable",
      stale: false,
      lastSuccessAt: null,
      source: "mempool.space",
      message: "No se pudo obtener datos de la red. Se reintentará automáticamente.",
    };
    return NextResponse.json(envelope, { status: 503 });
  }

  const envelope: ApiEnvelope<DatosVivosMineria> = {
    data: result.data,
    status: result.status,
    stale: result.stale,
    lastSuccessAt: result.lastSuccessAt,
    source: "mempool.space",
  };

  return NextResponse.json(envelope);
}
