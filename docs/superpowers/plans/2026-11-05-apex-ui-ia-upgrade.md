# Plan de Implementación: Apex UI, Rangos Épicos, Escaneo y Rutinas con IA, y PWA iOS Nativa

**Meta:** Transformar la aplicación Apex en una experiencia móvil premium, épica y nativa para iPhone, con un nuevo cuestionario paso a paso (1 a 1) para las Rutinas con IA, escaneo corporal con IA que analice solo lo visible y detalle qué mejorar, insignias de rango con diseño de nivel esports/mítico, y optimizaciones completas de UI y PWA para iOS.

---

## Tareas

### Tarea 1: Logos de Rangos Épicos (`src/components/Icons.jsx` y `src/lib/ranks.js`)
- Rediseñar el componente `RankBadge` para que cada uno de los 9 rangos (Hierro, Bronce, Plata, Oro, Rubí, Esmeralda, Diamante, Amatista, Apex) tenga un arte vectorial detallado, con capas de relieve, biseles metálicos, gemas facetadas, reflejos dinámicos y halos resplandecientes.
- Añadir variantes de tamaño, divisiones visibles estilizadas (I, II, III) y animaciones de aura/pulso místico para los rangos superiores (Diamante, Amatista y Apex).

### Tarea 2: Escaneo Corporal con IA Preciso y Real (`src/lib/gemini.js` y `src/screens/ScanView.jsx`)
- Corregir el timeout de llamada a Gemini (aumentar de 3.2s a 25s con reintentos).
- Actualizar el prompt y el esquema de Gemini para que evalúe **únicamente lo que se ve en la foto**:
  - Si solo se ve el torso/pecho/brazos, no inventar notas de piernas; marcar explícitamente qué zonas son visibles y cuáles no.
  - Generar la sección prioritaria **"Qué debes mejorar"**: análisis de rezagos, asimetrías, ejercicios correctivos recomendados y consejos de recuperación.
- Actualizar `ScanView.jsx` con una UI impresionante: tarjeta destacada "Qué debes mejorar", badges de músculos detectados, visor con guías biométricas y botón directo para generar una rutina enfocada en esas mejoras.

### Tarea 3: Cuestionario Apartado Paso a Paso (1 a 1) para Rutinas con IA (`src/screens/AiRoutineWizard.jsx` y `src/screens/RoutinesView.jsx`)
- Crear el componente `AiRoutineWizard.jsx`:
  - Flujo de cuestionario 1 a 1 con animaciones fluidas (`motion/react`) entre preguntas:
    1. Objetivo (Hipertrofia, Fuerza, Definición, Recomposición).
    2. Días de entrenamiento (2, 3, 4, 5, 6 días) con recomendación de split.
    3. Lugar y equipamiento disponible (Gimnasio comercial, Mancuernas en casa, Calistenia, Barra libre).
    4. Nivel de experiencia (Principiante, Intermedio, Avanzado).
    5. Músculos prioritarios (selección interactiva + opción de auto-cargar rezagos del escaneo).
    6. Preferencias o lesiones (texto y etiquetas rápidas).
    7. Pantalla de generación y previsualización del plan con guardado directo.
- Conectar este nuevo asistente a `RoutinesView.jsx` y `App.jsx` al pulsar "Rutina con IA".

### Tarea 4: Optimización PWA Nativa para iPhone (`index.html` y `src/index.css`)
- Ajustar safe areas: `env(safe-area-inset-top)` y `env(safe-area-inset-bottom)`.
- Evitar saltos de barra en Safari con `100dvh`, `overscroll-behavior: none`, `-webkit-overflow-scrolling: touch`.
- Ajustar la barra inferior de navegación `.tabbar` para que respete el indicador de inicio de iPhone (Home Indicator bar) y ningún botón quede oculto o difícil de presionar.
- Configurar viewport y estilos nativos standalone.

### Tarea 5: Pulido Global de la UI de Toda la Aplicación (`src/index.css`, `HomeView.jsx`, `ProfileView.jsx`, `App.jsx`)
- Modernización de componentes visuales con estética deportiva dark-mode, glassmorphism, sombras luminosas y bordes sutiles.
- Mejoras en la barra de pestañas, cabecera, tarjetas de feed, temporizador y botones táctiles.
- Verificación en local y comprobación de errores en el servidor Vite.
