"use client"

import React, { createContext, useContext, useState, useMemo, useEffect, type ReactNode } from "react"

export type CityTier = "tier1" | "tier2" | "tier3"

export const CITY_TIER_META: Record<CityTier, { label: string; badge: string; inflationFactor: number; inflationRate: number }> = {
  tier1: { label: "Tier 1 (Metro)", badge: "Tier 1 Metro", inflationFactor: 1.0, inflationRate: 8 },
  tier2: { label: "Tier 2 (City)", badge: "Tier 2 City", inflationFactor: 0.82, inflationRate: 7 },
  tier3: { label: "Tier 3 (Town)", badge: "Tier 3 Town", inflationFactor: 0.65, inflationRate: 6 },
}

export interface ExpenseDNA {
  rent: number
  food: number
  shopping: number
  subscriptions: number
  trips: number
  commute: number
  party: number
  habits: number
  sips: number
  investments: number
}

export interface FinancialData {
  monthlyIncome: number
  monthlyExpenses: number
  currentInvestments: number
  termInsurance: number
  healthInsurance: number
  termCover: number
  healthCover: number
  dna: ExpenseDNA
  cityTier: CityTier
}

const defaultDNA: ExpenseDNA = {
  rent: 12000,
  food: 5000,
  shopping: 3000,
  subscriptions: 1000,
  trips: 2000,
  commute: 2000,
  party: 1500,
  habits: 500,
  sips: 5000,
  investments: 3000,
}

const defaultData: FinancialData = {
  monthlyIncome: 50000,
  monthlyExpenses: 20000,
  currentInvestments: 500000,
  termInsurance: 10000000,
  healthInsurance: 1000000,
  termCover: 10000000,
  healthCover: 1000000,
  dna: defaultDNA,
  cityTier: "tier1",
}

interface FinancialContextType {
  data: FinancialData
  setData: React.Dispatch<React.SetStateAction<FinancialData>>
  hasOnboarded: boolean
  setHasOnboarded: React.Dispatch<React.SetStateAction<boolean>>
  totalDNAExpenses: number
  inflationFactor: number
}

const FinancialContext = createContext<FinancialContextType | null>(null)

export function FinancialProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FinancialData>(defaultData)
  const [hasOnboarded, setHasOnboarded] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("chronowealth_data")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setData((prev) => ({ ...prev, ...parsed }))
        setHasOnboarded(true) // Assume onboarded if data exists
      } catch (e) {
        console.error("Failed to load financial data", e)
      }
    }
    setLoaded(true)
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    if (loaded) {
      localStorage.setItem("chronowealth_data", JSON.stringify(data))
    }
  }, [data, loaded])

  const totalDNAExpenses = useMemo(() => {
    const d = data.dna
    return d.rent + d.food + d.shopping + d.subscriptions + d.trips + d.commute + d.party + d.habits + d.sips + d.investments
  }, [data.dna])

  const inflationFactor = CITY_TIER_META[data.cityTier].inflationFactor

  if (!loaded) return null // or a loader

  return (
    <FinancialContext.Provider value={{ data, setData, hasOnboarded, setHasOnboarded, totalDNAExpenses, inflationFactor }}>
      {children}
    </FinancialContext.Provider>
  )
}

export function useFinancialData() {
  const ctx = useContext(FinancialContext)
  if (!ctx) throw new Error("useFinancialData must be used within FinancialProvider")
  return ctx
}


