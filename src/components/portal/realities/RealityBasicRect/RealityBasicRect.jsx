import { useRef, useEffect, useCallback, useState } from 'react'
import RealityButton from '../../RealityButton'
import ScrollHint from '../../ScrollHint'
import styles from './RealityBasicRect.module.css'

// Cada paso: imagen + fuente del título (fontSize fijo por fuente para altura visual similar)
const STEPS = [
  {
    image: '/assets/images/encuadro_profesional/photo_me4.webp',
    fontFamily: '"Cabinet Grotesk", sans-serif',
    fontSize: 'clamp(2.15rem, 6.8vw, 4.75rem)',
  },
  {
    image: '/assets/images/encuadro_profesional/photo_me2.webp',
    fontFamily: '"Bebas Neue", sans-serif',
    fontSize: 'clamp(2.8rem, 8.5vw, 6rem)',
  },
  {
    image: '/assets/images/encuadro_profesional/photo_me1.webp',
    fontFamily: '"Fraunces", serif',
    fontSize: 'clamp(2.05rem, 6.6vw, 4.55rem)',
  },
  {
    image: '/assets/images/encuadro_profesional/photo_me3.webp',
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 'clamp(1.85rem, 5.9vw, 4.05rem)',
  },
  {
    image: '/assets/images/encuadro_profesional/photo_me5.webp',
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: 'clamp(2.1rem, 6.7vw, 4.7rem)',
  },
]

const TITLE_TEXT = 'Santiago Cabornero'
const DOT_RADIUS = 3
const RING_SIZE = { default: 28, hover: 40 }

function RealityBasicRect({ onNext, isTransitioning }) {
  const containerRef = useRef(null)
  const cursorDotRef = useRef(null)
  const cursorRingRef = useRef(null)
  const imgRef = useRef(null)

  const [activeStep, setActiveStep] = useState(0)
  const currentStepRef = useRef(0)
  const cursorPos = useRef({ x: 0, y: 0 })
  const targetPos = useRef({ x: 0, y: 0 })
  const pointerActiveRef = useRef(false)
  const isOverClickableRef = useRef(false)
  const animRef = useRef(null)

  const getStepIndex = useCallback((normX) => {
    const clamped = Math.min(Math.max(normX, 0), 0.999999)
    return Math.min(Math.floor(clamped * STEPS.length), STEPS.length - 1)
  }, [])

  const applyStep = useCallback((index) => {
    if (index === currentStepRef.current) return
    currentStepRef.current = index
    setActiveStep(index)
    const img = imgRef.current
    if (img) img.src = STEPS[index].image
  }, [])

  useEffect(() => {
    STEPS.forEach(({ image }) => {
      const preload = new Image()
      preload.src = image
    })
  }, [])

  // eslint-disable-next-line react-doctor/effect-needs-cleanup
  useEffect(() => {
    const container = containerRef.current
    const dot = cursorDotRef.current
    const ring = cursorRingRef.current
    if (!container || !dot || !ring) return

    container.style.cursor = 'none'

    const clickables = container.querySelectorAll('button, a')
    const handleOverIn = () => { isOverClickableRef.current = true }
    const handleOverOut = () => { isOverClickableRef.current = false }
    clickables.forEach((el) => {
      el.addEventListener('pointerenter', handleOverIn)
      el.addEventListener('pointerleave', handleOverOut)
      el.style.cursor = 'none'
    })

    const updateFromX = (clientX) => {
      const rect = container.getBoundingClientRect()
      const normX = (clientX - rect.left) / rect.width
      applyStep(getStepIndex(normX))
    }

    const snapPointer = (x, y) => {
      targetPos.current = { x, y }
      cursorPos.current = { x, y }
    }

    const handlePointerMove = (e) => {
      targetPos.current = { x: e.clientX, y: e.clientY }
      pointerActiveRef.current = true
      updateFromX(e.clientX)
    }

    const handlePointerEnter = (e) => {
      snapPointer(e.clientX, e.clientY)
      pointerActiveRef.current = true
      updateFromX(e.clientX)
    }

    const handlePointerLeave = (e) => {
      if (e.relatedTarget && container.contains(e.relatedTarget)) return
      pointerActiveRef.current = false
    }

    const handleDocumentMouseOut = (e) => {
      if (!e.relatedTarget) pointerActiveRef.current = false
    }

    const animate = () => {
      cursorPos.current.x += (targetPos.current.x - cursorPos.current.x) * 0.12
      cursorPos.current.y += (targetPos.current.y - cursorPos.current.y) * 0.12

      const { x, y } = cursorPos.current
      const over = isOverClickableRef.current
      const visible = pointerActiveRef.current
      const ringSize = over ? RING_SIZE.hover : RING_SIZE.default
      const ringOffset = ringSize / 2

      dot.style.transform = `translate(${targetPos.current.x - DOT_RADIUS}px, ${targetPos.current.y - DOT_RADIUS}px)`
      dot.style.opacity = visible ? '1' : '0'

      ring.style.transform = `translate(${x - ringOffset}px, ${y - ringOffset}px)`
      ring.style.width = `${ringSize}px`
      ring.style.height = `${ringSize}px`
      ring.style.opacity = visible ? '1' : '0'

      animRef.current = requestAnimationFrame(animate)
    }

    container.addEventListener('pointermove', handlePointerMove)
    container.addEventListener('pointerenter', handlePointerEnter)
    container.addEventListener('pointerleave', handlePointerLeave)
    document.addEventListener('mouseout', handleDocumentMouseOut)
    animRef.current = requestAnimationFrame(animate)

    return () => {
      container.removeEventListener('pointermove', handlePointerMove)
      container.removeEventListener('pointerenter', handlePointerEnter)
      container.removeEventListener('pointerleave', handlePointerLeave)
      document.removeEventListener('mouseout', handleDocumentMouseOut)
      clickables.forEach((el) => {
        el.removeEventListener('pointerenter', handleOverIn)
        el.removeEventListener('pointerleave', handleOverOut)
      })
      cancelAnimationFrame(animRef.current)
      container.style.cursor = ''
    }
  }, [applyStep, getStepIndex])

  const { fontFamily, fontSize } = STEPS[activeStep]

  return (
    <div ref={containerRef} className={styles.reality}>

      <div ref={cursorDotRef} className={styles.cursorDot} aria-hidden="true" />
      <div ref={cursorRingRef} className={styles.cursorRing} aria-hidden="true" />

      <header className={styles.titleBlock}>
        <h1
          className={styles.name}
          style={{ fontFamily, fontSize }}
        >
          {TITLE_TEXT}
        </h1>
      </header>

      <div className={styles.mainRow}>
        <aside className={styles.sideText}>
          <p className={styles.eyebrow}>Developer</p>
          <p className={styles.sideLine}>AI & Data Science Student</p>
        </aside>

        <figure className={styles.imageWrapper}>
          <img
            ref={imgRef}
            src={STEPS[0].image}
            alt="Retrato"
            className={styles.img}
            draggable={false}
          />
        </figure>

        <aside className={`${styles.sideText} ${styles.sideTextRight}`}>
          <p className={styles.sideLine}>Computer Technician</p>
          <p className={styles.eyebrow}>Open to work</p>
        </aside>
      </div>

      <div className={styles.bottomCenter}>
        <RealityButton
          onNext={onNext}
          isTransitioning={isTransitioning}
          className={styles.btn}
        >
          →
        </RealityButton>
        <ScrollHint className={styles.scrollHint} />
      </div>

    </div>
  )
}

export default RealityBasicRect
