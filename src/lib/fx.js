// Lightweight synthesized sound effects (Web Audio API) + haptics + canvas confetti
import { useStore } from '../store'

let ctx = null
const getCtx = () => {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (AC) ctx = new AC()
  }
  if (ctx?.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

export function haptic(ms = 12) {
  try {
    if (useStore.getState().settings?.haptics && navigator.vibrate) navigator.vibrate(ms)
  } catch {}
}

function tone(freq, dur = 0.08, type = 'sine', gain = 0.08, delay = 0) {
  if (!useStore.getState().settings?.sound) return
  const c = getCtx()
  if (!c) return
  const t0 = c.currentTime + delay
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g).connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + dur + 0.01)
}

export const sfx = {
  tap() {
    haptic(8)
    tone(520, 0.035, 'triangle', 0.04)
  },
  check() {
    haptic([15, 30, 20])
    tone(587.33, 0.09, 'sine', 0.09, 0)
    tone(880, 0.14, 'sine', 0.1, 0.055)
  },
  uncheck() {
    haptic(10)
    tone(420, 0.07, 'sine', 0.05)
  },
  timerDone() {
    haptic([40, 60, 40, 60, 80])
    tone(784, 0.12, 'triangle', 0.12, 0)
    tone(987.77, 0.12, 'triangle', 0.12, 0.13)
    tone(1174.66, 0.25, 'triangle', 0.14, 0.26)
  },
  rankUp() {
    haptic([30, 40, 30, 40, 90])
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]
    notes.forEach((n, i) => tone(n, 0.22, 'triangle', 0.11, i * 0.08))
  },
}

export function burstConfetti(color = '#2f6bff') {
  if (typeof document === 'undefined') return
  const c = document.createElement('canvas')
  c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999'
  c.width = window.innerWidth * devicePixelRatio
  c.height = window.innerHeight * devicePixelRatio
  document.body.appendChild(c)
  const g = c.getContext('2d')
  g.scale(devicePixelRatio, devicePixelRatio)
  const W = window.innerWidth, H = window.innerHeight
  const palette = [color, '#3d7bff', '#2fd571', '#f0c13e', '#9fd3ff', '#ffffff']
  const parts = Array.from({ length: 65 }, () => {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.4
    const sp = 6 + Math.random() * 10
    return {
      x: W / 2, y: H * 0.45,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 2,
      s: 5 + Math.random() * 6,
      r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.25,
      col: palette[(Math.random() * palette.length) | 0],
      alpha: 1,
    }
  })
  let f = 0
  const tick = () => {
    f++
    g.clearRect(0, 0, W, H)
    for (const p of parts) {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.28
      p.vx *= 0.99
      p.r += p.vr
      p.alpha = Math.max(0, 1 - f / 75)
      g.save()
      g.globalAlpha = p.alpha
      g.translate(p.x, p.y)
      g.rotate(p.r)
      g.fillStyle = p.col
      g.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6)
      g.restore()
    }
    if (f < 75) requestAnimationFrame(tick)
    else c.remove()
  }
  requestAnimationFrame(tick)
}
