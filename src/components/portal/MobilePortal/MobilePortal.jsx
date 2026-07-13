// MobilePortal.jsx
// Sección 1 mobile — solo el concepto de RealityBasicRect.
// Diseño de tarjeta centrada con texto arriba/abajo y galería deslizable.

import { useState, useRef, useEffect, useCallback } from 'react'
import styles from './MobilePortal.module.css'

const STEPS = [
  {
    image: '/assets/images/encuadro_profesional_movil/photo_me4.webp',
    fontFamily: '"Cabinet Grotesk", sans-serif',
    fontSize: '2.5rem',
  },
  {
    image: '/assets/images/encuadro_profesional_movil/photo_me2.webp',
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: '3rem',
  },
  {
    image: '/assets/images/encuadro_profesional_movil/photo_me1.webp',
    fontFamily: '"Fraunces", serif',
    fontSize: '2rem',
  },
  {
    image: '/assets/images/encuadro_profesional_movil/photo_me3.webp',
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: '2rem',
  },
  {
    image: '/assets/images/encuadro_profesional_movil/photo_me5.webp',
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: '2.5rem',
  },
]

const SWIPE_THRESHOLD = 40

export default function MobilePortal({ isActive }) {
  const [step, setStep] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)

  // Precargar imágenes
  useEffect(() => {
    STEPS.forEach(({ image }) => {
      const img = new Image()
      img.src = image
    })
  }, [])

  const onTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    setIsDragging(true)
    setDragOffset(0)
  }, [])

  const onTouchMove = useCallback((e) => {
    if (!isDragging) return
    const dx = e.touches[0].clientX - touchStartX.current
    const dy = e.touches[0].clientY - touchStartY.current
    
    // Si el movimiento es más vertical que horizontal, ignorar para permitir scroll de página si hubiera
    if (Math.abs(dy) > Math.abs(dx)) return

    // Limitar el arrastre visual para que no se vaya de los bordes bruscamente
    let offset = dx
    if (step === 0 && dx > 0) offset = dx * 0.3
    if (step === STEPS.length - 1 && dx < 0) offset = dx * 0.3
    
    setDragOffset(offset)
  }, [isDragging, step])

  const onTouchEnd = useCallback((e) => {
    if (!isDragging) return
    setIsDragging(false)
    
    if (Math.abs(dragOffset) > SWIPE_THRESHOLD) {
      if (dragOffset < 0 && step < STEPS.length - 1) {
        setStep(prev => prev + 1)
      } else if (dragOffset > 0 && step > 0) {
        setStep(prev => prev - 1)
      }
    }
    setDragOffset(0)
  }, [isDragging, dragOffset, step])

  const { fontFamily, fontSize } = STEPS[step]

  return (
    <div className={styles.portal}>
      {/* Navegación arriba — dots sin aria-hidden en el wrapper para mantener los buttons accesibles */}
      <div className={styles.navContainer}>
        <div className={styles.stepDots}>
          {STEPS.map((s, i) => (
            <button
              key={s.image}
              type="button"
              className={`${styles.stepDot} ${i === step ? styles.stepDotActive : ''}`}
              onClick={() => { setStep(i); setDragOffset(0) }}
              aria-label={`Foto ${i + 1} de ${STEPS.length}`}
              aria-current={i === step ? 'true' : undefined}
            />
          ))}
        </div>
      </div>

      {/* Nombre (Arriba de la imagen) */}
      <h1 className={styles.name} style={{ fontFamily, fontSize }}>
        Santiago Cabornero
      </h1>

      {/* Galería Slider (Medio) */}
      <div 
        className={styles.sliderContainer}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div 
          className={`${styles.sliderTrack} ${isDragging ? styles.sliderTrackDragging : ''}`}
          style={{ transform: `translateX(calc(-${step * 100}% + ${dragOffset}px))` }}
        >
          {STEPS.map((s, i) => (
            <div key={s.image} className={styles.slideItem}>
              <img
                src={s.image}
                alt="Santiago Cabornero"
                className={styles.slideImage}
                draggable="false"
                // Primera imagen = LCP: descarga inmediata con máxima prioridad.
                // El resto se difieren hasta que el usuario haga swipe.
                fetchPriority={i === 0 ? 'high' : undefined}
                loading={i === 0 ? undefined : 'lazy'}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Roles (Abajo de la imagen) */}
      <div className={styles.roleContainer}>
        <span className={styles.rolePill}>Developer</span>
        <span className={styles.roleDivider} />
        <span className={styles.rolePill}>AI & Data Science Student</span>
        <span className={styles.roleDivider} />
        <span className={styles.rolePill}>Open to work</span>
      </div>
    </div>
  )
}
