import { useRef, useEffect, useState, useCallback } from 'react'
import { usePixelWorld } from './hooks/usePixelWorld'
import { useDialog } from './hooks/useDialog'
import { useLanguage } from '../../../context/LanguageContext'

// FIX #13: import React from 'react' eliminado (no es necesario en React 17+)
import styles from './PixelWorld.module.css'

import { gsap } from 'gsap'

const SECTION_VISIBLE_RATIO = 0.35

export default function PixelWorld({ isActive }) {
  const canvasRef = useRef(null)
  const wrapperRef = useRef(null)
  const cursorRef = useRef(null)
  const dialogBoxRef = useRef(null)
  const dialogTextRef = useRef(null)
  const dialogHintRef = useRef(null)

  const { language, toggleLanguage } = useLanguage()

  const { dialogRef, enterRange, exitRange } = useDialog()
  usePixelWorld(canvasRef, dialogRef, enterRange, exitRange, language, isActive)

  const [isIntroVisible, setIsIntroVisible] = useState(true)

  // Declarado antes del efecto que lo referencia (observer de IntersectionObserver)
  const hasAnimatedRef = useRef(false)

  // FIX #18: Detección de dispositivos táctiles para mostrar "TAP" en lugar de "WASD"
  const isTouchDevice = typeof window !== 'undefined' && 'ontouchstart' in window

  const handleStartGame = useCallback((e) => {
    if (!isActive) return
    if (e.key === 'Enter' || e.type === 'click') {
      setIsIntroVisible(false)
    }
  }, [isActive])

  useEffect(() => {
    window.addEventListener('keydown', handleStartGame)
    return () => window.removeEventListener('keydown', handleStartGame)
  }, [handleStartGame])

  // Sync del diálogo al DOM sin setState — mismo patrón que el canvas
  useEffect(() => {
    let rafId
    let running = true

    function syncDialog() {
      if (!running) return

      const d = dialogRef.current
      if (dialogBoxRef.current) {
        const newDisplay = d.active ? 'flex' : 'none'
        if (dialogBoxRef.current.style.display !== newDisplay) {
          dialogBoxRef.current.style.display = newDisplay
        }
      }
      if (dialogTextRef.current && d.active) {
        if (dialogTextRef.current.textContent !== d.displayedText) {
          dialogTextRef.current.textContent = d.displayedText
        }
      }
      if (dialogHintRef.current && d.active) {
        const newVisibility = d.finished ? 'visible' : 'hidden'
        if (dialogHintRef.current.style.visibility !== newVisibility) {
          dialogHintRef.current.style.visibility = newVisibility
        }
      }

      rafId = requestAnimationFrame(syncDialog)
    }

    rafId = requestAnimationFrame(syncDialog)
    return () => {
      running = false
      cancelAnimationFrame(rafId)
    }
  }, [dialogRef])

  useEffect(() => {
    const wrapper = wrapperRef.current
    const cursor = cursorRef.current
    if (!wrapper || !cursor) return

    let sectionVisible = false
    let pointerInside = false

    const setActive = (show) => {
      wrapper.dataset.active = show ? 'true' : 'false'
      cursor.style.opacity = show ? '1' : '0'
    }

    const updateActive = () => {
      setActive(sectionVisible && pointerInside)
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        sectionVisible =
          entry.isIntersecting &&
          entry.intersectionRatio >= SECTION_VISIBLE_RATIO
          
        if (sectionVisible && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true
          gsap.to(wrapper, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
          })
        }
        
        updateActive()
      },
      { threshold: [0, SECTION_VISIBLE_RATIO, 0.5, 1] },
    )
    observer.observe(wrapper)

    const onMove = (e) => {
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`
    }

    const onEnter = () => {
      pointerInside = true
      updateActive()
    }

    const onLeave = () => {
      pointerInside = false
      updateActive()
    }

    wrapper.addEventListener('mouseenter', onEnter)
    wrapper.addEventListener('mouseleave', onLeave)
    
    if (!isTouchDevice) {
      window.addEventListener('mousemove', onMove)
    }

    return () => {
      observer.disconnect()
      wrapper.removeEventListener('mouseenter', onEnter)
      wrapper.removeEventListener('mouseleave', onLeave)
      if (!isTouchDevice) {
        window.removeEventListener('mousemove', onMove)
      }
      delete wrapper.dataset.active
      cursor.style.opacity = '0'
    }
  }, [isTouchDevice])

  // GSAP - Estado inicial
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    gsap.set(wrapper, { opacity: 0, y: 50 })
  }, [])

  // Animación ahora se maneja directamente en el observer

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      {isIntroVisible && (
        <button
          type="button"
          className={styles.introOverlay}
          onClick={handleStartGame}
          aria-label={language === 'es' ? 'Presiona Enter o haz click para empezar' : 'Press Enter or click to start'}
          onKeyDown={e => e.key === 'Enter' && handleStartGame(e)}
        >
          <div className={styles.introBox}>
            <p className={styles.introTag}>— WORLD 01</p>
            <h2 className={styles.introTitle}>{language === 'es' ? 'QUIÉN SOY' : 'WHO AM I'}</h2>
            <p className={styles.introDesc}>
              {language === 'es' ? (
                <>Explorá el mundo e interactuá con los objetos.<br />Acercate y presioná <kbd>E</kbd> para descubrir más.</>
              ) : (
                <>Explore the world and interact with objects.<br />Get closer and press <kbd>E</kbd> to discover more.</>
              )}
            </p>
            <p className={styles.introPrompt}>{language === 'es' ? '[ PRESIONA ENTER ]' : '[ PRESS ENTER ]'}</p>
          </div>
        </button>
      )}

      {/* Si es dispositivo táctil, no mostramos el cursor personalizado */}
      {!isTouchDevice && <div ref={cursorRef} className={styles.cursor} aria-hidden="true" />}
      <canvas ref={canvasRef} className={styles.canvas} />

      <div className={styles.hudContainer}>
        <div className={styles.hud}>
          <span>
            {isTouchDevice 
              ? (language === 'es' ? 'TAP — MOVER' : 'TAP — Move')
              : (language === 'es' ? 'WASD — MOVER' : 'WASD — Move')
            }
          </span>
          <span>//</span>
          <span>{language === 'es' ? 'CLICK — MÁS RÁPIDO' : 'Click — Faster'}</span>
        </div>
        <button type="button" className={styles.langToggle} onClick={toggleLanguage}>
          {language === 'es' ? 'ES' : 'EN'}
        </button>
      </div>

      {/* Usamos dialog semántico pero lo controlamos con display para no robar el foco (no modal) */}
      <dialog
        ref={dialogBoxRef}
        className={styles.dialogBox}
        style={{ display: 'none' }}
        aria-live="polite"
        aria-label={language === 'es' ? 'Diálogo del personaje' : 'Character dialog'}
      >
        <p ref={dialogTextRef} className={styles.dialogText} />
        <span ref={dialogHintRef} className={styles.dialogHint}>
          {language === 'es' ? '[ PRESIONA E ]' : '[ PRESS E ]'}
        </span>
      </dialog>
    </div>
  )
}
