import React, { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { EX_BY_ID, MUSCLE_ES, EQUIP_ES, LEVEL_ES } from '../data/exercises'
import { e1rm, perfRatio, rankFromZ, zFromRatio } from '../lib/ranks'
import { ExerciseAnim } from '../components/ExerciseAnim'
import { RankCalculator } from '../components/RankCalculator'
import { Icon, RankBadge } from '../components/Icons'
import { Tap, Segmented } from '../components/UI'
import { useStore } from '../store'

export function ExerciseDetail({ exId, onBack, onStartWithExercise }) {
  const ex = EX_BY_ID[exId]
  const workouts = useStore((s) => s.workouts)
  const profile = useStore((s) => s.profile)
  const [tab, setTab] = useState('technique') // 'technique' | 'progress' | 'calc'
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)

  const stats = useMemo(() => {
    if (!ex) return null
    const sessions = []
    let best1RM = 0
    let bestSet = null
    let bestSessionVol = 0

    for (const w of workouts) {
      const item = w.exercises.find((e) => e.exId === ex.id)
      if (!item) continue
      const done = item.sets.filter((s) => s.done && s.r > 0)
      if (!done.length) continue
      let sMaxW = 0
      let sBest1RM = 0
      let sBestSet = done[0]
      let sVol = 0
      for (const s of done) {
        const est = e1rm(s.w || 0, s.r)
        sVol += (s.w || 0) * s.r
        if ((s.w || 0) >= sMaxW) sMaxW = s.w || 0
        if (est >= sBest1RM) {
          sBest1RM = est
          sBestSet = s
        }
      }
      if (sBest1RM >= best1RM) {
        best1RM = sBest1RM
        bestSet = sBestSet
      }
      if (sVol > bestSessionVol) bestSessionVol = sVol
      const rank = rankFromZ(zFromRatio(perfRatio(ex, sBestSet, profile)))
      sessions.push({
        date: w.end || w.start,
        maxW: sMaxW,
        e1rm: Math.round(sBest1RM),
        bestSet: sBestSet,
        vol: Math.round(sVol),
        rank,
        sets: done,
      })
    }

    if (!sessions.length) {
      return {
        hasData: false,
        sessions: [],
        pts: [],
        pct: 0,
        pr1RM: 0,
        prSet: null,
        prVol: 0,
        currentRank: null,
      }
    }

    const pts = sessions.length >= 2 ? sessions.slice(-4) : [sessions[0], sessions[0]]
    const first = pts[0]
    const last = pts[pts.length - 1]
    const pct =
      first.maxW > 0 && sessions.length >= 2
        ? Math.round(((last.maxW - first.maxW) / first.maxW) * 100)
        : 0

    return {
      hasData: true,
      sessions,
      pts,
      first,
      last,
      pct,
      pr1RM: Math.round(best1RM),
      prSet: bestSet,
      prVol: Math.round(bestSessionVol),
      currentRank: last.rank,
    }
  }, [ex, workouts, profile])

  if (!ex) return null

  const W = 320, H = 135
  let dLine = ''
  let dArea = ''
  let coords = []
  if (stats.hasData) {
    const vals = stats.pts.map((p) => p.maxW || p.e1rm || 1)
    const minV = Math.min(...vals) * 0.9
    const maxV = Math.max(...vals) * 1.04 + 1
    coords = vals.map((v, i) => {
      const x = 18 + (i / Math.max(1, vals.length - 1)) * (W - 36)
      const y = H - 12 - ((v - minV) / (maxV - minV)) * (H - 36)
      return [x, y]
    })
    dLine = `M ${coords[0][0]} ${coords[0][1]}`
    for (let i = 1; i < coords.length; i++) {
      const [x0, y0] = coords[i - 1]
      const [x1, y1] = coords[i]
      const cx = (x0 + x1) / 2
      dLine += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`
    }
    dArea = `${dLine} L ${coords[coords.length - 1][0]} ${H} L ${coords[0][0]} ${H} Z`
  }

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 400, damping: 38 }}
      className="layer"
      style={{ zIndex: 90, background: '#000' }}
    >
      <div className="scroll">
        <div className="page" style={{ paddingBottom: 48 }}>
          {/* Barra superior */}
          <div className="row between" style={{ marginBottom: 12, gap: 8 }}>
            <Tap className="icon-btn" onClick={onBack} aria-label="Volver">
              <Icon.ChevronLeft />
            </Tap>
            <div className="grow">
              <Segmented
                id="ex-detail-seg"
                value={tab}
                onChange={setTab}
                options={[
                  { value: 'technique', label: 'Técnica' },
                  { value: 'progress', label: 'Progreso' },
                  { value: 'calc', label: 'Calcular' },
                ]}
              />
            </div>
          </div>

          {tab === 'technique' ? (
            /* Sección de Técnica en castellano, limpia sin textos superpuestos */
            <div className="col gap16">
              <div>
                <h1 className="h2" style={{ marginBottom: 6 }}>
                  {ex.name}
                </h1>
                <div className="row gap8 wrap">
                  <span className="chip">{MUSCLE_ES[ex.primary[0]]}</span>
                  <span className="chip">{EQUIP_ES[ex.equipment] || ex.equipment}</span>
                  <span className="chip">{LEVEL_ES[ex.level] || ex.level}</span>
                </div>
              </div>

              <div
                style={{
                  position: 'relative',
                  borderRadius: 22,
                  overflow: 'hidden',
                  border: '1px solid var(--line-2)',
                }}
              >
                <ExerciseAnim
                  ex={ex}
                  height={280}
                  rounded={0}
                  playing={playing}
                  speed={speed}
                  showMuscle
                  showPhase
                  onClick={() => setPlaying((p) => !p)}
                />
                {onStartWithExercise && (
                  <Tap
                    className="pill"
                    onClick={() => onStartWithExercise(ex.id)}
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: 'rgba(47,107,255,0.92)',
                      borderColor: '#6aa0ff',
                      fontWeight: 700,
                      fontSize: 12.5,
                    }}
                  >
                    <Icon.Play style={{ width: 13, height: 13 }} /> Entrenar este ejercicio
                  </Tap>
                )}
              </div>

              {/* Controles de reproducción */}
              <div className="row center gap12">
                <Tap
                  className="pill"
                  onClick={() => setSpeed((s) => (s === 0.6 ? 1 : 0.6))}
                >
                  {speed === 0.6 ? '0.6× Cámara lenta' : '1.0× Velocidad normal'}
                </Tap>
                <Tap
                  className="pill"
                  onClick={() => setPlaying((p) => !p)}
                >
                  {playing ? 'Pausar animación' : 'Reproducir animación'}
                </Tap>
              </div>

              {/* Ejecución paso a paso en castellano */}
              <div className="card col gap12">
                <span className="h3">Ejecución paso a paso</span>
                {ex.instructions.map((step, i) => (
                  <div key={i} className="row gap12" style={{ alignItems: 'flex-start' }}>
                    <span
                      className="num"
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: 'var(--blue-soft)',
                        color: '#8ab4ff',
                        fontSize: 12,
                        fontWeight: 800,
                        display: 'grid',
                        placeItems: 'center',
                        flex: 'none',
                        marginTop: 1,
                      }}
                    >
                      {i + 1}
                    </span>
                    <p className="small muted" style={{ lineHeight: 1.5 }}>
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : tab === 'progress' ? (
            /* Sección de Progreso y Récords */
            <div className="col gap16">
              <ExerciseAnim
                ex={ex}
                height={220}
                rounded={20}
                playing={playing}
                speed={speed}
                showMuscle
                showPhase
                onClick={() => setPlaying((p) => !p)}
              />

              <div>
                <h1 className="h2" style={{ marginBottom: 6 }}>
                  {ex.name}
                </h1>
                <div className="row gap8 wrap">
                  <span className="chip">{MUSCLE_ES[ex.primary[0]]}</span>
                  <span className="chip">{EQUIP_ES[ex.equipment] || ex.equipment}</span>
                  <span className="chip">{LEVEL_ES[ex.level] || ex.level}</span>
                </div>
              </div>

              {stats.hasData ? (
                <div
                  className="card"
                  style={{
                    padding: '18px 16px 16px',
                    background:
                      'radial-gradient(circle at 88% 32%, rgba(47, 213, 113, 0.22) 0%, rgba(16,18,22,0.95) 58%)',
                  }}
                >
                  <div className="tiny muted" style={{ marginBottom: 4 }}>
                    Récord Personal (1RM estimado)
                  </div>
                  <div className="row gap8" style={{ alignItems: 'baseline', marginBottom: 12 }}>
                    <span style={{ fontSize: 28, fontWeight: 800 }} className="num">
                      {stats.pr1RM} kg
                    </span>
                    {stats.pct !== 0 && (
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: 99,
                          fontSize: 12,
                          fontWeight: 800,
                          background: 'rgba(47,213,113,0.18)',
                          color: '#2fd571',
                        }}
                      >
                        {stats.pct > 0 ? `+${stats.pct}% ↑` : `${stats.pct}%`}
                      </span>
                    )}
                  </div>

                  <div style={{ position: 'relative', paddingTop: 42 }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: 4,
                        top: Math.max(0, coords[0][1] - 26),
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <span style={{ fontWeight: 800, fontSize: 16, color: '#ff7b7b' }} className="num">
                        {stats.first.maxW} kg
                      </span>
                      <RankBadge tier={stats.first.rank?.tier || 'iron'} size={36} />
                    </div>

                    <div
                      style={{
                        position: 'absolute',
                        right: 4,
                        top: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      <span style={{ fontWeight: 800, fontSize: 18, color: '#4dff93' }} className="num">
                        {stats.last.maxW} kg
                      </span>
                      <RankBadge tier={stats.last.rank?.tier || 'iron'} size={42} glow />
                    </div>

                    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="145" style={{ overflow: 'visible' }}>
                      <defs>
                        <linearGradient id="prGradFill" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#ef3b4a" stopOpacity="0.88" />
                          <stop offset="48%" stopColor="#e5a93c" stopOpacity="0.85" />
                          <stop offset="100%" stopColor="#2fd571" stopOpacity="0.92" />
                        </linearGradient>
                        <linearGradient id="prGradStroke" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#ff6b78" />
                          <stop offset="50%" stopColor="#ffd36a" />
                          <stop offset="100%" stopColor="#5bff9d" />
                        </linearGradient>
                      </defs>
                      <motion.path d={dArea} fill="url(#prGradFill)" />
                      <motion.path
                        d={dLine}
                        fill="none"
                        stroke="url(#prGradStroke)"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              ) : (
                <div className="card col center gap10" style={{ padding: 28, textAlign: 'center' }}>
                  <RankBadge tier="iron" size={44} />
                  <div className="h3">Sin datos registrados aún</div>
                  <p className="small muted">
                    Completa tu primera serie de este ejercicio para desbloquear su rango y gráfica de progreso.
                  </p>
                  {onStartWithExercise && (
                    <Tap className="btn primary sm" onClick={() => onStartWithExercise(ex.id)}>
                      <Icon.Play style={{ width: 13, height: 13 }} /> Registrar ahora
                    </Tap>
                  )}
                </div>
              )}

              <div className="card col gap12">
                <div className="row gap8">
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 7,
                      background: 'rgba(240,193,62,0.18)',
                      color: '#f0c13e',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 13,
                    }}
                  >
                    🏅
                  </span>
                  <span className="h3">Tus récords personales (PRs)</span>
                </div>

                <div className="row between" style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                  <span className="muted small">Mejor serie (Peso × Reps)</span>
                  <span style={{ fontWeight: 700 }} className="num">
                    {stats.prSet ? `${stats.prSet.w} kg × ${stats.prSet.r}` : '—'}
                  </span>
                </div>
                <div className="row between" style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                  <span className="muted small">Volumen máximo en sesión</span>
                  <span style={{ fontWeight: 700 }} className="num">
                    {stats.prVol ? `${stats.prVol} kg` : '—'}
                  </span>
                </div>
                <div className="row between" style={{ padding: '8px 0' }}>
                  <span className="muted small">1RM Estimado (Repetición Máxima)</span>
                  <span style={{ fontWeight: 700 }} className="num">
                    {stats.pr1RM ? `${stats.pr1RM} kg` : '—'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <RankCalculator initialExId={ex.id} />
          )}
        </div>
      </div>
    </motion.div>
  )
}
