import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { EX_BY_ID, EXERCISES, MUSCLE_ES, EQUIP_ES } from '../data/exercises'
import { suggestNext } from '../lib/overload'
import { computeRanks } from '../lib/ranks'
import { sfx, burstConfetti } from '../lib/fx'
import { ExerciseAnim } from '../components/ExerciseAnim'
import { Icon } from '../components/Icons'
import { Tap, Sheet } from '../components/UI'
import { useStore, uid } from '../store'

const fmtClock = (s) => {
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r < 10 ? '0' : ''}${r}`
}

export function WorkoutSession({ onOpenExercise, onWorkoutFinished }) {
  const active = useStore((s) => s.active)
  const workouts = useStore((s) => s.workouts)
  const profile = useStore((s) => s.profile)
  const settings = useStore((s) => s.settings)
  const updateActive = useStore((s) => s.updateActive)
  const addExercisesToActive = useStore((s) => s.addExercisesToActive)
  const finishWorkout = useStore((s) => s.finishWorkout)
  const discardWorkout = useStore((s) => s.discardWorkout)

  const [now, setNow] = useState(Date.now())
  const [pickerOpen, setPickerOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [restSheet, setRestSheet] = useState(false)
  const [finishSheet, setFinishSheet] = useState(false)
  const [note, setNote] = useState('')
  const [search, setSearch] = useState('')
  const [muscleFilter, setMuscleFilter] = useState('all')

  useEffect(() => {
    if (!active) return
    const id = setInterval(() => {
      const t = Date.now()
      setNow(t)
      if (active.restUntil && t >= active.restUntil) {
        sfx.timerDone()
        updateActive((a) => {
          a.restUntil = null
          return a
        })
      }
    }, 500)
    return () => clearInterval(id)
  }, [active?.id, active?.restUntil])

  const curItem = active?.exercises?.[active.current] || active?.exercises?.[0]
  const curEx = curItem ? EX_BY_ID[curItem.exId] : null

  const suggestion = useMemo(
    () => (curEx ? suggestNext(curEx.id, workouts, curItem?.repMin || 8, curItem?.repMax || 12) : null),
    [curEx?.id, workouts, curItem?.repMin, curItem?.repMax]
  )

  if (!active) return null

  const elapsedSec = Math.max(0, Math.floor((now - active.start) / 1000))
  const restLeft = active.restUntil ? Math.max(0, Math.ceil((active.restUntil - now) / 1000)) : 0

  if (active.minimized) {
    const doneSets = active.exercises.reduce((acc, e) => acc + e.sets.filter((s) => s.done).length, 0)
    return (
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        onClick={() =>
          updateActive((a) => {
            a.minimized = false
            return a
          })
        }
        style={{
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: 'calc(var(--tabbar-h) + var(--safe-b) + 10px)',
          zIndex: 60,
          background: 'linear-gradient(90deg, #17254a, #111522)',
          border: '1px solid #2f6bff88',
          borderRadius: 16,
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 12px 32px rgba(0,0,0,0.65)',
          cursor: 'pointer',
        }}
      >
        <div className="row gap10">
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#2fd571',
              boxShadow: '0 0 10px #2fd571',
            }}
          />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{active.name}</div>
            <div className="tiny muted num">
              {fmtClock(elapsedSec)} · {doneSets} series completadas
              {restLeft > 0 ? ` · Descanso ${restLeft}s` : ''}
            </div>
          </div>
        </div>
        <span className="pill" style={{ background: '#2f6bff', borderColor: '#2f6bff', fontWeight: 700 }}>
          Continuar
        </span>
      </motion.div>
    )
  }

  const toggleSetDone = (setIdx) => {
    updateActive((a) => {
      const exEntry = a.exercises[a.current]
      const s = exEntry.sets[setIdx]
      s.done = !s.done
      if (s.done) {
        if (!s.w && s.prev?.w) s.w = s.prev.w
        if (!s.r && s.prev?.r) s.r = s.prev.r
        if (!s.r) s.r = exEntry.repMax || 10
        const restSec = exEntry.rest || settings.restDefault || 90
        a.restUntil = Date.now() + restSec * 1000
        a.restTotal = restSec
        sfx.check()
        if (exEntry.superset) {
          const pairIdx = a.exercises.findIndex(
            (x, idx) => idx !== a.current && x.superset === exEntry.superset && x.sets[setIdx] && !x.sets[setIdx].done
          )
          if (pairIdx !== -1) a.current = pairIdx
        }
      } else {
        sfx.uncheck()
      }
      return a
    })
  }

  const cycleSetType = (setIdx) => {
    const order = ['normal', 'warmup', 'dropset', 'failure']
    updateActive((a) => {
      const s = a.exercises[a.current].sets[setIdx]
      s.type = order[(order.indexOf(s.type || 'normal') + 1) % order.length]
      return a
    })
  }

  const updateSetField = (setIdx, key, val) => {
    if (key === 'r' && +val > 100) val = '100'
    updateActive((a) => {
      a.exercises[a.current].sets[setIdx][key] = val
      return a
    })
  }

  const addSet = () => {
    updateActive((a) => {
      const sets = a.exercises[a.current].sets
      const last = sets[sets.length - 1]
      sets.push({
        id: uid(),
        w: last?.w ?? '',
        r: last?.r ?? 10,
        done: false,
        type: 'normal',
        prev: last?.prev || null,
      })
      return a
    })
  }

  const applyOverload = () => {
    if (!suggestion) return
    updateActive((a) => {
      a.exercises[a.current].sets.forEach((s) => {
        if (!s.done) {
          s.w = suggestion.w
          s.r = suggestion.r
        }
      })
      return a
    })
    burstConfetti('#2f6bff')
  }

  const toggleSuperset = () => {
    updateActive((a) => {
      const cur = a.exercises[a.current]
      const next = a.exercises[a.current + 1]
      if (cur.superset) {
        const tag = cur.superset
        a.exercises.forEach((x) => {
          if (x.superset === tag) x.superset = null
        })
      } else if (next) {
        const tag = uid().slice(0, 5)
        cur.superset = tag
        next.superset = tag
      }
      return a
    })
    setMenuOpen(false)
  }

  const handleFinishConfirm = () => {
    const before = computeRanks(workouts, profile)
    const saved = finishWorkout({ note })
    if (saved) {
      const after = computeRanks([...workouts, saved], profile)
      const rankUps = []
      for (const id of Object.keys(after.exRanks)) {
        const prevR = before.exRanks[id]
        const nextR = after.exRanks[id]
        if (!prevR || nextR.tierIndex > prevR.tierIndex || nextR.score > prevR.score + 0.05) {
          rankUps.push({
            exId: id,
            from: prevR?.tier || null,
            to: nextR.tier,
            division: nextR.division,
          })
        }
      }
      sfx.rankUp()
      burstConfetti('#2fd571')
      onWorkoutFinished?.({ workout: saved, rankUps })
    }
    setFinishSheet(false)
  }

  const filteredCatalog = EXERCISES.filter((e) => {
    if (muscleFilter !== 'all' && e.primary[0] !== muscleFilter) return false
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.en.toLowerCase().includes(search.toLowerCase()))
      return false
    return true
  })

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 390, damping: 36 }}
      className="layer"
      style={{ zIndex: 80, background: '#000' }}
    >
      <div className="scroll">
        <div className="page" style={{ paddingBottom: 42 }}>
          {/* Barra superior */}
          <div className="row between" style={{ height: 46, marginBottom: 4 }}>
            <Tap
              className="icon-btn"
              onClick={() =>
                updateActive((a) => {
                  a.minimized = true
                  return a
                })
              }
              aria-label="Minimizar"
            >
              <Icon.ChevronDown />
            </Tap>

            <div className="row gap6 tiny muted num">
              <Icon.Clock style={{ width: 14, height: 14, color: '#2f6bff' }} />
              <span>{fmtClock(elapsedSec)}</span>
            </div>

            <Tap
              onClick={() => setFinishSheet(true)}
              style={{
                color: '#3a78ff',
                fontWeight: 700,
                fontSize: 16,
                padding: '8px 6px',
              }}
            >
              Finalizar
            </Tap>
          </div>

          {curEx ? (
            <>
              {/* Animación principal + botón "▶ Ver técnica" */}
              <div style={{ position: 'relative', marginBottom: 14 }}>
                <ExerciseAnim ex={curEx} height={225} rounded={20} playing showMuscle />

                <Tap
                  onClick={() => onOpenExercise?.(curEx.id)}
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: 'rgba(22, 22, 26, 0.88)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 99,
                    padding: '7px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    fontSize: 13.5,
                    fontWeight: 600,
                  }}
                >
                  <Icon.Play style={{ width: 13, height: 13 }} />
                  <span>Ver técnica</span>
                </Tap>

                {suggestion && (
                  <Tap
                    onClick={applyOverload}
                    style={{
                      position: 'absolute',
                      right: 10,
                      bottom: 10,
                      background: 'rgba(22, 38, 74, 0.92)',
                      border: '1px solid #3a76ff',
                      borderRadius: 99,
                      padding: '4px 10px',
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: '#b8d4ff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <Icon.Sparkles style={{ width: 12, height: 12, color: '#5893ff' }} />
                    <span>
                      Sobrecarga IA: {suggestion.w} kg × {suggestion.r}
                    </span>
                  </Tap>
                )}
              </div>

              {/* Carrusel circular de ejercicios */}
              <div className="hscroll" style={{ paddingBottom: 12, alignItems: 'center', gap: 14 }}>
                {active.exercises.map((item, idx) => {
                  const exObj = EX_BY_ID[item.exId]
                  const isCurrent = idx === active.current
                  const totalS = item.sets.length
                  const doneS = item.sets.filter((s) => s.done).length
                  const allDone = totalS > 0 && doneS === totalS

                  return (
                    <Tap
                      key={item.uid}
                      onClick={() =>
                        updateActive((a) => {
                          a.current = idx
                          return a
                        })
                      }
                      style={{
                        position: 'relative',
                        width: 68,
                        height: 68,
                        borderRadius: '50%',
                        padding: 3,
                        border: isCurrent
                          ? '2px solid #2f6bff'
                          : allDone
                          ? '1.5px solid rgba(47,107,255,0.45)'
                          : '1.5px solid #22232a',
                        boxShadow: isCurrent ? '0 0 18px rgba(47,107,255,0.45)' : undefined,
                        flex: 'none',
                      }}
                    >
                      <ExerciseAnim
                        ex={exObj}
                        size="100%"
                        rounded="50%"
                        playing={isCurrent}
                        style={{ border: 'none' }}
                      />

                      {item.superset && (
                        <span
                          style={{
                            position: 'absolute',
                            top: -2,
                            left: -2,
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: '#8b5cf6',
                            display: 'grid',
                            placeItems: 'center',
                            border: '2px solid #000',
                          }}
                        >
                          <Icon.Link style={{ width: 11, height: 11 }} />
                        </span>
                      )}

                      {(isCurrent || allDone || doneS > 0) && (
                        <span
                          style={{
                            position: 'absolute',
                            right: -2,
                            bottom: -2,
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            background: allDone ? '#263b6e' : '#0d1326',
                            border: `1.8px solid ${isCurrent ? '#2f6bff' : '#3b5998'}`,
                            display: 'grid',
                            placeItems: 'center',
                            color: '#fff',
                          }}
                        >
                          {allDone ? (
                            <Icon.Check style={{ width: 13, height: 13, color: '#8ab4ff' }} />
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 20 20">
                              <circle cx="10" cy="10" r="8" fill="#132042" />
                              <path d="M10 2 A8 8 0 0 1 17.5 13 L10 10 Z" fill="#2f6bff" />
                            </svg>
                          )}
                        </span>
                      )}
                    </Tap>
                  )
                })}

                <Tap
                  onClick={() => setPickerOpen(true)}
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: '50%',
                    border: '1.6px dashed #2e3038',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#7a7b85',
                    flex: 'none',
                  }}
                  aria-label="Añadir ejercicio"
                >
                  <Icon.Plus style={{ width: 24, height: 24 }} />
                </Tap>
              </div>

              <div className="divider" style={{ margin: '4px -18px 14px' }} />

              {/* Título del ejercicio + Descanso + Menú */}
              <div className="row between" style={{ marginBottom: 14 }}>
                <div className="grow" onClick={() => onOpenExercise?.(curEx.id)} style={{ cursor: 'pointer' }}>
                  <h2 style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.01em' }}>{curEx.name}</h2>
                  {curItem.superset && (
                    <span className="tiny" style={{ color: '#a78bfa', fontWeight: 700 }}>
                      ⚡ En superserie · alterna serie a serie
                    </span>
                  )}
                </div>

                <div className="row gap4">
                  <Tap
                    className="icon-btn"
                    onClick={() => setRestSheet(true)}
                    style={{
                      width: 'auto',
                      padding: '0 10px',
                      gap: 5,
                      display: 'flex',
                      background: restLeft > 0 ? 'rgba(47,107,255,0.2)' : 'transparent',
                      color: restLeft > 0 ? '#6aa0ff' : '#9a9aa6',
                    }}
                  >
                    <Icon.Timer style={{ width: 21, height: 21 }} />
                    {restLeft > 0 && (
                      <span className="small num" style={{ fontWeight: 800 }}>
                        {fmtClock(restLeft)}
                      </span>
                    )}
                  </Tap>

                  <Tap className="icon-btn" onClick={() => setMenuOpen(true)} style={{ color: '#9a9aa6' }}>
                    <Icon.Dots style={{ width: 20, height: 20 }} />
                  </Tap>
                </div>
              </div>

              {/* Tabla de Series en castellano */}
              <div style={{ margin: '0 -18px' }}>
                <div className="sets-head">
                  <span>Serie</span>
                  <span>Anterior</span>
                  <span style={{ textAlign: 'center' }}>
                    KG <span className="dim">/ LB</span>
                  </span>
                  <span style={{ textAlign: 'center' }}>Reps</span>
                  <span />
                </div>

                <AnimatePresence initial={false}>
                  {curItem.sets.map((s, idx) => {
                    const typeLabel =
                      s.type === 'warmup' ? 'C' : s.type === 'dropset' ? 'D' : s.type === 'failure' ? 'F' : idx + 1
                    const typeColor =
                      s.type === 'warmup'
                        ? '#f0c13e'
                        : s.type === 'dropset'
                        ? '#a78bfa'
                        : s.type === 'failure'
                        ? '#ff4d5e'
                        : '#fff'

                    return (
                      <motion.div
                        key={s.id}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{
                          opacity: 1,
                          height: 56,
                          backgroundColor: s.done ? '#1b2a4b' : idx % 2 === 1 ? '#08080a' : '#000000',
                        }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22 }}
                        className="set-row"
                      >
                        <Tap
                          onClick={() => cycleSetType(idx)}
                          style={{
                            fontWeight: 700,
                            color: typeColor,
                            fontSize: 15,
                            textAlign: 'left',
                            paddingLeft: 6,
                          }}
                        >
                          {typeLabel}
                        </Tap>

                        <span
                          className="num"
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: s.done ? '#9ab0d8' : s.prev ? '#e2e2e8' : '#6b6b75',
                          }}
                        >
                          {s.prev ? `${s.prev.w} kg × ${s.prev.r}` : '—'}
                        </span>

                        <input
                          type="number"
                          inputMode="decimal"
                          placeholder={s.prev ? String(s.prev.w) : '0'}
                          value={s.w}
                          onChange={(e) => updateSetField(idx, 'w', e.target.value)}
                          className="set-cell-input num"
                          style={{
                            background: s.done ? 'transparent' : '#17171b',
                          }}
                        />

                        <input
                          type="number"
                          inputMode="numeric"
                          min="1"
                          max="100"
                          placeholder={String(curItem.repMax || 10)}
                          value={s.r}
                          onChange={(e) => updateSetField(idx, 'r', e.target.value)}
                          className="set-cell-input num"
                          style={{
                            background: s.done ? 'transparent' : '#17171b',
                          }}
                        />

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Tap
                            onClick={() => toggleSetDone(idx)}
                            scale={0.86}
                            className="check"
                            style={{
                              background: s.done ? '#2f6bff' : '#2a2a30',
                              color: '#fff',
                              boxShadow: s.done ? '0 0 14px rgba(47,107,255,0.65)' : undefined,
                            }}
                          >
                            <Icon.Check />
                          </Tap>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>

              <Tap
                onClick={addSet}
                style={{
                  marginTop: 14,
                  width: '100%',
                  height: 46,
                  borderRadius: 11,
                  background: '#1c1c20',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <span>+ Añadir serie</span>
              </Tap>
            </>
          ) : (
            <div className="card col center gap12" style={{ padding: 36, textAlign: 'center', marginTop: 24 }}>
              <p className="muted">Entrenamiento vacío. Añade tu primer ejercicio de los 320 disponibles.</p>
              <Tap className="btn primary" onClick={() => setPickerOpen(true)}>
                + Añadir ejercicio
              </Tap>
            </div>
          )}
        </div>
      </div>

      {/* Opciones del ejercicio */}
      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Opciones del ejercicio">
        {curItem && (
          <div className="col gap12">
            <Tap
              className="card row between"
              onClick={toggleSuperset}
              disabled={!curItem.superset && active.current >= active.exercises.length - 1}
            >
              <div className="row gap12">
                <Icon.Link style={{ width: 20, height: 20, color: '#a78bfa' }} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700 }}>
                    {curItem.superset ? 'Desvincular superserie' : 'Encadenar en Superserie'}
                  </div>
                  <div className="tiny muted">
                    Alterna automáticamente serie a serie con el siguiente ejercicio
                  </div>
                </div>
              </div>
            </Tap>

            <div className="card col gap10">
              <div className="row between">
                <span style={{ fontWeight: 700 }}>Rango objetivo de repeticiones (hasta 100)</span>
                <span className="chip num">
                  {curItem.repMin || 8} – {curItem.repMax || 12} reps
                </span>
              </div>
              <div className="row gap8 wrap">
                {[
                  [4, 6, 'Fuerza 4-6'],
                  [6, 10, 'Hipertrofia 6-10'],
                  [8, 12, 'Clásico 8-12'],
                  [12, 15, 'Bombeo 12-15'],
                  [20, 30, 'Alto 20-30'],
                  [50, 100, 'Resistencia 50-100'],
                ].map(([min, max, label]) => (
                  <Tap
                    key={label}
                    className={`pill ${curItem.repMax === max ? 'active' : ''}`}
                    onClick={() => {
                      updateActive((a) => {
                        a.exercises[a.current].repMin = min
                        a.exercises[a.current].repMax = max
                        return a
                      })
                    }}
                  >
                    {label}
                  </Tap>
                ))}
              </div>
            </div>

            {curItem.sets.length > 1 && (
              <Tap
                className="btn"
                onClick={() => {
                  updateActive((a) => {
                    a.exercises[a.current].sets.pop()
                    return a
                  })
                  setMenuOpen(false)
                }}
              >
                Quitar última serie
              </Tap>
            )}

            <Tap
              className="btn danger"
              onClick={() => {
                updateActive((a) => {
                  a.exercises.splice(a.current, 1)
                  a.current = Math.max(0, a.current - 1)
                  return a
                })
                setMenuOpen(false)
              }}
            >
              Eliminar ejercicio del entreno
            </Tap>
          </div>
        )}
      </Sheet>

      {/* Temporizador de descanso */}
      <Sheet open={restSheet} onClose={() => setRestSheet(false)} title="Temporizador de descanso">
        <div className="col center gap16" style={{ padding: '10px 0' }}>
          <div style={{ fontSize: 48, fontWeight: 800 }} className="num">
            {restLeft > 0 ? fmtClock(restLeft) : fmtClock(curItem?.rest || settings.restDefault || 90)}
          </div>
          <div className="row gap8 wrap center">
            {[45, 60, 90, 120, 180, 240].map((sec) => (
              <Tap
                key={sec}
                className="pill"
                onClick={() => {
                  updateActive((a) => {
                    if (a.exercises[a.current]) a.exercises[a.current].rest = sec
                    a.restUntil = Date.now() + sec * 1000
                    a.restTotal = sec
                    return a
                  })
                }}
              >
                {sec}s
              </Tap>
            ))}
          </div>
          {restLeft > 0 && (
            <div className="row gap10">
              <Tap
                className="btn sm"
                onClick={() =>
                  updateActive((a) => {
                    a.restUntil += 15000
                    return a
                  })
                }
              >
                +15s
              </Tap>
              <Tap
                className="btn sm danger"
                onClick={() =>
                  updateActive((a) => {
                    a.restUntil = null
                    return a
                  })
                }
              >
                Saltar descanso
              </Tap>
            </div>
          )}
        </div>
      </Sheet>

      {/* Selector de ejercicios */}
      <Sheet open={pickerOpen} onClose={() => setPickerOpen(false)} title="Añadir ejercicio (320)" full>
        <div className="col gap12">
          <input
            className="field"
            placeholder="Buscar ejercicio (ej. Press, Sentadilla, Curl...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="hscroll">
            <Tap className={`pill ${muscleFilter === 'all' ? 'active' : ''}`} onClick={() => setMuscleFilter('all')}>
              Todos
            </Tap>
            {Object.entries(MUSCLE_ES).map(([k, label]) => (
              <Tap key={k} className={`pill ${muscleFilter === k ? 'active' : ''}`} onClick={() => setMuscleFilter(k)}>
                {label}
              </Tap>
            ))}
          </div>
          <div className="col">
            {filteredCatalog.slice(0, 60).map((e) => (
              <Tap
                key={e.id}
                className="list-row"
                onClick={() => {
                  addExercisesToActive([e.id])
                  setPickerOpen(false)
                }}
                style={{ borderBottom: '1px solid var(--line)', textAlign: 'left' }}
              >
                <ExerciseAnim ex={e} size={54} rounded={12} playing={false} />
                <div className="grow">
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{e.name}</div>
                  <div className="tiny muted">
                    {MUSCLE_ES[e.primary[0]]} · {EQUIP_ES[e.equipment] || e.equipment}
                  </div>
                </div>
                <span className="pill" style={{ background: 'var(--blue)', borderColor: 'var(--blue)' }}>
                  + Añadir
                </span>
              </Tap>
            ))}
          </div>
        </div>
      </Sheet>

      {/* Finalizar entrenamiento */}
      <Sheet open={finishSheet} onClose={() => setFinishSheet(false)} title="Finalizar entrenamiento">
        <div className="col gap16">
          <div className="card row between">
            <div>
              <div className="tiny muted">Duración</div>
              <div className="h2 num">{fmtClock(elapsedSec)}</div>
            </div>
            <div>
              <div className="tiny muted">Volumen total</div>
              <div className="h2 num">
                {Math.round(
                  active.exercises.reduce(
                    (acc, e) => acc + e.sets.filter((s) => s.done).reduce((v, s) => v + (+s.w || 0) * (+s.r || 0), 0),
                    0
                  )
                )}{' '}
                kg
              </div>
            </div>
            <div>
              <div className="tiny muted">Series</div>
              <div className="h2 num">
                {active.exercises.reduce((acc, e) => acc + e.sets.filter((s) => s.done).length, 0)}
              </div>
            </div>
          </div>

          <div>
            <div className="label">Notas del entrenamiento (usa @ para mencionar amigos)</div>
            <textarea
              rows={3}
              className="field"
              style={{ height: 84, padding: 12 }}
              placeholder="Ej: ¡Buenas sensaciones hoy en banca!"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <Tap className="btn primary block" onClick={handleFinishConfirm}>
            Guardar y calcular rangos
          </Tap>
          <Tap
            className="btn danger block"
            onClick={() => {
              discardWorkout()
              setFinishSheet(false)
            }}
          >
            Descartar entrenamiento
          </Tap>
        </div>
      </Sheet>
    </motion.div>
  )
}
