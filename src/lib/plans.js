import { findEx, EXERCISES, EX_BY_ID, GROUPS } from '../data/exercises'

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)

// Each slot lists candidates by preference (gym, home, calisthenics)
const S = {
  chestPress: {
    gym: ['Barbell Bench Press - Medium Grip', 'Machine Bench Press', 'Dumbbell Bench Press'],
    home: ['Dumbbell Bench Press', 'Pushups'],
    cali: ['Pushups', 'Incline Push-Up Medium'],
  },
  inclinePress: {
    gym: ['Incline Dumbbell Press', 'Barbell Incline Bench Press - Medium Grip'],
    home: ['Incline Dumbbell Press', 'Decline Push-Up'],
    cali: ['Dips - Chest Version', 'Decline Push-Up'],
  },
  chestFly: {
    gym: ['Butterfly', 'Cable Crossover', 'Incline Dumbbell Flyes'],
    home: ['Incline Dumbbell Flyes', 'Dumbbell Flyes'],
    cali: ['Incline Push-Up Close-Grip', 'Pushups'],
  },
  vPull: {
    gym: ['Wide-Grip Lat Pulldown', 'Pullups', 'Close-Grip Front Lat Pulldown'],
    home: ['Pullups', 'Chin-Up'],
    cali: ['Pullups', 'Chin-Up'],
  },
  hPull: {
    gym: ['Seated Cable Rows', 'Bent Over Barbell Row', 'One-Arm Dumbbell Row'],
    home: ['One-Arm Dumbbell Row', 'Bent Over Two-Dumbbell Row'],
    cali: ['Chin-Up', 'Inverted Row'],
  },
  row: {
    gym: ['Bent Over Barbell Row', 'T-Bar Row with Handle', 'Seated Cable Rows'],
    home: ['Bent Over Two-Dumbbell Row', 'One-Arm Dumbbell Row'],
    cali: ['Chin-Up', 'Pullups'],
  },
  ohp: {
    gym: ['Seated Dumbbell Press', 'Standing Military Press', 'Machine Shoulder (Military) Press'],
    home: ['Seated Dumbbell Press', 'Arnold Dumbbell Press'],
    cali: ['Handstand Push-Ups', 'Pushups'],
  },
  lateral: {
    gym: ['Side Lateral Raise', 'Cable Seated Lateral Raise'],
    home: ['Side Lateral Raise', 'Front Dumbbell Raise'],
    cali: ['Side Lateral Raise', 'Pushups'],
  },
  rearDelt: {
    gym: ['Face Pull', 'Reverse Flyes', 'Seated Bent-Over Rear Delt Raise'],
    home: ['Reverse Flyes', 'Seated Bent-Over Rear Delt Raise'],
    cali: ['Reverse Flyes'],
  },
  squat: {
    gym: ['Barbell Squat', 'Hack Squat', 'Front Barbell Squat'],
    home: ['Goblet Squat', 'Dumbbell Squat'],
    cali: ['Bodyweight Squat', 'Pistol Squat'],
  },
  legPress: {
    gym: ['Leg Press', 'Barbell Lunge'],
    home: ['Split Squat with Dumbbells', 'Dumbbell Lunges'],
    cali: ['Freehand Jump Squat', 'Bodyweight Lunge'],
  },
  hinge: {
    gym: ['Romanian Deadlift', 'Barbell Deadlift'],
    home: ['Stiff-Legged Dumbbell Deadlift'],
    cali: ['Natural Glute Ham Raise'],
  },
  legCurl: {
    gym: ['Seated Leg Curl', 'Lying Leg Curls'],
    home: ['Stiff-Legged Dumbbell Deadlift'],
    cali: ['Natural Glute Ham Raise'],
  },
  legExt: {
    gym: ['Leg Extensions', 'Dumbbell Lunges'],
    home: ['Dumbbell Lunges', 'Goblet Squat'],
    cali: ['Elevated Back Lunge', 'Bodyweight Squat'],
  },
  calf: {
    gym: ['Standing Calf Raises', 'Seated Calf Raise'],
    home: ['Dumbbell Seated One-Leg Calf Raise', 'Standing Dumbbell Calf Raise'],
    cali: ['Rocking Standing Calf Raise'],
  },
  glute: {
    gym: ['Barbell Hip Thrust', 'Cable Pull Through'],
    home: ['Barbell Glute Bridge', 'Glute Kickback'],
    cali: ['Glute Kickback', 'Single Leg Glute Bridge'],
  },
  curl: {
    gym: ['Barbell Curl', 'Preacher Curl', 'Incline Dumbbell Curl'],
    home: ['Dumbbell Bicep Curl', 'Alternate Incline Dumbbell Curl'],
    cali: ['Chin-Up'],
  },
  hammer: {
    gym: ['Hammer Curls', 'Cable Hammer Curls - Rope Attachment'],
    home: ['Hammer Curls', 'Concentration Curls'],
    cali: ['Hammer Curls'],
  },
  tricep: {
    gym: ['Triceps Pushdown', 'Triceps Pushdown - Rope Attachment'],
    home: ['Standing Dumbbell Triceps Extension', 'Dumbbell One-Arm Triceps Extension'],
    cali: ['Bench Dips', 'Dips - Triceps Version'],
  },
  tricep2: {
    gym: ['EZ-Bar Skullcrusher', 'Cable Overhead Triceps Extension'],
    home: ['Tricep Dumbbell Kickback', 'Close-Grip Dumbbell Press'],
    cali: ['Dips - Triceps Version'],
  },
  abs: {
    gym: ['Cable Crunch', 'Hanging Leg Raise'],
    home: ['Crunches', 'Air Bike'],
    cali: ['Hanging Leg Raise', 'Crunches'],
  },
  core: {
    gym: ['Plank', 'Ab Roller'],
    home: ['Plank', 'Dead Bug'],
    cali: ['Plank', 'Cocoons'],
  },
  deadlift: {
    gym: ['Barbell Deadlift', 'Romanian Deadlift'],
    home: ['Stiff-Legged Dumbbell Deadlift'],
    cali: ['Natural Glute Ham Raise'],
  },
}

const SPLITS = {
  2: [
    ['Cuerpo Completo A', ['squat', 'chestPress', 'hPull', 'ohp', 'legCurl', 'curl', 'abs']],
    ['Cuerpo Completo B', ['hinge', 'inclinePress', 'vPull', 'lateral', 'legExt', 'tricep', 'core']],
  ],
  3: [
    ['Empuje (Pecho · Hombro · Tríceps)', ['chestPress', 'inclinePress', 'ohp', 'lateral', 'chestFly', 'tricep']],
    ['Tirón (Espalda · Bíceps · Deltoide Post.)', ['vPull', 'row', 'hPull', 'rearDelt', 'curl', 'hammer']],
    ['Pierna y Core Completo', ['squat', 'hinge', 'legPress', 'legCurl', 'calf', 'abs']],
  ],
  4: [
    ['Torso Fuerza e Hipertrofia A', ['chestPress', 'row', 'ohp', 'vPull', 'lateral', 'tricep']],
    ['Pierna Dominante Cuádriceps A', ['squat', 'legPress', 'legCurl', 'legExt', 'calf', 'abs']],
    ['Torso Estética y Bombeo B', ['inclinePress', 'hPull', 'chestFly', 'rearDelt', 'curl', 'tricep2']],
    ['Pierna Cadena Posterior y Glúteo B', ['hinge', 'glute', 'legPress', 'legCurl', 'calf', 'core']],
  ],
  5: [
    ['Pecho y Deltoide Lateral', ['chestPress', 'inclinePress', 'chestFly', 'lateral', 'tricep']],
    ['Espalda Densidad y Amplitud', ['vPull', 'row', 'hPull', 'rearDelt', 'curl']],
    ['Pierna Completa (Cuádriceps · Femoral)', ['squat', 'legPress', 'legCurl', 'legExt', 'calf']],
    ['Hombros 3D y Abdomen', ['ohp', 'lateral', 'rearDelt', 'inclinePress', 'abs']],
    ['Brazos de Acero y Punto Débil', ['curl', 'tricep', 'hammer', 'tricep2', 'core']],
  ],
  6: [
    ['Empuje A (Fuerza Pectoral)', ['chestPress', 'ohp', 'inclinePress', 'lateral', 'tricep']],
    ['Tirón A (Amplitud Dorsal)', ['deadlift', 'vPull', 'hPull', 'rearDelt', 'curl']],
    ['Pierna A (Enfoque Cuádriceps)', ['squat', 'legPress', 'legExt', 'legCurl', 'calf']],
    ['Empuje B (Hipertrofia Superior)', ['inclinePress', 'chestFly', 'ohp', 'lateral', 'tricep2']],
    ['Tirón B (Densidad y Brazos)', ['row', 'vPull', 'hPull', 'rearDelt', 'hammer']],
    ['Pierna B (Cadena Posterior y Glúteo)', ['hinge', 'glute', 'legCurl', 'legExt', 'abs']],
  ],
}

const GROUP_SLOTS = {
  chest: ['inclinePress', 'chestFly', 'chestPress'],
  back: ['vPull', 'row', 'hPull'],
  shoulders: ['lateral', 'rearDelt', 'ohp'],
  arms: ['curl', 'tricep', 'hammer', 'tricep2'],
  legs: ['squat', 'glute', 'legExt', 'legCurl', 'calf'],
  core: ['abs', 'core'],
}

const LEVEL_SETS = { beginner: 3, intermediate: 3, advanced: 4 }
const LEVEL_ES = { beginner: 'PRINCIPIANTE', intermediate: 'INTERMEDIO', advanced: 'AVANZADO' }
const GOAL_ES = { hypertrophy: 'HIPERTROFIA', strength: 'FUERZA', definition: 'DEFINICIÓN' }

function pick(slot, env, usedIds = new Set()) {
  const candidates = S[slot]?.[env] || S[slot]?.gym || []
  for (const n of candidates) {
    const e = findEx(n)
    if (e && !usedIds.has(e.id)) return e
  }
  for (const n of candidates) {
    const e = findEx(n)
    if (e) return e
  }
  return null
}

/**
 * Resolves any exercise identifier from AI output to a guaranteed valid exercise in EX_BY_ID
 */
export function resolveExerciseId(rawId, fallbackGroup = 'chest') {
  if (!rawId) return EXERCISES[0]?.id
  const clean = String(rawId).trim()
  if (EX_BY_ID[clean]) return clean
  const slug = clean.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  if (EX_BY_ID[slug]) return slug
  const byName = findEx(clean)
  if (byName) return byName.id
  const lower = clean.toLowerCase()
  const byEs = EXERCISES.find((e) => e.name.toLowerCase().includes(lower))
  if (byEs) return byEs.id
  const groupMuscles = GROUPS[fallbackGroup]?.muscles || ['chest']
  const byGroup = EXERCISES.find((e) => groupMuscles.includes(e.primary[0]))
  return (byGroup || EXERCISES[0]).id
}

function parsePromptGroups(prompt = '') {
  const p = prompt.toLowerCase()
  const detected = []
  if (/(pecho|pectoral|banca|push|empuje)/.test(p)) detected.push('chest')
  if (/(espalda|dorsal|dominada|remo|pull|tiron|tirón)/.test(p)) detected.push('back')
  if (/(hombro|deltoide|militar|lateral)/.test(p)) detected.push('shoulders')
  if (/(brazo|bicep|bícep|tricep|trícep|antebrazo)/.test(p)) detected.push('arms')
  if (/(pierna|cuadricep|cuádricep|femoral|isquio|gluteo|glúteo|sentadilla|gemelo)/.test(p)) detected.push('legs')
  if (/(abdomen|abdominal|core|six pack|cintura)/.test(p)) detected.push('core')
  return detected
}

/**
 * Builds a personalised plan. weakGroups / focusGroups + customPrompt customize exercises, sets, reps, and rest.
 */
export function generatePlan({
  days = 3,
  level = 'intermediate',
  env = 'gym',
  goal = 'hypertrophy',
  weakGroups = [],
  focusGroups = [],
  customPrompt = '',
}) {
  const clampedDays = Math.min(6, Math.max(2, +days || 3))
  const split = SPLITS[clampedDays] || SPLITS[3]
  const baseSets = LEVEL_SETS[level] ?? 3
  const promptGroups = parsePromptGroups(customPrompt)
  const priorityGroups = Array.from(new Set([...focusGroups, ...weakGroups, ...promptGroups]))

  const goalTag = GOAL_ES[goal] || LEVEL_ES[level] || 'IA'

  return split.map(([name, baseSlots], i) => {
    const slots = [...baseSlots]
    // Inject priority/weak muscle slots into routines
    for (const g of priorityGroups) {
      const candidates = GROUP_SLOTS[g] || []
      const extra = candidates.find((x) => !slots.includes(x)) || candidates[0]
      if (extra && (i % Math.max(1, Math.floor(split.length / 2)) === 0 || priorityGroups.length === 1)) {
        slots.push(extra)
      }
    }

    const usedIds = new Set()
    const exercises = []
    for (const slot of slots) {
      const e = pick(slot, env, usedIds)
      if (e && !usedIds.has(e.id)) {
        usedIds.add(e.id)
        const comp = e.mechanic === 'compound'
        const isPriority = priorityGroups.some((g) => (GROUPS[g]?.muscles || []).includes(e.primary[0]))
        const sets = isPriority ? Math.min(5, baseSets + 1) : baseSets

        let repMin = comp ? 6 : 10
        let repMax = comp ? 10 : 15
        let rest = comp ? 150 : 90

        if (goal === 'strength') {
          repMin = comp ? 4 : 8
          repMax = comp ? 6 : 10
          rest = comp ? 180 : 120
        } else if (goal === 'definition') {
          repMin = comp ? 10 : 12
          repMax = comp ? 14 : 18
          rest = comp ? 90 : 60
        }

        exercises.push({
          exId: e.id,
          sets,
          repMin,
          repMax,
          rest,
        })
      }
    }

    return {
      id: `${uid()}-d${i + 1}`,
      name: `DÍA ${i + 1} · ${name.toUpperCase()} (${goalTag})`,
      exercises,
      createdAt: Date.now() - i,
      ai: true,
    }
  })
}

export const DEFAULT_ROUTINES = () => [
  {
    id: `${uid()}-r1`,
    name: 'PECHO (PRINCIPIANTE)',
    exercises: ['Incline Dumbbell Press', 'Machine Bench Press', 'Butterfly']
      .map((n) => ({ exId: findEx(n)?.id, sets: 4, repMin: 8, repMax: 12, rest: 120 }))
      .filter((x) => x.exId),
    createdAt: Date.now() - 3,
  },
  {
    id: `${uid()}-r2`,
    name: 'ESPALDA (INTERMEDIO)',
    exercises: ['Seated Cable Rows', 'Wide-Grip Lat Pulldown', 'Bent Over Barbell Row']
      .map((n) => ({ exId: findEx(n)?.id, sets: 3, repMin: 8, repMax: 12, rest: 120 }))
      .filter((x) => x.exId),
    createdAt: Date.now() - 2,
  },
  {
    id: `${uid()}-r3`,
    name: 'PIERNA (AVANZADO)',
    exercises: ['Seated Leg Curl', 'Leg Extensions', 'Standing Calf Raises']
      .map((n) => ({ exId: findEx(n)?.id, sets: 2, repMin: 10, repMax: 15, rest: 90 }))
      .filter((x) => x.exId),
    createdAt: Date.now() - 1,
  },
]

export const exerciseCatalogForAI = () =>
  EXERCISES.slice(0, 140)
    .map((e) => `${e.id}|${e.en}|${e.primary[0]}|${e.equipment}`)
    .join('\n')
