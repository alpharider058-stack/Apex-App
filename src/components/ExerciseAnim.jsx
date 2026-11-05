import React, { useEffect, useState } from 'react'
import { EX_BY_ID, MUSCLE_ES } from '../data/exercises'

// Shared global beat so multiple visible thumbnails animate in sync with zero timer overhead
let phase = 0
const listeners = new Set()
let timer = null
function subscribe(fn) {
  listeners.add(fn)
  if (!timer) {
    timer = setInterval(() => {
      phase = phase === 0 ? 1 : 0
      listeners.forEach((l) => l(phase))
    }, 1050)
  }
  return () => {
    listeners.delete(fn)
    if (!listeners.size && timer) {
      clearInterval(timer)
      timer = null
    }
  }
}

export function ExerciseAnim({
  ex,
  exId,
  size = '100%',
  height,
  rounded = 16,
  playing = true,
  speed = 1,
  showPhase = false,
  showMuscle = false,
  style,
  className = '',
  onClick,
}) {
  const item = ex || EX_BY_ID[exId]
  const [f, setF] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!playing || !item) return
    if (speed === 1) return subscribe(setF)
    const id = setInterval(() => setF((p) => (p === 0 ? 1 : 0)), Math.round(1050 / speed))
    return () => clearInterval(id)
  }, [playing, speed, item?.id])

  if (!item) return null

  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        position: 'relative',
        width: size,
        height: height ?? size,
        borderRadius: rounded,
        overflow: 'hidden',
        background: 'radial-gradient(circle at 50% 45%, #1d2747 0%, #0d1018 72%, #07080c 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        flex: 'none',
        ...style,
      }}
    >
      {!loaded && <div className="shimmer" style={{ position: 'absolute', inset: 0 }} />}

      <img
        src={item.img[0]}
        alt={item.name}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: loaded ? 1 : 0,
          transform: f === 1 && playing ? 'scale(1.03)' : 'scale(1)',
          transition: 'transform 650ms cubic-bezier(0.22, 1, 0.36, 1), opacity 250ms ease',
        }}
      />
      <img
        src={item.img[1]}
        alt=""
        loading="lazy"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: loaded && f === 1 ? 1 : 0,
          transform: f === 1 && playing ? 'scale(1.03)' : 'scale(1)',
          transition: 'opacity 520ms cubic-bezier(0.22, 1, 0.36, 1), transform 650ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />

      {/* Subtle blue vignette & muscle highlight tint */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 40%, rgba(47,107,255,0.14) 0%, rgba(0,0,0,0) 60%), linear-gradient(180deg, rgba(0,0,0,0) 65%, rgba(0,0,0,0.65) 100%)',
          pointerEvents: 'none',
        }}
      />

      {showMuscle && item.primary?.[0] && (
        <div
          style={{
            position: 'absolute',
            left: 10,
            bottom: 10,
            padding: '4px 10px',
            borderRadius: 99,
            fontSize: 11.5,
            fontWeight: 700,
            background: 'rgba(15, 23, 42, 0.78)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(76, 131, 255, 0.45)',
            color: '#9fd3ff',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#2f6bff',
              boxShadow: '0 0 8px #2f6bff',
            }}
          />
          {MUSCLE_ES[item.primary[0]] || item.primary[0]}
        </div>
      )}

      {showPhase && (
        <div
          style={{
            position: 'absolute',
            right: 10,
            bottom: 10,
            padding: '4px 9px',
            borderRadius: 99,
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: '0.03em',
            background: 'rgba(10, 12, 18, 0.75)',
            color: f === 1 ? '#4dff93' : '#a7a7b0',
            border: '1px solid rgba(255,255,255,0.12)',
            transition: 'color .3s',
          }}
        >
          {f === 1 ? 'CONTRACCIÓN' : 'INICIO'}
        </div>
      )}
    </div>
  )
}
