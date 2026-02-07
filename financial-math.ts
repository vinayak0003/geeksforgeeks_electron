import { ExpenseDNA } from "./financial-context";

export const VICES_CATEGORIES: (keyof ExpenseDNA)[] = [
    "shopping",
    "subscriptions",
    "trips",
    "party",
    "habits"
];

/**
 * Calculates Risk Score based on Monthly Vices / Total Income.
 * Formula: (MonthlyVices / TotalIncome) * 100
 */
export function calculateRiskScore(dna: ExpenseDNA, monthlyIncome: number): number {
    if (monthlyIncome === 0) return 0;

    const monthlyVices = VICES_CATEGORIES.reduce((total, key) => {
        return total + (dna[key] || 0);
    }, 0);

    // Cap at 100
    return Math.min(100, (monthlyVices / monthlyIncome) * 100);
}

/**
 * Calculates Projected Wealth with Monthly Contributions.
 * Formula: CurrentWealth * (1 + r)^n + MonthlySavings * (((1 + r)^n - 1) / r)
 * r = 0.12/12 (12% annual return)
 * n = Months
 */
export function calculateProjectedWealth(currentWealth: number, monthlySavings: number, months: number): number {
    const r = 0.12 / 12; // 1% monthly return
    const n = months;

    const compoundPrincipal = currentWealth * Math.pow(1 + r, n);
    const futureValueSeries = monthlySavings * ((Math.pow(1 + r, n) - 1) / r);

    return compoundPrincipal + futureValueSeries;
}

export function formatCurrency(value: number): string {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return `₹${value.toLocaleString("en-IN")}`;
}
