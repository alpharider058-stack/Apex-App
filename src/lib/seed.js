import { findEx } from '../data/exercises'

const day = 86400000
const uid = () => Math.random().toString(36).slice(2, 10)

function exEntry(enName, sets) {
  const e = findEx(enName)
  if (!e) return null
  return {
    exId: e.id,
    sets: sets.map(([w, r]) => ({ w, r, type: 'normal', done: true })),
  }
}

export function buildDemoWorkouts() {
  const now = Date.now()
  const sessions = [
    {
      ago: 24,
      name: 'PECHO Y TRÍCEPS',
      dur: 52,
      note: 'Primera semana del bloque de fuerza con @miguel_ortiz',
      items: [
        exEntry('Barbell Bench Press - Medium Grip', [[60, 8], [65, 6], [65, 6]]),
        exEntry('Incline Dumbbell Press', [[26, 10], [28, 10], [28, 9]]),
        exEntry('Butterfly', [[55, 12], [60, 12], [60, 10]]),
        exEntry('Triceps Pushdown', [[30, 12], [35, 10], [35, 10]]),
      ],
    },
    {
      ago: 21,
      name: 'ESPALDA Y BÍCEPS',
      dur: 58,
      note: 'Dominadas lastradas y remo pesado @diego_moreno',
      items: [
        exEntry('Pullups', [[10, 10], [15, 8], [15, 8]]),
        exEntry('Bent Over Barbell Row', [[80, 10], [85, 8], [85, 8]]),
        exEntry('Seated Cable Rows', [[65, 12], [70, 10], [70, 10]]),
        exEntry('Barbell Curl', [[38, 10], [40, 8], [40, 8]]),
      ],
    },
    {
      ago: 17,
      name: 'PIERNA COMPLETA',
      dur: 64,
      note: 'Enfoque en cuádriceps e isquios',
      items: [
        exEntry('Barbell Squat', [[95, 8], [100, 6], [100, 6]]),
        exEntry('Romanian Deadlift', [[95, 10], [100, 8], [100, 8]]),
        exEntry('Leg Extensions', [[65, 12], [70, 12], [70, 10]]),
        exEntry('Seated Leg Curl', [[55, 12], [60, 10], [60, 10]]),
        exEntry('Standing Calf Raises', [[60, 12], [65, 10], [65, 10]]),
      ],
    },
    {
      ago: 14,
      name: 'PECHO Y HOMBRO',
      dur: 55,
      note: 'Subiendo cargas en banca @carlos_tejero',
      items: [
        exEntry('Barbell Bench Press - Medium Grip', [[67.5, 8], [72.5, 6], [72.5, 6]]),
        exEntry('Seated Dumbbell Press', [[26, 10], [28, 8], [28, 8]]),
        exEntry('Side Lateral Raise', [[14, 14], [16, 12], [16, 12]]),
        exEntry('EZ-Bar Skullcrusher', [[35, 10], [37.5, 10], [37.5, 8]]),
      ],
    },
    {
      ago: 9,
      name: 'TIRÓN + CORE',
      dur: 50,
      note: 'Récord en jalón y face pull',
      items: [
        exEntry('Wide-Grip Lat Pulldown', [[70, 10], [75, 8], [75, 8]]),
        exEntry('One-Arm Dumbbell Row', [[36, 10], [38, 10], [38, 8]]),
        exEntry('Face Pull', [[30, 15], [35, 15], [35, 12]]),
        exEntry('Hammer Curls', [[18, 12], [20, 10], [20, 10]]),
        exEntry('Cable Crunch', [[45, 15], [50, 15], [50, 12]]),
      ],
    },
    {
      ago: 5,
      name: 'EMPUJE PESADO',
      dur: 54,
      note: '75 kg en banca moviéndose rápidos',
      items: [
        exEntry('Barbell Bench Press - Medium Grip', [[72.5, 8], [75, 6], [75, 6]]),
        exEntry('Incline Dumbbell Press', [[30, 10], [32, 8], [32, 8]]),
        exEntry('Dips - Chest Version', [[15, 10], [20, 8], [20, 8]]),
        exEntry('Hanging Leg Raise', [[0, 15], [0, 15], [0, 12]]),
      ],
    },
    {
      ago: 2,
      name: 'PR DE BANCA · SEMANA 4',
      dur: 53,
      note: 'POR FIN RANGO ESMERALDA en banca con @miguel_ortiz 🔥',
      fromTier: 'ruby',
      toTier: 'emerald',
      items: [
        exEntry('Barbell Bench Press - Medium Grip', [[75, 8], [77.5, 6], [80, 3]]),
        exEntry('Cable Crossover', [[25, 12], [27.5, 12], [27.5, 10]]),
        exEntry('Preacher Curl', [[35, 10], [37.5, 8], [37.5, 8]]),
      ],
    },
  ]

  return sessions.map((s) => {
    const end = now - s.ago * day
    const start = end - s.dur * 60000
    return {
      id: uid(),
      name: s.name,
      start,
      end,
      note: s.note,
      fromTier: s.fromTier || null,
      toTier: s.toTier || null,
      exercises: s.items.filter(Boolean),
      likes: 12 + ((s.ago * 3) % 29),
      liked: s.ago === 2,
      comments:
        s.ago === 2
          ? [
              { id: 'c1', user: 'Miguel Ortiz', text: 'Locked in bro!' },
              { id: 'c2', user: 'Diego Moreno', text: 'Killing it brooo 🔥🔥' },
            ]
          : [{ id: 'c3', user: 'Carlos Tejero', text: 'Brutal esa progresión 💪' }],
    }
  })
}

export function buildDemoMeasurements() {
  const now = Date.now()
  return [
    { id: 'm1', date: now - 28 * day, weight: 73.4, bodyFat: 15.2, chest: 101, waist: 79, arm: 37.5, thigh: 56 },
    { id: 'm2', date: now - 14 * day, weight: 74.2, bodyFat: 14.6, chest: 102.5, waist: 78.5, arm: 38.1, thigh: 56.8 },
    { id: 'm3', date: now - 1 * day, weight: 75.0, bodyFat: 14.0, chest: 104, waist: 78, arm: 38.8, thigh: 57.5 },
  ]
}

export function buildDemoScan() {
  return {
    id: 'scan-demo',
    date: Date.now() - 3 * day,
    valid: true,
    detectedPose: 'Cuerpo completo frontal (Calibración)',
    visibleGroups: ['chest', 'back', 'arms', 'shoulders', 'core', 'legs'],
    unseenGroups: [],
    bodyFat: 14.0,
    physiqueScore: 84,
    symmetryScore: 88,
    genetics: 'Clavículas amplias con cintura estrecha (ratio V-taper 1.48). Inserciones pectorales simétricas y vientres musculares largos en dorsal y bíceps.',
    groups: [
      {
        group: 'chest',
        visible: true,
        score: 91,
        note: 'Pectoral superior y medio muy densos, gran línea esternal.',
        whatToImprove: 'Mantener sobrecarga en press inclinado con mancuernas para consolidar la porción clavicular.',
      },
      {
        group: 'back',
        visible: true,
        score: 89,
        note: 'Amplitud dorsal marcada que acentúa la forma en V.',
        whatToImprove: 'Añadir remo en máquina con apoyo en pecho para añadir grosor en la espalda media.',
      },
      {
        group: 'arms',
        visible: true,
        score: 85,
        note: 'Buen pico de bíceps y cabeza lateral del tríceps visible.',
        whatToImprove: 'Priorizar extensiones sobre la cabeza para potenciar la cabeza larga del tríceps.',
      },
      {
        group: 'shoulders',
        visible: true,
        score: 83,
        note: 'Deltoides lateral redondo; margen de mejora en cabeza posterior.',
        whatToImprove: 'Incorporar elevaciones laterales en polea y face pulls con pausa de 1s en contracción.',
      },
      {
        group: 'core',
        visible: true,
        score: 80,
        note: 'Recto abdominal visible y oblicuos definidos.',
        whatToImprove: 'Crunches con carga en polea alta para aumentar la profundidad de los paquetes abdominales.',
      },
      {
        group: 'legs',
        visible: true,
        score: 71,
        note: 'Cuádriceps sólidos, pero gemelos e isquios van rezagados respecto al torso.',
        whatToImprove: 'Priorizar peso muerto rumano pesado y curl femoral tumbado al inicio de la sesión de pierna.',
      },
    ],
    improvements: [
      {
        area: 'Cadena Posterior & Isquiosurales',
        priority: 'alta',
        reason: 'Desequilibrio visible entre la fuerza del cuádriceps y la masa del bíceps femoral.',
        action: 'Empezar el día de pierna con peso muerto rumano (3x8) y curl femoral sentado a RIR 1.',
      },
      {
        area: 'Cabeza Posterior del Deltoide',
        priority: 'alta',
        reason: 'El deltoide anterior domina el hombro, restando profundidad a la vista lateral y 3D.',
        action: 'Añadir 4 series de pájaros en polea o contractora invertida 2 veces por semana.',
      },
      {
        area: 'Gemelos & Sóleo',
        priority: 'media',
        reason: 'Inserción alta del gemelo que requiere mayor tensión mecánica con estiramiento completo.',
        action: 'Elevaciones de talones de pie con pausa de 2 segundos en el fondo del estiramiento.',
      },
    ],
    strongest: ['chest', 'back'],
    weakest: ['legs', 'shoulders'],
    summary: 'Físico atlético con dominante de tren superior y excelente proporción cintura-hombros. Priorizar volumen en pierna posterior, gemelos y deltoides lateral/posterior elevará tu simetría global al top 5%.',
    tips: [
      'Añade 4 series semanales directas de gemelo sentado y de pie con pausa de 2s en estiramiento.',
      'Empieza el día de pierna con curl femoral sentado antes de la sentadilla para priorizar isquios.',
      'Incluye elevaciones laterales en polea y face pulls dos veces por semana.',
    ],
  }
}
