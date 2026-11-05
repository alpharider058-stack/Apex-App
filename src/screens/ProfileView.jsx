import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { EX_BY_ID, MUSCLE_ES, GROUPS } from '../data/exercises'
import { TIERS, computeRanks } from '../lib/ranks'
import { BodyMap } from '../components/BodyMap'
import { ExerciseAnim } from '../components/ExerciseAnim'
import { RankCalculator } from '../components/RankCalculator'
import { Icon, RankBadge } from '../components/Icons'
import { AppHeader, Tap, Segmented, Sheet } from '../components/UI'
import { sfx } from '../lib/fx'
import { useStore } from '../store'

export function ProfileView({ onOpenExercise, onOpenGuide, onOpenSettings, onOpenCalc, showToast }) {
  const workouts = useStore((s) => s.workouts)
  const profile = useStore((s) => s.profile)
  const measurements = useStore((s) => s.measurements)
  const addMeasurement = useStore((s) => s.addMeasurement)

  const [side, setSide] = useState('anterior')
  const [selectedMuscle, setSelectedMuscle] = useState(null)
  const [subTab, setSubTab] = useState('ranks') // 'ranks' | 'calc' | 'measurements' | 'stats'
  const [measSheet, setMeasSheet] = useState(false)
  const [mForm, setMForm] = useState({
    weight: profile.bodyweight || '',
    bodyFat: '',
    chest: '',
    waist: '',
    arm: '',
    thigh: '',
  })

  const ranks = useMemo(() => computeRanks(workouts, profile), [workouts, profile])
  const badgeRow = TIERS.slice(1) // Bronce .. Apex
  const activeTierId = ranks.global?.tier?.id || null

  const muscleExercises = useMemo(() => {
    if (!selectedMuscle) return []
    return Object.keys(ranks.exRanks)
      .filter((id) => EX_BY_ID[id]?.primary?.includes(selectedMuscle))
      .map((id) => ({ ex: EX_BY_ID[id], rank: ranks.exRanks[id], best: ranks.best[id] }))
  }, [selectedMuscle, ranks])

  const handleSaveMeasurement = () => {
    addMeasurement({
      weight: +mForm.weight || profile.bodyweight,
      bodyFat: +mForm.bodyFat || null,
      chest: +mForm.chest || null,
      waist: +mForm.waist || null,
      arm: +mForm.arm || null,
      thigh: +mForm.thigh || null,
    })
    setMeasSheet(false)
    showToast?.('Medidas registradas')
  }

  return (
    <div
      className="scroll tab-pad"
      style={{
        background: 'linear-gradient(180deg, #000000 0%, #070b18 52%, #172248 100%)',
      }}
    >
      <div className="page">
        <AppHeader onOpenGuide={onOpenGuide} onOpenSettings={onOpenSettings} onOpenCalc={onOpenCalc} />

        {/* Fila horizontal épica con las 8 insignias de rango */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, minmax(0, 1fr))',
            alignItems: 'end',
            gap: 2,
            padding: '6px 2px 12px',
            marginBottom: 4,
            borderRadius: 18,
            background: 'linear-gradient(180deg, rgba(25,32,62,0.38) 0%, rgba(12,14,22,0.15) 100%)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {badgeRow.map((t, idx) => {
            const isHero = t.id === activeTierId
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={onOpenGuide}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  cursor: 'pointer',
                  opacity: activeTierId && !isHero ? 0.72 : 1,
                }}
              >
                <RankBadge
                  tier={t}
                  size={isHero ? 42 : 34}
                  glow={isHero || t.id === 'apex'}
                  epic={isHero}
                />
                <span
                  className="num"
                  style={{
                    fontSize: t.id === 'apex' ? 9.5 : 10,
                    fontWeight: 800,
                    color: t.glow,
                    letterSpacing: '-0.03em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t.id === 'apex' ? 'TOP 1%' : `${t.top}%`}
                </span>
              </motion.div>
            )
          })}
        </div>

        {/* Mapa corporal anatómico interactivo */}
        <div style={{ position: 'relative', height: 396, margin: '2px 0 12px' }}>
          <BodyMap
            side={side}
            muscleRanks={ranks.muscleRanks}
            selectedMuscle={selectedMuscle}
            onSelectMuscle={(m) => setSelectedMuscle((prev) => (prev === m ? null : m))}
            showCallouts
            height={396}
          />

          {/* Botón Vista Frontal / Espalda — estático 100% sin desplazamiento ni escala al hacer click */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 6,
              display: 'flex',
              justifyContent: 'center',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          >
            <button
              type="button"
              onClick={() => {
                sfx.tap()
                setSide((s) => (s === 'anterior' ? 'posterior' : 'anterior'))
              }}
              style={{
                pointerEvents: 'auto',
                width: 236,
                height: 36,
                borderRadius: 99,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                background: 'rgba(16, 20, 34, 0.92)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(110, 155, 255, 0.28)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.55)',
                color: '#ffffff',
                fontSize: 12.5,
                fontWeight: 700,
                transform: 'none',
                transition: 'background-color 0.15s ease, border-color 0.15s ease',
              }}
            >
              <Icon.Flip style={{ width: 14, height: 14, color: '#6aa0ff', flex: 'none' }} />
              <span style={{ whiteSpace: 'nowrap' }}>
                {side === 'anterior' ? 'Vista Frontal · Ver Espalda' : 'Vista Espalda · Ver Frontal'}
              </span>
            </button>
          </div>
        </div>

        {/* Detalle del músculo seleccionado */}
        <AnimatePresence>
          {selectedMuscle && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="card col gap10"
              style={{ marginBottom: 14, borderColor: '#2f6bff66' }}
            >
              <div className="row between">
                <div className="row gap10">
                  <RankBadge
                    tier={ranks.muscleRanks[selectedMuscle]?.tier || 'iron'}
                    size={42}
                    glow={!!ranks.muscleRanks[selectedMuscle]}
                  />
                  <div>
                    <div className="h3">{MUSCLE_ES[selectedMuscle] || selectedMuscle}</div>
                    <div className="tiny muted">
                      {ranks.muscleRanks[selectedMuscle]
                        ? `Rango ${ranks.muscleRanks[selectedMuscle].tier.name} ${ranks.muscleRanks[selectedMuscle].division} · Top ${ranks.muscleRanks[selectedMuscle].top.toFixed(1)}%`
                        : 'Sin clasificar aún · registra un ejercicio de este músculo'}
                    </div>
                  </div>
                </div>
                <Tap className="icon-btn" onClick={() => setSelectedMuscle(null)} style={{ width: 32, height: 32 }}>
                  <Icon.Close style={{ width: 16, height: 16 }} />
                </Tap>
              </div>
              {muscleExercises.map(({ ex, rank, best }) => (
                <Tap
                  key={ex.id}
                  onClick={() => onOpenExercise?.(ex.id)}
                  className="row between"
                  style={{ paddingTop: 8, borderTop: '1px solid var(--line)', textAlign: 'left' }}
                >
                  <div className="row gap10" style={{ minWidth: 0 }}>
                    <ExerciseAnim ex={ex} size={42} rounded={10} playing={false} />
                    <div className="grow" style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }} className="ellipsis">
                        {ex.name}
                      </div>
                      <div className="tiny muted num">
                        Mejor serie: {best.set.w} kg × {best.set.r} · 1RM {Math.round(best.e1rm)} kg
                      </div>
                    </div>
                  </div>
                  <RankBadge tier={rank.tier} division={rank.division} size={36} showDiv />
                </Tap>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sub-navegación en castellano con Calculadora de Rango integrada */}
        <div style={{ marginBottom: 16 }}>
          <Segmented
            id="prof-sub-seg"
            value={subTab}
            onChange={setSubTab}
            options={[
              { value: 'ranks', label: 'Rangos' },
              { value: 'calc', label: 'Calculadora' },
              { value: 'measurements', label: 'Medidas' },
              { value: 'stats', label: 'Estadíst.' },
            ]}
          />
        </div>

        <AnimatePresence mode="wait">
          {subTab === 'ranks' && (
            <motion.div
              key="ranks"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="col gap12"
            >
              {/* Resumen de Rango Global + Acceso rápido a Calculadora */}
              <div
                className="card col gap10"
                style={{
                  background: '#0d101a',
                  borderColor: 'rgba(76, 131, 255, 0.35)',
                }}
              >
                <div className="row between">
                  <div className="row gap12" style={{ minWidth: 0 }}>
                    <RankBadge tier={ranks.global?.tier || 'iron'} size={48} glow={!!ranks.global} epic={!!ranks.global} />
                    <div style={{ minWidth: 0 }}>
                      <div className="tiny muted upper">Rango Global</div>
                      <div className="h2 upper" style={{ color: ranks.global?.tier?.glow || '#d0d2dc' }}>
                        {ranks.global ? `${ranks.global.tier.name} ${ranks.global.division}` : 'Sin clasificar'}
                      </div>
                      <div className="tiny muted">
                        {ranks.global
                          ? `${profile.bodyweight} kg`
                          : `${Math.max(0, 10 - ranks.rankedCount)} ejercicios para clasificar`}
                      </div>
                    </div>
                  </div>
                  {ranks.global && (
                    <span className="chip num" style={{ color: '#9fd3ff', fontWeight: 900 }}>
                      TOP {Math.max(1, Math.round(ranks.global.top))}%
                    </span>
                  )}
                </div>

                {/* Acceso directo a Calculadora */}
                <Tap
                  onClick={() => setSubTab('calc')}
                  style={{
                    height: 38,
                    borderRadius: 10,
                    background: 'rgba(47, 107, 255, 0.12)',
                    border: '1px solid rgba(106, 160, 255, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    fontWeight: 700,
                    fontSize: 13.5,
                    color: '#9fc5ff',
                  }}
                >
                  <Icon.Calculator style={{ width: 16, height: 16 }} />
                  <span>Calculadora de Rango</span>
                </Tap>
              </div>

              {/* Rangos por grupo muscular */}
              <h3 className="h3" style={{ marginTop: 4 }}>
                Rangos por grupo muscular
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {Object.entries(GROUPS).map(([gKey, gInfo]) => {
                  const gr = ranks.groupRanks[gKey]
                  return (
                    <div
                      key={gKey}
                      className="card row gap10"
                      style={{
                        padding: 12,
                        borderColor: gr ? `${gr.tier.color}44` : 'var(--line)',
                        background: gr
                          ? `linear-gradient(135deg, ${gr.tier.color}16 0%, #121318 80%)`
                          : undefined,
                      }}
                    >
                      <RankBadge tier={gr?.tier || 'iron'} division={gr?.division} size={42} showDiv={!!gr} glow={!!gr} />
                      <div className="grow" style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14.5 }} className="ellipsis">
                          {gInfo.label}
                        </div>
                        <div
                          className="tiny upper ellipsis"
                          style={{ color: gr?.tier?.glow || '#6b6b75', fontWeight: 800 }}
                        >
                          {gr ? `${gr.tier.name} ${gr.division}` : 'Sin rango'}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Ejercicios clasificados */}
              <h3 className="h3" style={{ marginTop: 6 }}>
                Tus ejercicios clasificados ({ranks.rankedCount})
              </h3>
              {ranks.rankedCount === 0 ? (
                <div className="card col center gap10" style={{ padding: 24, textAlign: 'center' }}>
                  <p className="small muted">
                    Aún no tienes ejercicios con rango registrado. Pulsa el botón central de la pesa para entrenar o
                    prueba la Calculadora de Rango.
                  </p>
                  <Tap className="btn sm primary" onClick={() => setSubTab('calc')}>
                    <Icon.Calculator style={{ width: 16, height: 16 }} />
                    <span>Simular mis rangos ahora</span>
                  </Tap>
                </div>
              ) : (
                <div className="col gap8">
                  {Object.entries(ranks.exRanks)
                    .sort((a, b) => b[1].score - a[1].score)
                    .map(([exId, r]) => {
                      const ex = EX_BY_ID[exId]
                      const b = ranks.best[exId]
                      if (!ex) return null
                      return (
                        <Tap
                          key={exId}
                          onClick={() => onOpenExercise?.(exId)}
                          className="card row gap12"
                          style={{
                            padding: '10px 12px',
                            textAlign: 'left',
                            borderColor: `${r.tier.color}38`,
                          }}
                        >
                          <ExerciseAnim ex={ex} size={50} rounded={12} playing={false} />
                          <div className="grow" style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 14.5 }} className="ellipsis">
                              {ex.name}
                            </div>
                            <div className="tiny muted num">
                              PR: {b.set.w} kg × {b.set.r} · 1RM {Math.round(b.e1rm)} kg
                            </div>
                          </div>
                          <div className="row gap8" style={{ flex: 'none' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div className="tiny upper" style={{ fontWeight: 900, color: r.tier.glow }}>
                                {r.tier.name} {r.division}
                              </div>
                              <div className="tiny muted num">Top {Math.max(1, Math.round(r.top))}%</div>
                            </div>
                            <RankBadge tier={r.tier} division={r.division} size={40} glow />
                          </div>
                        </Tap>
                      )
                    })}
                </div>
              )}
            </motion.div>
          )}

          {subTab === 'calc' && (
            <motion.div
              key="calc"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <RankCalculator onOpenExercise={onOpenExercise} />
            </motion.div>
          )}

          {subTab === 'measurements' && (
            <motion.div
              key="measurements"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="col gap14"
            >
              <div className="row between">
                <div>
                  <h3 className="h3">Peso y medidas corporales</h3>
                  <p className="tiny muted">Registra tu evolución corporal a lo largo del tiempo</p>
                </div>
                <Tap className="btn primary sm" onClick={() => setMeasSheet(true)}>
                  + Registrar
                </Tap>
              </div>

              {measurements.length === 0 ? (
                <div className="card col center gap10" style={{ padding: 26, textAlign: 'center' }}>
                  <p className="small muted">No has guardado ninguna medición todavía.</p>
                  <Tap className="btn primary sm" onClick={() => setMeasSheet(true)}>
                    Añadir primera medición
                  </Tap>
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {[
                      ['Peso', measurements[measurements.length - 1].weight ? `${measurements[measurements.length - 1].weight} kg` : '—'],
                      ['Grasa est.', measurements[measurements.length - 1].bodyFat ? `${measurements[measurements.length - 1].bodyFat}%` : '—'],
                      ['Pecho', measurements[measurements.length - 1].chest ? `${measurements[measurements.length - 1].chest} cm` : '—'],
                      ['Cintura', measurements[measurements.length - 1].waist ? `${measurements[measurements.length - 1].waist} cm` : '—'],
                      ['Brazo', measurements[measurements.length - 1].arm ? `${measurements[measurements.length - 1].arm} cm` : '—'],
                      ['Muslo', measurements[measurements.length - 1].thigh ? `${measurements[measurements.length - 1].thigh} cm` : '—'],
                    ].map(([k, v]) => (
                      <div key={k} className="card" style={{ padding: 12 }}>
                        <div className="tiny muted">{k}</div>
                        <div className="h3 num" style={{ marginTop: 2 }}>
                          {v}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="card col gap10">
                    <span className="h3">Historial de mediciones</span>
                    {[...measurements].reverse().map((m) => (
                      <div
                        key={m.id}
                        className="row between small"
                        style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}
                      >
                        <span className="muted">
                          {new Date(m.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </span>
                        <span className="num" style={{ fontWeight: 700 }}>
                          {m.weight ? `${m.weight} kg` : ''}
                          {m.waist ? ` · ${m.waist} cm cintura` : ''}
                          {m.arm ? ` · ${m.arm} cm brazo` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {subTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="col gap12"
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="card">
                  <div className="tiny muted">Entrenamientos</div>
                  <div className="h1 num">{workouts.length}</div>
                </div>
                <div className="card">
                  <div className="tiny muted">Volumen total movido</div>
                  <div className="h1 num">
                    {Math.round(
                      workouts.reduce(
                        (acc, w) =>
                          acc +
                          w.exercises.reduce(
                            (a, e) => a + e.sets.reduce((sAcc, s) => sAcc + (s.w || 0) * (s.r || 0), 0),
                            0
                          ),
                        0
                      )
                    )}{' '}
                    kg
                  </div>
                </div>
              </div>

              {workouts.length > 0 && (
                <div className="card col gap10">
                  <span className="h3">Volumen por sesión (kg)</span>
                  <div className="row gap8" style={{ height: 120, alignItems: 'flex-end', paddingTop: 16 }}>
                    {workouts.slice(-7).map((w) => {
                      const vol = w.exercises.reduce(
                        (a, e) => a + e.sets.reduce((sAcc, s) => sAcc + (s.w || 0) * (s.r || 0), 0),
                        0
                      )
                      const h = Math.min(100, Math.max(18, Math.round(vol / 50)))
                      return (
                        <div key={w.id} className="col center grow gap4">
                          <span className="tiny muted num" style={{ fontSize: 10 }}>
                            {Math.round(vol)}
                          </span>
                          <div
                            style={{
                              width: '100%',
                              height: h,
                              borderRadius: 8,
                              background: 'linear-gradient(180deg, #4b84ff, #1f4fd6)',
                            }}
                          />
                          <span className="tiny dim">
                            {new Date(w.end || w.start).toLocaleDateString('es-ES', { weekday: 'narrow' })}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Registrar medidas */}
      <Sheet open={measSheet} onClose={() => setMeasSheet(false)} title="Registrar medidas">
        <div className="col gap12">
          <div className="row gap10">
            <div className="grow">
              <div className="label">Peso corporal (kg)</div>
              <input
                type="number"
                step="0.1"
                className="field num"
                value={mForm.weight}
                onChange={(e) => setMForm({ ...mForm, weight: e.target.value })}
              />
            </div>
            <div className="grow">
              <div className="label">% Grasa estimado</div>
              <input
                type="number"
                step="0.5"
                className="field num"
                value={mForm.bodyFat}
                onChange={(e) => setMForm({ ...mForm, bodyFat: e.target.value })}
              />
            </div>
          </div>
          <div className="row gap10">
            <div className="grow">
              <div className="label">Pecho (cm)</div>
              <input
                type="number"
                className="field num"
                value={mForm.chest}
                onChange={(e) => setMForm({ ...mForm, chest: e.target.value })}
              />
            </div>
            <div className="grow">
              <div className="label">Cintura (cm)</div>
              <input
                type="number"
                className="field num"
                value={mForm.waist}
                onChange={(e) => setMForm({ ...mForm, waist: e.target.value })}
              />
            </div>
          </div>
          <div className="row gap10">
            <div className="grow">
              <div className="label">Brazo (cm)</div>
              <input
                type="number"
                className="field num"
                value={mForm.arm}
                onChange={(e) => setMForm({ ...mForm, arm: e.target.value })}
              />
            </div>
            <div className="grow">
              <div className="label">Muslo (cm)</div>
              <input
                type="number"
                className="field num"
                value={mForm.thigh}
                onChange={(e) => setMForm({ ...mForm, thigh: e.target.value })}
              />
            </div>
          </div>
          <Tap className="btn primary block" onClick={handleSaveMeasurement}>
            Guardar medidas
          </Tap>
        </div>
      </Sheet>
    </div>
  )
}
