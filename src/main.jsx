import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

// Auto-register Service Worker so the whole app and all exercise data work offline
registerSW({
  immediate: true,
  onOfflineReady() {
    console.log('[Apex] Modo 100% Offline activado y precacheado')
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
