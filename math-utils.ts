/* ── Seeded PRNG (Mulberry32) for deterministic Monte Carlo ── */

export function mulberry32(seed: number) {
    return function () {
        let t = (seed += 0x6d2b79f5)
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

/** Box-Muller transform: returns a standard normal random value using the seeded rng */
export function randomNormal(rng: () => number, mean: number, stddev: number): number {
    const u1 = rng()
    const u2 = rng()
    const z = Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2)
    return mean + stddev * z
}
