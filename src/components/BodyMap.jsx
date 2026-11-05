import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { anteriorData, posteriorData } from '../data/bodyPolygons'
import { MUSCLE_TO_POLY, MUSCLE_ES } from '../data/exercises'
import { RankBadge } from './Icons'

// Reverse map: polygon muscle id -> dataset muscle keys
const POLY_TO_MUSCLES = {
  chest: ['chest'],
  abs: ['abdominals'],
  obliques: ['abdominals'],
  biceps: ['biceps'],
  triceps: ['triceps'],
  forearm: ['forearms'],
  'front-deltoids': ['shoulders'],
  'back-deltoids': ['shoulders'],
  trapezius: ['traps', 'middle back'],
  'upper-back': ['lats', 'middle back'],
  'lower-back': ['lower back'],
  quadriceps: ['quadriceps'],
  hamstring: ['hamstrings'],
  gluteal: ['glutes'],
  calves: ['calves'],
  'left-soleus': ['calves'],
  'right-soleus': ['calves'],
  adductor: ['adductors'],
  abductors: ['abductors'],
  neck: ['neck'],
}

export function BodyMap({
  side = 'anterior',
  muscleRanks = {},
  primary = [],
  secondary = [],
  selectedMuscle = null,
  onSelectMuscle,
  showCallouts = false,
  height = 360,
  crop = 'full', // 'full' | 'upper' | 'lower'
  style,
}) {
  const polys = side === 'posterior' ? posteriorData : anteriorData

  const priPoly = new Set(primary.flatMap((m) => MUSCLE_TO_POLY[m] || [m]))
  const secPoly = new Set(secondary.flatMap((m) => MUSCLE_TO_POLY[m] || [m]))

  const getRankForPoly = (polyMuscle) => {
    const candidates = POLY_TO_MUSCLES[polyMuscle] || []
    let best = null
    for (const m of candidates) {
      const r = muscleRanks[m]
      if (r && (!best || r.score > best.score)) best = { ...r, muscle: m }
    }
    return best
  }

  const getFill = (polyMuscle) => {
    if (polyMuscle === 'head' || polyMuscle === 'knees') return '#4b505c'
    if (priPoly.size || secPoly.size) {
      if (priPoly.has(polyMuscle)) return '#2f6bff'
      if (secPoly.has(polyMuscle)) return '#9fd3ff'
      return '#2a2d35'
    }
    const r = getRankForPoly(polyMuscle)
    if (r) return r.tier.color
    return '#434854'
  }

  const viewBox =
    crop === 'upper' ? '8 2 84 115' : crop === 'lower' ? '12 82 76 116' : '0 0 100 205'

  const calloutDefs =
    side === 'anterior'
      ? [
          { pos: 'tl', poly: 'chest', y: 49, xTarget: 36 },
          { pos: 'tr', poly: 'front-deltoids', y: 46, xTarget: 70 },
          { pos: 'bl', poly: 'quadriceps', y: 122, xTarget: 39 },
          { pos: 'br', poly: 'calves', y: 164, xTarget: 60 },
        ]
      : [
          { pos: 'tl', poly: 'upper-back', y: 52, xTarget: 38 },
          { pos: 'tr', poly: 'triceps', y: 58, xTarget: 73 },
          { pos: 'bl', poly: 'hamstring', y: 126, xTarget: 40 },
          { pos: 'br', poly: 'calves', y: 162, xTarget: 60 },
        ]

  const callouts = showCallouts
    ? calloutDefs.map((c) => ({ ...c, rank: getRankForPoly(c.poly) })).filter((c) => c.rank)
    : []

  return (
    <div
      style={{
        position: 'relative',
        height,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      {/* Ambient blue aura behind the torso */}
      {showCallouts && (
        <div
          style={{
            position: 'absolute',
            width: '72%',
            height: '72%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(47,107,255,0.24) 0%, rgba(47,107,255,0) 70%)',
            pointerEvents: 'none',
          }}
        />
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.svg
          key={side}
          initial={showCallouts ? { opacity: 0.25, scale: 0.96 } : false}
          animate={{ opacity: 1, scale: 1 }}
          exit={showCallouts ? { opacity: 0.25, scale: 0.96 } : undefined}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          viewBox={viewBox}
          style={{
            height: '100%',
            width: 'auto',
            maxWidth: '100%',
            overflow: 'visible',
            filter: 'drop-shadow(0 10px 26px rgba(0,0,0,0.68))',
          }}
        >
          {/* Callout connector lines */}
          {callouts.map((c) => {
            const isLeft = c.pos.endsWith('l')
            const xEdge = isLeft ? 8 : 92
            return (
              <g key={c.pos}>
                <line
                  x1={xEdge}
                  y1={c.y}
                  x2={c.xTarget}
                  y2={c.y}
                  stroke={c.rank.tier.color}
                  strokeWidth="1.2"
                  strokeOpacity="0.85"
                />
                <circle cx={c.xTarget} cy={c.y} r="1.8" fill={c.rank.tier.glow} />
              </g>
            )
          })}

          {polys.map((group) => {
            const fill = getFill(group.muscle)
            const candidates = POLY_TO_MUSCLES[group.muscle] || []
            const isSelected = selectedMuscle && candidates.includes(selectedMuscle)
            return (
              <g
                key={group.muscle}
                onClick={() => {
                  if (onSelectMuscle && candidates[0]) onSelectMuscle(candidates[0])
                }}
                style={{ cursor: onSelectMuscle && candidates[0] ? 'pointer' : 'default' }}
              >
                {group.svgPoints.map((pts, i) => (
                  <polygon
                    key={i}
                    points={pts}
                    fill={fill}
                    stroke={isSelected ? '#ffffff' : '#090b10'}
                    strokeWidth={isSelected ? '1.3' : '0.75'}
                    strokeLinejoin="round"
                    style={{
                      transition: 'fill 320ms cubic-bezier(0.22, 1, 0.36, 1), filter 220ms ease',
                      filter: isSelected ? 'brightness(1.28)' : undefined,
                    }}
                  />
                ))}
              </g>
            )
          })}
        </motion.svg>
      </AnimatePresence>

      {/* Corner Callout Badges */}
      {callouts.map((c) => {
        const isLeft = c.pos.endsWith('l')
        const isTop = c.pos.startsWith('t')
        const mLabel = MUSCLE_ES[c.rank.muscle] || ''
        return (
          <motion.div
            key={`${side}-${c.pos}`}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            onClick={() => onSelectMuscle?.(c.rank.muscle)}
            style={{
              position: 'absolute',
              [isLeft ? 'left' : 'right']: 2,
              top: isTop ? '15%' : '66%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 900,
                letterSpacing: '0.04em',
                color: c.rank.tier.glow,
                textTransform: 'uppercase',
                textShadow: `0 0 12px ${c.rank.tier.color}88`,
              }}
            >
              {c.rank.tier.name} {c.rank.division}
            </span>
            <RankBadge tier={c.rank.tier} size={46} glow />
            <span className="tiny muted" style={{ fontSize: 10.5, fontWeight: 600 }}>
              {mLabel}
            </span>
          </motion.div>
        )
      })}
    </div>
  )
}
