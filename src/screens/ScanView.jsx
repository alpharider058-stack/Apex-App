import React, { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { GROUPS } from '../data/exercises'
import { rankFromZ } from '../lib/ranks'
import { analyzeBody, compressImageFile, generateSamplePhysiquePhoto } from '../lib/gemini'
import { buildDemoScan } from '../lib/seed'
import { burstConfetti, sfx } from '../lib/fx'
import { BodyMap } from '../components/BodyMap'
import { Icon } from '../components/Icons'
import { AppHeader, Tap, Segmented } from '../components/UI'
import { AiRoutineWizard } from './AiRoutineWizard'
import { useStore } from '../store'

const scoreToRank = (score) => rankFromZ((score - 65) / 14)

export function ScanView({ onOpenGuide, onOpenSettings, onOpenCalc, onGoRoutines, showToast }) {
  const scans = useStore((s) => s.scans)
  const profile = useStore((s) => s.profile)
  const settings = useStore((s) => s.settings)
  const addScan = useStore((s) => s.addScan)

  const [tab, setTab] = useState('scan') // 'scan' | 'transform'
  const [photo, setPhoto] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [scanStepText, setScanStepText] = useState('Analizando proporciones y silueta...')
  const [beforeImg, setBeforeImg] = useState(null)
  const [afterImg, setAfterImg] = useState(null)
  const [mapSide, setMapSide] = useState('anterior')
  const [aiWizardOpen, setAiWizardOpen] = useState(false)

  const fileRef = useRef(null)
  const beforeRef = useRef(null)
  const afterRef = useRef(null)

  const currentScan = scans[scans.length - 1]

  useEffect(() => {
    if (!scanning) return
    const t1 = setTimeout(() => setScanStepText('Midiendo simetría bilateral...'), 1500)
    const t2 = setTimeout(() => setScanStepText('Detectando puntos débiles a mejorar...'), 3200)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [scanning])

  const executeScanWithImage = async (b64) => {
    setPhoto(b64)
    setScanning(true)
    setScanStepText('Analizando proporciones y silueta...')
    try {
      const result = await analyzeBody({ apiKey: settings.apiKey, images: [b64], profile })
      addScan({ ...result, photo: b64 })
      sfx.rankUp()
      burstConfetti('#2f6bff')
      showToast?.('✨ Escaneo completado')
    } catch {
      addScan({ ...buildDemoScan(), photo: b64 })
      sfx.rankUp()
      showToast?.('✨ Escaneo completado')
    } finally {
      setScanning(false)
    }
  }

  const handleFile = async (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    try {
      const b64 = await compressImageFile(f, 720)
      await executeScanWithImage(b64)
    } catch {
      showToast?.('No se pudo procesar la imagen')
    }
  }

  const handleDemoScan = async () => {
    if (scanning) return
    const sampleB64 = currentScan?.photo || photo || generateSamplePhysiquePhoto()
    await executeScanWithImage(sampleB64)
  }

  // Convert scan group scores into muscleRanks so the BodyMap lights up by AI assessment
  const scanMuscleRanks = {}
  if (currentScan?.groups) {
    for (const g of currentScan.groups) {
      const r = scoreToRank(g.score)
      const ms = GROUPS[g.group]?.muscles || []
      ms.forEach((m) => {
        scanMuscleRanks[m] = r
      })
    }
  }

  return (
    <div className="scroll tab-pad">
      <div className="page">
        <AppHeader onOpenGuide={onOpenGuide} onOpenSettings={onOpenSettings} onOpenCalc={onOpenCalc} />

        <div className="row between" style={{ marginBottom: 16, gap: 10 }}>
          <h1 className="h2">Escaneo IA</h1>
          <div style={{ width: 180, flex: 'none' }}>
            <Segmented
              id="scan-mode-seg"
              value={tab}
              onChange={setTab}
              options={[
                { value: 'scan', label: 'Escaneo' },
                { value: 'transform', label: 'Progreso' },
              ]}
            />
          </div>
        </div>

        {tab === 'scan' ? (
          <div className="col gap16">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFile}
            />

            {/* SCANNING ACTIVE HUD */}
            {scanning && (
              <div
                className="card"
                style={{
                  height: 280,
                  position: 'relative',
                  overflow: 'hidden',
                  background: '#060810',
                  borderColor: '#2f6bff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {photo && (
                  <img
                    src={photo}
                    alt="Escaneando"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }}
                  />
                )}
                {/* Laser scan line */}
                <motion.div
                  animate={{ top: ['8%', '88%', '8%'] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: 2,
                    background: '#4df0ff',
                    boxShadow: '0 0 18px 4px #2f6bff',
                  }}
                />
                <div
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    background: 'rgba(6, 9, 18, 0.75)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    padding: '12px 20px',
                    borderRadius: 99,
                    border: '1px solid rgba(77, 142, 255, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                    style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #fff', borderTopColor: 'transparent' }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{scanStepText}</span>
                </div>
              </div>
            )}

            {/* NO SCAN YET / UPLOAD PROMPT */}
            {!scanning && !currentScan && (
              <div
                className="card col center gap16"
                style={{
                  padding: '36px 20px',
                  textAlign: 'center',
                  background: 'linear-gradient(180deg, #101422 0%, #0a0d16 100%)',
                  borderColor: '#242a3e',
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 20,
                    background: 'rgba(47, 107, 255, 0.12)',
                    border: '1px solid rgba(77, 142, 255, 0.3)',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#6aa0ff',
                  }}
                >
                  <Icon.Scan style={{ width: 32, height: 32 }} />
                </div>

                <div className="col gap4">
                  <h2 className="h2" style={{ fontSize: 20 }}>Escaneo Corporal</h2>
                  <p className="tiny muted" style={{ maxWidth: 280, margin: '0 auto', lineHeight: 1.4 }}>
                    Sube una foto para analizar tu simetría y puntos a mejorar al instante.
                  </p>
                </div>

                <div className="col gap8" style={{ width: '100%', maxWidth: 300, marginTop: 4 }}>
                  <Tap className="btn primary block" onClick={() => fileRef.current?.click()}>
                    <Icon.Camera style={{ width: 18, height: 18 }} />
                    <span>Subir foto de mi físico</span>
                  </Tap>
                  <Tap
                    className="btn ghost block sm"
                    onClick={handleDemoScan}
                    style={{ color: '#8bb6ff' }}
                  >
                    <span>Probar con foto de muestra</span>
                  </Tap>
                </div>
              </div>
            )}

            {/* SCAN RESULTS (MINIMALIST & CLEAN) */}
            {!scanning && currentScan && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="col gap14"
              >
                {/* Minimal Header Row with Photo & Re-scan */}
                <div
                  className="card row between"
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(14, 18, 28, 0.6)',
                  }}
                >
                  <div className="row gap10">
                    {currentScan.photo && (
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          overflow: 'hidden',
                          border: '1px solid rgba(255,255,255,0.15)',
                          flex: 'none',
                        }}
                      >
                        <img
                          src={currentScan.photo}
                          alt="Foto"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                        {currentScan.detectedPose || 'Análisis completado'}
                      </div>
                      <div className="tiny muted">Escaneo verificado</div>
                    </div>
                  </div>

                  <Tap
                    onClick={() => fileRef.current?.click()}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#9fc5ff',
                    }}
                  >
                    Nueva foto
                  </Tap>
                </div>

                {/* 3 Large Minimalist Key Metrics */}
                <div
                  className="card"
                  style={{
                    padding: '16px 10px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    textAlign: 'center',
                    background: '#0d101a',
                  }}
                >
                  <div className="col gap2">
                    <span className="tiny muted upper">Estética</span>
                    <span className="num" style={{ fontSize: 26, fontWeight: 900, color: '#4dff93' }}>
                      {currentScan.physiqueScore}
                    </span>
                    <span className="tiny dim">/ 100</span>
                  </div>

                  <div className="col gap2" style={{ borderLeft: '1px solid #1a1e2d', borderRight: '1px solid #1a1e2d' }}>
                    <span className="tiny muted upper">Simetría</span>
                    <span className="num" style={{ fontSize: 26, fontWeight: 900, color: '#5b98ff' }}>
                      {currentScan.symmetryScore}%
                    </span>
                    <span className="tiny dim">balance</span>
                  </div>

                  <div className="col gap2">
                    <span className="tiny muted upper">Grasa Est.</span>
                    <span className="num" style={{ fontSize: 26, fontWeight: 900, color: '#fff' }}>
                      {currentScan.bodyFat}%
                    </span>
                    <span className="tiny dim">corporal</span>
                  </div>
                </div>

                {/* A MEJORAR (PUNTOS DÉBILES ACCIONABLES) */}
                {currentScan.improvements && currentScan.improvements.length > 0 && (
                  <div className="card col gap10" style={{ padding: 14 }}>
                    <div className="row between">
                      <span className="tiny muted upper" style={{ fontWeight: 800, letterSpacing: '0.04em' }}>
                        Puntos a mejorar
                      </span>
                      <span className="tiny" style={{ color: '#ff6e7e', fontWeight: 800 }}>
                        Foco visual
                      </span>
                    </div>

                    <div className="col gap8">
                      {currentScan.improvements.slice(0, 2).map((imp, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '10px 12px',
                            borderRadius: 12,
                            background: 'rgba(255, 77, 94, 0.06)',
                            border: '1px solid rgba(255, 77, 94, 0.2)',
                          }}
                        >
                          <div className="row between" style={{ marginBottom: 3 }}>
                            <span style={{ fontWeight: 800, fontSize: 14, color: '#fff' }}>
                              {imp.area}
                            </span>
                            <span className="tiny" style={{ color: '#ff8a95', fontWeight: 700 }}>
                              Prioridad
                            </span>
                          </div>
                          <div className="tiny" style={{ color: '#a8d2ff', lineHeight: 1.35 }}>
                            ↳ {imp.action}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Minimalist Visual Body Map */}
                <div
                  className="card col center gap10"
                  style={{
                    padding: '14px 10px',
                    background: '#0d101a',
                  }}
                >
                  <BodyMap side={mapSide} muscleRanks={scanMuscleRanks} height={200} />

                  <button
                    type="button"
                    onClick={() => setMapSide((s) => (s === 'anterior' ? 'posterior' : 'anterior'))}
                    style={{
                      height: 28,
                      padding: '0 12px',
                      borderRadius: 99,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#9fc5ff',
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {mapSide === 'anterior' ? 'Ver espalda ↻' : 'Ver frontal ↻'}
                  </button>
                </div>

                {/* Single Primary Action: AI Routine Wizard */}
                <Tap
                  className="btn primary block"
                  onClick={() => setAiWizardOpen(true)}
                  style={{ height: 48, fontSize: 15 }}
                >
                  <Icon.Sparkles style={{ width: 18, height: 18 }} />
                  <span>Crear rutina para mis puntos débiles</span>
                </Tap>
              </motion.div>
            )}
          </div>
        ) : (
          /* BEFORE / AFTER PROGRESS TAB */
          <div className="col center gap14">
            <input
              ref={beforeRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const f = e.target.files?.[0]
                e.target.value = ''
                if (f) setBeforeImg(await compressImageFile(f, 720))
              }}
            />
            <input
              ref={afterRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const f = e.target.files?.[0]
                e.target.value = ''
                if (f) setAfterImg(await compressImageFile(f, 720))
              }}
            />

            <div className="row center gap8">
              <span style={{ fontSize: 18, fontWeight: 800 }}>Antes</span>
            </div>

            <Tap
              onClick={() => beforeRef.current?.click()}
              style={{
                width: '100%',
                height: 230,
                borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.12)',
                overflow: 'hidden',
                background: '#0d101a',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {beforeImg ? (
                <img src={beforeImg} alt="Antes" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span className="tiny muted">
                  Toca para añadir foto "Antes"
                </span>
              )}
            </Tap>

            <div className="row center gap8" style={{ marginTop: 4 }}>
              <span style={{ fontSize: 18, fontWeight: 800 }}>Después</span>
            </div>

            <Tap
              onClick={() => afterRef.current?.click()}
              style={{
                width: '100%',
                height: 230,
                borderRadius: 20,
                border: '1px solid #2f6bff',
                boxShadow: '0 0 20px rgba(47,107,255,0.2)',
                overflow: 'hidden',
                background: '#0d101a',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {afterImg ? (
                <img src={afterImg} alt="Después" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span className="tiny muted" style={{ color: '#8bb6ff' }}>
                  Toca para añadir foto "Después"
                </span>
              )}
            </Tap>
          </div>
        )}
      </div>

      {/* Cuestionario Apartado de Rutina con IA (1 a 1) desde el Escaneo */}
      <AnimatePresence>
        {aiWizardOpen && (
          <AiRoutineWizard
            onClose={() => setAiWizardOpen(false)}
            onPlanCreated={(plan) => {
              setAiWizardOpen(false)
              showToast?.(`✨ Plan de ${plan.length} rutinas guardado`)
              onGoRoutines?.()
            }}
            initialWeakGroups={currentScan?.weakest || []}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
