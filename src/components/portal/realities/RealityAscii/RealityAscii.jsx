import { useRef, useEffect } from 'react'
import RealityButton from '../../RealityButton'
import ScrollHint from '../../ScrollHint'
import styles from './RealityAscii.module.css'

const CONFIG = {
  fontFamily: 'monospace',
  color: '#00ff41',
  bgColor: '#0a0a0a',
  breathInterval: 80,
  breathChance: 0.015,
  distortionRadius: 7,
  distortionDecay: 0.85,
  clickDistortionRadius: 40,
  clickDistortionDuration: 600,
  awakeMinMs: 3000,
  awakeMaxMs: 5000,
  transitionMs: 120,
  sleepMinMs: 1500,
  sleepMaxMs: 3500,
}

const DISTORT_CHARS = '@#$%&*!?/\\|<>{}[]^~'

const FRAME_PATHS = [
  '/assets/ascii/frame-0-open.txt',
  '/assets/ascii/frame-1-closing.txt',
  '/assets/ascii/frame-2-closed.txt',
  '/assets/ascii/frame-3-opening.txt',
]

function parseFrame(text) {
  // Elimina líneas vacías al final pero preserva espacios internos
  const lines = text.split('\n')
  while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
    lines.pop()
  }
  return lines.map((line) => line.split(''))
}

let framesLoadPromise = null

function loadAsciiFrames() {
  if (!framesLoadPromise) {
    framesLoadPromise = Promise.all(
      FRAME_PATHS.map((path) => fetch(path).then((r) => r.text()))
    )
      .then((texts) => texts.map(parseFrame))
      .catch((err) => {
        framesLoadPromise = null
        throw err
      })
  }
  return framesLoadPromise
}

function RealityAscii({ onNext, isTransitioning }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)

  const framesRef = useRef([])
  const currentFrameRef = useRef(0)
  const isLoadedRef = useRef(false)

  const distortMapRef = useRef(null)
  const gridRef = useRef({ cols: 0, rows: 0, charW: 0, charH: 0, fontSize: 10 })

  const cycleTimeoutRef = useRef(null)
  const rafRef = useRef(null)
  const breathIntervalRef = useRef(null)

  // ── Cargar frames ────────────────────────────────────────
  // eslint-disable-next-line react-doctor/no-fetch-in-effect
  useEffect(() => {
    let active = true
    loadAsciiFrames()
      .then((frames) => {
        if (!active) return
        framesRef.current = frames
        isLoadedRef.current = true
      })
      .catch((err) => console.error('Error cargando frames ASCII:', err))
    return () => { active = false }
  }, [])

  // ── Canvas principal ─────────────────────────────────────
  // eslint-disable-next-line react-doctor/effect-needs-cleanup
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // Calcula dimensiones de celda en función del TXT
    // para que el ASCII ocupe exactamente el 100% del viewport
    const computeGrid = () => {
      if (!isLoadedRef.current || !framesRef.current[0]) return false

      const frame0 = framesRef.current[0]

      // Columnas = la línea más larga del TXT
      const txtCols = Math.max(...frame0.map((row) => row.length))
      const txtRows = frame0.length

      // Cada celda ocupa exactamente (viewport / cantidad de chars)
      const charW = canvas.width / txtCols
      const charH = canvas.height / txtRows

      // fontSize proporcional al charW — ajustá el 0.85 si los chars se solapan
      const fontSize = charW * 0.85

      gridRef.current = { cols: txtCols, rows: txtRows, charW, charH, fontSize }
      distortMapRef.current = new Float32Array(txtCols * txtRows)
      return true
    }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      computeGrid()
    }

    resize()
    window.addEventListener('resize', resize)

    // ── Ciclo de parpadeo/sueño ──────────────────────────
    const runCycle = () => {
      if (!isLoadedRef.current) {
        cycleTimeoutRef.current = setTimeout(runCycle, 200)
        return
      }

      const awakeTime =
        CONFIG.awakeMinMs + Math.random() * (CONFIG.awakeMaxMs - CONFIG.awakeMinMs)

      cycleTimeoutRef.current = setTimeout(() => {
        // Entrecerrado
        currentFrameRef.current = 1
        cycleTimeoutRef.current = setTimeout(() => {
          // Cerrado
          currentFrameRef.current = 2
          const sleepTime =
            CONFIG.sleepMinMs + Math.random() * (CONFIG.sleepMaxMs - CONFIG.sleepMinMs)

          cycleTimeoutRef.current = setTimeout(() => {
            // Despertando
            currentFrameRef.current = 3
            cycleTimeoutRef.current = setTimeout(() => {
              // Abierto — reinicia
              currentFrameRef.current = 0
              runCycle()
            }, CONFIG.transitionMs)
          }, sleepTime)
        }, CONFIG.transitionMs)
      }, awakeTime)
    }

    runCycle()

    // ── Respiración ──────────────────────────────────────
    breathIntervalRef.current = setInterval(() => {
      if (!isLoadedRef.current) return
      const { cols, rows } = gridRef.current
      const distort = distortMapRef.current
      if (!distort) return

      const total = cols * rows
      for (let i = 0; i < total; i++) {
        if (distort[i] < 0.1 && Math.random() < CONFIG.breathChance) {
          distort[i] = 0.3
        }
      }
    }, CONFIG.breathInterval)

    // ── Render loop ──────────────────────────────────────
    const render = () => {
      // Si no cargaron los frames o la grilla no está lista, reintentar
      if (!isLoadedRef.current || gridRef.current.cols === 0) {
        // Intentar computar la grilla si ya cargaron los frames
        if (isLoadedRef.current) {
          canvas.width = window.innerWidth
          canvas.height = window.innerHeight
          computeGrid()
        }
        rafRef.current = requestAnimationFrame(render)
        return
      }

      const { cols, rows, charW, charH, fontSize } = gridRef.current
      const distort = distortMapRef.current
      const frameIdx = currentFrameRef.current
      const frame = framesRef.current[frameIdx]

      // Fondo
      ctx.fillStyle = CONFIG.bgColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Fuente — se setea una vez por frame
      ctx.font = `${fontSize}px ${CONFIG.fontFamily}`
      ctx.textBaseline = 'top'

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const idx = row * cols + col

          // Decay de distorsión
          if (distort[idx] > 0) {
            distort[idx] *= CONFIG.distortionDecay
            if (distort[idx] < 0.01) distort[idx] = 0
          }

          // Char del frame activo — si la línea es más corta, usa espacio
          const frameRow = frame?.[row]
          const baseChar = frameRow?.[col] ?? ' '

          // Si hay distorsión, char aleatorio
          const char =
            distort[idx] > 0.1
              ? DISTORT_CHARS[Math.floor(Math.random() * DISTORT_CHARS.length)]
              : baseChar

          if (char === ' ') continue // no dibujés espacios, ahorra tiempo

          // Opacidad según distorsión
          ctx.globalAlpha = distort[idx] > 0.1 ? Math.min(1, 0.7 + distort[idx]) : 1
          ctx.fillStyle = CONFIG.color

          // Posición exacta en base a charW y charH
          ctx.fillText(char, col * charW, row * charH)
        }
      }

      ctx.globalAlpha = 1
      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(rafRef.current)
      clearInterval(breathIntervalRef.current)
      clearTimeout(cycleTimeoutRef.current)
    }
  }, [])

  // ── Mouse — distorsión radial ────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouseMove = (e) => {
      const { charW, charH, cols, rows } = gridRef.current
      const distort = distortMapRef.current
      if (!distort || charW === 0) return

      const mouseCol = Math.floor(e.clientX / charW)
      const mouseRow = Math.floor(e.clientY / charH)
      const r = CONFIG.distortionRadius

      for (let dr = -r; dr <= r; dr++) {
        for (let dc = -r; dc <= r; dc++) {
          const col = mouseCol + dc
          const row = mouseRow + dr
          if (col < 0 || col >= cols || row < 0 || row >= rows) continue

          const dist = Math.sqrt(dc * dc + dr * dr)
          if (dist > r) continue

          const intensity = 1 - dist / r
          const idx = row * cols + col
          distort[idx] = Math.max(distort[idx], intensity)
        }
      }
    }

    const handleClick = (e) => {
      const { charW, charH, cols, rows } = gridRef.current
      const distort = distortMapRef.current
      if (!distort || charW === 0) return

      const clickCol = Math.floor(e.clientX / charW)
      const clickRow = Math.floor(e.clientY / charH)
      const r = CONFIG.clickDistortionRadius
      const start = performance.now()

      const expand = (now) => {
        const elapsed = now - start
        const progress = Math.min(elapsed / CONFIG.clickDistortionDuration, 1)
        const currentRadius = r * progress

        for (let dr = -currentRadius; dr <= currentRadius; dr++) {
          for (let dc = -currentRadius; dc <= currentRadius; dc++) {
            const col = clickCol + Math.round(dc)
            const row = clickRow + Math.round(dr)
            if (col < 0 || col >= cols || row < 0 || row >= rows) continue

            const dist = Math.sqrt(dc * dc + dr * dr)
            if (dist > currentRadius) continue

            const intensity = (1 - dist / r) * (1 - progress * 0.5)
            const idx = row * cols + col
            distort[idx] = Math.max(distort[idx], intensity)
          }
        }

        if (progress < 1) requestAnimationFrame(expand)
      }

      requestAnimationFrame(expand)
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('click', handleClick)

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('click', handleClick)
    }
  }, [])

  return (
    <div ref={containerRef} className={styles.reality}>
      <canvas ref={canvasRef} className={styles.canvas} />

      <div className={styles.content}>
        <p className={styles.tag}>portfolio.exe</p>
        <h1 className={styles.name}>santiago_cabornero</h1>
        <p className={styles.tagline}>{'>'} whoami<br />[ developer | student | builder ]</p>
      </div>

      <div className={styles.bottomCenter}>
        <RealityButton
          onNext={onNext}
          isTransitioning={isTransitioning}
          className={styles.btn}
        >
          [ NEXT_ ]
        </RealityButton>
        <ScrollHint className={styles.scrollHint} />
      </div>
    </div>
  )
}

export default RealityAscii