import { useRef, useEffect, useCallback, useState } from 'react'
import RealityButton from '../../RealityButton'
import ScrollHint from '../../ScrollHint'
import styles from './RealityVideo.module.css'

const CONFIG = {
  // Tamaño de la linterna en px — ajustá a gusto
  lanternRadius: 160,
  // Qué tan suave es el borde de la linterna (0 a 1, más alto = más suave)
  lanternSoftness: 0.5,
  // Brillo máximo dentro de la linterna (1 = normal, >1 = sobreexpuesto)
  lanternBrightness: 1.1,
  // Duración visible de la polaroid antes del fade-out (ms)
  polaroidDuration: 2200,
  // Duración del fade-out de la polaroid (ms)
  polaroidFadeOut: 500,
  // Duración de la transición de iluminación total en hover del botón en ms
  illuminateDuration: 400,
}

function RealityVideo({ onNext, isTransitioning }) {
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const overlayRef = useRef(null)
  const cursorRef = useRef(null)

  const [polaroid, setPolaroid] = useState(null)

  const mouseRef = useRef({ x: -9999, y: -9999 })
  const currentMouseRef = useRef({ x: -9999, y: -9999 })
  const isVisibleRef = useRef(false)
  const isFrozenRef = useRef(false)
  const isIlluminatedRef = useRef(false)
  const rafRef = useRef(null)
  const freezeTimeoutsRef = useRef([])

  // ── Linterna via canvas ──────────────────────────────────
  const updateLantern = useCallback(() => {
    const overlay = overlayRef.current
    if (!overlay) return

    const { x, y } = currentMouseRef.current
    const r = CONFIG.lanternRadius
    const soft = CONFIG.lanternSoftness

    if (isIlluminatedRef.current) {
      // Hover sobre botón — pantalla completamente iluminada
      overlay.style.background = 'rgba(0,0,0,0)'
      return
    }

    if (!isVisibleRef.current || x < 0) {
      // Mouse fuera — oscuridad total
      overlay.style.background = 'rgba(0,0,0,0.96)'
      return
    }

    // Gradiente radial que simula la linterna
    overlay.style.background = `radial-gradient(
      circle ${r}px at ${x}px ${y}px,
      rgba(0,0,0,0) 0%,
      rgba(0,0,0,0) ${Math.round(r * (1 - soft))}px,
      rgba(0,0,0,0.96) ${r}px
    )`
  }, [])

  useEffect(() => {
    const container = containerRef.current
    const video = videoRef.current
    if (!container || !video) return

    container.style.cursor = 'none'

    // ── Mouse tracking con inercia ──
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      isVisibleRef.current = true
    }

    const handleMouseEnter = (e) => {
      const rect = container.getBoundingClientRect()
      currentMouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
      isVisibleRef.current = true
    }

    const handleMouseLeave = () => {
      isVisibleRef.current = false
      updateLantern()
    }

    const clearFreezeTimeouts = () => {
      freezeTimeoutsRef.current.forEach(clearTimeout)
      freezeTimeoutsRef.current = []
    }

    const capturePolaroidFrame = () => {
      const canvas = canvasRef.current
      if (!canvas || !video.videoWidth) return null

      const maxW = 640
      const scale = Math.min(1, maxW / video.videoWidth)
      const w = Math.round(video.videoWidth * scale)
      const h = Math.round(video.videoHeight * scale)

      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, w, h)

      const imageData = ctx.getImageData(0, 0, w, h)
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        const n = (Math.random() - 0.5) * 28
        data[i] = Math.min(255, Math.max(0, data[i] + n))
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n))
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n))
      }
      ctx.putImageData(imageData, 0, 0)

      return canvas.toDataURL('image/jpeg', 0.9)
    }

    // ── Click — freeze del video + polaroid ──
    const handleClick = (e) => {
      if (e.target.closest('button')) return
      if (isFrozenRef.current) return

      clearFreezeTimeouts()
      isFrozenRef.current = true
      video.pause()

      const frameSrc = capturePolaroidFrame()
      if (frameSrc) {
        setPolaroid({
          src: frameSrc,
          rotation: (Math.random() - 0.5) * 14,
          exiting: false,
        })
      }

      const flash = document.createElement('div')
      flash.style.cssText = `
        position: absolute;
        inset: 0;
        background: rgba(255,255,255,0.2);
        pointer-events: none;
        z-index: 50;
        transition: opacity 180ms ease;
      `
      container.appendChild(flash)
      requestAnimationFrame(() => {
        flash.style.opacity = '0'
      })
      setTimeout(() => flash.remove(), 220)

      const totalMs = CONFIG.polaroidDuration + CONFIG.polaroidFadeOut
      freezeTimeoutsRef.current.push(
        setTimeout(() => {
          setPolaroid((prev) => (prev ? { ...prev, exiting: true } : null))
        }, CONFIG.polaroidDuration),
        setTimeout(() => {
          isFrozenRef.current = false
          setPolaroid(null)
          video.play().catch(() => { })
        }, totalMs),
      )
    }

    // ── Hover sobre botón — iluminar todo ──
    const btn = container.querySelector('button')
    const handleBtnEnter = () => {
      isIlluminatedRef.current = true
      if (overlayRef.current) {
        overlayRef.current.style.transition = `background ${CONFIG.illuminateDuration}ms ease`
      }
    }
    const handleBtnLeave = () => {
      isIlluminatedRef.current = false
      if (overlayRef.current) {
        overlayRef.current.style.transition = 'none'
      }
    }

    if (btn) {
      btn.style.cursor = 'none'
      btn.addEventListener('mouseenter', handleBtnEnter)
      btn.addEventListener('mouseleave', handleBtnLeave)
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mouseleave', handleMouseLeave)
    container.addEventListener('click', handleClick)

    // ── RAF — inercia del mouse + actualización de linterna ──
    const animate = () => {
      currentMouseRef.current.x +=
        (mouseRef.current.x - currentMouseRef.current.x) * 0.1
      currentMouseRef.current.y +=
        (mouseRef.current.y - currentMouseRef.current.y) * 0.1

      updateLantern()

      const cursor = cursorRef.current
      if (cursor) {
        const { x, y } = currentMouseRef.current
        if (isVisibleRef.current && x >= 0) {
          cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
          cursor.style.opacity = '1'
        } else {
          cursor.style.opacity = '0'
        }
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseenter', handleMouseEnter)
      container.removeEventListener('mouseleave', handleMouseLeave)
      container.removeEventListener('click', handleClick)
      if (btn) {
        btn.removeEventListener('mouseenter', handleBtnEnter)
        btn.removeEventListener('mouseleave', handleBtnLeave)
      }
      cancelAnimationFrame(rafRef.current)
      freezeTimeoutsRef.current.forEach(clearTimeout)
      freezeTimeoutsRef.current = []
      setPolaroid(null)
      container.style.cursor = ''
    }
  }, [updateLantern])

  return (
    <div ref={containerRef} className={styles.reality}>

      {/* Video de fondo */}
      <video
        ref={videoRef}
        title="Background looping video"
        aria-label="Background looping video"
        className={styles.video}
        src="/assets/video/lookv3.webm"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />

      {/* Canvas reservado para efectos futuros sobre el video */}
      <canvas ref={canvasRef} className={styles.canvas} />

      {/* Overlay de oscuridad con el agujero de la linterna */}
      <div ref={overlayRef} className={styles.lanternOverlay} />

      {/* Cursor custom — cruz minimalista */}
      <div ref={cursorRef} className={styles.cursor} aria-hidden />

      {polaroid && (
        <div
          className={`${styles.polaroidBackdrop} ${polaroid.exiting ? styles.polaroidBackdropOut : ''}`}
          style={{ '--fade-ms': `${CONFIG.polaroidFadeOut}ms` }}
        >
          <figure
            className={`${styles.polaroid} ${polaroid.exiting ? styles.polaroidOut : styles.polaroidIn}`}
            style={{
              '--rot': `${polaroid.rotation}deg`,
              '--fade-ms': `${CONFIG.polaroidFadeOut}ms`,
            }}
          >
            <div className={styles.polaroidPhoto}>
              <img src={polaroid.src} alt="" draggable={false} />
              <span className={styles.polaroidGrain} aria-hidden />
            </div>
          </figure>
        </div>
      )}

      {/* Contenido */}
      <div className={styles.content}>
        <p className={styles.tag}>Building by choice</p>
        <h1 className={styles.name}>Santiago Cabornero</h1>
        <p className={styles.tagline}>Take a picture of me (click on the screen)</p>
      </div>

      {/* Botón + scroll */}
      <div className={styles.bottomCenter}>
        <RealityButton
          onNext={onNext}
          isTransitioning={isTransitioning}
          className={styles.btn}
        >
          See more of me
        </RealityButton>
        <ScrollHint className={styles.scrollHint} />
      </div>

    </div>
  )
}

export default RealityVideo