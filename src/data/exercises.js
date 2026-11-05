import raw from './exercises.json'
import { NAME_ES } from './names_es'

// Spanish labels for dataset muscles
export const MUSCLE_ES = {
  abdominals: 'Abdominales', abductors: 'Abductores', adductors: 'Aductores', biceps: 'Bíceps', calves: 'Gemelos',
  chest: 'Pecho', forearms: 'Antebrazos', glutes: 'Glúteos', hamstrings: 'Isquiotibiales', lats: 'Dorsales',
  'lower back': 'Lumbares', 'middle back': 'Espalda media', neck: 'Cuello', quadriceps: 'Cuádriceps',
  shoulders: 'Hombros', traps: 'Trapecios', triceps: 'Tríceps',
}

export const EQUIP_ES = {
  barbell: 'Barra', dumbbell: 'Mancuernas', cable: 'Polea', machine: 'Máquina', 'body only': 'Peso corporal',
  'e-z curl bar': 'Barra Z', kettlebells: 'Kettlebell', other: 'Otro', bands: 'Bandas',
}

export const LEVEL_ES = { beginner: 'Principiante', intermediate: 'Intermedio', expert: 'Avanzado' }

// Dataset muscle -> body-map polygon ids
export const MUSCLE_TO_POLY = {
  abdominals: ['abs', 'obliques'], abductors: ['abductors'], adductors: ['adductor'], biceps: ['biceps'],
  calves: ['calves', 'left-soleus', 'right-soleus'], chest: ['chest'], forearms: ['forearm'], glutes: ['gluteal'],
  hamstrings: ['hamstring'], lats: ['upper-back'], 'lower back': ['lower-back'], 'middle back': ['upper-back'],
  neck: ['neck'], quadriceps: ['quadriceps'], shoulders: ['front-deltoids', 'back-deltoids'], traps: ['trapezius'],
  triceps: ['triceps'],
}

// Muscle groups (zones) as in the original rank system
export const GROUPS = {
  chest: { label: 'Pecho', muscles: ['chest'] },
  back: { label: 'Espalda', muscles: ['lats', 'middle back', 'lower back', 'traps'] },
  shoulders: { label: 'Hombros', muscles: ['shoulders', 'neck'] },
  arms: { label: 'Brazos', muscles: ['biceps', 'triceps', 'forearms'] },
  legs: { label: 'Piernas', muscles: ['quadriceps', 'hamstrings', 'glutes', 'calves', 'adductors', 'abductors'] },
  core: { label: 'Core', muscles: ['abdominals'] },
}
export const MUSCLE_GROUP = Object.fromEntries(
  Object.entries(GROUPS).flatMap(([g, v]) => v.muscles.map((m) => [m, g]))
)

const isBodyweight = (e) => e.equipment === 'body only'
const isTimed = (e) => /plank|hold|wall sit|bridge hold/i.test(e.name)

export const EXERCISES = raw.map((e) => ({
  ...e,
  en: e.en || e.name,
  name: NAME_ES[e.en || e.name] || e.name,
  img: [`/ex/${e.id}-0.webp`, `/ex/${e.id}-1.webp`],
  bodyweight: isBodyweight(e),
  timed: isTimed(e),
  group: MUSCLE_GROUP[e.primary[0]],
}))

export const EX_BY_ID = Object.fromEntries(EXERCISES.map((e) => [e.id, e]))

export const findEx = (name) => EXERCISES.find((e) => e.en.toLowerCase() === name.toLowerCase())

EXERCISES.sort((a, b) => a.name.localeCompare(b.name, 'es'))
