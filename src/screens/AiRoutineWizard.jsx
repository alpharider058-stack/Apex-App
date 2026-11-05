import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { GROUPS, EX_BY_ID } from '../data/exercises'
import { aiPlan } from '../lib/gemini'
import { generatePlan } from '../lib/plans'
import { burstConfetti, sfx } from '../lib/fx'
import { Icon } from '../components/Icons'
import { Tap } from '../components/UI'
import { useStore } from '../store'

const TOTAL_STEPS = 6

const GOALS = [
  { id: 'hypertrophy', title: 'Hipertrofia', subtitle: 'Volumen y forma estética', icon: Icon.Dumbbell },
  { id: 'strength', title: 'Fuerza', subtitle: 'Sobrecarga y rendimiento', icon: Icon.Trophy },
  { id: 'fatloss', title: 'Definición', subtitle: 'Pérdida de grasa magra', icon: Icon.Flame },
  { id: 'recomp', title: 'Salud', subtitle: 'Movilidad y equilibrio', icon: Icon.Bolt },
]

const DAYS_OPTIONS = [
  { days: 2, title: '2 días', subtitle: 'Full Body' },
  { days: 3, title: '3 días', subtitle: 'Tirón / Empuje / Pierna' },
  { days: 4, title: '4 días', subtitle: 'Torso / Pierna', badge: 'Recomendado' },
  { days: 5, title: '5 días', subtitle: 'Híbrido PPL + Torso' },
  { days: 6, title: '6 días', subtitle: 'Push / Pull / Legs x2' },
]

const ENV_OPTIONS = [
  { id: 'gym', title: 'Gimnasio', subtitle: 'Máquinas, poleas y barras', icon: '🏋️' },
  { id: 'home', title: 'En casa', subtitle: 'Mancuernas y banco', icon: '🏠' },
  { id: 'calisthenics', title: 'Calistenia', subtitle: 'Barras y peso corporal', icon: '🤸' },
  { id: 'barbell', title: 'Barra libre', subtitle: 'Rack y discos olímpicos', icon: '⚡' },
]

const LEVEL_OPTIONS = [
  { id: 'beginner', title: 'Principiante', subtitle: 'Menos de 1 año' },
  { id: 'intermediate', title: 'Intermedio', subtitle: '1 a 3 años de constancia' },
  { id: 'advanced', title: 'Avanzado', subtitle: 'Más de 3 años' },
]

const QUICK_NOTES = [
  'Sin sentadilla libre',
  'Molestia en hombro',
  'Sesiones de 45 min',
  'Enfoque en brazos',
]

export function AiRoutineWizard({ onClose, onPlanCreated, initialWeakGroups = [] }) {
  const profile = useStore((s) => s.profile)
  const settings = useStore((s) => s.settings)
  const scans = useStore((s) => s.scans)
  const addRoutines = useStore((s) => s.addRoutines)

  const lastScan = scans[scans.length - 1]
  const suggestedWeak = initialWeakGroups.length ? initialWeakGroups : (lastScan?.weakest || [])

  const [step, setStep] = useState(1)
  const [goal, setGoal] = useState('hypertrophy')
  const [days, setDays] = useState(profile.days || 4)
  const [env, setEnv] = useState(profile.env || 'gym')
  const [level, setLevel] = useState(profile.experience || 'intermediate')
  const [focusGroups, setFocusGroups] = useState(suggestedWeak.length ? suggestedWeak : ['chest', 'shoulders'])
  const [customPrompt, setCustomPrompt] = useState('')

  const [loading, setLoading] = useState(false)
  const [genPhase, setGenPhase] = useState('')
  const [generatedPlan, setGeneratedPlan] = useState(null)

  const progressPct = ((step - 1) / TOTAL_STEPS) * 100

  const toggleGroup = (g) => {
    sfx.tap()
    setFocusGroups((prev) => {
      if (prev.includes(g)) return prev.filter((x) => x !== g)
      if (prev.length >= 3) return [...prev.slice(1), g]
      return [...prev, g]
    })
  }

  const handleNext = () => {
    sfx.tap()
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1)
    } else {
      handleGenerate()
    }
  }

  const handleBack = () => {
    sfx.tap()
    if (step > 1) {
      setStep((s) => s - 1)
    } else {
      onClose()
    }
  }

  const handleGenerate = async () => {
    setLoading(true)
    setGenPhase('Conectando con la IA...')
    const t1 = setTimeout(() => setGenPhase('Seleccionando ejercicios óptimos...'), 1500)
    const t2 = setTimeout(() => setGenPhase('Ajustando series y descansos...'), 3500)

    try {
      const plan = await aiPlan({
        apiKey: settings.apiKey,
        profile: { ...profile, experience: level, days, env },
        prefs: { days, level, env, goal, focusGroups, customPrompt },
        scan: lastScan,
      })
      clearTimeout(t1)
      clearTimeout(t2)
      setGeneratedPlan(plan)
      sfx.pr()
      burstConfetti('#2f6bff')
    } catch {
      clearTimeout(t1)
      clearTimeout(t2)
      const fallback = generatePlan({
        days,
        level,
        env,
        goal,
        weakGroups: focusGroups,
        focusGroups,
        customPrompt,
      })
      setGeneratedPlan(fallback)
      sfx.rankUp()
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAndFinish = () => {
    if (!generatedPlan || !generatedPlan.length) return
    addRoutines(generatedPlan)
    sfx.rankUp()
    burstConfetti('#2fd571')
    onPlanCreated?.(generatedPlan)
    onClose()
  }

  if (typeof document === 'undefined') return null
  const portalTarget = document.getElementById('app-root') || document.body

  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 250,
        background: '#07090e',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          flex: 'none',
          padding: 'calc(var(--safe-t) + 12px) 18px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          background: 'rgba(7, 9, 14, 0.98)',
          borderBottom: '1px solid #161a26',
          zIndex: 10,
        }}
      >
        <div className="row between">
          <Tap
            onClick={handleBack}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.06)',
              fontSize: 13,
              fontWeight: 700,
              color: '#c2c8d6',
            }}
          >
            {step === 1 ? 'Cerrar' : '← Atrás'}
          </Tap>

          <span style={{ fontSize: 13, fontWeight: 700, color: '#8bb6ff' }}>
            {loading ? 'Generando...' : generatedPlan ? 'Listo' : `${step} de ${TOTAL_STEPS}`}
          </span>
        </div>

        {!generatedPlan && (
          <div style={{ height: 3, width: '100%', borderRadius: 99, background: '#181d2a', overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.3 }}
              style={{ height: '100%', background: '#2f6bff' }}
            />
          </div>
        )}
      </div>

      {/* Body Container (Scrolls cleanly between Header & Footer without overlap) */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '20px 18px 30px',
        }}
      >
        <AnimatePresence mode="wait">
          {/* LOADING */}
          {loading && (
            <motion.div
              key="load"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col center gap16"
              style={{ minHeight: '50vh', textAlign: 'center' }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid #2f6bff', borderTopColor: 'transparent' }}
              />
              <div className="col gap4">
                <div style={{ fontSize: 18, fontWeight: 800 }}>Diseñando tus rutinas</div>
                <div className="tiny muted">{genPhase}</div>
              </div>
            </motion.div>
          )}

          {/* PLAN RESULT */}
          {!loading && generatedPlan && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="col gap14"
            >
              <div className="card col gap4" style={{ padding: 16, background: '#0d101a', textAlign: 'center' }}>
                <span className="tiny" style={{ color: '#4dff93', fontWeight: 800, textTransform: 'uppercase' }}>
                  Plan Completado
                </span>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{generatedPlan.length} Rutinas Creadas</div>
                <div className="tiny muted">{days} días/sem · {goal}</div>
              </div>

              <div className="col gap10">
                {generatedPlan.map((r, i) => (
                  <div
                    key={r.id || i}
                    className="card col gap8"
                    style={{ padding: 14, background: '#0d101a' }}
                  >
                    <div className="row between">
                      <span style={{ fontWeight: 800, fontSize: 15 }}>{r.name}</span>
                      <span className="tiny muted">{r.exercises.length} ejerc.</span>
                    </div>
                    <div className="col gap4">
                      {r.exercises.slice(0, 3).map((ex, eIdx) => (
                        <div key={eIdx} className="tiny muted ellipsis">
                          • {EX_BY_ID[ex.exId]?.name || ex.exId} ({ex.sets}×{ex.repMin}-{ex.repMax})
                        </div>
                      ))}
                      {r.exercises.length > 3 && (
                        <div className="tiny dim">+ {r.exercises.length - 3} ejercicios más</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 1: GOAL */}
          {!loading && !generatedPlan && step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col gap14">
              <h2 className="h2" style={{ marginBottom: 4 }}>¿Cuál es tu objetivo?</h2>
              <div className="col gap10">
                {GOALS.map((g) => {
                  const sel = goal === g.id
                  const IconComp = g.icon
                  return (
                    <Tap
                      key={g.id}
                      onClick={() => setGoal(g.id)}
                      className="card row between"
                      style={{
                        padding: 16,
                        borderColor: sel ? '#2f6bff' : '#1d2230',
                        background: sel ? 'rgba(47, 107, 255, 0.12)' : '#0d101a',
                      }}
                    >
                      <div className="row gap12">
                        <div style={{ color: sel ? '#2f6bff' : '#8e96aa' }}>
                          <IconComp style={{ width: 22, height: 22 }} />
                        </div>
                        <div>
                          <div style={{ fontSize: 15.5, fontWeight: 800, color: sel ? '#fff' : '#d2d6e2' }}>
                            {g.title}
                          </div>
                          <div className="tiny muted">{g.subtitle}</div>
                        </div>
                      </div>
                      {sel && <span style={{ color: '#2f6bff', fontWeight: 800 }}>✓</span>}
                    </Tap>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 2: DAYS */}
          {!loading && !generatedPlan && step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col gap14">
              <h2 className="h2" style={{ marginBottom: 4 }}>¿Cuántos días vas a entrenar?</h2>
              <div className="col gap10">
                {DAYS_OPTIONS.map((d) => {
                  const sel = days === d.days
                  return (
                    <Tap
                      key={d.days}
                      onClick={() => setDays(d.days)}
                      className="card row between"
                      style={{
                        padding: 16,
                        borderColor: sel ? '#2f6bff' : '#1d2230',
                        background: sel ? 'rgba(47, 107, 255, 0.12)' : '#0d101a',
                      }}
                    >
                      <div>
                        <div className="row gap8">
                          <span style={{ fontSize: 15.5, fontWeight: 800, color: sel ? '#fff' : '#d2d6e2' }}>
                            {d.title}
                          </span>
                          {d.badge && (
                            <span className="tiny" style={{ color: '#2f6bff', fontWeight: 800 }}>
                              {d.badge}
                            </span>
                          )}
                        </div>
                        <div className="tiny muted">{d.subtitle}</div>
                      </div>
                      {sel && <span style={{ color: '#2f6bff', fontWeight: 800 }}>✓</span>}
                    </Tap>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 3: ENVIRONMENT */}
          {!loading && !generatedPlan && step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col gap14">
              <h2 className="h2" style={{ marginBottom: 4 }}>¿Dónde vas a entrenar?</h2>
              <div className="col gap10">
                {ENV_OPTIONS.map((e) => {
                  const sel = env === e.id
                  return (
                    <Tap
                      key={e.id}
                      onClick={() => setEnv(e.id)}
                      className="card row between"
                      style={{
                        padding: 16,
                        borderColor: sel ? '#2f6bff' : '#1d2230',
                        background: sel ? 'rgba(47, 107, 255, 0.12)' : '#0d101a',
                      }}
                    >
                      <div className="row gap12">
                        <span style={{ fontSize: 22 }}>{e.icon}</span>
                        <div>
                          <div style={{ fontSize: 15.5, fontWeight: 800, color: sel ? '#fff' : '#d2d6e2' }}>
                            {e.title}
                          </div>
                          <div className="tiny muted">{e.subtitle}</div>
                        </div>
                      </div>
                      {sel && <span style={{ color: '#2f6bff', fontWeight: 800 }}>✓</span>}
                    </Tap>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 4: LEVEL */}
          {!loading && !generatedPlan && step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col gap14">
              <h2 className="h2" style={{ marginBottom: 4 }}>Tu nivel de experiencia</h2>
              <div className="col gap10">
                {LEVEL_OPTIONS.map((l) => {
                  const sel = level === l.id
                  return (
                    <Tap
                      key={l.id}
                      onClick={() => setLevel(l.id)}
                      className="card row between"
                      style={{
                        padding: 16,
                        borderColor: sel ? '#2f6bff' : '#1d2230',
                        background: sel ? 'rgba(47, 107, 255, 0.12)' : '#0d101a',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 15.5, fontWeight: 800, color: sel ? '#fff' : '#d2d6e2' }}>
                          {l.title}
                        </div>
                        <div className="tiny muted">{l.subtitle}</div>
                      </div>
                      {sel && <span style={{ color: '#2f6bff', fontWeight: 800 }}>✓</span>}
                    </Tap>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 5: MUSCLE FOCUS */}
          {!loading && !generatedPlan && step === 5 && (
            <motion.div key="s5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col gap14">
              <div className="col gap2">
                <h2 className="h2" style={{ marginBottom: 2 }}>Músculos a priorizar</h2>
                <span className="tiny muted">Elige de 1 a 3 grupos clave</span>
              </div>

              {suggestedWeak.length > 0 && (
                <Tap
                  onClick={() => setFocusGroups(suggestedWeak)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 10,
                    background: 'rgba(47, 107, 255, 0.12)',
                    border: '1px solid rgba(47, 107, 255, 0.3)',
                    fontSize: 12,
                    color: '#8bb6ff',
                    fontWeight: 700,
                  }}
                >
                  ✨ Aplicar sugerencias del Escaneo IA ({suggestedWeak.map((g) => GROUPS[g]?.label || g).join(', ')})
                </Tap>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {Object.keys(GROUPS).map((gKey) => {
                  const g = GROUPS[gKey]
                  const sel = focusGroups.includes(gKey)
                  return (
                    <Tap
                      key={gKey}
                      onClick={() => toggleGroup(gKey)}
                      className="card row between"
                      style={{
                        padding: '14px 12px',
                        borderColor: sel ? '#2f6bff' : '#1d2230',
                        background: sel ? 'rgba(47, 107, 255, 0.15)' : '#0d101a',
                      }}
                    >
                      <span style={{ fontSize: 14, fontWeight: 700, color: sel ? '#fff' : '#c0c5d2' }}>
                        {g.label}
                      </span>
                      {sel && <span style={{ color: '#2f6bff', fontWeight: 800 }}>✓</span>}
                    </Tap>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 6: NOTES */}
          {!loading && !generatedPlan && step === 6 && (
            <motion.div key="s6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col gap14">
              <div className="col gap2">
                <h2 className="h2" style={{ marginBottom: 2 }}>Peticiones o molestias</h2>
                <span className="tiny muted">Opcional: ejercicios a evitar o incluir</span>
              </div>

              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Ej: Molestia en hombro al presionar, no hacer sentadillas libres..."
                className="field"
                rows={3}
                style={{
                  height: 90,
                  padding: 12,
                  resize: 'none',
                  fontSize: 14,
                  borderRadius: 14,
                  background: '#0d101a',
                  borderColor: '#242a3e',
                }}
              />

              <div className="row gap6 wrap">
                {QUICK_NOTES.map((note) => (
                  <button
                    key={note}
                    type="button"
                    onClick={() => {
                      sfx.tap()
                      setCustomPrompt((prev) => (prev ? `${prev}. ${note}` : note))
                    }}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 8,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#b0b5c4',
                      fontSize: 11.5,
                      cursor: 'pointer',
                    }}
                  >
                    + {note}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer CTA (Pinned cleanly at the bottom above safe-area, completely covers the app tabbar) */}
      <div
        style={{
          flex: 'none',
          padding: '12px 18px calc(var(--safe-b) + 14px)',
          background: 'rgba(7, 9, 14, 0.98)',
          borderTop: '1px solid #161a26',
          zIndex: 10,
        }}
      >
        {generatedPlan ? (
          <Tap className="btn primary block" onClick={handleSaveAndFinish} style={{ height: 48 }}>
            <span>Guardar en Mis Rutinas</span>
          </Tap>
        ) : (
          <Tap
            className="btn primary block"
            disabled={loading}
            onClick={handleNext}
            style={{ height: 48 }}
          >
            <span>{step === TOTAL_STEPS ? 'Crear mi rutina con IA' : 'Siguiente'}</span>
          </Tap>
        )}
      </div>
    </motion.div>,
    portalTarget
  )
}
