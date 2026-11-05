import React from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ApexLogo, Icon, RankBadge } from './Icons'
import { TIERS } from '../lib/ranks'
import { sfx } from '../lib/fx'
import { useStore, DEFAULT_API_KEY } from '../store'

export function Tap({ children, onClick, className = '', style, scale = 0.96, disabled, as = 'button', ...rest }) {
  const Comp = motion[as] || motion.button
  return (
    <Comp
      whileTap={disabled || scale === 1 ? undefined : { scale }}
      transition={{ type: 'spring', stiffness: 520, damping: 28 }}
      onClick={(e) => {
        if (disabled) return
        sfx.tap()
        onClick?.(e)
      }}
      disabled={disabled}
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </Comp>
  )
}

export function AppHeader({ onOpenGuide, onOpenSettings, onOpenCalc, rightExtra }) {
  return (
    <header className="app-header">
      <ApexLogo />
      <div className="row gap4">
        {rightExtra}
        {onOpenCalc && (
          <Tap
            className="icon-btn"
            onClick={onOpenCalc}
            aria-label="Calculadora de rango"
            title="Calculadora de Rango"
            style={{ color: '#78adff' }}
          >
            <Icon.Calculator />
          </Tap>
        )}
        {onOpenGuide && (
          <Tap className="icon-btn" onClick={onOpenGuide} aria-label="Guía de rangos">
            <Icon.Book />
          </Tap>
        )}
        {onOpenSettings && (
          <Tap className="icon-btn" onClick={onOpenSettings} aria-label="Ajustes">
            <Icon.Gear />
          </Tap>
        )}
      </div>
    </header>
  )
}

export function Segmented({ options, value, onChange, id = 'seg' }) {
  return (
    <div className="seg">
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            className={active ? 'on' : ''}
            onClick={() => {
              sfx.tap()
              onChange(opt.value)
            }}
          >
            {active && (
              <motion.span
                layoutId={id}
                className="seg-thumb"
                transition={{ type: 'spring', stiffness: 480, damping: 34 }}
              />
            )}
            <span className="ellipsis" style={{ display: 'block', padding: '0 4px' }}>
              {opt.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function Sheet({ open, onClose, title, children, footer, full = false }) {
  if (typeof document === 'undefined') return null
  const portalTarget = document.getElementById('app-root') || document.body

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 170,
            pointerEvents: 'auto',
            overflow: 'hidden',
          }}
        >
          {/* Solid + blurred backdrop so background content never bleeds or scrolls */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'absolute',
              inset: 0,
              background: full ? 'rgba(4, 5, 10, 0.94)' : 'rgba(4, 5, 10, 0.82)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              touchAction: 'none',
            }}
          />
          <motion.div
            initial={{ y: '100%', opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.6 }}
            transition={{ type: 'spring', stiffness: 410, damping: 38 }}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: full ? 'calc(100% - var(--safe-t) - 6px)' : 'auto',
              maxHeight: full ? 'calc(100% - var(--safe-t) - 6px)' : '88%',
              background: '#0d0e14',
              borderTop: '1px solid #2c2e3a',
              borderRadius: '24px 24px 0 0',
              display: 'flex',
              flexDirection: 'column',
              paddingBottom: 'var(--safe-b)',
              boxShadow: '0 -20px 60px rgba(0,0,0,0.9)',
              overflow: 'hidden',
            }}
          >
            {/* Pinned Sheet Header */}
            <div
              style={{
                padding: '10px 18px 12px',
                borderBottom: '1px solid var(--line)',
                background: '#0d0e14',
                flex: 'none',
                zIndex: 2,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 4,
                  borderRadius: 99,
                  background: '#343644',
                  margin: '0 auto 10px',
                }}
              />
              <div className="row between">
                <h3 className="h3 ellipsis" style={{ paddingRight: 8 }}>
                  {title}
                </h3>
                <Tap className="icon-btn" onClick={onClose} style={{ width: 36, height: 36, background: '#181922' }}>
                  <Icon.Close style={{ width: 19, height: 19 }} />
                </Tap>
              </div>
            </div>

            {/* Isolated Scrollable Sheet Body */}
            <div
              className="no-scrollbar"
              style={{
                overflowY: 'auto',
                overflowX: 'hidden',
                overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch',
                padding: '16px 18px 28px',
                flex: 1,
                background: '#0d0e14',
              }}
            >
              {children}
            </div>

            {/* Optional Pinned Footer */}
            {footer && (
              <div
                style={{
                  padding: '12px 18px 14px',
                  borderTop: '1px solid var(--line)',
                  background: '#0d0e14',
                  flex: 'none',
                  zIndex: 2,
                }}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    portalTarget
  )
}

export function RankGuideModal({ open, onClose }) {
  return (
    <Sheet open={open} onClose={onClose} title="Jerarquía Épica de Rangos" full>
      <p className="small muted" style={{ lineHeight: 1.5, marginBottom: 16 }}>
        Cada ejercicio que registras calcula tu <strong style={{ color: '#fff' }}>1RM estimado</strong> escalado a tu
        peso corporal y sexo. Los rangos se dividen en 9 ligas (con divisiones III → II → I) y se combinan en 4
        niveles: <strong style={{ color: '#fff' }}>Ejercicio → Músculo → Grupo → Rango Global</strong> (se desbloquea
        al clasificar 10 ejercicios).
      </p>
      <div className="col gap10">
        {[...TIERS].reverse().map((t) => (
          <div
            key={t.id}
            className="card row between"
            style={{
              padding: '12px 14px',
              borderColor: `${t.color}55`,
              background: `linear-gradient(95deg, ${t.color}22 0%, #111218 72%)`,
              boxShadow: t.id === 'apex' ? `0 0 24px ${t.color}33` : undefined,
            }}
          >
            <div className="row gap12">
              <RankBadge tier={t} size={46} glow={t.id === 'apex' || t.id === 'amethyst' || t.id === 'diamond'} />
              <div>
                <div style={{ fontWeight: 900, color: t.glow, fontSize: 15.5 }} className="upper">
                  {t.name} {t.id !== 'iron' && '· III / II / I'}
                </div>
                <div className="tiny" style={{ color: '#d0d2dc', fontWeight: 600 }}>
                  {t.title}
                </div>
                <div className="tiny muted">
                  {t.id === 'apex'
                    ? 'Élite mundial · Top 1% de atletas'
                    : t.id === 'iron'
                    ? 'Rango inicial al registrar tu primera serie'
                    : `Supera al ${100 - t.top}% de levantadores`}
                </div>
              </div>
            </div>
            <span
              className="chip num"
              style={{
                background: `${t.color}28`,
                color: t.glow,
                border: `1px solid ${t.color}66`,
                fontWeight: 900,
                padding: '4px 10px',
              }}
            >
              {t.id === 'apex' ? 'TOP 1%' : `TOP ${t.top}%`}
            </span>
          </div>
        ))}
      </div>
    </Sheet>
  )
}

export function SettingsModal({ open, onClose, showToast }) {
  const profile = useStore((s) => s.profile)
  const settings = useStore((s) => s.settings)
  const setProfile = useStore((s) => s.setProfile)
  const setSettings = useStore((s) => s.setSettings)
  const resetAll = useStore((s) => s.resetAll)

  return (
    <Sheet open={open} onClose={onClose} title="Ajustes y Perfil" full>
      <div className="col gap16">
        <div className="card col gap12">
          <div className="row between">
            <span className="h3">IA · Google API Key</span>
            <span className="chip" style={{ color: settings.apiKey ? '#2fd571' : '#f0c13e' }}>
              {settings.apiKey ? 'Activa por defecto' : 'Sin clave'}
            </span>
          </div>
          <p className="tiny muted" style={{ lineHeight: 1.45 }}>
            Clave predeterminada configurada para Escaneo Corporal IA y generador de planes con{' '}
            <code>gemini-3.8-flash</code>.
          </p>
          <input
            type="text"
            className="field"
            placeholder="AQ.Ab8RN6LD..."
            value={settings.apiKey || ''}
            onChange={(e) => setSettings({ apiKey: e.target.value.trim() })}
            style={{ fontSize: 13 }}
          />
          {settings.apiKey !== DEFAULT_API_KEY && (
            <Tap
              className="btn sm"
              onClick={() => {
                setSettings({ apiKey: DEFAULT_API_KEY })
                showToast?.('API Key predeterminada restaurada')
              }}
            >
              Restaurar API Key predeterminada
            </Tap>
          )}
        </div>

        <div className="card col gap12">
          <span className="h3">Datos corporales (escalado de rangos)</span>
          <div className="row gap10 wrap">
            <div className="grow" style={{ minWidth: 140 }}>
              <div className="label">Nombre</div>
              <input
                className="field"
                placeholder="Tu nombre"
                value={profile.name}
                onChange={(e) => setProfile({ name: e.target.value })}
              />
            </div>
            <div style={{ width: 148 }}>
              <div className="label">Sexo</div>
              <Segmented
                id="sex-seg"
                value={profile.sex}
                onChange={(sex) => setProfile({ sex })}
                options={[
                  { value: 'male', label: 'Hombre' },
                  { value: 'female', label: 'Mujer' },
                ]}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            <div>
              <div className="label">Peso ({profile.unit})</div>
              <input
                type="number"
                className="field num"
                value={profile.bodyweight}
                onChange={(e) => setProfile({ bodyweight: +e.target.value || 70 })}
              />
            </div>
            <div>
              <div className="label">Altura (cm)</div>
              <input
                type="number"
                className="field num"
                value={profile.height}
                onChange={(e) => setProfile({ height: +e.target.value || 175 })}
              />
            </div>
            <div>
              <div className="label">Edad</div>
              <input
                type="number"
                className="field num"
                value={profile.age}
                onChange={(e) => setProfile({ age: +e.target.value || 25 })}
              />
            </div>
          </div>
        </div>

        <div className="card col gap12">
          <span className="h3">Preferencias de entrenamiento</span>
          <div className="col gap8">
            <span className="small muted">Descanso por defecto</span>
            <div className="row gap6">
              {[60, 90, 120, 180].map((sec) => (
                <Tap
                  key={sec}
                  className={`pill grow center ${settings.restDefault === sec ? 'active' : ''}`}
                  onClick={() => setSettings({ restDefault: sec })}
                >
                  {sec}s
                </Tap>
              ))}
            </div>
          </div>
          <div className="row between" style={{ paddingTop: 4 }}>
            <span className="small">Efectos de sonido</span>
            <Tap
              className={`pill ${settings.sound ? 'active' : ''}`}
              onClick={() => setSettings({ sound: !settings.sound })}
            >
              {settings.sound ? 'Activados' : 'Silencio'}
            </Tap>
          </div>
          <div className="row between">
            <span className="small">Vibración háptica</span>
            <Tap
              className={`pill ${settings.haptics ? 'active' : ''}`}
              onClick={() => setSettings({ haptics: !settings.haptics })}
            >
              {settings.haptics ? 'Activada' : 'Desactivada'}
            </Tap>
          </div>
        </div>

        <div className="row gap10">
          <Tap
            className="btn danger block"
            onClick={() => {
              resetAll()
              showToast?.('Datos reiniciados a cero')
              onClose()
            }}
          >
            Reiniciar todos los datos
          </Tap>
        </div>
      </div>
    </Sheet>
  )
}
