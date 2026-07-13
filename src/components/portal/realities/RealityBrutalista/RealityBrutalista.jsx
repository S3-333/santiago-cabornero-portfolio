import { useEffect, useRef, useCallback } from 'react'
import RealityButton from '../../RealityButton'
import ScrollHint from '../../ScrollHint'
import styles from './RealityBrutalista.module.css'

// Moved to module scope — doesn't use local state, no need to rebuild every render
const MINI_BLOB = { cx: 24, cy: 24, radius: 18, noise: [5, 3.5, 2.5] }

function RealityBrutalista({ onNext, isTransitioning }) {
  const containerRef = useRef(null)
  const blobRef = useRef(null)
  const interactiveCursorRef = useRef(null)
  const interactiveBlobPathRef = useRef(null)

  const animFrameRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const currentRef = useRef({ x: 0, y: 0 })
  const interactiveCurrentRef = useRef({ x: 0, y: 0 })
  const pointerActiveRef = useRef(false)
  const needsSyncRef = useRef(true)
  const isInteractiveRef = useRef(false)

  // Genera puntos del blob orgánico con ruido
  const generateBlobPath = useCallback((cx, cy, radius, time, noise = [18, 14, 10]) => {
    const points = 8
    const coords = []

    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2
      const noiseVal =
        Math.sin(angle * 2 + time * 1.2) * noise[0] +
        Math.cos(angle * 3 + time * 0.8) * noise[1] +
        Math.sin(angle * 1.5 + time * 1.6) * noise[2]
      const r = radius + noiseVal
      coords.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
      })
    }

    // Curva suave entre puntos
    let path = `M ${coords[0].x} ${coords[0].y}`
    for (let i = 0; i < coords.length; i++) {
      const curr = coords[i]
      const next = coords[(i + 1) % coords.length]
      const mx = (curr.x + next.x) / 2
      const my = (curr.y + next.y) / 2
      path += ` Q ${curr.x} ${curr.y} ${mx} ${my}`
    }
    path += ' Z'
    return path
  }, [])

  useEffect(() => {
    const container = containerRef.current
    const blob = blobRef.current
    const interactiveCursor = interactiveCursorRef.current
    const interactiveBlobPath = interactiveBlobPathRef.current
    if (!container || !blob) return

    container.style.cursor = 'none'

    const snapPointer = (x, y) => {
      mouseRef.current = { x, y }
      currentRef.current = { x, y }
      interactiveCurrentRef.current = { x, y }
    }

    const handlePointerMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      if (needsSyncRef.current) {
        snapPointer(e.clientX, e.clientY)
        needsSyncRef.current = false
      }
      pointerActiveRef.current = true
    }

    const handlePointerEnter = (e) => {
      snapPointer(e.clientX, e.clientY)
      pointerActiveRef.current = true
      needsSyncRef.current = false
    }

    const handlePointerLeave = (e) => {
      if (e.relatedTarget && container.contains(e.relatedTarget)) return
      pointerActiveRef.current = false
    }

    const handleDocumentMouseOut = (e) => {
      if (!e.relatedTarget) pointerActiveRef.current = false
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        pointerActiveRef.current = false
      } else {
        needsSyncRef.current = true
      }
    }

    const handleWindowBlur = () => {
      pointerActiveRef.current = false
    }

    const interactiveZone = container.querySelector('[data-interactive]')

    const handleInteractiveEnter = () => {
      isInteractiveRef.current = true
      snapPointer(mouseRef.current.x, mouseRef.current.y)
    }

    const handleInteractiveLeave = (e) => {
      if (e.relatedTarget && interactiveZone?.contains(e.relatedTarget)) return
      isInteractiveRef.current = false
      snapPointer(mouseRef.current.x, mouseRef.current.y)
    }

    container.addEventListener('pointermove', handlePointerMove)
    container.addEventListener('pointerenter', handlePointerEnter)
    container.addEventListener('pointerleave', handlePointerLeave)
    document.addEventListener('mouseout', handleDocumentMouseOut)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleWindowBlur)

    if (interactiveZone) {
      interactiveZone.addEventListener('pointerenter', handleInteractiveEnter)
      interactiveZone.addEventListener('pointerleave', handleInteractiveLeave)
    }

    const startTime = performance.now()

    const animate = (now) => {
      const time = (now - startTime) / 1000
      const active = pointerActiveRef.current
      const interactive = isInteractiveRef.current

      if (interactive && interactiveCursor) {
        interactiveCurrentRef.current.x +=
          (mouseRef.current.x - interactiveCurrentRef.current.x) * 0.45
        interactiveCurrentRef.current.y +=
          (mouseRef.current.y - interactiveCurrentRef.current.y) * 0.45

        const ix = interactiveCurrentRef.current.x
        const iy = interactiveCurrentRef.current.y

        interactiveCursor.style.transform = `translate(${ix}px, ${iy}px) translate(-50%, -50%)`
        interactiveCursor.style.opacity = active ? '1' : '0'

        if (interactiveBlobPath) {
          const { cx, cy, radius, noise } = MINI_BLOB
          interactiveBlobPath.setAttribute(
            'd',
            generateBlobPath(cx, cy, radius, time * 1.4, noise),
          )
        }

        blob.style.opacity = '0'
      } else {
        if (interactiveCursor) interactiveCursor.style.opacity = '0'

        currentRef.current.x += (mouseRef.current.x - currentRef.current.x) * 0.08
        currentRef.current.y += (mouseRef.current.y - currentRef.current.y) * 0.08

        const cx = currentRef.current.x
        const cy = currentRef.current.y
        const path = generateBlobPath(cx, cy, 150, time)
        blob.style.clipPath = `path('${path}')`
        blob.style.webkitClipPath = `path('${path}')`
        blob.style.opacity = active ? '1' : '0'
      }

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      container.removeEventListener('pointermove', handlePointerMove)
      container.removeEventListener('pointerenter', handlePointerEnter)
      container.removeEventListener('pointerleave', handlePointerLeave)
      document.removeEventListener('mouseout', handleDocumentMouseOut)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleWindowBlur)
      if (interactiveZone) {
        interactiveZone.removeEventListener('pointerenter', handleInteractiveEnter)
        interactiveZone.removeEventListener('pointerleave', handleInteractiveLeave)
      }
      cancelAnimationFrame(animFrameRef.current)
      container.style.cursor = ''
    }
  }, [generateBlobPath])

  return (
    <div ref={containerRef} className={styles.reality}>

      <div
        ref={interactiveCursorRef}
        className={styles.interactiveCursor}
        aria-hidden="true"
      >
        <svg
          className={styles.interactiveCursorSvg}
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <path ref={interactiveBlobPathRef} className={styles.interactiveCursorBlob} />
        </svg>
      </div>

      {/* Imagen base — B&W */}
      <img
        src="/assets/images/brutalism/foto.webp"
        alt="Foto original"
        className={styles.imgBase}
        draggable={false}
        fetchPriority="high"
        decoding="async"
      />

      {/* Imagen brutalista — se revela con el blob */}
      <div ref={blobRef} className={styles.blobReveal}>
        <img
          src="/assets/images/brutalism/hover.webp"
          alt="Alter ego brutalista"
          className={styles.imgBrutalista}
          draggable={false}
          loading="lazy"
        />
      </div>

      {/* Contenido de texto */}
      <div className={styles.content}>
        <p className={styles.tag}>FULL STACK DEVELOPER — ARGENTINA</p>
        <h1 className={styles.name}>Santiago Cabornero</h1>
        <p className={styles.tagline}>I BUILD - I BREAK - I FIX</p>
      </div>

      {/* Botón centrado abajo */}
      <div className={styles.bottomCenter}>
        <div className={styles.btnInteractive} data-interactive>
          <RealityButton
            onNext={onNext}
            isTransitioning={isTransitioning}
            className={styles.btn}
          >
            NEXT REALITY
          </RealityButton>
        </div>
        <ScrollHint className={styles.scrollHint} />
      </div>

    </div>
  )
}

export default RealityBrutalista