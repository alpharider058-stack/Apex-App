import { EX_BY_ID } from '../data/exercises'

const INC = { barbell: 2.5, 'e-z curl bar': 2.5, dumbbell: 2, kettlebells: 4, cable: 2.5, machine: 5, other: 2.5, bands: 0, 'body only': 0 }

export const round = (w, step = 0.25) => Math.round(w / step) * step

/** Last logged session of an exercise (array of done sets) */
export function lastSession(exId, workouts) {
  for (let i = workouts.length - 1; i >= 0; i--) {
    const it = workouts[i].exercises.find((e) => e.exId === exId)
    if (it) {
      const sets = it.sets.filter((s) => s.done && s.type !== 'warmup')
      if (sets.length) return { sets, date: workouts[i].end || workouts[i].start }
    }
  }
  return null
}

/**
 * Automatic progressive overload (double progression):
 * if every working set reached the top of the rep range -> add load and reset to the bottom;
 * otherwise keep the load and add one rep.
 */
export function suggestNext(exId, workouts, repMin = 8, repMax = 12) {
  const ex = EX_BY_ID[exId]
  const last = lastSession(exId, workouts)
  if (!last) return null
  const top = last.sets.reduce((a, s) => (s.w > a.w || (s.w === a.w && s.r > a.r) ? s : a), last.sets[0])
  const allTop = last.sets.every((s) => s.r >= repMax)
  const inc = INC[ex?.equipment] ?? 2.5
  if (allTop && inc > 0) return { w: round(top.w + inc), r: repMin, reason: `+${inc} kg: completaste ${repMax} reps en todas las series` }
  if (allTop) return { w: top.w, r: Math.min(100, top.r + 1), reason: '+1 rep' }
  return { w: top.w, r: Math.min(repMax, top.r + 1), reason: 'Mismo peso, +1 rep' }
}
