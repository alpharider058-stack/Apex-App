import React, { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { EX_BY_ID } from '../data/exercises'
import { computeRanks, TIER_BY_ID } from '../lib/ranks'
import { ExerciseAnim } from '../components/ExerciseAnim'
import { Icon, RankBadge } from '../components/Icons'
import { AppHeader, Tap, Sheet } from '../components/UI'
import { useStore } from '../store'

function renderMentions(text = '') {
  const parts = text.split(/(@[\w_]+)/g)
  return parts.map((p, i) =>
    p.startsWith('@') ? (
      <span key={i} style={{ color: '#61a0ff', fontWeight: 700 }}>
        {p}
      </span>
    ) : (
      p
    )
  )
}

export function HomeView({ onStartQuick, onOpenExercise, onOpenGuide, onOpenSettings, onOpenCalc }) {
  const workouts = useStore((s) => s.workouts)
  const profile = useStore((s) => s.profile)
  const updateWorkout = useStore((s) => s.updateWorkout)

  const [streakOpen, setStreakOpen] = useState(false)
  const [commentFor, setCommentFor] = useState(null)
  const [commentText, setCommentText] = useState('')

  const ranks = useMemo(() => computeRanks(workouts, profile), [workouts, profile])
  const feed = useMemo(() => [...workouts].reverse(), [workouts])
  const streakWeeks = workouts.length > 0 ? Math.max(1, Math.ceil(workouts.length / 3)) : 0

  const handleAddComment = (w) => {
    if (!commentText.trim()) return
    const next = [...(w.comments || []), { id: String(Date.now()), user: profile.name || 'Tú', text: commentText.trim() }]
    updateWorkout(w.id, { comments: next })
    setCommentText('')
    setCommentFor(null)
  }

  return (
    <div className="scroll tab-pad">
      <div className="page">
        <AppHeader
          onOpenGuide={onOpenGuide}
          onOpenSettings={onOpenSettings}
          onOpenCalc={onOpenCalc}
          rightExtra={
            <Tap
              onClick={() => setStreakOpen(true)}
              className="pill"
              style={{
                height: 32,
                padding: '0 10px',
                background: 'rgba(255, 138, 36, 0.12)',
                borderColor: 'rgba(255, 138, 36, 0.3)',
                color: '#ff9e44',
                fontWeight: 800,
                fontSize: 12,
              }}
            >
              <Icon.Flame style={{ width: 14, height: 14 }} />
              <span className="num">{streakWeeks} sem</span>
            </Tap>
          }
        />

        {/* Minimalist Top Rank Card */}
        <div
          className="card col gap12"
          style={{
            marginBottom: 16,
            padding: 14,
            background: '#0d101a',
            borderColor: '#1d2230',
          }}
        >
          <div className="row between">
            <div className="row gap10">
              <RankBadge tier={ranks.global?.tier || 'iron'} size={44} glow={!!ranks.global} epic={!!ranks.global} />
              <div>
                <div className="tiny muted upper">Nivel Actual</div>
                <div className="h3 upper" style={{ color: ranks.global?.tier?.glow || '#fff' }}>
                  {ranks.global ? `${ranks.global.tier.name} ${ranks.global.division}` : 'Sin clasificar'}
                </div>
              </div>
            </div>

            <Tap
              onClick={onStartQuick}
              className="btn primary sm"
              style={{ height: 36, padding: '0 14px', fontSize: 13.5 }}
            >
              <Icon.Play style={{ width: 12, height: 12 }} />
              <span>Entrenar</span>
            </Tap>
          </div>

          <Tap
            onClick={onOpenCalc}
            style={{
              height: 34,
              borderRadius: 8,
              background: 'rgba(47, 107, 255, 0.08)',
              border: '1px solid rgba(75, 135, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              fontSize: 12.5,
              fontWeight: 700,
              color: '#8bb6ff',
            }}
          >
            <Icon.Calculator style={{ width: 14, height: 14 }} />
            <span>Calculadora de Rango</span>
          </Tap>
        </div>

        {/* Feed de entrenamientos */}
        {feed.length === 0 ? (
          <div className="card col center gap12" style={{ padding: 28, textAlign: 'center', background: '#0d101a' }}>
            <RankBadge tier="apex" size={54} glow epic />
            <div className="h3">Sin entrenamientos registrados</div>
            <p className="tiny muted" style={{ lineHeight: 1.4, maxWidth: 260 }}>
              Registra tu primera sesión para ver tu volumen, tiempo y subidas de rango.
            </p>
            <Tap className="btn primary sm" onClick={onStartQuick} style={{ marginTop: 4 }}>
              <Icon.Play style={{ width: 12, height: 12 }} />
              <span>Empezar entreno</span>
            </Tap>
          </div>
        ) : (
          <div className="col gap14">
            {feed.map((w, idx) => {
              const durMin = Math.max(1, Math.round(((w.end || Date.now()) - w.start) / 60000))
              const volKg = Math.round(
                w.exercises.reduce(
                  (acc, e) => acc + e.sets.reduce((sAcc, s) => sAcc + (+s.w || 0) * (+s.r || 0), 0),
                  0
                )
              )
              const fromT = w.fromTier ? TIER_BY_ID[w.fromTier] : TIER_BY_ID.iron
              const toT = w.toTier ? TIER_BY_ID[w.toTier] : null
              const dateStr = new Date(w.end || w.start).toLocaleDateString('es-ES', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })

              return (
                <motion.article
                  key={w.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="card col gap10"
                  style={{
                    padding: 14,
                    background: '#0d101a',
                    borderColor: '#1a1e2a',
                  }}
                >
                  {/* Card Header */}
                  <div className="row between">
                    <div className="row gap8">
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#9fa4b4', textTransform: 'capitalize' }}>
                        {dateStr}
                      </span>
                      <span className="dim">·</span>
                      <span className="tiny muted num">{durMin} min</span>
                      <span className="dim">·</span>
                      <span className="tiny muted num">{volKg} kg</span>
                    </div>

                    {toT && (
                      <div className="row gap4">
                        <RankBadge tier={fromT} size={20} />
                        <span style={{ color: toT.glow, fontWeight: 900, fontSize: 13 }}>→</span>
                        <RankBadge tier={toT} size={24} glow />
                      </div>
                    )}
                  </div>

                  {/* Workout Title */}
                  <div style={{ fontSize: 16, fontWeight: 800 }}>
                    {toT ? (
                      <span style={{ color: toT.glow }}>NUEVO RANGO {toT.name.toUpperCase()}</span>
                    ) : (
                      w.name
                    )}
                  </div>

                  {/* Exercise Preview Thumbnails */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {w.exercises.slice(0, 3).map((item, i) => {
                      const ex = EX_BY_ID[item.exId]
                      const topSet = item.sets.reduce(
                        (best, s) => ((+s.w || 0) > (+best.w || 0) ? s : best),
                        item.sets[0] || { w: 0, r: 0 }
                      )
                      return (
                        <Tap
                          key={i}
                          onClick={() => ex && onOpenExercise?.(ex.id)}
                          style={{
                            background: '#07090e',
                            border: '1px solid #161a26',
                            borderRadius: 12,
                            padding: 6,
                            textAlign: 'left',
                          }}
                        >
                          <ExerciseAnim ex={ex} height={72} rounded={8} playing={idx === 0} />
                          <div className="ellipsis" style={{ fontWeight: 700, fontSize: 11, marginTop: 4 }}>
                            {ex?.name}
                          </div>
                          <div className="tiny num" style={{ color: '#6aa0ff', fontWeight: 800 }}>
                            {topSet.w} kg × {topSet.r}
                          </div>
                        </Tap>
                      )
                    })}
                  </div>

                  {/* Note / Comments */}
                  {w.note && (
                    <p className="tiny muted" style={{ lineHeight: 1.35 }}>
                      {renderMentions(w.note)}
                    </p>
                  )}

                  {/* Footer Likes & Comments */}
                  <div className="row between" style={{ paddingTop: 6, borderTop: '1px solid #161924' }}>
                    <div className="row gap14">
                      <Tap
                        className="row gap4 tiny"
                        onClick={() =>
                          updateWorkout(w.id, {
                            liked: !w.liked,
                            likes: (w.likes || 0) + (w.liked ? -1 : 1),
                          })
                        }
                        style={{ color: w.liked ? '#ff4d5e' : '#8e93a0' }}
                      >
                        <Icon.Heart filled={w.liked} style={{ width: 15, height: 15 }} />
                        <span className="num">{w.likes || 0}</span>
                      </Tap>

                      <Tap
                        className="row gap4 tiny muted"
                        onClick={() => setCommentFor(commentFor === w.id ? null : w.id)}
                      >
                        <Icon.Comment style={{ width: 15, height: 15 }} />
                        <span>{w.comments?.length ? `${w.comments.length}` : 'Comentar'}</span>
                      </Tap>
                    </div>

                    <span className="tiny dim">{w.exercises.length} ejercicios</span>
                  </div>

                  {commentFor === w.id && (
                    <div className="row gap6" style={{ marginTop: 4 }}>
                      <input
                        className="field"
                        style={{ height: 34, fontSize: 12.5 }}
                        placeholder="Comentario..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(w)}
                      />
                      <Tap className="btn primary sm" onClick={() => handleAddComment(w)} style={{ height: 34, padding: '0 12px' }}>
                        Enviar
                      </Tap>
                    </div>
                  )}
                </motion.article>
              )
            })}
          </div>
        )}
      </div>

      {/* Racha Sheet */}
      <Sheet open={streakOpen} onClose={() => setStreakOpen(false)} title="🔥 Racha Semanal">
        <div className="col center gap12" style={{ textAlign: 'center', padding: '12px 0' }}>
          <div className="h1 num" style={{ color: '#ff9424' }}>{streakWeeks} Semanas</div>
          <p className="tiny muted">
            Entrena de forma continua para mantener tu racha activa.
          </p>
        </div>
      </Sheet>
    </div>
  )
}
