import { mulberry32, randomNormal } from "./math-utils";

export interface SimulationResult {
    year: number;
    p10: number; // Pessimistic (10th percentile)
    p50: number; // Median (50th percentile)
    p90: number; // Optimistic (90th percentile)
}

export function runMonteCarloSimulation(
    initialWealth: number,
    monthlySavings: number,
    years: number = 20,
    iterations: number = 1000
): { results: SimulationResult[]; riskScore: number } {
    const results: SimulationResult[] = [];
    const annualSavings = monthlySavings * 12;

    // Market assumptions (conservative to aggressive mix)
    const meanReturn = 0.12; // 12% equity return
    const stdDev = 0.15; // 15% volatility

    // Storage for all final values to calculate percentiles
    const yearlyData: number[][] = Array.from({ length: years + 1 }, () => []);

    const rng = mulberry32(1337); // Seeded for reproducibility

    for (let i = 0; i < iterations; i++) {
        let currentWealth = initialWealth;
        yearlyData[0].push(currentWealth);

        for (let j = 1; j <= years; j++) {
            const annualReturn = randomNormal(rng, meanReturn, stdDev);
            currentWealth = currentWealth * (1 + annualReturn) + annualSavings;
            yearlyData[j].push(currentWealth);
        }
    }

    // Calculate percentiles for each year
    for (let j = 0; j <= years; j++) {
        yearlyData[j].sort((a, b) => a - b);
        const p10 = yearlyData[j][Math.floor(iterations * 0.1)];
        const p50 = yearlyData[j][Math.floor(iterations * 0.5)];
        const p90 = yearlyData[j][Math.floor(iterations * 0.9)];

        results.push({
            year: new Date().getFullYear() + j,
            p10,
            p50,
            p90,
        });
    }

    // Dynamic Risk Score Calculation
    // Based on Coefficient of Variation (CV) = Standard Deviation / Mean
    // We approximate using (p90 - p10) / p50 as a measure of dispersion/uncertainty.
    const finalYear = results[results.length - 1];
    if (finalYear && finalYear.p50 > 0) {
        const spread = finalYear.p90 - finalYear.p10;
        const cv = spread / finalYear.p50;
        // Map CV to 1-10 scale. 
        // A CV of 1.0 (StdDev = Mean) is very high risk.
        // We use a multiplier of 5, so CV=0.2 -> Score 1, CV=1.8 -> Score 9.
        const dynamicRisk = Math.min(9.9, Math.max(1.0, cv * 5));
        var riskScore = Number(dynamicRisk.toFixed(1));
    } else {
        var riskScore = 5.0; // Fallback
    }

    return { results, riskScore };
}
