import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { EX_BY_ID } from './data/exercises'
import { HomeView } from './screens/HomeView'
import { RoutinesView } from './screens/RoutinesView'
import { ScanView } from './screens/ScanView'
import { ProfileView } from './screens/ProfileView'
import { WorkoutSession } from './screens/WorkoutSession'
import { ExerciseDetail } from './screens/ExerciseDetail'
import { RankCalculator } from './components/RankCalculator'
import { ApexLogo, Icon, RankBadge } from './components/Icons'
import { Tap, RankGuideModal, SettingsModal, Sheet } from './components/UI'
import { TIERS } from './lib/ranks'
import { useStore } from './store'

function IntroSplash({ onFinish }) {
  const showcaseTiers = TIERS.slice(3) // Oro, Rubí, Esmeralda, Diamante, Amatista, Apex

  useEffect(() => {
    const t = setTimeout(onFinish, 1750)
    return () => clearTimeout(t)
  }, [onFinish])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.06, filter: 'blur(8px)' }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      onClick={onFinish}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 300,
        background: 'radial-gradient(circle at 50% 38%, #162858 0%, #070b18 52%, #000000 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        cursor: 'pointer',
        overflow: 'hidden',
      }}
    >
      {/* Ambient pulsing aura */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: [0.8, 1.25, 1.05], opacity: [0, 0.55, 0.35] }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,255,0.45) 0%, rgba(59,130,255,0) 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Central Apex Emblem + Wordmark */}
      <motion.div
        initial={{ scale: 0.65, opacity: 0, y: 18 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 360, damping: 24 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
          position: 'relative',
          zIndex: 2,
        }}
      >
        <motion.div
          initial={{ rotate: -12, scale: 0.7 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 20, delay: 0.08 }}
        >
          <RankBadge tier="apex" size={88} glow epic />
        </motion.div>

        <ApexLogo size={38} />

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.35 }}
          style={{
            fontSize: 11.5,
            fontWeight: 800,
            letterSpacing: '0.24em',
            color: '#8cc0ff',
            textTransform: 'uppercase',
          }}
        >
          Entrena · Clasifica · Domina
        </motion.div>
      </motion.div>

      {/* Staggered Rank Gems Showcase */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginTop: 28,
          position: 'relative',
          zIndex: 2,
        }}
      >
        {showcaseTiers.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 14, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: 0.25 + i * 0.07,
              type: 'spring',
              stiffness: 420,
              damping: 22,
            }}
          >
            <RankBadge tier={t} size={34} glow={t.id === 'apex'} />
          </motion.div>
        ))}
      </div>

      {/* Loading progress bar */}
      <div
        style={{
          width: 140,
          height: 3,
          borderRadius: 99,
          background: 'rgba(255,255,255,0.1)',
          overflow: 'hidden',
          marginTop: 28,
        }}
      >
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.45, ease: 'easeInOut' }}
          style={{
            height: '100%',
            borderRadius: 99,
            background: 'linear-gradient(90deg, #2f6bff, #8cc0ff)',
            boxShadow: '0 0 12px #3b82ff',
          }}
        />
      </div>
    </motion.div>
  )
}

export default function App() {
  const active = useStore((s) => s.active)
  const routines = useStore((s) => s.routines)
  const startWorkout = useStore((s) => s.startWorkout)
  const updateActive = useStore((s) => s.updateActive)

  const [introVisible, setIntroVisible] = useState(true)
  const [tab, setTab] = useState('profile')
  const [openExId, setOpenExId] = useState(null)
  const [guideOpen, setGuideOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [calcOpen, setCalcOpen] = useState(false)
  const [fabSheet, setFabSheet] = useState(false)
  const [celebration, setCelebration] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast((t) => (t === msg ? null : t)), 2800)
  }

  const handleFabPress = () => {
    if (active) {
      updateActive((a) => {
        a.minimized = false
        return a
      })
    } else {
      setFabSheet(true)
    }
  }

  const handleStartWithExercise = (exId) => {
    setOpenExId(null)
    startWorkout({
      name: EX_BY_ID[exId]?.name?.toUpperCase() || 'ENTRENAMIENTO',
      exercises: [{ exId, sets: 3, repMin: 8, repMax: 12, rest: 90 }],
    })
  }

  return (
    <div className="app" id="app-root">
      {/* Intro Splash Animation on App Entry */}
      <AnimatePresence>
        {introVisible && <IntroSplash onFinish={() => setIntroVisible(false)} />}
      </AnimatePresence>

      {/* Toast Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -24, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -24, x: '-50%' }}
            className="toast"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Tab Views */}
      <AnimatePresence mode="wait">
        {tab === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="layer"
          >
            <HomeView
              onStartQuick={() => setFabSheet(true)}
              onOpenExercise={setOpenExId}
              onOpenGuide={() => setGuideOpen(true)}
              onOpenSettings={() => setSettingsOpen(true)}
              onOpenCalc={() => setCalcOpen(true)}
            />
          </motion.div>
        )}

        {tab === 'routines' && (
          <motion.div
            key="routines"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="layer"
          >
            <RoutinesView
              onStartRoutine={(r) => startWorkout(r)}
              onOpenExercise={setOpenExId}
              onOpenGuide={() => setGuideOpen(true)}
              onOpenSettings={() => setSettingsOpen(true)}
              onOpenCalc={() => setCalcOpen(true)}
              showToast={showToast}
            />
          </motion.div>
        )}

        {tab === 'scan' && (
          <motion.div
            key="scan"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="layer"
          >
            <ScanView
              onOpenGuide={() => setGuideOpen(true)}
              onOpenSettings={() => setSettingsOpen(true)}
              onOpenCalc={() => setCalcOpen(true)}
              onGoRoutines={() => setTab('routines')}
              showToast={showToast}
            />
          </motion.div>
        )}

        {tab === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="layer"
          >
            <ProfileView
              onOpenExercise={setOpenExId}
              onOpenGuide={() => setGuideOpen(true)}
              onOpenSettings={() => setSettingsOpen(true)}
              onOpenCalc={() => setCalcOpen(true)}
              showToast={showToast}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Workout Logger (fullscreen or minimized pill bar) */}
      <AnimatePresence>
        {active && (
          <WorkoutSession
            onOpenExercise={setOpenExId}
            onWorkoutFinished={(res) => {
              setCelebration(res)
              setTab('home')
            }}
          />
        )}
      </AnimatePresence>

      {/* Exercise Detail & Technique Overlay */}
      <AnimatePresence>
        {openExId && (
          <ExerciseDetail
            exId={openExId}
            onBack={() => setOpenExId(null)}
            onStartWithExercise={handleStartWithExercise}
          />
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <nav className="tabbar">
        <Tap className={`tab ${tab === 'home' ? 'on' : ''}`} onClick={() => setTab('home')}>
          <Icon.Home />
          <span>Inicio</span>
          {tab === 'home' && <motion.span layoutId="tab-dot" className="tab-dot" />}
        </Tap>

        <Tap className={`tab ${tab === 'routines' ? 'on' : ''}`} onClick={() => setTab('routines')}>
          <Icon.Folder />
          <span>Planes</span>
          {tab === 'routines' && <motion.span layoutId="tab-dot" className="tab-dot" />}
        </Tap>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Tap className="fab" scale={0.9} onClick={handleFabPress} aria-label="Iniciar entrenamiento">
            <Icon.Dumbbell />
          </Tap>
        </div>

        <Tap className={`tab ${tab === 'scan' ? 'on' : ''}`} onClick={() => setTab('scan')}>
          <Icon.Scan />
          <span>Escaneo</span>
          {tab === 'scan' && <motion.span layoutId="tab-dot" className="tab-dot" />}
        </Tap>

        <Tap className={`tab ${tab === 'profile' ? 'on' : ''}`} onClick={() => setTab('profile')}>
          <Icon.User />
          <span>Perfil</span>
          {tab === 'profile' && <motion.span layoutId="tab-dot" className="tab-dot" />}
        </Tap>
      </nav>

      {/* Quick Start Workout Picker Sheet */}
      <Sheet open={fabSheet} onClose={() => setFabSheet(false)} title="Iniciar entrenamiento">
        <div className="col gap12">
          <Tap
            className="btn primary block"
            onClick={() => {
              setFabSheet(false)
              startWorkout({ name: 'ENTRENAMIENTO LIBRE', exercises: [] })
            }}
          >
            <Icon.Plus style={{ width: 18, height: 18 }} />
            <span>Empezar entrenamiento en blanco</span>
          </Tap>

          <div className="tiny muted upper" style={{ marginTop: 6 }}>
            O elige una de tus rutinas
          </div>
          {routines.map((r) => (
            <Tap
              key={r.id}
              onClick={() => {
                setFabSheet(false)
                startWorkout(r)
              }}
              className="card row between"
              style={{ padding: '12px 14px', textAlign: 'left', gap: 10 }}
            >
              <div style={{ minWidth: 0 }}>
                <div className="ellipsis" style={{ fontWeight: 800, fontSize: 15 }}>
                  {r.name}
                </div>
                <div className="tiny muted">{r.exercises.length} ejercicios</div>
              </div>
              <span
                className="pill"
                style={{ background: '#1f5eff', borderColor: '#1f5eff', fontWeight: 700, flex: 'none' }}
              >
                <Icon.Play style={{ width: 12, height: 12 }} /> Empezar
              </span>
            </Tap>
          ))}
        </div>
      </Sheet>

      {/* Global Rank Calculator Sheet */}
      <Sheet
        open={calcOpen}
        onClose={() => setCalcOpen(false)}
        title="⚡ Calculadora de Rango"
        full
      >
        <RankCalculator
          onOpenExercise={(id) => {
            setCalcOpen(false)
            setOpenExId(id)
          }}
        />
      </Sheet>

      {/* Post-Workout Rank-Up Celebration Sheet */}
      <Sheet
        open={!!celebration}
        onClose={() => setCelebration(null)}
        title="🎉 ¡Entrenamiento Completado!"
      >
        {celebration && (
          <div className="col center gap14" style={{ textAlign: 'center', padding: '6px 0' }}>
            <RankBadge
              tier={celebration.rankUps?.[0]?.to || 'emerald'}
              size={84}
              glow
              epic
            />
            <div>
              <div className="h2">{celebration.workout.name}</div>
              <p className="small muted" style={{ marginTop: 4 }}>
                Has registrado {celebration.workout.exercises.length} ejercicios y actualizado tu mapa corporal.
              </p>
            </div>

            {celebration.rankUps?.length > 0 && (
              <div className="col gap8" style={{ width: '100%' }}>
                <div className="tiny muted upper">Subidas de rango y récords</div>
                {celebration.rankUps.map((ru, i) => (
                  <div key={i} className="card row between" style={{ padding: '10px 14px' }}>
                    <span className="ellipsis" style={{ fontWeight: 700, fontSize: 14, paddingRight: 8 }}>
                      {EX_BY_ID[ru.exId]?.name || ru.exId}
                    </span>
                    <div className="row gap6" style={{ flex: 'none' }}>
                      {ru.from && <RankBadge tier={ru.from} size={28} />}
                      <span style={{ color: ru.to.glow, fontWeight: 900 }}>→</span>
                      <RankBadge tier={ru.to} division={ru.division} size={38} showDiv glow />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Tap className="btn primary block" onClick={() => setCelebration(null)}>
              Continuar
            </Tap>
          </div>
        )}
      </Sheet>

      <RankGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} showToast={showToast} />
    </div>
  )
}
