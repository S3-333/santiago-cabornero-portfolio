// SectionScroller.jsx
// FIXES DE AUDITORÍA aplicados:
//   #9  — Resize: debounce de 150ms para evitar re-renders en cascada
//          (teclado virtual mobile, resize arrastre de ventana, etc.)
//   #9  — onWheel: detección inteligente de trackpad vs mouse físico
//          usando `e.deltaMode` para ajustar threshold dinámicamente.
//   #16 — paperCreaseRef.current también recibe clearProps en onCompleteTransition
//          para no acumular estilos inline entre transiciones.

import { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import styles from './SectionScroller.module.css'

// ─── Constantes ──────────────────────────────────────────────────────────────
const WHEEL_THRESHOLD_PX   = 30   // deltaY en px (mouse físico, deltaMode=0)
const WHEEL_THRESHOLD_LINE = 3    // deltaY en líneas (trackpad, deltaMode=1)
const TOUCH_THRESHOLD      = 45
const COOLDOWN_MS          = 1050

const getTransitionType = (fromIndex, toIndex, sections) => {
  const minIdx = Math.min(fromIndex, toIndex)
  const maxIdx = Math.max(fromIndex, toIndex)

  if (minIdx === 0 && maxIdx === 1) return 'pixel'
  if (minIdx === 1 && maxIdx === 2) return 'paper'
  if (minIdx === 2 && maxIdx === 3) return 'grid'
  if (minIdx === 3 && maxIdx === 4) return 'contact'

  return sections[toIndex]?.id || 'portal'
}

// ─── SectionScroller ─────────────────────────────────────────────────────────
// eslint-disable-next-line react-doctor/no-giant-component
export default function SectionScroller({ sections }) {
  const total = sections.length

  // ── Estado / refs ────────────────────────────────────────────────────────
  const [current,  setCurrent]  = useState(0)
  const [incoming, setIncoming] = useState(null)

  const currentRef      = useRef(0)
  const isTransitioning = useRef(false)

  const trackRef          = useRef(null)
  const pixelOverlayRef   = useRef(null)
  const paperOverlayRef   = useRef(null)
  const paperCreaseRef    = useRef(null)
  const gridOverlayRef    = useRef(null)
  const contactOverlayRef = useRef(null)

  const touchStartY    = useRef(0)
  const lastWheelTime  = useRef(0)
  const activeTimeline = useRef(null)

  // ── Navegación central ───────────────────────────────────────────────────
  const goTo = useCallback((index, immediate = false) => {
    if (index < 0 || index >= sections.length) return
    if (!immediate && isTransitioning.current) return
    const fromIndex = currentRef.current
    if (index === fromIndex && !immediate) return

    activeTimeline.current?.kill()

    if (immediate) {
      currentRef.current = index
      setCurrent(index)
      setIncoming(null)
      isTransitioning.current = false

      if (trackRef.current) {
        Array.from(trackRef.current.children).forEach((child) => {
          gsap.set(child, { clearProps: 'all' })
        })
      }
      if (pixelOverlayRef.current)   gsap.set(pixelOverlayRef.current,   { visibility: 'hidden' })
      if (paperOverlayRef.current)   gsap.set(paperOverlayRef.current,   { visibility: 'hidden' })
      if (gridOverlayRef.current)    gsap.set(gridOverlayRef.current,    { visibility: 'hidden' })
      if (contactOverlayRef.current) gsap.set(contactOverlayRef.current, { visibility: 'hidden' })
      return
    }

    isTransitioning.current = true
    const direction      = index > fromIndex ? 'forward' : 'backward'
    const transitionType = getTransitionType(fromIndex, index, sections)

    const outgoingEl = trackRef.current?.children[fromIndex]
    const incomingEl = trackRef.current?.children[index]

    if (!outgoingEl || !incomingEl) {
      isTransitioning.current = false
      return
    }

    const onCompleteTransition = () => {
      currentRef.current = index
      setCurrent(index)
      setIncoming(null)
      isTransitioning.current = false

      if (outgoingEl) gsap.set(outgoingEl, { clearProps: 'all' })
      if (incomingEl) gsap.set(incomingEl, { clearProps: 'all' })

      if (pixelOverlayRef.current)   gsap.set(pixelOverlayRef.current,   { visibility: 'hidden' })
      if (paperOverlayRef.current)   gsap.set(paperOverlayRef.current,   { visibility: 'hidden' })
      if (gridOverlayRef.current)    gsap.set(gridOverlayRef.current,    { visibility: 'hidden' })
      if (contactOverlayRef.current) gsap.set(contactOverlayRef.current, { visibility: 'hidden' })

      // FIX #16: limpiar estilos inline del paperCrease acumulados entre transiciones
      if (paperCreaseRef.current) gsap.set(paperCreaseRef.current, { clearProps: 'all' })
    }

    const tl = gsap.timeline({ onComplete: onCompleteTransition })
    activeTimeline.current = tl

    // 1. Transición Pixelada (PixelWorld)
    if (transitionType === 'pixel') {
      const cells = pixelOverlayRef.current?.children
      if (cells && cells.length > 0 && pixelOverlayRef.current) {
        gsap.set(pixelOverlayRef.current, { visibility: 'visible' })
        gsap.set(cells, { scale: 0 })

        tl.to(cells, {
          scale: 1.05, duration: 0.45, ease: 'power2.inOut',
          stagger: { grid: [8, 12], from: 'center', amount: 0.45 }
        })
        .call(() => { setCurrent(index); currentRef.current = index })
        .to(cells, {
          scale: 0, duration: 0.45, ease: 'power2.inOut',
          stagger: { grid: [8, 12], from: 'center', amount: 0.45 }
        })
      } else {
        setCurrent(index)
        currentRef.current = index
        onCompleteTransition()
      }
    }
    // 2. Transición de Rejilla/Persianas (FaceGrid)
    else if (transitionType === 'grid') {
      const cols = gridOverlayRef.current?.children
      if (cols && cols.length > 0 && gridOverlayRef.current) {
        gsap.set(gridOverlayRef.current, { visibility: 'visible' })
        gsap.set(cols, { translateY: (i) => i % 2 === 0 ? '-101%' : '101%' })

        tl.to(cols, {
          translateY: '0%', duration: 0.5, ease: 'power3.inOut',
          stagger: { amount: 0.35, from: direction === 'forward' ? 'start' : 'end' }
        })
        .call(() => { setCurrent(index); currentRef.current = index })
        .to(cols, {
          translateY: (i) => i % 2 === 0 ? '101%' : '-101%',
          duration: 0.5, ease: 'power3.inOut',
          stagger: { amount: 0.35, from: 'center' }
        })
      } else {
        setCurrent(index)
        currentRef.current = index
        onCompleteTransition()
      }
    }
    // 3. Transición Contact (dissolve elegante)
    else if (transitionType === 'contact') {
      if (!contactOverlayRef.current) {
        setCurrent(index)
        currentRef.current = index
        onCompleteTransition()
        return
      }

      setIncoming(index)

      gsap.set(contactOverlayRef.current, { visibility: 'visible', opacity: 0 })
      gsap.set(incomingEl, {
        opacity: 0,
        scale: direction === 'forward' ? 1.04 : 0.97,
        zIndex: 20,
        pointerEvents: 'auto'
      })

      tl
        .to(outgoingEl, { opacity: 0, scale: direction === 'forward' ? 0.97 : 1.04, duration: 0.55, ease: 'power2.inOut' })
        .to(contactOverlayRef.current, { opacity: 1, duration: 0.25, ease: 'power1.in' }, 0.3)
        .call(() => { setCurrent(index); currentRef.current = index })
        .to(contactOverlayRef.current, { opacity: 0, duration: 0.35, ease: 'power1.out' })
        .to(incomingEl, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }, '-=0.25')
    }
    // 4. Transición de Papel (PaperWorld)
    else if (transitionType === 'paper') {
      const crease = paperCreaseRef.current
      if (crease && incomingEl && paperOverlayRef.current) {
        setIncoming(index)
        gsap.set(paperOverlayRef.current, { visibility: 'visible' })

        if (direction === 'forward') {
          gsap.set(incomingEl, { opacity: 1, zIndex: 20, pointerEvents: 'auto', clipPath: 'inset(0% 0% 0% 100%)' })
          gsap.set(crease, { left: '105%', transform: 'translateX(-50%) rotate(-6deg)' })

          tl.to(crease,     { left: '-10%', duration: 0.95, ease: 'power2.inOut' })
            .to(incomingEl, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.95, ease: 'power2.inOut' }, 0)
        } else {
          gsap.set(incomingEl, { opacity: 1, zIndex: 20, pointerEvents: 'auto', clipPath: 'inset(0% 100% 0% 0%)' })
          gsap.set(crease, { left: '-5%', transform: 'translateX(-50%) rotate(6deg)' })

          tl.to(crease,     { left: '110%', duration: 0.95, ease: 'power2.inOut' })
            .to(incomingEl, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.95, ease: 'power2.inOut' }, 0)
        }
      } else {
        setCurrent(index)
        currentRef.current = index
        onCompleteTransition()
      }
    }
    // 5. Portal / Zoom & Fade (Portal o transiciones genéricas)
    else {
      setIncoming(index)

      gsap.set(incomingEl, { opacity: 0, scale: 0.85, zIndex: 20, pointerEvents: 'auto' })

      tl.to(outgoingEl, { opacity: 0, scale: 1.15, duration: 0.85, ease: 'power2.inOut' })
        .to(incomingEl, { opacity: 1, scale: 1,    duration: 0.85, ease: 'power2.inOut' }, 0)
    }

  }, [sections])

  // ── Inicialización ───────────────────────────────────────────────────────
  useEffect(() => {
    if (trackRef.current) {
      Array.from(trackRef.current.children).forEach((child) => {
        gsap.set(child, { clearProps: 'all' })
      })
    }
  }, [])

  // ── Resize con debounce ──────────────────────────────────────────────────
  // FIX #9: sin debounce, resize dispara goTo() decenas de veces seguidas.
  // Con 150ms de debounce: mobile no flashea por el teclado virtual y el
  // arrastre de ventana en desktop no produce animaciones redundantes.
  useEffect(() => {
    let resizeTimer
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => goTo(currentRef.current, true), 150)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      clearTimeout(resizeTimer)
    }
  }, [goTo])

  // ── Wheel handler ────────────────────────────────────────────────────────
  // FIX #9: threshold dinámico según deltaMode.
  //   deltaMode=0 → valores en px (mouse físico)   → threshold 30px
  //   deltaMode=1 → valores en líneas (trackpad)   → threshold 3 líneas
  //   deltaMode=2 → valores en páginas             → umbral 1 (cualquier gesto cuenta)
  useEffect(() => {
    const onWheel = (e) => {
      e.preventDefault()

      // Seleccionar el threshold correcto según el tipo de dispositivo
      let threshold
      if (e.deltaMode === 0) threshold = WHEEL_THRESHOLD_PX
      else if (e.deltaMode === 1) threshold = WHEEL_THRESHOLD_LINE
      else threshold = 1

      if (Math.abs(e.deltaY) < threshold) return

      const now = Date.now()
      if (now - lastWheelTime.current < COOLDOWN_MS) return
      if (isTransitioning.current) return

      lastWheelTime.current = now

      const next = e.deltaY > 0
        ? currentRef.current + 1
        : currentRef.current - 1

      goTo(next)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [goTo])

  // ── Touch handler ────────────────────────────────────────────────────────
  useEffect(() => {
    const onTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY
    }

    const onTouchEnd = (e) => {
      if (isTransitioning.current) return
      const delta = touchStartY.current - e.changedTouches[0].clientY
      if (Math.abs(delta) < TOUCH_THRESHOLD) return

      const next = delta > 0
        ? currentRef.current + 1
        : currentRef.current - 1

      goTo(next)
    }

    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend',   onTouchEnd,   { passive: true })
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend',   onTouchEnd)
    }
  }, [goTo])


  // ── Renderizado ──────────────────────────────────────────────────────────
  return (
    <div className={styles.viewport} aria-live="polite">

      {/* Pistas de Secciones Stacked */}
      <div ref={trackRef} className={styles.track}>
        {sections.map(({ id, Component }, i) => {
          const isActive       = current === i
          const isIncomingSection = incoming === i

          let sectionClass = styles.section
          if (isActive)           sectionClass += ` ${styles.sectionActive}`
          else if (isIncomingSection) sectionClass += ` ${styles.sectionTransitioning}`

          return (
            <section
              key={id}
              className={sectionClass}
              data-section-id={id}
              data-section-index={i}
              inert={!isActive && !isIncomingSection ? '' : undefined}
            >
              <Component isActive={isActive} />
            </section>
          )
        })}
      </div>

      {/* Overlay de Píxeles (Siempre montado) */}
      <div ref={pixelOverlayRef} className={styles.pixelOverlay}>
        {Array.from({ length: 96 }).map((_, idx) => {
          const row    = Math.floor(idx / 12)
          const col    = idx % 12
          const isEven = (row + col) % 2 === 0
          const color  = isEven ? 'rgba(157, 70, 50, 1)' : 'rgba(0, 112, 77, 1)'
          return (
            <div
              key={idx}
              className={styles.pixelCell}
              style={{ backgroundColor: color }}
            />
          )
        })}
      </div>

      {/* Overlay de Papel (Siempre montado) */}
      <div ref={paperOverlayRef} className={styles.paperOverlay}>
        <div ref={paperCreaseRef} className={styles.paperCrease} />
      </div>

      {/* Overlay de Grid (Siempre montado) */}
      <div ref={gridOverlayRef} className={styles.gridOverlay}>
        {Array.from({ length: 10 }).map((_, idx) => {
          const colors = ['rgba(20, 20, 20, 1)', 'rgba(217, 217, 217, 1)', 'rgba(255, 255, 255, 1)']
          const color  = colors[idx % colors.length]
          return (
            <div key={idx} className={styles.gridCol} style={{ backgroundColor: color }} />
          )
        })}
      </div>

      {/* Overlay de Contact (Dissolve) */}
      <div ref={contactOverlayRef} className={styles.contactOverlay} />

      {/* Navegación lateral — dots */}
      <nav className={styles.nav} aria-label="Secciones">
        {sections.map(({ id, label }, i) => (
          <button
            type="button"
            key={id}
            id={`section-nav-${id}`}
            className={`${styles.dot} ${current === i ? styles.dotActive : ''}`}
            onClick={(e) => {
              goTo(i)
              e.currentTarget.blur()
            }}
            aria-label={label ?? id}
            aria-current={current === i ? 'true' : undefined}
          />
        ))}
      </nav>

    </div>
  )
}
