export type Random = () => number;

/** Seeded generator (mulberry32), so charts and stats are stable across requests. */
export function seededRandom(seed: string): Random {
  let state = 0;
  for (const char of seed) {
    state = (Math.imul(state, 31) + char.charCodeAt(0)) | 0;
  }
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
