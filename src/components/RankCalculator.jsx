import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { EX_BY_ID, EXERCISES, MUSCLE_ES, EQUIP_ES } from '../data/exercises'
import { simulateExerciseRank } from '../lib/ranks'
import { ExerciseAnim } from './ExerciseAnim'
import { Icon, RankBadge } from './Icons'
import { Tap, Sheet } from './UI'
import { useStore } from '../store'

const POPULAR_EX_IDS = [
  'barbell-bench-press-medium-grip',
  'barbell-full-squat',
  'barbell-deadlift',
  'pullups',
  'barbell-shoulder-press',
  'barbell-curl',
  'leg-press',
  'bent-over-barbell-row',
  'dips-triceps-version',
  'incline-dumbbell-press',
  'romanian-deadlift',
  'wide-grip-lat-pulldown',
].filter((id) => EX_BY_ID[id])

export function RankCalculator({ initialExId = 'barbell-bench-press-medium-grip', onOpenExercise }) {
  const profile = useStore((s) => s.profile)
  const [exId, setExId] = useState(EX_BY_ID[initialExId] ? initialExId : POPULAR_EX_IDS[0] || EXERCISES[0]?.id)
  const [weight, setWeight] = useState(80)
  const [reps, setReps] = useState(8)
  const [sets, setSets] = useState(3)
  const [bw, setBw] = useState(profile.bodyweight || 75)
  const [sex, setSex] = useState(profile.sex || 'male')

  const [pickerOpen, setPickerOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [muscleFilter, setMuscleFilter] = useState('all')

  const ex = EX_BY_ID[exId] || EXERCISES[0]

  const simProfile = useMemo(
    () => ({ ...profile, bodyweight: Math.max(35, +bw || 75), sex }),
    [profile, bw, sex]
  )

  const sim = useMemo(
    () => simulateExerciseRank(ex, { weight, reps, sets }, simProfile),
    [ex, weight, reps, sets, simProfile]
  )

  const filteredCatalog = useMemo(() => {
    const q = search.trim().toLowerCase()
    return EXERCISES.filter((e) => {
      if (muscleFilter !== 'all' && e.primary[0] !== muscleFilter) return false
      if (q && !e.name.toLowerCase().includes(q) && !e.en.toLowerCase().includes(q)) return false
      return true
    })
  }, [search, muscleFilter])

  if (!sim) return null
  const { rank, ladder } = sim
  const tier = rank.tier

  const adjustWeight = (delta) => {
    setWeight((w) => Math.max(0, Math.round((+w + delta) * 2) / 2))
  }

  return (
    <div className="col gap14">
      {/* Resultado Épico en Vivo */}
      <motion.div
        layout
        className="card"
        style={{
          padding: '18px 16px',
          borderRadius: 22,
          border: `1.5px solid ${tier.color}88`,
          background: `radial-gradient(circle at 50% 0%, ${tier.color}38 0%, rgba(15, 17, 26, 0.96) 68%, #090a0f 100%)`,
          boxShadow: `0 14px 40px -10px ${tier.color}44, inset 0 1px 0 rgba(255,255,255,0.16)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient background glow */}
        <div
          style={{
            position: 'absolute',
            top: -50,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 220,
            height: 140,
            borderRadius: '50%',
            background: tier.glow,
            opacity: 0.16,
            filter: 'blur(38px)',
            pointerEvents: 'none',
          }}
        />

        <div className="row between" style={{ position: 'relative', zIndex: 1, marginBottom: 12 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: tier.glow,
            }}
          >
            ⚡ Rango Estimado · {tier.title}
          </span>
          <span
            className="num"
            style={{
              fontSize: 11.5,
              fontWeight: 900,
              padding: '3px 9px',
              borderRadius: 8,
              background: `${tier.color}28`,
              border: `1px solid ${tier.color}66`,
              color: tier.glow,
            }}
          >
            TOP {rank.top < 1 ? rank.top.toFixed(1) : Math.max(1, Math.round(rank.top))}%
          </span>
        </div>

        <div className="row gap16" style={{ position: 'relative', zIndex: 1, alignItems: 'center' }}>
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`${tier.id}-${rank.division}`}
              initial={{ scale: 0.72, rotate: -10, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.72, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            >
              <RankBadge tier={tier} division={rank.division} size={82} glow epic showDiv />
            </motion.div>
          </AnimatePresence>

          <div className="grow" style={{ minWidth: 0 }}>
            <motion.div
              key={tier.name + rank.division}
              initial={{ y: 6, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="upper"
              style={{
                fontSize: 27,
                fontWeight: 900,
                letterSpacing: '-0.02em',
                lineHeight: 1.05,
                color: '#fff',
                textShadow: `0 0 22px ${tier.color}88`,
              }}
            >
              {tier.name} <span style={{ color: tier.glow }}>{rank.division}</span>
            </motion.div>

            <div className="tiny muted ellipsis" style={{ marginTop: 4, fontWeight: 600 }}>
              {ex.name} · {sets}×{reps} con {weight} kg
            </div>

            {/* Mini KPI strip */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 6,
                marginTop: 10,
                paddingTop: 10,
                borderTop: '1px solid rgba(255,255,255,0.09)',
              }}
            >
              <div>
                <div className="tiny dim" style={{ fontSize: 10.5 }}>1RM Est.</div>
                <div className="num" style={{ fontWeight: 800, fontSize: 14.5, color: '#fff' }}>
                  {sim.est1RM} kg
                </div>
              </div>
              <div>
                <div className="tiny dim" style={{ fontSize: 10.5 }}>Fuerza Rel.</div>
                <div className="num" style={{ fontWeight: 800, fontSize: 14.5, color: tier.glow }}>
                  {sim.bwRatio}× peso
                </div>
              </div>
              <div>
                <div className="tiny dim" style={{ fontSize: 10.5 }}>Volumen</div>
                <div className="num" style={{ fontWeight: 800, fontSize: 14.5, color: '#9fd3ff' }}>
                  {sim.volume} kg
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de progreso hacia el siguiente rango */}
        <div style={{ marginTop: 14, position: 'relative', zIndex: 1 }}>
          <div className="row between tiny" style={{ marginBottom: 6 }}>
            <span className="muted">
              Progreso de división:{' '}
              <strong style={{ color: '#fff' }}>{Math.round(rank.progress * 100)}%</strong>
            </span>
            {sim.nextLabel ? (
              <span className="num" style={{ color: sim.nextTier?.glow || tier.glow, fontWeight: 700 }}>
                Siguiente: {sim.nextLabel} ({sim.nextWeight} kg × {reps})
              </span>
            ) : (
              <span style={{ color: '#8cc0ff', fontWeight: 800 }}>★ Rango Máximo APEX Alcanzado</span>
            )}
          </div>
          <div
            style={{
              height: 8,
              borderRadius: 99,
              background: 'rgba(255,255,255,0.09)',
              overflow: 'hidden',
              padding: 1,
            }}
          >
            <motion.div
              initial={false}
              animate={{ width: `${Math.max(6, Math.round(rank.progress * 100))}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                height: '100%',
                borderRadius: 99,
                background: `linear-gradient(90deg, ${tier.color}, ${tier.glow})`,
                boxShadow: `0 0 12px ${tier.glow}`,
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Selector de Ejercicio */}
      <div className="card col gap10" style={{ padding: 14 }}>
        <div className="row between">
          <span className="tiny muted upper" style={{ fontWeight: 700 }}>
            1. Ejercicio a calcular
          </span>
          <Tap
            onClick={() => setPickerOpen(true)}
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              color: '#5893ff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Icon.Search style={{ width: 14, height: 14 }} />
            <span>Buscar entre 320</span>
          </Tap>
        </div>

        <div className="row gap12" style={{ alignItems: 'center' }}>
          <Tap onClick={() => onOpenExercise?.(ex.id)}>
            <ExerciseAnim ex={ex} size={62} rounded={14} playing />
          </Tap>
          <div className="grow" style={{ minWidth: 0 }} onClick={() => setPickerOpen(true)}>
            <div style={{ fontWeight: 800, fontSize: 16, cursor: 'pointer' }} className="ellipsis">
              {ex.name}
            </div>
            <div className="tiny muted" style={{ marginTop: 2 }}>
              {MUSCLE_ES[ex.primary[0]]} · {EQUIP_ES[ex.equipment] || ex.equipment}
            </div>
          </div>
          <Tap
            className="btn sm"
            onClick={() => setPickerOpen(true)}
            style={{ height: 36, padding: '0 12px', fontSize: 13 }}
          >
            Cambiar
          </Tap>
        </div>

        {/* Accesos rápidos a ejercicios populares */}
        <div className="hscroll" style={{ paddingTop: 2 }}>
          {POPULAR_EX_IDS.map((id) => {
            const item = EX_BY_ID[id]
            const active = id === ex.id
            return (
              <Tap
                key={id}
                className={`pill ${active ? 'active' : ''}`}
                onClick={() => setExId(id)}
                style={{ height: 30, fontSize: 12, padding: '0 11px' }}
              >
                {item.name}
              </Tap>
            )
          })}
        </div>
      </div>

      {/* Controles de Peso, Repeticiones y Series */}
      <div className="card col gap14" style={{ padding: 14 }}>
        <span className="tiny muted upper" style={{ fontWeight: 700 }}>
          2. Peso, Repeticiones y Series
        </span>

        {/* PESO (KG) */}
        <div>
          <div className="row between" style={{ marginBottom: 8 }}>
            <span className="small" style={{ fontWeight: 600 }}>
              {ex.bodyweight ? 'Lastre adicional (kg)' : 'Peso levantado (kg)'}
            </span>
            <div className="row gap6">
              {[-5, -2.5, 2.5, 5].map((d) => (
                <Tap
                  key={d}
                  onClick={() => adjustWeight(d)}
                  style={{
                    height: 30,
                    padding: '0 9px',
                    borderRadius: 8,
                    background: '#1e2028',
                    border: '1px solid #2e313d',
                    fontSize: 12,
                    fontWeight: 700,
                    color: d > 0 ? '#6aa0ff' : '#b5b6c2',
                  }}
                >
                  {d > 0 ? `+${d}` : d}
                </Tap>
              ))}
            </div>
          </div>

          <div className="row gap12" style={{ alignItems: 'center' }}>
            <input
              type="range"
              min="0"
              max="260"
              step="2.5"
              value={Math.min(260, weight)}
              onChange={(e) => setWeight(+e.target.value)}
              className="grow"
              style={{ accentColor: tier.color, height: 6 }}
            />
            <div style={{ position: 'relative', width: 92, flex: 'none' }}>
              <input
                type="number"
                inputMode="decimal"
                step="0.5"
                min="0"
                max="600"
                value={weight}
                onChange={(e) => setWeight(Math.max(0, +e.target.value || 0))}
                className="set-cell-input num"
                style={{ height: 40, paddingRight: 26, fontSize: 16, width: '100%' }}
              />
              <span
                className="tiny muted"
                style={{ position: 'absolute', right: 8, top: 12, pointerEvents: 'none', fontWeight: 700 }}
              >
                kg
              </span>
            </div>
          </div>
        </div>

        <div className="divider" />

        {/* REPETICIONES */}
        <div>
          <div className="row between" style={{ marginBottom: 8 }}>
            <span className="small" style={{ fontWeight: 600 }}>
              Repeticiones por serie
            </span>
            <div className="row gap6" style={{ alignItems: 'center' }}>
              <Tap
                onClick={() => setReps((r) => Math.max(1, r - 1))}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: '#1e2028',
                  border: '1px solid #2e313d',
                  fontWeight: 800,
                }}
              >
                −
              </Tap>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                max="100"
                value={reps}
                onChange={(e) => setReps(Math.min(100, Math.max(1, +e.target.value || 1)))}
                className="set-cell-input num"
                style={{ width: 58, height: 32, fontSize: 15 }}
              />
              <Tap
                onClick={() => setReps((r) => Math.min(100, r + 1))}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: '#1e2028',
                  border: '1px solid #2e313d',
                  fontWeight: 800,
                }}
              >
                +
              </Tap>
            </div>
          </div>

          <div className="row gap6 wrap">
            {[1, 3, 5, 6, 8, 10, 12, 15, 20].map((r) => (
              <Tap
                key={r}
                onClick={() => setReps(r)}
                style={{
                  flex: 1,
                  minWidth: 34,
                  height: 32,
                  borderRadius: 8,
                  background: reps === r ? '#2f6bff' : '#181920',
                  border: `1px solid ${reps === r ? '#5893ff' : '#282a34'}`,
                  color: reps === r ? '#fff' : '#a7a7b0',
                  fontWeight: 700,
                  fontSize: 12.5,
                }}
                className="num"
              >
                {r}
              </Tap>
            ))}
          </div>
        </div>

        <div className="divider" />

        {/* SERIES Y PESO CORPORAL */}
        <div className="row gap12 wrap">
          <div className="grow" style={{ minWidth: 155 }}>
            <div className="tiny muted" style={{ marginBottom: 6, fontWeight: 600 }}>
              Series efectivas ({sets} series)
            </div>
            <div className="row gap6">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <Tap
                  key={s}
                  onClick={() => setSets(s)}
                  className="num"
                  style={{
                    flex: 1,
                    height: 34,
                    borderRadius: 8,
                    background: sets === s ? '#fff' : '#181920',
                    color: sets === s ? '#000' : '#a7a7b0',
                    border: `1px solid ${sets === s ? '#fff' : '#282a34'}`,
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  {s}
                </Tap>
              ))}
            </div>
          </div>

          <div style={{ width: 115 }}>
            <div className="tiny muted" style={{ marginBottom: 6, fontWeight: 600 }}>
              Tu peso (kg)
            </div>
            <div className="row gap4">
              <input
                type="number"
                inputMode="decimal"
                value={bw}
                onChange={(e) => setBw(+e.target.value || 70)}
                className="set-cell-input num"
                style={{ height: 34, fontSize: 14 }}
              />
              <Tap
                onClick={() => setSex((s) => (s === 'male' ? 'female' : 'male'))}
                style={{
                  height: 34,
                  padding: '0 8px',
                  borderRadius: 8,
                  background: '#1e2028',
                  border: '1px solid #2e313d',
                  fontSize: 11.5,
                  fontWeight: 700,
                }}
                title="Cambiar sexo para baremo"
              >
                {sex === 'male' ? 'H' : 'M'}
              </Tap>
            </div>
          </div>
        </div>
      </div>

      {/* Escalera de Rangos para este Ejercicio */}
      <div className="card col gap10" style={{ padding: 14 }}>
        <div className="row between">
          <div>
            <div className="h3" style={{ fontSize: 15.5 }}>
              Marcas para cada Rango ({reps} reps · {sets} series)
            </div>
            <div className="tiny muted">Toca cualquier rango para simular ese peso</div>
          </div>
        </div>

        <div className="col gap6">
          {[...ladder].reverse().map((row) => {
            const isCur = row.isCurrent
            return (
              <Tap
                key={row.tier.id}
                onClick={() => row.weight > 0 && setWeight(row.weight)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 13,
                  background: isCur
                    ? `linear-gradient(90deg, ${row.tier.color}2e 0%, rgba(22,24,34,0.95) 100%)`
                    : 'rgba(20, 21, 26, 0.75)',
                  border: isCur ? `1.5px solid ${row.tier.color}` : '1px solid #22242c',
                  opacity: row.unlocked || isCur ? 1 : 0.78,
                  textAlign: 'left',
                }}
              >
                <div className="row gap10">
                  <RankBadge tier={row.tier} size={36} glow={isCur || row.tier.id === 'apex'} />
                  <div>
                    <div
                      className="upper"
                      style={{
                        fontWeight: 800,
                        fontSize: 14,
                        color: isCur ? '#fff' : row.tier.glow,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <span>{row.tier.name}</span>
                      {isCur && (
                        <span
                          style={{
                            fontSize: 10,
                            padding: '1px 6px',
                            borderRadius: 6,
                            background: row.tier.color,
                            color: '#000',
                            fontWeight: 900,
                          }}
                        >
                          ACTUAL {rank.division}
                        </span>
                      )}
                    </div>
                    <div className="tiny muted">
                      {row.tier.id === 'apex'
                        ? 'Top 1% Mundial'
                        : row.tier.id === 'iron'
                        ? 'Rango inicial'
                        : `Top ${row.tier.top}% · 1RM ~${row.e1rm} kg`}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="num" style={{ fontWeight: 900, fontSize: 15, color: '#fff' }}>
                    {row.tier.id === 'iron' ? 'Cualquier peso' : `${row.weight} kg × ${reps}`}
                  </div>
                  <div className="tiny dim num">
                    {row.tier.id !== 'iron' && `${sets} series`}
                  </div>
                </div>
              </Tap>
            )
          })}
        </div>
      </div>

      {/* Modal para elegir entre los 320 ejercicios */}
      <Sheet open={pickerOpen} onClose={() => setPickerOpen(false)} title="Elegir ejercicio para calcular" full>
        <div className="col gap12">
          <input
            className="field"
            placeholder="Buscar ejercicio (ej. Banca, Sentadilla, Dominadas...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="hscroll">
            <Tap
              className={`pill ${muscleFilter === 'all' ? 'active' : ''}`}
              onClick={() => setMuscleFilter('all')}
            >
              Todos (320)
            </Tap>
            {Object.entries(MUSCLE_ES).map(([k, label]) => (
              <Tap
                key={k}
                className={`pill ${muscleFilter === k ? 'active' : ''}`}
                onClick={() => setMuscleFilter(k)}
              >
                {label}
              </Tap>
            ))}
          </div>

          <div className="col">
            {filteredCatalog.slice(0, 80).map((item) => (
              <Tap
                key={item.id}
                onClick={() => {
                  setExId(item.id)
                  setPickerOpen(false)
                }}
                className="list-row"
                style={{ borderBottom: '1px solid var(--line)', textAlign: 'left' }}
              >
                <ExerciseAnim ex={item} size={50} rounded={12} playing={false} />
                <div className="grow">
                  <div style={{ fontWeight: 700, fontSize: 14.5 }}>{item.name}</div>
                  <div className="tiny muted">
                    {MUSCLE_ES[item.primary[0]]} · {EQUIP_ES[item.equipment] || item.equipment}
                  </div>
                </div>
                {item.id === ex.id && (
                  <span className="pill active" style={{ height: 28, fontSize: 12 }}>
                    Elegido
                  </span>
                )}
              </Tap>
            ))}
          </div>
        </div>
      </Sheet>
    </div>
  )
}
