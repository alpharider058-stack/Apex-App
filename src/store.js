import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { get, set, del } from 'idb-keyval'
import { DEFAULT_ROUTINES } from './lib/plans'
import { suggestNext, lastSession } from './lib/overload'

// Clean up any previous demo key so the app starts completely empty
del('apex-store').catch(() => {})

const idbStorage = {
  getItem: async (k) => (await get(k)) ?? null,
  setItem: (k, v) => set(k, v),
  removeItem: (k) => del(k),
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)

const newSetsFor = (exId, workouts, cfg = {}) => {
  const n = cfg.sets ?? 3
  const sug = suggestNext(exId, workouts, cfg.repMin ?? 8, cfg.repMax ?? 12)
  const last = lastSession(exId, workouts)
  return Array.from({ length: n }, (_, i) => {
    const prev = last?.sets[i] || last?.sets[last.sets.length - 1]
    return {
      id: uid(),
      w: sug?.w ?? prev?.w ?? '',
      r: sug?.r ?? cfg.repMax ?? '',
      done: false,
      type: 'normal',
      prev: prev ? { w: prev.w, r: prev.r } : null,
    }
  })
}

export const DEFAULT_API_KEY = ''

export const useStore = create(
  persist(
    (setState, getState) => ({
      hydrated: false,
      profile: {
        name: '',
        sex: 'male',
        bodyweight: 75,
        height: 175,
        age: 25,
        experience: 'intermediate',
        goal: 'muscle',
        days: 4,
        env: 'gym',
        unit: 'kg',
        onboarded: false,
        photo: null,
      },
      settings: { apiKey: DEFAULT_API_KEY, restDefault: 90, sound: true, haptics: true },
      workouts: [],
      routines: DEFAULT_ROUTINES(),
      active: null,
      scans: [],
      measurements: [],
      lastRankUps: null,

      setProfile: (p) => setState((s) => ({ profile: { ...s.profile, ...p } })),
      setSettings: (p) => setState((s) => ({ settings: { ...s.settings, ...p } })),

      // routines
      saveRoutine: (r) =>
        setState((s) => {
          const exists = r.id && s.routines.some((x) => x.id === r.id)
          return {
            routines: exists
              ? s.routines.map((x) => (x.id === r.id ? { ...x, ...r } : x))
              : [{ ...r, id: r.id || uid(), createdAt: r.createdAt || Date.now() }, ...s.routines],
          }
        }),
      deleteRoutine: (id) => setState((s) => ({ routines: s.routines.filter((r) => r.id !== id) })),
      addRoutines: (rs) =>
        setState((s) => {
          const normalized = (rs || []).map((r, i) => ({
            ...r,
            id: r.id || `${uid()}-${i}`,
            name: (r.name || `RUTINA IA ${i + 1}`).toUpperCase(),
            createdAt: r.createdAt || Date.now() - i,
            ai: r.ai ?? true,
            exercises: (r.exercises || []).map((e) => ({
              exId: e.exId,
              sets: Math.max(1, +e.sets || 3),
              repMin: Math.max(1, +e.repMin || 8),
              repMax: Math.max(1, +e.repMax || 12),
              rest: Math.max(15, +e.rest || 90),
            })),
          }))
          return { routines: [...normalized, ...s.routines] }
        }),

      // active workout
      startWorkout: (routine) => {
        const { workouts } = getState()
        const exercises = (routine?.exercises || []).map((e) => ({
          uid: uid(),
          exId: e.exId,
          repMin: e.repMin ?? 8,
          repMax: e.repMax ?? 12,
          rest: e.rest ?? 90,
          superset: null,
          sets: newSetsFor(e.exId, workouts, e),
        }))
        setState({
          active: {
            id: uid(),
            name: routine?.name || 'Entrenamiento libre',
            routineId: routine?.id || null,
            start: Date.now(),
            exercises,
            current: 0,
            minimized: false,
            restUntil: null,
            restTotal: 0,
          },
        })
      },
      updateActive: (fn) => setState((s) => (s.active ? { active: fn(structuredClone(s.active)) } : {})),
      addExercisesToActive: (ids) => {
        const { workouts } = getState()
        getState().updateActive((a) => {
          ids.forEach((exId) =>
            a.exercises.push({
              uid: uid(),
              exId,
              repMin: 8,
              repMax: 12,
              rest: getState().settings.restDefault,
              superset: null,
              sets: newSetsFor(exId, workouts),
            })
          )
          a.current = a.exercises.length - ids.length
          return a
        })
      },
      discardWorkout: () => setState({ active: null }),
      finishWorkout: (extra = {}) => {
        const { active, workouts } = getState()
        if (!active) return null
        const exercises = active.exercises
          .map((e) => ({
            exId: e.exId,
            superset: e.superset,
            sets: e.sets
              .filter((s) => s.done)
              .map(({ w, r, type, done }) => ({ w: +w || 0, r: +r || 0, type, done })),
          }))
          .filter((e) => e.sets.length)
        const w = {
          id: active.id,
          name: active.name,
          routineId: active.routineId,
          start: active.start,
          end: Date.now(),
          exercises,
          ...extra,
        }
        setState({ workouts: [...workouts, w], active: null })
        return w
      },
      updateWorkout: (id, p) =>
        setState((s) => ({ workouts: s.workouts.map((w) => (w.id === id ? { ...w, ...p } : w)) })),
      deleteWorkout: (id) => setState((s) => ({ workouts: s.workouts.filter((w) => w.id !== id) })),

      addScan: (scan) => setState((s) => ({ scans: [...s.scans, { id: uid(), date: Date.now(), ...scan }] })),
      addMeasurement: (m) =>
        setState((s) => ({
          measurements: [...s.measurements, { id: uid(), date: Date.now(), ...m }],
          profile: m.weight ? { ...s.profile, bodyweight: m.weight } : s.profile,
        })),
      deleteMeasurement: (id) =>
        setState((s) => ({ measurements: s.measurements.filter((m) => m.id !== id) })),

      resetAll: () =>
        setState({
          workouts: [],
          routines: DEFAULT_ROUTINES(),
          active: null,
          scans: [],
          measurements: [],
          profile: { ...getState().profile, onboarded: false },
        }),
    }),
    {
      name: 'apex-store-clean-v1',
      storage: createJSONStorage(() => idbStorage),
      partialize: ({ hydrated, ...rest }) =>
        Object.fromEntries(Object.entries(rest).filter(([, v]) => typeof v !== 'function')),
      onRehydrateStorage: () => (state) => {
        const currentKey = state?.settings?.apiKey
        const fixedRoutines = Array.isArray(state?.routines)
          ? state.routines.map((r, idx) => (r && r.id ? r : { ...r, id: `${uid()}-${idx}` }))
          : undefined
        useStore.setState({
          hydrated: true,
          ...(state?.settings && !currentKey
            ? { settings: { ...state.settings, apiKey: DEFAULT_API_KEY } }
            : {}),
          ...(fixedRoutines ? { routines: fixedRoutines } : {}),
        })
      },
    }
  )
)
