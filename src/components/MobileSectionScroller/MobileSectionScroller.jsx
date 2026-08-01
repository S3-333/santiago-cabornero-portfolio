// MobileSectionScroller.jsx
// Scroll vertical nativo CSS snap para mobile.
// Sin GSAP, sin overlays de transición — el browser maneja el momentum táctil.
// Los dots de navegación están al centro-abajo para acceso con el pulgar.

import { useRef, useState, useEffect, useCallback } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import styles from './MobileSectionScroller.module.css'

export default function MobileSectionScroller({ sections }) {
  const viewportRef = useRef(null)
  const [current, setCurrent] = useState(0)
  const { language, toggleLanguage } = useLanguage()

  // Detectar sección activa via IntersectionObserver
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Threshold 0.85: evita falsos positivos durante el desajuste de snap
          if (entry.isIntersecting && entry.intersectionRatio >= 0.85) {
            const idx = parseInt(entry.target.dataset.mobileSectionIndex)
            setCurrent(idx)
          }
        }
      },
      {
        root: viewport,
        threshold: 0.85,
      }
    )

    const sectionEls = viewport.querySelectorAll('[data-mobile-section]')
    sectionEls.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  // Scroll programático al tocar un dot — sin smooth para que el snap mandatory
  // no compita con la animación CSS y la sección encaje exactamente
  const goTo = useCallback((index) => {
    const viewport = viewportRef.current
    if (!viewport) return
    const sectionEl = viewport.querySelector(`[data-mobile-section-index="${index}"]`)
    if (sectionEl) {
      // offsetTop es relativo al scrollport; más fiable que scrollIntoView con snap
      viewport.scrollTo({ top: sectionEl.offsetTop, behavior: 'instant' })
    }
  }, [])

  // Re-snap al cambio de tamaño del viewport visual (barra de direcciones)
  // Garantiza que la sección activa siempre llene el scrollport tras el resize
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    function onVisualViewportResize() {
      const viewport = viewportRef.current
      if (!viewport) return
      const sectionEl = viewport.querySelector(`[data-mobile-section-index="${current}"]`)
      if (sectionEl) {
        viewport.scrollTo({ top: sectionEl.offsetTop, behavior: 'instant' })
      }
    }

    vv.addEventListener('resize', onVisualViewportResize)
    return () => vv.removeEventListener('resize', onVisualViewportResize)
  }, [current])

  return (
    <div ref={viewportRef} className={styles.viewport} aria-live="polite">
      {sections.map(({ id, Component }, i) => (
        <section
          key={id}
          className={styles.section}
          data-mobile-section
          data-mobile-section-index={i}
          data-section-id={id}
          // `inert` reemplaza `aria-hidden`: oculta de ARIA Y bloquea el foco
          // en los descendientes cuando la sección no está activa.
          // aria-hidden solo ocultaba visualmente pero dejaba el foco accesible
          // → violación WAI-ARIA cuando un botón hijo retenía el foco.
          inert={current !== i || undefined}
        >
          <Component isActive={current === i} />
        </section>
      ))}

      {/* Dots de navegación — accesibles con el pulgar */}
      <nav className={styles.nav} aria-label="Secciones">
        {sections.map(({ id, label }, i) => (
          <button
            type="button"
            key={id}
            id={`mobile-nav-${id}`}
            className={`${styles.dot} ${current === i ? styles.dotActive : ''}`}
            onClick={() => goTo(i)}
            aria-label={label ?? id}
            aria-current={current === i ? 'true' : undefined}
          />
        ))}
      </nav>

      {/* Global Language Toggle */}
      {current !== 0 && (
        <button
          type="button"
          className={styles.globalLangToggle}
          onClick={toggleLanguage}
          aria-label={language === 'es' ? 'Cambiar a inglés' : 'Switch to Spanish'}
        >
          {language === 'es' ? 'ES' : 'EN'}
        </button>
      )}
    </div>
  )
}
