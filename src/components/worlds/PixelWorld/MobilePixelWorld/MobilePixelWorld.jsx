// MobilePixelWorld.jsx
// Versión mobile de PixelWorld. RPG con controles táctiles (tap-to-move).
// Sin cursor custom, sin WASD, botón "E" para interactuar.

import { useRef, useEffect, useState, useCallback } from 'react'
import { usePixelWorld } from '../hooks/usePixelWorld'
import { useDialog } from '../hooks/useDialog'
import { useLanguage } from '../../../../context/LanguageContext'
import styles from './MobilePixelWorld.module.css'

export default function MobilePixelWorld({ isActive }) {
  const canvasRef = useRef(null)
  const wrapperRef = useRef(null)
  const dialogBoxRef = useRef(null)
  const dialogTextRef = useRef(null)
  const dialogHintRef = useRef(null)

  const { language, toggleLanguage } = useLanguage()
  const { dialogRef, enterRange, exitRange } = useDialog()
  
  // Usamos el mismo engine que en desktop, pero la cámara y entrada se ajustan en hook.
  usePixelWorld(canvasRef, dialogRef, enterRange, exitRange, language, isActive)

  const [isIntroVisible, setIsIntroVisible] = useState(true)

  const handleStartGame = useCallback((e) => {
    if (!isActive) return
    setIsIntroVisible(false)
  }, [isActive])

  // Sync del diálogo al DOM
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

  // Handle interact (avanzar diálogo)
  const handleDialogTap = () => {
    // Si el diálogo está activo, despachar tecla 'e' para que el engine lo procese (ya que está hookeado globalmente).
    if (dialogRef.current?.active) {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }))
      setTimeout(() => {
         window.dispatchEvent(new KeyboardEvent('keyup', { key: 'e' }))
      }, 50)
    }
  }

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      {isIntroVisible && (
        <button
          type="button"
          className={styles.introOverlay}
          onClick={handleStartGame}
          aria-label={language === 'es' ? 'Haz click para empezar' : 'Click to start'}
        >
          <div className={styles.introBox}>
            <p className={styles.introTag}>— WORLD 01</p>
            <h2 className={styles.introTitle}>{language === 'es' ? 'QUIÉN SOY' : 'WHO AM I'}</h2>
            <p className={styles.introDesc}>
              {language === 'es' ? (
                <>Toca la pantalla para moverte.</>
              ) : (
                <>Tap to move around.</>
              )}
            </p>
            <p className={styles.introPrompt}>{language === 'es' ? '[ TOCA PARA INICIAR ]' : '[ TAP TO START ]'}</p>
          </div>
        </button>
      )}

      <canvas ref={canvasRef} className={styles.canvas} />

      {/* Si usamos dialog semántico y no tiene open, se oculta. display 'none' lo manejamos en style. */}
      {/* Al tocar el diálogo, se avanza */}
      <button
        type="button"
        ref={dialogBoxRef}
        className={styles.dialogBox}
        style={{ display: 'none' }}
        aria-live="polite"
        aria-label={language === 'es' ? 'Diálogo del personaje' : 'Character dialog'}
        onClick={handleDialogTap}
      >
        <p ref={dialogTextRef} className={styles.dialogText} />
        <span ref={dialogHintRef} className={styles.dialogHint}>
          {language === 'es' ? '[ TOCA PARA AVANZAR ]' : '[ TAP TO ADVANCE ]'}
        </span>
      </button>
    </div>
  )
}
