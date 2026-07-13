import { useRef, useEffect } from 'react'
import RealityButton from '../../RealityButton'
import ScrollHint from '../../ScrollHint'
import styles from './RealityChangeColor.module.css'

function RealityChangeColor({ onNext, isTransitioning }) {
  const overlayRef = useRef(null)
  const containerRef = useRef(null)
  const cursorRootRef = useRef(null)
  const innerWrapRef = useRef(null)
  const outerWrapRef = useRef(null)
  const ringRef = useRef(null)
  const dotRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const outerRef = useRef({ x: 0, y: 0 })
  const activeRef = useRef(false)
  const buttonHoverRef = useRef(false)
  const frameRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    const overlay = overlayRef.current
    const cursorRoot = cursorRootRef.current
    const innerWrap = innerWrapRef.current
    const outerWrap = outerWrapRef.current
    if (!container || !overlay || !cursorRoot || !innerWrap || !outerWrap) return

    const applyColor = (clientX, clientY) => {
      const normX = clientX / window.innerWidth
      const normY = clientY / window.innerHeight
      const hue = Math.round(normX * 360)
      const saturation = Math.round(5 + normY * 25)
      const lightness = 70
      const hsl = `hsl(${hue}, ${saturation}%, ${lightness}%)`
      overlay.style.backgroundColor = hsl
      cursorRoot.style.setProperty('--cursor-color', hsl)
    }

    const handlePointerMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      activeRef.current = true
      applyColor(e.clientX, e.clientY)
    }

    const handlePointerEnter = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      outerRef.current = { ...mouseRef.current }
      activeRef.current = true
      applyColor(e.clientX, e.clientY)
    }

    const handlePointerLeave = (e) => {
      if (e.relatedTarget && container.contains(e.relatedTarget)) return
      activeRef.current = false
    }

    const syncOuterLoop = () => {
      const { x: mx, y: my } = mouseRef.current
      const { x: ox, y: oy } = outerRef.current
      const lag = buttonHoverRef.current ? 0.1 : 0.17
      outerRef.current = {
        x: ox + (mx - ox) * lag,
        y: oy + (my - oy) * lag,
      }

      innerWrap.style.transform = `translate3d(${mx}px, ${my}px, 0)`
      outerWrap.style.transform = `translate3d(${outerRef.current.x}px, ${outerRef.current.y}px, 0)`

      const vis = activeRef.current ? '1' : '0'
      cursorRoot.style.opacity = vis

      frameRef.current = requestAnimationFrame(syncOuterLoop)
    }

    container.addEventListener('pointermove', handlePointerMove)
    container.addEventListener('pointerenter', handlePointerEnter)
    container.addEventListener('pointerleave', handlePointerLeave)
    frameRef.current = requestAnimationFrame(syncOuterLoop)

    return () => {
      container.removeEventListener('pointermove', handlePointerMove)
      container.removeEventListener('pointerenter', handlePointerEnter)
      container.removeEventListener('pointerleave', handlePointerLeave)
      cancelAnimationFrame(frameRef.current)
    }
  }, [])

  return (
    <div ref={containerRef} className={styles.reality}>

      <div ref={cursorRootRef} className={styles.cursorRoot} aria-hidden="true">
        <div ref={outerWrapRef} className={styles.cursorOuterWrap}>
          <div ref={ringRef} className={styles.cursorRing} />
        </div>
        <div ref={innerWrapRef} className={styles.cursorInnerWrap}>
          <div ref={dotRef} className={styles.cursorDot} />
        </div>
      </div>

      {/* Imagen de fondo */}
      <img
        src="/assets/images/fotorrealismo_costado/costa2.webp"
        alt="Foto perfil"
        className={styles.img}
        draggable={false}
      />

      {/* Overlay de color con mix-blend-mode */}
      <div ref={overlayRef} className={styles.colorOverlay} />

      {/* Contenido */}
      <div className={styles.content}>
        <p className={styles.tag}>Constantly learning. Constantly switching</p>
        <h1 className={styles.name}>SantiaGO</h1>
        <p className={styles.tagline}>Frontend, Backend, Data, Design, AI, All of the above</p>
      </div>

      {/* Botón + scroll */}
      <div className={styles.bottomCenter}>
        <div
          className={styles.btnCursorTarget}
          onPointerEnter={() => {
            buttonHoverRef.current = true
            ringRef.current?.classList.add(styles.cursorRingInteractive)
            dotRef.current?.classList.add(styles.cursorDotInteractive)
          }}
          onPointerLeave={() => {
            buttonHoverRef.current = false
            ringRef.current?.classList.remove(styles.cursorRingInteractive)
            dotRef.current?.classList.remove(styles.cursorDotInteractive)
          }}
        >
          <RealityButton
            onNext={onNext}
            isTransitioning={isTransitioning}
            className={styles.btn}
          >
            Change perspective
          </RealityButton>
        </div>
        <ScrollHint className={styles.scrollHint} />
      </div>

    </div>
  )
}

export default RealityChangeColor
