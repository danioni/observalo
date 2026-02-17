/**
 * Cálculo determinístico del suministro de Bitcoin.
 * La emisión de Bitcoin es pura matemática — no necesita API.
 */

const HALVING_INTERVAL = 210_000;
const INITIAL_REWARD = 50;
const GENESIS = new Date(2009, 0, 3); // 3 de enero 2009
const BLOCKS_PER_DAY = 144; // promedio: 1 bloque cada ~10 min
export const MAX_SUPPLY = 21_000_000;

/** Altura aproximada del bloque para una fecha dada */
export function blockHeightAtDate(date: Date): number {
  const days = (date.getTime() - GENESIS.getTime()) / 86_400_000;
  return Math.max(0, Math.floor(days * BLOCKS_PER_DAY));
}

/** Recompensa por bloque a una altura dada */
export function rewardAtBlock(height: number): number {
  const halvings = Math.floor(height / HALVING_INTERVAL);
  if (halvings >= 64) return 0;
  return INITIAL_REWARD / Math.pow(2, halvings);
}

/** Suministro acumulado hasta una altura de bloque */
export function cumulativeSupplyAtBlock(height: number): number {
  let supply = 0;
  let current = 0;
  let era = 0;

  while (current < height) {
    const reward = INITIAL_REWARD / Math.pow(2, era);
    if (reward < 1e-8) break; // precisión de 1 satoshi
    const nextHalving = (era + 1) * HALVING_INTERVAL;
    const blocksInEra = Math.min(nextHalving, height) - current;
    supply += blocksInEra * reward;
    current += blocksInEra;
    era++;
  }

  return Math.min(supply, MAX_SUPPLY);
}

/** Calcula suministro, bloque y recompensa para una fecha */
export function supplyAtDate(date: Date): {
  supply: number;
  blockHeight: number;
  reward: number;
} {
  const height = blockHeightAtDate(date);
  return {
    supply: Math.round(cumulativeSupplyAtBlock(height)),
    blockHeight: height,
    reward: rewardAtBlock(height),
  };
}
