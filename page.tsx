"use client"

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useFinancialData, type ExpenseDNA, type CityTier, CITY_TIER_META } from "@/lib/financial-context"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion"
import { Sparkles, Key, Bird, Shield, Clock, MapPin } from "lucide-react"
import { TypewriterText } from "@/components/typewriter-text"

function formatINR(val: number) {
  if (val >= 10000000) return `${(val / 10000000).toFixed(1)} Cr`
  if (val >= 100000) return `${(val / 100000).toFixed(1)}L`
  if (val >= 1000) return `${(val / 1000).toFixed(0)}K`
  return val.toString()
}

/* ─── Deterministic orb layout (avoids hydration mismatch) ─── */

interface OrbDef {
  x: number
  y: number
  size: number
  color: string
  opacity: number
  blur: number
}

const ORB_DEFS: OrbDef[] = [
  { x: 8, y: 12, size: 90, color: "#00f2ea", opacity: 0.07, blur: 60 },
  { x: 85, y: 8, size: 70, color: "#ff0055", opacity: 0.05, blur: 50 },
  { x: 45, y: 75, size: 100, color: "#3b82ff", opacity: 0.06, blur: 70 },
  { x: 20, y: 55, size: 60, color: "#00f2ea", opacity: 0.04, blur: 45 },
  { x: 72, y: 35, size: 80, color: "#ff0055", opacity: 0.05, blur: 55 },
  { x: 55, y: 18, size: 55, color: "#3b82ff", opacity: 0.04, blur: 40 },
  { x: 10, y: 82, size: 75, color: "#00f2ea", opacity: 0.06, blur: 50 },
  { x: 92, y: 68, size: 65, color: "#ff0055", opacity: 0.04, blur: 45 },
  { x: 35, y: 42, size: 85, color: "#3b82ff", opacity: 0.05, blur: 60 },
  { x: 62, y: 90, size: 70, color: "#00f2ea", opacity: 0.05, blur: 50 },
  { x: 78, y: 52, size: 50, color: "#ff0055", opacity: 0.03, blur: 35 },
  { x: 25, y: 28, size: 95, color: "#3b82ff", opacity: 0.06, blur: 65 },
  { x: 50, y: 50, size: 60, color: "#00f2ea", opacity: 0.04, blur: 40 },
  { x: 15, y: 70, size: 80, color: "#ff0055", opacity: 0.05, blur: 55 },
  { x: 88, y: 22, size: 70, color: "#3b82ff", opacity: 0.04, blur: 48 },
  { x: 42, y: 88, size: 55, color: "#00f2ea", opacity: 0.04, blur: 38 },
  { x: 68, y: 15, size: 90, color: "#ff0055", opacity: 0.06, blur: 62 },
  { x: 5, y: 45, size: 65, color: "#3b82ff", opacity: 0.04, blur: 42 },
  { x: 58, y: 62, size: 75, color: "#00f2ea", opacity: 0.05, blur: 52 },
  { x: 30, y: 95, size: 85, color: "#ff0055", opacity: 0.05, blur: 58 },
]

/* ─── Anti-Gravity Orb ─── */

function AntiGravityOrb({ def, mouseX, mouseY }: { def: OrbDef; mouseX: number; mouseY: number }) {
  const baseX = def.x
  const baseY = def.y

  const dx = baseX - mouseX
  const dy = baseY - mouseY
  const dist = Math.sqrt(dx * dx + dy * dy)

  const repelRadius = 25
  const repelStrength = 12
  let pushX = 0
  let pushY = 0
  if (dist < repelRadius && dist > 0) {
    const force = ((repelRadius - dist) / repelRadius) * repelStrength
    pushX = (dx / dist) * force
    pushY = (dy / dist) * force
  }

  const targetX = baseX + pushX
  const targetY = baseY + pushY

  const springX = useSpring(useMotionValue(targetX), { stiffness: 60, damping: 20 })
  const springY = useSpring(useMotionValue(targetY), { stiffness: 60, damping: 20 })

  useEffect(() => {
    springX.set(targetX)
    springY.set(targetY)
  }, [targetX, targetY, springX, springY])

  const left = useTransform(springX, (v) => `${v}%`)
  const top = useTransform(springY, (v) => `${v}%`)

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left,
        top,
        width: def.size,
        height: def.size,
        background: `radial-gradient(circle, ${def.color} 0%, transparent 70%)`,
        opacity: def.opacity,
        filter: `blur(${def.blur}px)`,
        transform: "translate(-50%, -50%)",
      }}
    />
  )
}

/* ─── Anti-Gravity Background ─── */

function AntiGravityBackground({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {ORB_DEFS.map((def, i) => (
        <AntiGravityOrb key={i} def={def} mouseX={mouseX} mouseY={mouseY} />
      ))}
    </div>
  )
}

/* ─── Slide to Enter ─── */

function SlideToEnter({ onUnlock }: { onUnlock: () => void }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [unlocked, setUnlocked] = useState(false)

  const handleStart = useCallback(() => {
    if (!unlocked) setDragging(true)
  }, [unlocked])

  const handleMove = useCallback(
    (clientX: number) => {
      if (!dragging || !trackRef.current || unlocked) return
      const rect = trackRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(clientX - rect.left - 24, rect.width - 48))
      const pct = x / (rect.width - 48)
      setProgress(pct)
      if (pct > 0.92) {
        setProgress(1)
        setDragging(false)
        setUnlocked(true)
        setTimeout(() => onUnlock(), 600)
      }
    },
    [dragging, unlocked, onUnlock]
  )

  const handleEnd = useCallback(() => {
    if (!unlocked) { setDragging(false); setProgress(0) }
  }, [unlocked])

  useEffect(() => {
    function onMM(e: MouseEvent) { handleMove(e.clientX) }
    function onTM(e: TouchEvent) { handleMove(e.touches[0].clientX) }
    function onUp() { handleEnd() }
    if (dragging) {
      window.addEventListener("mousemove", onMM)
      window.addEventListener("touchmove", onTM)
      window.addEventListener("mouseup", onUp)
      window.addEventListener("touchend", onUp)
    }
    return () => {
      window.removeEventListener("mousemove", onMM)
      window.removeEventListener("touchmove", onTM)
      window.removeEventListener("mouseup", onUp)
      window.removeEventListener("touchend", onUp)
    }
  }, [dragging, handleMove, handleEnd])

  return (
    <div className="relative flex flex-col items-center gap-6">
      <div
        ref={trackRef}
        className="relative h-14 w-80 overflow-hidden rounded-full border border-white/[0.08] bg-white/[0.02]"
        style={{ backdropFilter: "blur(20px)" }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-opacity"
          style={{
            width: `${progress * 100}%`,
            background: "linear-gradient(90deg, rgba(0,242,234,0.05), rgba(0,242,234,0.15))",
            opacity: progress > 0 ? 1 : 0,
          }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 flex h-10 w-10 cursor-grab items-center justify-center rounded-full border-2 border-[#00f2ea] bg-[#050505] shadow-[0_0_20px_rgba(0,242,234,0.5)] active:cursor-grabbing"
          style={{ left: `${progress * (100 - 15)}%`, marginLeft: 4 }}
          onMouseDown={handleStart}
          onTouchStart={handleStart}
          role="slider"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Slide to enter"
          tabIndex={0}
        >
          <Key className="h-4 w-4 text-[#00f2ea]" strokeWidth={1.5} />
        </div>
        {progress < 0.1 && !unlocked && (
          <span className="absolute inset-0 flex items-center justify-center text-[11px] uppercase tracking-[0.2em] text-white/20 pointer-events-none select-none">
            Slide to Enter
          </span>
        )}
      </div>

      {/* Warp speed blur indicator */}
      {unlocked && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-[#00f2ea]/60 tracking-[0.15em] uppercase"
        >
          Access Granted
        </motion.p>
      )}
    </div>
  )
}

/* ─── Branded Logo ─── */

function ChronoLogo({ size = "lg" }: { size?: "sm" | "lg" }) {
  const textClass = size === "lg" ? "text-2xl" : "text-base"
  const iconSize = size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5"
  const tagClass = size === "lg" ? "text-[10px]" : "text-[9px]"

  return (
    <div className="flex flex-col items-center gap-2">
      <h1 className={`font-display ${textClass} font-medium tracking-[0.14em] text-white/90`}>
        {"CHR"}
        <span className="relative inline-flex items-center justify-center align-middle mx-[-1px]">
          <Clock className={`${iconSize} text-[#00f2ea]`} strokeWidth={1.5} />
        </span>
        {"NO"}
        <span className="text-[#00f2ea]">{"WEALTH"}</span>
      </h1>
      <p className={`${tagClass} uppercase tracking-[0.25em] text-white/20`}>
        Architect Your Future. Before It Happens.
      </p>
    </div>
  )
}

/* ─── City Tier Selector ─── */

function CityTierSelector() {
  const { data, setData } = useFinancialData()

  const tiers: CityTier[] = ["tier1", "tier2", "tier3"]

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-1.5">
        <MapPin className="h-3 w-3 text-white/25" strokeWidth={1.5} />
        <span className="text-[10px] uppercase tracking-[0.15em] text-white/30">
          Select Your Location
        </span>
      </div>
      <div className="flex items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
        {tiers.map((tier) => {
          const meta = CITY_TIER_META[tier]
          const active = data.cityTier === tier
          return (
            <button
              key={tier}
              type="button"
              onClick={() => setData((prev) => ({ ...prev, cityTier: tier }))}
              className={`rounded-lg px-4 py-2 text-[10px] uppercase tracking-[0.1em] transition-all duration-300 ${active
                ? "bg-[#00f2ea]/15 text-[#00f2ea] shadow-[0_0_16px_rgba(0,242,234,0.15)] ring-1 ring-[#00f2ea]/30"
                : "text-white/30 hover:bg-white/[0.03] hover:text-white/50"
                }`}
            >
              {meta.label}
            </button>
          )
        })}
      </div>
      <p className="mono-num text-[9px] text-white/15">
        Inflation rate: {CITY_TIER_META[data.cityTier].inflationRate}% p.a.
      </p>
    </div>
  )
}

/* ─── Anti-Gravity Gate ─── */

function AntiGravityGate({ onUnlock }: { onUnlock: () => void }) {
  const { data, setData } = useFinancialData()
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth) * 100
    const y = (e.clientY / window.innerHeight) * 100
    setMousePos({ x, y })
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(40px)", scale: 1.05 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <AntiGravityBackground mouseX={mousePos.x} mouseY={mousePos.y} />

      {/* Frosted Glass Gate Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="glass-highlight glass-spotlight relative z-10 mx-4 flex w-full max-w-md flex-col items-center gap-8 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-8 py-10"
        style={{ backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)" }}
      >
        <ChronoLogo size="lg" />

        {/* Email & Password & State/City Inputs */}
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-[10px] uppercase tracking-[0.15em] text-white/25"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="glow-input w-full bg-transparent px-0 py-2.5 text-sm text-white/80 placeholder-white/15 focus:text-white/90"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-[10px] uppercase tracking-[0.15em] text-white/25"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="glow-input w-full bg-transparent px-0 py-2.5 text-sm text-white/80 placeholder-white/15 focus:text-white/90"
            />
          </div>

          {/* State & City Inputs */}
          <div className="flex gap-4">
            <div className="flex flex-col gap-1.5 w-1/2">
              <label
                htmlFor="state"
                className="text-[10px] uppercase tracking-[0.15em] text-white/25"
              >
                State
              </label>
              <input
                id="state"
                type="text"
                placeholder="State"
                value={data?.state || ""}
                onChange={(e) => setData(prev => ({ ...prev, state: e.target.value }))}
                className="glow-input w-full bg-transparent px-0 py-2.5 text-sm text-white/80 placeholder-white/15 focus:text-white/90"
              />
            </div>
            <div className="flex flex-col gap-1.5 w-1/2">
              <label
                htmlFor="city"
                className="text-[10px] uppercase tracking-[0.15em] text-white/25"
              >
                City
              </label>
              <input
                id="city"
                type="text"
                placeholder="City"
                value={data?.city || ""}
                onChange={(e) => setData(prev => ({ ...prev, city: e.target.value }))}
                className="glow-input w-full bg-transparent px-0 py-2.5 text-sm text-white/80 placeholder-white/15 focus:text-white/90"
              />
            </div>
          </div>
        </div>

        {/* City Tier Selector */}
        <div className="w-full border-t border-white/[0.04] pt-6">
          <CityTierSelector />
        </div>

        {/* Slide to Enter */}
        <SlideToEnter onUnlock={onUnlock} />
      </motion.div >
      )
}

      /* ─── DNA Slider ─── */

      interface DNASliderProps {
        label: string
      sublabel: string
      value: number
      min: number
      max: number
      step: number
      trackColor: string
  onChange: (val: number) => void
}

      function DNASlider({label, sublabel, value, min, max, step, trackColor, onChange}: DNASliderProps) {
  return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-white/60">{label}</span>
            <span className="text-[9px] text-white/20">{sublabel}</span>
          </div>
          <span className="mono-num text-xs font-medium" style={{ color: trackColor }}>
            {"\u20B9"}{formatINR(value)}
          </span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="dna-slider"
          style={{ "--track-color": trackColor } as React.CSSProperties}
        />
      </div>
      )
}

      /* ─── DNA Category Config ─── */

      interface DNACategoryConfig {
        key: keyof ExpenseDNA
      label: string
      sublabel: string
      max: number
  getColor?: (val: number, max: number) => string
      color?: string
}

      const dnaCategories: DNACategoryConfig[] = [
      {key: "rent", label: "Rent", sublabel: "Core Survival", max: 50000, color: "rgba(255,255,255,0.7)" },
      {key: "food", label: "Food & Groceries", sublabel: "Core Survival", max: 30000, color: "rgba(255,255,255,0.7)" },
      {
        key: "shopping", label: "Shopping", sublabel: "Lifestyle & Vices", max: 30000,
    getColor: (val, mx) => {
      const t = val / mx
      return `rgb(${Math.round(34 + t * 186)},${Math.round(197 - t * 159)},${Math.round(94 - t * 56)})`
    },
  },
      {
        key: "subscriptions", label: "Subscriptions", sublabel: "Lifestyle & Vices", max: 10000,
    getColor: (val, mx) => {
      const t = val / mx
      return `rgb(${Math.round(34 + t * 186)},${Math.round(197 - t * 159)},${Math.round(94 - t * 56)})`
    },
  },
      {
        key: "trips", label: "Trips & Holidays", sublabel: "Lifestyle & Vices", max: 20000,
    getColor: (val, mx) => {
      const t = val / mx
      return `rgb(${Math.round(34 + t * 186)},${Math.round(197 - t * 159)},${Math.round(94 - t * 56)})`
    },
  },
      {key: "commute", label: "Commute", sublabel: "Travel", max: 15000, color: "rgba(255,255,255,0.7)" },
      {
        key: "party", label: "Party & Nightlife", sublabel: "Vices", max: 20000,
    getColor: (val, mx) => {
      const t = val / mx
      return `rgb(${Math.round(34 + t * 186)},${Math.round(197 - t * 159)},${Math.round(94 - t * 56)})`
    },
  },
      {
        key: "habits", label: "Habits", sublabel: "Vices", max: 10000,
    getColor: (val, mx) => {
      const t = val / mx
      return `rgb(${Math.round(34 + t * 186)},${Math.round(197 - t * 159)},${Math.round(94 - t * 56)})`
    },
  },
      {key: "sips", label: "SIPs & Mutual Funds", sublabel: "Discipline", max: 50000, color: "#eab308" },
      {key: "investments", label: "Investments", sublabel: "Discipline", max: 50000, color: "#eab308" },
      ]

      /* ─── DNA Sanctuary (with Risk Shield) ─── */

      function DNASanctuary({onAnalyze}: {onAnalyze: () => void }) {
  const {data, setData, totalDNAExpenses} = useFinancialData()

      const handleDNA = useCallback(
    (key: keyof ExpenseDNA) => (val: number) => {
        setData((prev) => {
          const newDNA = { ...prev.dna, [key]: val }
          const total = Object.values(newDNA).reduce((a, b) => a + b, 0)
          return { ...prev, dna: newDNA, monthlyExpenses: total }
        })
      },
      [setData]
      )

      const handleIncome = useCallback(
    (val: number) => setData((prev) => ({...prev, monthlyIncome: val })),
      [setData]
      )

      const handleTermCover = useCallback(
    (val: number) => setData((prev) => ({...prev, termCover: val })),
      [setData]
      )

      const handleHealthCover = useCallback(
    (val: number) => setData((prev) => ({...prev, healthCover: val })),
      [setData]
      )

      return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: -30 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="glass-highlight glass-spotlight relative z-10 mx-4 w-full max-w-[600px] overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03]"
        style={{ backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)" }}
      >
        {/* Header */}
        <div className="border-b border-white/[0.04] px-8 pt-8 pb-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00f2ea]/10 ring-1 ring-[#00f2ea]/20">
              <Sparkles className="h-5 w-5 text-[#00f2ea]" strokeWidth={1.5} />
            </div>
            <h1 className="text-platinum text-lg font-light tracking-[0.08em]">
              <TypewriterText text="Calibrating Financial DNA..." />
            </h1>
            <p className="animate-unblur text-[11px] text-white/25" style={{ animationDelay: "1.5s" }}>
              Every rupee tells a story. Where does yours go?
            </p>
          </div>
        </div>

        {/* Income Slider */}
        <div className="border-b border-white/[0.04] px-8 py-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-[0.15em] text-white/40">Monthly Income</span>
            <span className="mono-num text-sm font-light text-[#00f2ea]">
              {"\u20B9"}{formatINR(data.monthlyIncome)}
            </span>
          </div>
          <input
            type="range"
            min={10000}
            max={1000000}
            step={5000}
            value={data.monthlyIncome}
            onChange={(e) => handleIncome(Number(e.target.value))}
            className="luxury-slider w-full"
          />
        </div>

        {/* DNA Grid */}
        <div className="max-h-[260px] overflow-y-auto scrollbar-hide border-b border-white/[0.04] px-8 py-5">
          <p className="mb-4 text-[10px] uppercase tracking-[0.15em] text-white/30">
            Spending Categories
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {dnaCategories.map((cat) => {
              const val = data.dna[cat.key]
              const color = cat.getColor ? cat.getColor(val, cat.max) : (cat.color ?? "#00f2ea")
              return (
                <DNASlider
                  key={cat.key}
                  label={cat.label}
                  sublabel={cat.sublabel}
                  value={val}
                  min={0}
                  max={cat.max}
                  step={500}
                  trackColor={color}
                  onChange={handleDNA(cat.key)}
                />
              )
            })}
          </div>
        </div>

        {/* Risk Shield Section */}
        <div className="border-b border-white/[0.04] px-8 py-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-3.5 w-3.5 text-[#00f2ea]" strokeWidth={1.5} />
            <p className="text-[10px] uppercase tracking-[0.15em] text-white/40">
              Risk Shield
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DNASlider
              label="Health Insurance"
              sublabel="Cover Amount"
              value={data.healthCover}
              min={500000}
              max={10000000}
              step={500000}
              trackColor="#3b82ff"
              onChange={handleHealthCover}
            />
            <DNASlider
              label="Term Life Cover"
              sublabel="Sum Assured"
              value={data.termCover}
              min={5000000}
              max={50000000}
              step={5000000}
              trackColor="#3b82ff"
              onChange={handleTermCover}
            />
          </div>
        </div>

        {/* Total Outflow + CTA */}
        <div className="px-8 py-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase tracking-[0.12em] text-white/30">Total Outflow</span>
            <motion.span
              key={totalDNAExpenses}
              initial={{ scale: 1.1, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mono-num text-2xl font-light text-white/90"
            >
              {"\u20B9"}{formatINR(totalDNAExpenses)}
            </motion.span>
          </div>

          {data.monthlyIncome > totalDNAExpenses && (
            <div className="mb-4 flex items-center justify-between rounded-lg bg-[#00f2ea]/5 px-4 py-2 ring-1 ring-[#00f2ea]/10">
              <span className="text-[10px] uppercase tracking-wider text-white/25">Monthly Surplus</span>
              <span className="mono-num text-sm text-[#00f2ea]">
                {"\u20B9"}{formatINR(data.monthlyIncome - totalDNAExpenses)}
              </span>
            </div>
          )}

          <motion.button
            onClick={onAnalyze}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative w-full overflow-hidden rounded-xl bg-[#00f2ea]/10 py-4 text-xs font-medium uppercase tracking-[0.2em] text-[#00f2ea] ring-1 ring-[#00f2ea]/20 transition-all duration-300 hover:bg-[#00f2ea]/20 hover:ring-[#00f2ea]/40 hover:shadow-[0_0_40px_rgba(0,242,234,0.15)]"
          >
            <span className="relative z-10">Simulate Future</span>
          </motion.button>
        </div>
      </motion.div>
      )
}

      /* ─── Morphing Bird Transition ─── */

      function MorphingBirdTransition({onComplete}: {onComplete: () => void }) {
  const [stage, setStage] = useState<1 | 2 | 3>(1)

  useEffect(() => {
    const t1 = setTimeout(() => setStage(2), 2400)
    const t2 = setTimeout(() => setStage(3), 3400)
    const t3 = setTimeout(() => onComplete(), 4200)
    return () => {clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onComplete])

      return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8"
        style={{ background: "#050505" }}
      >
        {/* Infinity symbol + bird */}
        <div className="relative h-48 w-80">
          {/* Draw infinity path */}
          {(stage === 1 || stage === 2) && (
            <svg viewBox="0 0 320 140" className="absolute inset-0 h-full w-full" fill="none">
              <path
                d="M160,70 C160,35 110,35 110,70 C110,105 160,105 160,70 C160,35 210,35 210,70 C210,105 160,105 160,70 Z"
                stroke="#eab308"
                strokeWidth="1.5"
                strokeDasharray="600"
                style={{ animation: "draw-path 2s ease-in-out forwards" }}
              />
            </svg>
          )}

          {/* Bird flying infinity loop */}
          {stage === 1 && (
            <motion.div
              animate={{
                x: [0, 50, 0, -50, 0],
                y: [0, -35, 0, 35, 0],
              }}
              transition={{ duration: 2.4, ease: "linear" }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <Bird className="h-5 w-5 text-[#eab308] drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]" strokeWidth={1.5} />
            </motion.div>
          )}

          {/* Bird escapes: bottom-left to top-right with golden trail */}
          {stage === 2 && (
            <>
              {/* Trail SVG */}
              <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 320 140" fill="none">
                <line
                  x1="60"
                  y1="120"
                  x2="300"
                  y2="10"
                  stroke="#eab308"
                  strokeWidth="2"
                  strokeDasharray="400"
                  opacity="0.6"
                  style={{ animation: "draw-path 0.8s ease-out forwards" }}
                />
              </svg>
              <motion.div
                initial={{ x: -100, y: 60, opacity: 1, scale: 1 }}
                animate={{ x: 250, y: -80, opacity: 0, scale: 0.4 }}
                transition={{ duration: 0.9, ease: "easeIn" }}
                className="absolute left-0 top-1/2"
              >
                <Bird className="h-5 w-5 text-[#eab308] drop-shadow-[0_0_12px_rgba(234,179,8,0.7)]" strokeWidth={1.5} />
              </motion.div>
            </>
          )}

          {/* Stage 3: Trail morphs into gold line (visual echo) */}
          {stage === 3 && (
            <motion.svg
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 h-full w-full overflow-visible"
              viewBox="0 0 320 140"
              fill="none"
            >
              <line x1="0" y1="100" x2="320" y2="20" stroke="#eab308" strokeWidth="2.5" opacity="0.5" />
            </motion.svg>
          )}
        </div>

        {/* Stage text */}
        <AnimatePresence mode="wait">
          {stage === 1 && (
            <motion.p key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs uppercase tracking-[0.25em] text-white/30">
              Escaping the Rat Race...
            </motion.p>
          )}
          {stage === 2 && (
            <motion.p key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs uppercase tracking-[0.25em] text-[#eab308]/60">
              Breaking Free
            </motion.p>
          )}
          {stage === 3 && (
            <motion.p key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs uppercase tracking-[0.25em] text-[#00f2ea]/60">
              Charting Your Destiny
            </motion.p>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        <div className="w-48 h-[2px] rounded-full bg-white/5 overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 4, ease: "easeInOut" }}
            className="h-full rounded-full bg-gradient-to-r from-[#eab308] to-[#00f2ea]"
          />
        </div>
      </motion.div>
      )
}

      /* ─── Main Page Orchestrator ─── */

      type AppStage = "gate" | "sanctuary" | "transition"

      export default function EntryPage() {
  const [stage, setStage] = useState<AppStage>("gate")
        const {setHasOnboarded} = useFinancialData()
        const router = useRouter()

  const handleGateUnlock = useCallback(() => setStage("sanctuary"), [])

  const handleAnalyze = useCallback(() => {
          setHasOnboarded(true)
    setStage("transition")
  }, [setHasOnboarded])

  const handleTransitionComplete = useCallback(() => {
          router.push("/dashboard")
        }, [router])

        return (
        <div className="relative min-h-screen overflow-hidden" style={{ background: "#050505" }}>
          <AnimatePresence mode="wait">
            {stage === "gate" && <AntiGravityGate key="gate" onUnlock={handleGateUnlock} />}
            {stage === "sanctuary" && (
              <motion.div
                key="sanctuary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="relative flex min-h-screen items-center justify-center overflow-y-auto py-8"
              >
                <DNASanctuary onAnalyze={handleAnalyze} />
              </motion.div>
            )}
            {stage === "transition" && (
              <MorphingBirdTransition key="transition" onComplete={handleTransitionComplete} />
            )}
          </AnimatePresence>
        </div>
        )
}
