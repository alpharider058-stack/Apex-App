import { EX_BY_ID, MUSCLE_GROUP, GROUPS } from '../data/exercises'

export const TIERS = [
  { id: 'iron', name: 'Hierro', top: 100, color: '#8b929e', glow: '#b0b8c6', dark: '#2c3038', title: 'Iniciado de Hierro' },
  { id: 'bronze', name: 'Bronce', top: 80, color: '#cd7f42', glow: '#f0a260', dark: '#4d260d', title: 'Guerrero de Bronce' },
  { id: 'silver', name: 'Plata', top: 60, color: '#c8d4e3', glow: '#eef5ff', dark: '#4a5566', title: 'Centurión de Plata' },
  { id: 'gold', name: 'Oro', top: 40, color: '#f4c038', glow: '#ffe175', dark: '#6b4704', title: 'Campeón de Oro' },
  { id: 'ruby', name: 'Rubí', top: 30, color: '#f23548', glow: '#ff6e7e', dark: '#5e0812', title: 'Señor Carmesí' },
  { id: 'emerald', name: 'Esmeralda', top: 20, color: '#24db70', glow: '#6bffa8', dark: '#074f24', title: 'Titán Esmeralda' },
  { id: 'diamond', name: 'Diamante', top: 10, color: '#64c8ff', glow: '#c4eeff', dark: '#124675', title: 'Élite Diamante' },
  { id: 'amethyst', name: 'Amatista', top: 5, color: '#a56eff', glow: '#d4b3ff', dark: '#34136e', title: 'Soberano Amatista' },
  { id: 'apex', name: 'Apex', top: 1, color: '#3b82ff', glow: '#8cc0ff', dark: '#092275', title: 'Semidiós Apex' },
]
export const TIER_BY_ID = Object.fromEntries(TIERS.map((t) => [t.id, t]))
const DIV = ['III', 'II', 'I']

// --- math helpers ---------------------------------------------------------
const erf = (x) => {
  const s = Math.sign(x); x = Math.abs(x)
  const t = 1 / (1 + 0.3275911 * x)
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x)
  return s * y
}
const cdf = (z) => 0.5 * (1 + erf(z / Math.SQRT2))
const SIGMA = 0.38
const topToZ = (top) => {
  let lo = -5, hi = 5
  for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; (100 * (1 - cdf(m)) > top) ? (lo = m) : (hi = m) }
  return (lo + hi) / 2
}
const TIER_Z = TIERS.map((t) => (t.top >= 100 ? -Infinity : topToZ(t.top)))

export const e1rm = (w, r) => (r <= 1 ? w : w * (1 + r / 30))

// --- strength standards ---------------------------------------------------
const MUSCLE_STD = {
  chest: 0.85, quadriceps: 1.15, hamstrings: 1.2, glutes: 1.25, 'lower back': 1.3, lats: 0.75, 'middle back': 0.8,
  shoulders: 0.55, traps: 1.0, biceps: 0.42, triceps: 0.45, forearms: 0.35, calves: 1.0, abdominals: 0.35,
  adductors: 0.8, abductors: 0.8, neck: 0.25,
}
const EQUIP_STD = { barbell: 1, 'e-z curl bar': 0.9, dumbbell: 0.38, kettlebells: 0.35, cable: 0.62, machine: 1.1, other: 0.7, bands: 0.3, 'body only': 1 }
const SMALL = new Set(['biceps', 'triceps', 'forearms', 'calves', 'neck', 'abdominals'])

function bwProfile(ex) {
  if (/pull-?up|chin-?up|muscle.?up/i.test(ex.name)) return { frac: 0.95, med: 8 }
  if (/dip/i.test(ex.name)) return { frac: 0.95, med: 10 }
  if (/push-?up/i.test(ex.name)) return { frac: 0.65, med: 20 }
  return { frac: 0.6, med: 15 }
}

/** Standard 1RM reference for a median lifter on a given exercise */
export function median1RM(ex, profile) {
  const bw = profile?.bodyweight || 75
  const fem = profile?.sex === 'female'
  const lower = ['quadriceps', 'hamstrings', 'glutes', 'calves', 'adductors', 'abductors'].includes(ex.primary[0])
  const sexK = fem ? (lower ? 0.75 : 0.6) : 1
  if (ex.bodyweight) {
    const { frac, med } = bwProfile(ex)
    return e1rm(bw * frac, med * sexK)
  }
  const m = ex.primary[0]
  let std = (MUSCLE_STD[m] ?? 0.6) * (EQUIP_STD[ex.equipment] ?? 0.7)
  if (ex.mechanic === 'isolation' && !SMALL.has(m)) std *= 0.55
  std *= sexK
  return bw * std
}

/** Ratio of the performance vs the median lifter (1 = median). */
export function perfRatio(ex, set, profile) {
  const bw = profile?.bodyweight || 75
  const fem = profile?.sex === 'female'
  const lower = ['quadriceps', 'hamstrings', 'glutes', 'calves', 'adductors', 'abductors'].includes(ex.primary[0])
  const sexK = fem ? (lower ? 0.75 : 0.6) : 1
  if (ex.timed) return (set.r || 0) / (60 * sexK)
  if (ex.bodyweight) {
    const { frac, med } = bwProfile(ex)
    const perf = e1rm(bw * frac + (set.w || 0), set.r || 0)
    return perf / e1rm(bw * frac, med * sexK)
  }
  return e1rm(set.w || 0, set.r || 0) / median1RM(ex, profile)
}

export function rankFromZ(z) {
  if (z == null || Number.isNaN(z)) return null
  let ti = 0
  for (let i = 0; i < TIERS.length; i++) if (z >= TIER_Z[i]) ti = i
  const tier = TIERS[ti]
  const lo = ti === 0 ? topToZ(99) : TIER_Z[ti]
  const hi = ti === TIERS.length - 1 ? topToZ(0.05) : TIER_Z[ti + 1]
  const frac = Math.min(0.999, Math.max(0, (z - lo) / (hi - lo)))
  const isTop = ti === TIERS.length - 1
  const d = isTop ? 2 : Math.min(2, Math.floor(frac * 3))
  const divProgress = isTop ? frac : frac * 3 - d
  const top = Math.max(0.1, 100 * (1 - cdf(z)))
  return { tier, tierIndex: ti, division: ti === 0 ? '' : DIV[d], divIndex: d, progress: divProgress, tierProgress: frac, z, top, score: ti * 3 + d + divProgress }
}

export const zFromRatio = (r) => (r > 0 ? Math.log(r) / SIGMA : -4)

/**
 * Interactive Rank Calculator helper:
 * Given exercise, weight, reps, sets, and user profile, computes the exact rank,
 * multi-set volume bonus, next rank target weight, and full tier ladder.
 */
export function simulateExerciseRank(exId, { weight = 60, reps = 8, sets = 3 }, profile) {
  const ex = typeof exId === 'string' ? EX_BY_ID[exId] : exId
  if (!ex) return null
  const w = Math.max(0, +weight || 0)
  const r = Math.max(1, +reps || 1)
  const s = Math.max(1, +sets || 1)
  const bw = profile?.bodyweight || 75

  // Effective set performance (with subtle consistency boost when completing multiple working sets at same weight)
  const setBonus = 1 + Math.min(0.06, Math.max(0, s - 1) * 0.012)
  const baseRatio = perfRatio(ex, { w, r }, profile) * setBonus
  const z = zFromRatio(baseRatio)
  const rank = rankFromZ(z)
  const est1RM = ex.bodyweight
    ? e1rm(bw * bwProfile(ex).frac + w, r)
    : e1rm(w, r)

  const repFactor = r <= 1 ? 1 : 1 + r / 30
  const med1RM = median1RM(ex, profile)

  const weightForZ = (targetZ) => {
    const targetRatio = Math.exp(targetZ * SIGMA) / setBonus
    const needed1RM = targetRatio * med1RM
    const neededTotalW = needed1RM / repFactor
    if (ex.bodyweight) {
      const extra = neededTotalW - bw * bwProfile(ex).frac
      return Math.max(0, Math.round(extra * 2) / 2)
    }
    return Math.max(2.5, Math.round(neededTotalW * 2) / 2)
  }

  // Next tier or division target
  let nextLabel = null
  let nextTier = null
  let nextWeight = null
  if (rank.tierIndex < TIERS.length - 1) {
    const ti = rank.tierIndex
    const lo = ti === 0 ? topToZ(99) : TIER_Z[ti]
    const hi = TIER_Z[ti + 1]
    if (ti === 0 || rank.divIndex === 2) {
      nextTier = TIERS[ti + 1]
      nextLabel = `${nextTier.name} ${ti + 1 === TIERS.length - 1 ? '' : 'III'}`.trim()
      nextWeight = weightForZ(hi)
    } else {
      nextTier = rank.tier
      const nextDivIdx = rank.divIndex + 1
      nextLabel = `${rank.tier.name} ${DIV[nextDivIdx]}`
      const divZ = lo + ((hi - lo) * nextDivIdx) / 3
      nextWeight = weightForZ(divZ)
    }
  }

  const ladder = TIERS.map((t, idx) => {
    const zReq = idx === 0 ? topToZ(95) : TIER_Z[idx]
    const reqW = idx === 0 ? 0 : weightForZ(zReq)
    const req1RM = Math.round(reqW * repFactor)
    return {
      tier: t,
      tierIndex: idx,
      weight: reqW,
      e1rm: req1RM,
      unlocked: rank.tierIndex >= idx,
      isCurrent: rank.tier.id === t.id,
    }
  })

  return {
    ex,
    weight: w,
    reps: r,
    sets: s,
    est1RM: Math.round(est1RM),
    volume: Math.round(w * r * s),
    bwRatio: +(est1RM / bw).toFixed(2),
    rank,
    nextTier,
    nextLabel,
    nextWeight,
    kgToNext: nextWeight != null ? Math.max(0.5, +(nextWeight - w).toFixed(1)) : 0,
    ladder,
  }
}

// --- history aggregation ----------------------------------------------------
export function bestByExercise(workouts) {
  const best = {}
  for (const w of workouts) {
    for (const item of w.exercises) {
      for (const s of item.sets) {
        if (!s.done || !(s.r > 0)) continue
        const v = e1rm(s.w || 0, s.r)
        const b = (best[item.exId] ??= { e1rm: 0, set: null, sets: 0, volume: 0, maxW: 0, history: [], date: 0 })
        b.sets++
        b.volume += (s.w || 0) * s.r
        b.maxW = Math.max(b.maxW, s.w || 0)
        if (v >= b.e1rm) { b.e1rm = v; b.set = s; b.date = w.end || w.start }
      }
    }
  }
  return best
}

export function exerciseRank(exId, best, profile) {
  const ex = EX_BY_ID[exId]
  const b = best[exId]
  if (!ex || !b || !b.set) return null
  return rankFromZ(zFromRatio(perfRatio(ex, b.set, profile)))
}

export function computeRanks(workouts, profile) {
  const best = bestByExercise(workouts)
  const exRanks = {}
  for (const id in best) { const r = exerciseRank(id, best, profile); if (r) exRanks[id] = r }

  const acc = {}
  for (const id in exRanks) {
    const ex = EX_BY_ID[id]
    const w = Math.log(1 + best[id].sets)
    for (const m of ex.primary) (acc[m] ??= { z: 0, w: 0 }), (acc[m].z += exRanks[id].z * w), (acc[m].w += w)
    for (const m of ex.secondary) (acc[m] ??= { z: 0, w: 0 }), (acc[m].z += exRanks[id].z * w * 0.3), (acc[m].w += w * 0.3)
  }
  const muscleRanks = {}
  for (const m in acc) muscleRanks[m] = rankFromZ(acc[m].z / acc[m].w)

  const groupRanks = {}
  for (const g in GROUPS) {
    const ms = GROUPS[g].muscles.filter((m) => muscleRanks[m])
    if (ms.length) groupRanks[g] = rankFromZ(ms.reduce((a, m) => a + muscleRanks[m].z, 0) / ms.length)
  }
  const ids = Object.keys(exRanks)
  const global = ids.length >= 10 ? rankFromZ(Object.values(muscleRanks).reduce((a, r) => a + r.z, 0) / Object.keys(muscleRanks).length) : null
  return { best, exRanks, muscleRanks, groupRanks, global, rankedCount: ids.length }
}

export { MUSCLE_GROUP }
