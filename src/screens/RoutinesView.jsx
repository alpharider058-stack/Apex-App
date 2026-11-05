import React, { useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { EX_BY_ID, EXERCISES, MUSCLE_ES, EQUIP_ES, GROUPS } from '../data/exercises'
import { generatePlan } from '../lib/plans'
import { aiPlan } from '../lib/gemini'
import { computeRanks } from '../lib/ranks'
import { burstConfetti, sfx } from '../lib/fx'
import { BodyMap } from '../components/BodyMap'
import { ExerciseAnim } from '../components/ExerciseAnim'
import { Icon, RankBadge } from '../components/Icons'
import { AppHeader, Tap, Segmented, Sheet } from '../components/UI'
import { AiRoutineWizard } from './AiRoutineWizard'
import { useStore } from '../store'

const POSTERIOR_MUSCLES = new Set(['lats', 'middle back', 'lower back', 'traps', 'hamstrings', 'glutes', 'calves'])
const LOWER_MUSCLES = new Set(['quadriceps', 'hamstrings', 'glutes', 'calves', 'adductors', 'abductors'])

function routineAnatomy(routine) {
  const pri = []
  const sec = []
  let postScore = 0
  let lowerScore = 0
  for (const item of routine.exercises) {
    const ex = EX_BY_ID[item.exId]
    if (!ex) continue
    ex.primary.forEach((m) => {
      if (!pri.includes(m)) pri.push(m)
      if (POSTERIOR_MUSCLES.has(m)) postScore += 2
      if (LOWER_MUSCLES.has(m)) lowerScore += 2
    })
    ex.secondary.forEach((m) => {
      if (!sec.includes(m) && !pri.includes(m)) sec.push(m)
    })
  }
  const total = Math.max(1, routine.exercises.length)
  const side = postScore / total >= 1 ? 'posterior' : 'anterior'
  const crop = lowerScore / total >= 1 ? 'lower' : 'upper'
  const totalSets = routine.exercises.reduce((a, e) => a + (e.sets || 3), 0)
  const mins = Math.max(25, totalSets * 5)
  const dur = mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60 ? `${mins % 60}m` : ''}`.trim() : `${mins} min`
  return { pri, sec, side, crop, totalSets, dur }
}

export function RoutinesView({ onStartRoutine, onOpenExercise, onOpenGuide, onOpenSettings, onOpenCalc, showToast }) {
  const routines = useStore((s) => s.routines)
  const workouts = useStore((s) => s.workouts)
  const profile = useStore((s) => s.profile)
  const settings = useStore((s) => s.settings)
  const scans = useStore((s) => s.scans)
  const addRoutines = useStore((s) => s.addRoutines)
  const saveRoutine = useStore((s) => s.saveRoutine)
  const deleteRoutine = useStore((s) => s.deleteRoutine)

  const [mode, setMode] = useState('routines') // 'routines' | 'exercises'
  const [aiOpen, setAiOpen] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [addExOpen, setAddExOpen] = useState(false)

  // AI Plan generator state
  const [days, setDays] = useState(profile.days || 3)
  const [level, setLevel] = useState(profile.experience || 'intermediate')
  const [env, setEnv] = useState(profile.env || 'gym')
  const [goal, setGoal] = useState('hypertrophy')
  const [focusGroups, setFocusGroups] = useState([])
  const [customPrompt, setCustomPrompt] = useState('')
  const [loadingAI, setLoadingAI] = useState(false)
  const scrollRef = useRef(null)

  // Routine Editor state
  const [editingRoutine, setEditingRoutine] = useState(null)
  const [pickerSearch, setPickerSearch] = useState('')
  const [pickerMuscle, setPickerMuscle] = useState('all')

  // Exercise catalog filters
  const [search, setSearch] = useState('')
  const [muscle, setMuscle] = useState('all')
  const [equip, setEquip] = useState('all')
  const [page, setPage] = useState(1)

  const ranks = useMemo(() => computeRanks(workouts, profile), [workouts, profile])
  const lastScan = scans[scans.length - 1]

  const toggleFocusGroup = (g) => {
    setFocusGroups((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]))
  }

  const filteredExercises = useMemo(() => {
    const q = search.trim().toLowerCase()
    return EXERCISES.filter((e) => {
      if (muscle !== 'all' && e.primary[0] !== muscle) return false
      if (equip !== 'all' && e.equipment !== equip) return false
      if (q && !e.name.toLowerCase().includes(q) && !e.en.toLowerCase().includes(q)) return false
      return true
    })
  }, [search, muscle, equip])

  const filteredPickerExercises = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase()
    return EXERCISES.filter((e) => {
      if (pickerMuscle !== 'all' && e.primary[0] !== pickerMuscle) return false
      if (q && !e.name.toLowerCase().includes(q) && !e.en.toLowerCase().includes(q)) return false
      return true
    })
  }, [pickerSearch, pickerMuscle])

  const openNewRoutine = () => {
    setEditingRoutine({
      id: null,
      name: '',
      exercises: [],
    })
    setEditorOpen(true)
  }

  const openEditRoutine = (r) => {
    setEditingRoutine({
      id: r.id,
      name: r.name,
      exercises: r.exercises.map((e) => ({
        exId: e.exId,
        sets: e.sets ?? 3,
        repMin: e.repMin ?? 8,
        repMax: e.repMax ?? 12,
        rest: e.rest ?? 90,
      })),
    })
    setEditorOpen(true)
  }

  const handleSaveEditedRoutine = () => {
    if (!editingRoutine || !editingRoutine.exercises.length) {
      showToast?.('Añade al menos un ejercicio a la rutina')
      return
    }
    const isEdit = !!editingRoutine.id
    saveRoutine({
      ...(editingRoutine.id ? { id: editingRoutine.id } : {}),
      name: (editingRoutine.name.trim() || 'MI RUTINA').toUpperCase(),
      exercises: editingRoutine.exercises,
    })
    setEditorOpen(false)
    setEditingRoutine(null)
    showToast?.(isEdit ? 'Rutina actualizada' : 'Rutina creada')
  }

  const updateEditedEx = (idx, patch) => {
    setEditingRoutine((prev) => {
      if (!prev) return prev
      const next = [...prev.exercises]
      next[idx] = { ...next[idx], ...patch }
      return { ...prev, exercises: next }
    })
  }

  const moveEditedEx = (idx, dir) => {
    setEditingRoutine((prev) => {
      if (!prev) return prev
      const target = idx + dir
      if (target < 0 || target >= prev.exercises.length) return prev
      const next = [...prev.exercises]
      const tmp = next[idx]
      next[idx] = next[target]
      next[target] = tmp
      return { ...prev, exercises: next }
    })
  }

  const removeEditedEx = (idx) => {
    setEditingRoutine((prev) => {
      if (!prev) return prev
      return { ...prev, exercises: prev.exercises.filter((_, i) => i !== idx) }
    })
  }

  const toggleExInEditor = (exId) => {
    setEditingRoutine((prev) => {
      if (!prev) return prev
      const exists = prev.exercises.some((x) => x.exId === exId)
      if (exists) {
        return { ...prev, exercises: prev.exercises.filter((x) => x.exId !== exId) }
      }
      return {
        ...prev,
        exercises: [...prev.exercises, { exId, sets: 3, repMin: 8, repMax: 12, rest: 90 }],
      }
    })
  }

  const handleGeneratePlan = async () => {
    if (loadingAI) return
    setLoadingAI(true)
    try {
      const weakGroups = lastScan?.weakest || []
      let generated = null
      try {
        const res = await aiPlan({
          apiKey: settings.apiKey,
          profile,
          prefs: { days, level, env, goal, focusGroups, customPrompt },
          scan: lastScan,
        })
        if (res?.length) generated = res
      } catch {}
      if (!generated || !generated.length) {
        generated = generatePlan({ days, level, env, goal, weakGroups, focusGroups, customPrompt })
      }
      addRoutines(generated)
      sfx.pr()
      burstConfetti('#2f6bff')
      showToast?.(`✨ Plan IA de ${generated.length} rutinas creado con éxito`)
      setAiOpen(false)
      setMode('routines')
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      }, 80)
    } finally {
      setLoadingAI(false)
    }
  }

  return (
    <div
      ref={scrollRef}
      className="scroll tab-pad"
      style={{
        background: 'linear-gradient(180deg, #000000 0%, #060913 55%, #162044 100%)',
      }}
    >
      <div className="page">
        <AppHeader onOpenGuide={onOpenGuide} onOpenSettings={onOpenSettings} onOpenCalc={onOpenCalc} />

        {/* Subcabecera limpia y equilibrada para móvil */}
        <div className="row between" style={{ marginBottom: 14, gap: 10 }}>
          <h1 className="h2 ellipsis">
            {mode === 'routines' ? 'Mis Rutinas' : `Ejercicios (${EXERCISES.length})`}
          </h1>

          <div style={{ width: 196, flex: 'none' }}>
            <Segmented
              id="lib-mode-seg"
              value={mode}
              onChange={setMode}
              options={[
                { value: 'routines', label: 'Rutinas' },
                { value: 'exercises', label: '320 Ejerc.' },
              ]}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'routines' ? (
            <motion.div
              key="routines-list"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {/* Barra de acciones superior: Rutina con IA + Nueva Rutina */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 10, marginBottom: 16 }}>
                <Tap
                  onClick={() => setAiOpen(true)}
                  style={{
                    height: 46,
                    padding: '0 14px',
                    borderRadius: 14,
                    background: 'linear-gradient(90deg, #122452 0%, #1a3882 100%)',
                    border: '1px solid #3563cb',
                    boxShadow: '0 6px 20px rgba(26, 68, 168, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    fontWeight: 700,
                    fontSize: 14.5,
                  }}
                >
                  <Icon.Sparkles style={{ width: 19, height: 19, color: '#78b0ff', flex: 'none' }} />
                  <span className="ellipsis">Rutina con IA</span>
                </Tap>

                <Tap
                  onClick={openNewRoutine}
                  style={{
                    height: 46,
                    padding: '0 14px',
                    borderRadius: 14,
                    background: '#181a22',
                    border: '1px solid #2e313f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 7,
                    fontWeight: 700,
                    fontSize: 14.5,
                    color: '#fff',
                  }}
                >
                  <Icon.Plus style={{ width: 18, height: 18, color: '#5893ff', flex: 'none' }} />
                  <span className="ellipsis">Nueva rutina</span>
                </Tap>
              </div>

              {/* Tarjetas de Rutinas */}
              <div className="col gap14">
                {routines.map((r, idx) => {
                  const { pri, sec, side, crop, totalSets, dur } = routineAnatomy(r)
                  return (
                    <motion.div
                      key={r.id || `routine-${idx}`}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.035, 0.25), duration: 0.26 }}
                      className="card"
                      style={{
                        padding: '14px 12px 14px 14px',
                        borderRadius: 16,
                        borderColor: r.ai ? 'rgba(75, 135, 255, 0.3)' : '#1a1e28',
                        background: '#0d101a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10,
                      }}
                    >
                      <div className="col" style={{ flex: 1, minWidth: 0 }}>
                        <div className="row gap6 wrap" style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                          {r.ai && (
                            <span
                              style={{
                                padding: '2px 7px',
                                borderRadius: 6,
                                background: 'rgba(47,107,255,0.22)',
                                border: '1px solid rgba(90,150,255,0.45)',
                                color: '#8ab8ff',
                                fontSize: 10.5,
                                fontWeight: 800,
                              }}
                            >
                              ✨ IA
                            </span>
                          )}
                          <span style={{ color: '#5893ff' }}>{r.exercises.length} ejercicios</span>
                          <span className="dim">·</span>
                          <span className="muted">{totalSets} series</span>
                          <span className="dim">·</span>
                          <span className="muted num">{dur}</span>
                        </div>

                        <h2
                          className="upper ellipsis"
                          onClick={() => openEditRoutine(r)}
                          style={{
                            fontSize: 17,
                            fontWeight: 800,
                            letterSpacing: '-0.01em',
                            marginBottom: 8,
                            cursor: 'pointer',
                          }}
                        >
                          {r.name}
                        </h2>

                        <div className="col gap4" style={{ marginBottom: 14 }}>
                          {r.exercises.slice(0, 4).map((item, i) => {
                            const ex = EX_BY_ID[item.exId]
                            return (
                              <div
                                key={i}
                                onClick={() => ex && onOpenExercise?.(ex.id)}
                                className="ellipsis"
                                style={{
                                  fontSize: 12.5,
                                  color: '#b8b9c4',
                                  cursor: 'pointer',
                                }}
                              >
                                • {ex?.name || item.exId}{' '}
                                <span className="dim num">
                                  ({item.sets || 3}×{item.repMin || 8}-{item.repMax || 12})
                                </span>
                              </div>
                            )
                          })}
                          {r.exercises.length > 4 && (
                            <div className="tiny muted">+ {r.exercises.length - 4} ejercicios más</div>
                          )}
                        </div>

                        <div className="row gap8">
                          <Tap
                            onClick={() => onStartRoutine(r)}
                            style={{
                              height: 36,
                              padding: '0 16px',
                              borderRadius: 10,
                              background: 'linear-gradient(180deg, #3a76ff, #1f56e8)',
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: 13.5,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              boxShadow: '0 4px 14px rgba(31, 94, 255, 0.38)',
                            }}
                          >
                            <Icon.Play style={{ width: 11, height: 11 }} />
                            <span>Empezar</span>
                          </Tap>

                          <Tap
                            onClick={() => openEditRoutine(r)}
                            style={{
                              height: 36,
                              padding: '0 13px',
                              borderRadius: 10,
                              background: '#22242e',
                              border: '1px solid #323544',
                              color: '#d8d9e2',
                              fontWeight: 600,
                              fontSize: 13,
                            }}
                          >
                            Editar
                          </Tap>
                        </div>
                      </div>

                      {/* Mapa anatómico derecho */}
                      <div
                        onClick={() => openEditRoutine(r)}
                        style={{ width: 102, height: 134, flex: 'none', cursor: 'pointer' }}
                      >
                        <BodyMap side={side} crop={crop} primary={pri} secondary={sec} height={134} />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          ) : (
            /* Biblioteca de los 320 ejercicios en castellano */
            <motion.div
              key="exercises-list"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="col gap12"
            >
              <div style={{ position: 'relative' }}>
                <input
                  className="field"
                  placeholder="Buscar entre los 320 ejercicios..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  style={{ paddingLeft: 42 }}
                />
                <Icon.Search
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: 16,
                    width: 20,
                    height: 20,
                    color: '#6b6b75',
                  }}
                />
              </div>

              <div className="hscroll">
                <Tap
                  className={`pill ${muscle === 'all' ? 'active' : ''}`}
                  onClick={() => {
                    setMuscle('all')
                    setPage(1)
                  }}
                >
                  Todos ({EXERCISES.length})
                </Tap>
                {Object.entries(MUSCLE_ES).map(([k, label]) => (
                  <Tap
                    key={k}
                    className={`pill ${muscle === k ? 'active' : ''}`}
                    onClick={() => {
                      setMuscle(k)
                      setPage(1)
                    }}
                  >
                    {label}
                  </Tap>
                ))}
              </div>

              <div className="hscroll">
                <Tap
                  className={`pill ${equip === 'all' ? 'active' : ''}`}
                  onClick={() => {
                    setEquip('all')
                    setPage(1)
                  }}
                >
                  Cualquier equipo
                </Tap>
                {Object.entries(EQUIP_ES).map(([k, label]) => (
                  <Tap
                    key={k}
                    className={`pill ${equip === k ? 'active' : ''}`}
                    onClick={() => {
                      setEquip(k)
                      setPage(1)
                    }}
                  >
                    {label}
                  </Tap>
                ))}
              </div>

              <div className="col gap8">
                {filteredExercises.slice(0, page * 30).map((ex) => {
                  const exRank = ranks.exRanks[ex.id]
                  const best = ranks.best[ex.id]
                  return (
                    <Tap
                      key={ex.id}
                      onClick={() => onOpenExercise?.(ex.id)}
                      className="card row gap12"
                      style={{ padding: 10, textAlign: 'left' }}
                    >
                      <ExerciseAnim ex={ex} size={60} rounded={14} playing />
                      <div className="grow" style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }} className="ellipsis">
                          {ex.name}
                        </div>
                        <div className="tiny muted">
                          {MUSCLE_ES[ex.primary[0]]} · {EQUIP_ES[ex.equipment] || ex.equipment}
                        </div>
                        {best && (
                          <div className="tiny num" style={{ color: '#6aa0ff', fontWeight: 700, marginTop: 2 }}>
                            PR: {best.set.w} kg × {best.set.r} (1RM {Math.round(best.e1rm)} kg)
                          </div>
                        )}
                      </div>
                      {exRank ? (
                        <RankBadge tier={exRank.tier} division={exRank.division} size={40} showDiv glow />
                      ) : (
                        <span className="tiny dim">Sin rango</span>
                      )}
                    </Tap>
                  )
                })}

                {filteredExercises.length > page * 30 && (
                  <Tap className="btn block" onClick={() => setPage((p) => p + 1)} style={{ marginTop: 8 }}>
                    Mostrar más ({filteredExercises.length - page * 30} restantes)
                  </Tap>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cuestionario Apartado de Rutina con IA (Paso a paso 1 a 1) */}
      <AnimatePresence>
        {aiOpen && (
          <AiRoutineWizard
            onClose={() => setAiOpen(false)}
            onPlanCreated={(plan) => {
              setAiOpen(false)
              setMode('routines')
              showToast?.(`✨ Plan IA de ${plan.length} rutinas creado con éxito`)
              setTimeout(() => {
                scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
              }, 80)
            }}
            initialWeakGroups={lastScan?.weakest || []}
          />
        )}
      </AnimatePresence>

      {/* Editor Completo de Rutina (Portaled + Pinned Footer so background never shows) */}
      <Sheet
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editingRoutine?.id ? 'Editar rutina' : 'Nueva rutina'}
        full
        footer={
          editingRoutine && (
            <div className="row gap10">
              {editingRoutine.id && (
                <Tap
                  className="btn danger"
                  onClick={() => {
                    deleteRoutine(editingRoutine.id)
                    setEditorOpen(false)
                    showToast?.('Rutina eliminada')
                  }}
                >
                  Eliminar
                </Tap>
              )}
              <Tap className="btn primary grow" onClick={handleSaveEditedRoutine}>
                {editingRoutine.id ? 'Guardar cambios' : 'Crear rutina'}
              </Tap>
            </div>
          )
        }
      >
        {editingRoutine && (
          <div className="col gap14">
            <div>
              <div className="label">Nombre de la rutina</div>
              <input
                className="field"
                placeholder="Ej: PECHO Y TRÍCEPS"
                value={editingRoutine.name}
                onChange={(e) => setEditingRoutine({ ...editingRoutine, name: e.target.value })}
              />
            </div>

            <div className="row between">
              <span className="small muted" style={{ fontWeight: 600 }}>
                {editingRoutine.exercises.length} ejercicios seleccionados
              </span>
              <Tap className="btn sm primary" onClick={() => setAddExOpen(true)}>
                + Añadir ejercicios
              </Tap>
            </div>

            {editingRoutine.exercises.length === 0 ? (
              <div
                className="card col center gap12"
                style={{
                  padding: '36px 20px',
                  textAlign: 'center',
                  background: 'linear-gradient(180deg, #14161f 0%, #0f1016 100%)',
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    background: 'rgba(47,107,255,0.14)',
                    border: '1px solid rgba(47,107,255,0.35)',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#6aa0ff',
                  }}
                >
                  <Icon.Dumbbell style={{ width: 26, height: 26 }} />
                </div>
                <div>
                  <div className="h3" style={{ marginBottom: 4 }}>
                    Tu rutina está vacía
                  </div>
                  <p className="small muted">
                    Elige los ejercicios del catálogo de 320 movimientos y personaliza sus series y repeticiones.
                  </p>
                </div>
                <Tap className="btn primary sm" onClick={() => setAddExOpen(true)}>
                  + Elegir de los 320 ejercicios
                </Tap>
              </div>
            ) : (
              <div className="col gap10">
                {editingRoutine.exercises.map((item, idx) => {
                  const ex = EX_BY_ID[item.exId]
                  return (
                    <div key={`${item.exId}-${idx}`} className="card col gap10" style={{ padding: 12 }}>
                      <div className="row gap10">
                        <ExerciseAnim ex={ex} size={50} rounded={10} playing={false} />
                        <div className="grow" style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 14.5 }} className="ellipsis">
                            {ex?.name || item.exId}
                          </div>
                          <div className="tiny muted ellipsis">
                            {ex ? `${MUSCLE_ES[ex.primary[0]]} · ${EQUIP_ES[ex.equipment] || ex.equipment}` : ''}
                          </div>
                        </div>

                        {/* Reordenar arriba / abajo + Eliminar */}
                        <div className="row gap4" style={{ flex: 'none' }}>
                          <Tap
                            className="pill"
                            style={{ padding: '0 9px', height: 32 }}
                            disabled={idx === 0}
                            onClick={() => moveEditedEx(idx, -1)}
                          >
                            ↑
                          </Tap>
                          <Tap
                            className="pill"
                            style={{ padding: '0 9px', height: 32 }}
                            disabled={idx === editingRoutine.exercises.length - 1}
                            onClick={() => moveEditedEx(idx, 1)}
                          >
                            ↓
                          </Tap>
                          <Tap
                            className="pill"
                            style={{ padding: '0 9px', height: 32, color: '#ff4d5e' }}
                            onClick={() => removeEditedEx(idx)}
                          >
                            ✕
                          </Tap>
                        </div>
                      </div>

                      {/* Ajustes de series, repeticiones y descanso del ejercicio */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                        <div>
                          <div className="tiny muted" style={{ marginBottom: 4 }}>
                            Series
                          </div>
                          <input
                            type="number"
                            min="1"
                            max="15"
                            className="set-cell-input num"
                            value={item.sets}
                            onChange={(e) => updateEditedEx(idx, { sets: Math.max(1, +e.target.value || 1) })}
                          />
                        </div>
                        <div>
                          <div className="tiny muted" style={{ marginBottom: 4 }}>
                            Reps mín
                          </div>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            className="set-cell-input num"
                            value={item.repMin}
                            onChange={(e) =>
                              updateEditedEx(idx, { repMin: Math.min(100, Math.max(1, +e.target.value || 1)) })
                            }
                          />
                        </div>
                        <div>
                          <div className="tiny muted" style={{ marginBottom: 4 }}>
                            Reps máx
                          </div>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            className="set-cell-input num"
                            value={item.repMax}
                            onChange={(e) =>
                              updateEditedEx(idx, { repMax: Math.min(100, Math.max(1, +e.target.value || 1)) })
                            }
                          />
                        </div>
                        <div>
                          <div className="tiny muted" style={{ marginBottom: 4 }}>
                            Desc. (s)
                          </div>
                          <input
                            type="number"
                            step="15"
                            min="15"
                            max="300"
                            className="set-cell-input num"
                            value={item.rest}
                            onChange={(e) => updateEditedEx(idx, { rest: Math.max(15, +e.target.value || 60) })}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </Sheet>

      {/* Selector de ejercicios para añadir/quitar dentro del Editor de Rutina */}
      <Sheet
        open={addExOpen}
        onClose={() => setAddExOpen(false)}
        title="Seleccionar ejercicios (320)"
        full
        footer={
          <Tap className="btn primary block" onClick={() => setAddExOpen(false)}>
            Listo ({editingRoutine?.exercises?.length || 0} en la rutina)
          </Tap>
        }
      >
        <div className="col gap12">
          <input
            className="field"
            placeholder="Buscar ejercicio..."
            value={pickerSearch}
            onChange={(e) => setPickerSearch(e.target.value)}
          />
          <div className="hscroll">
            <Tap
              className={`pill ${pickerMuscle === 'all' ? 'active' : ''}`}
              onClick={() => setPickerMuscle('all')}
            >
              Todos
            </Tap>
            {Object.entries(MUSCLE_ES).map(([k, label]) => (
              <Tap
                key={k}
                className={`pill ${pickerMuscle === k ? 'active' : ''}`}
                onClick={() => setPickerMuscle(k)}
              >
                {label}
              </Tap>
            ))}
          </div>

          <div className="col">
            {filteredPickerExercises.slice(0, 80).map((ex) => {
              const picked = editingRoutine?.exercises?.some((x) => x.exId === ex.id)
              return (
                <Tap
                  key={ex.id}
                  onClick={() => toggleExInEditor(ex.id)}
                  className="list-row"
                  style={{ borderBottom: '1px solid var(--line)', textAlign: 'left' }}
                >
                  <ExerciseAnim ex={ex} size={50} rounded={12} playing={false} />
                  <div className="grow" style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14.5 }} className="ellipsis">
                      {ex.name}
                    </div>
                    <div className="tiny muted">
                      {MUSCLE_ES[ex.primary[0]]} · {EQUIP_ES[ex.equipment] || ex.equipment}
                    </div>
                  </div>
                  <span
                    className="check"
                    style={{
                      background: picked ? '#2f6bff' : '#26262c',
                      color: '#fff',
                      flex: 'none',
                    }}
                  >
                    {picked ? <Icon.Check /> : <Icon.Plus />}
                  </span>
                </Tap>
              )
            })}
          </div>
        </div>
      </Sheet>
    </div>
  )
}
