import { useRef, useEffect, useCallback, useEffectEvent } from 'react'
import RealityButton from '../../RealityButton'
import ScrollHint from '../../ScrollHint'
import {
  createBackgroundSplashes,
  drawBackgroundSplashes,
  spawnPaintBurst,
  updateAndDrawPaint,
} from './hooks/paintEffects';
import styles from './RealityParallax.module.css';
// Particle cap to avoid performance hits
const MAX_PARTICLES = 200;

// eslint-disable-next-line react-doctor/no-giant-component
function RealityParallax({ onNext, isTransitioning }) {
  const containerRef = useRef(null)
  const cursorRef = useRef(null)
  const crosshairPulseRef = useRef(null)
  const splashCanvasRef = useRef(null)
  const paintCanvasRef = useRef(null)
  const mainRef = useRef(null)
  const cuerpoRef = useRef(null)
  const faceRef = useRef(null)
  const part1Ref = useRef(null)
  const part2Ref = useRef(null)
  const pinturaRef = useRef(null)

  const animFrameRef = useRef(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const facePosRef = useRef({ x: 0, y: 0 })
  const currentCursorRef = useRef({ x: 0, y: 0 })
  const isVisibleRef = useRef(false)
  const splashesRef = useRef([])
  const paintParticlesRef = useRef([])
  const clickPulseRef = useRef(0)
  const isOverUiRef = useRef(false)
  const sizeRef = useRef({ width: 0, height: 0 })
  const isTransitioningRef = useRef(isTransitioning)

  // Keep ref in sync with prop — safely inside an effect
  useEffect(() => {
    isTransitioningRef.current = isTransitioning
  }, [isTransitioning])

  const resizeCanvases = useCallback(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    sizeRef.current = { width: w, height: h };

    // Limit device pixel ratio to improve performance while keeping reasonable quality
    const maxDpr = 1.5;
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    ;[splashCanvasRef, paintCanvasRef].forEach((ref) => {
      const canvas = ref.current;
      if (!canvas) return;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.cssText = `width: ${w}px; height: ${h}px;`;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    });

    splashesRef.current = createBackgroundSplashes(w, h);
  }, []);

  const isShootBlockedAt = useEffectEvent((x, y) => {
    const el = document.elementFromPoint(x, y)
    if (!el) return false
    return !!el.closest('button:not(:disabled), a[href]')
  })

  const shootOrigin = useEffectEvent(() => {
    const { width, height } = sizeRef.current
    return { x: width / 2, y: height / 2 }
  })

  useEffect(() => {
    const container = containerRef.current
    const cursor = cursorRef.current
    const pulse = crosshairPulseRef.current
    const splashCanvas = splashCanvasRef.current
    const paintCanvas = paintCanvasRef.current
    if (!container) return

    container.style.cursor = 'none'
    resizeCanvases()

    const limit = {
      width: container.offsetWidth,
      height: container.offsetHeight,
    }
    const center = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    }

      let pending = false;
      const handleMouseMove = (e) => {
        if (pending) return;
        pending = true;
        requestAnimationFrame(() => {
          const rawX = e.clientX - center.x;
          const rawY = e.clientY - center.y;

          if (rawX > -limit.width / 2 && rawX < limit.width / 2) {
            facePosRef.current.x = rawX;
          }
          if (rawY > -limit.height / 2 && rawY < limit.height / 2) {
            facePosRef.current.y = rawY;
          }

          mouseRef.current = { x: e.clientX, y: e.clientY };
          isVisibleRef.current = true;
          isOverUiRef.current = isShootBlockedAt(e.clientX, e.clientY);
          pending = false;
        });
      };

    const handleMouseEnter = (e) => {
      currentCursorRef.current = { x: e.clientX, y: e.clientY }
      mouseRef.current = { x: e.clientX, y: e.clientY }
      isVisibleRef.current = true
      isOverUiRef.current = isShootBlockedAt(e.clientX, e.clientY)
    }

    const handleMouseLeave = () => {
      isVisibleRef.current = false
      isOverUiRef.current = false
    }

    const handleClick = (e) => {
      if (e.button !== 0) return
      if (isShootBlockedAt(e.clientX, e.clientY)) return

      const targetX = currentCursorRef.current.x || e.clientX
      const targetY = currentCursorRef.current.y || e.clientY
      const origin = shootOrigin()
      if (paintParticlesRef.current.length < MAX_PARTICLES) {
        spawnPaintBurst(
          paintParticlesRef.current,
          origin.x,
          origin.y,
          targetX,
          targetY,
        );
      }
      clickPulseRef.current = 1
    }

    const handleResize = () => resizeCanvases()

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mouseleave', handleMouseLeave)
    container.addEventListener('mousedown', handleClick)
    window.addEventListener('resize', handleResize)

    const animate = () => {
      currentCursorRef.current.x += (mouseRef.current.x - currentCursorRef.current.x) * 0.14
      currentCursorRef.current.y += (mouseRef.current.y - currentCursorRef.current.y) * 0.14

      const cx = currentCursorRef.current.x
      const cy = currentCursorRef.current.y

      if (cursor) {
        const onUi = isShootBlockedAt(mouseRef.current.x, mouseRef.current.y)
        isOverUiRef.current = onUi
        const scale = onUi ? 1.12 : 1
        cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%) scale(${scale})`
        cursor.style.opacity = isVisibleRef.current && !isTransitioningRef.current ? '1' : '0'
        cursor.classList.toggle(styles.cursorOnUi, onUi)
      }

      if (pulse) {
        clickPulseRef.current *= 0.88
        const scale = 1 + clickPulseRef.current * 0.35
        pulse.style.transform = `scale(${scale})`
        pulse.style.opacity = String(clickPulseRef.current * 0.7)
      }

      const { width, height } = sizeRef.current
      const px = facePosRef.current.x
      const py = facePosRef.current.y

      if (splashCanvas && width > 0) {
        const sctx = splashCanvas.getContext('2d')
        if (sctx) {
          drawBackgroundSplashes(sctx, splashesRef.current, px, py, width, height)
        }
      }

      if (paintCanvas && width > 0) {
        const pctx = paintCanvas.getContext('2d')
        if (pctx) {
          pctx.clearRect(0, 0, width, height)
          updateAndDrawPaint(pctx, paintParticlesRef.current, width, height)
        }
      }

      if (!isTransitioningRef.current) {
        const scrollOffset = window.scrollY * 0.25
        const move = (ref, depth, extraY = 0) => {
          if (!ref.current) return
          const x = facePosRef.current.x / depth
          const y = facePosRef.current.y / depth + extraY
          ref.current.style.transform = `translate3D(${x}px, ${y}px, 0)`
        }
        move(mainRef, 50)
        move(cuerpoRef, 35)
        move(faceRef, 30)
        move(part1Ref, 28)
        move(part2Ref, 25)
        move(pinturaRef, 18, scrollOffset)
      }
      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseenter', handleMouseEnter)
      container.removeEventListener('mouseleave', handleMouseLeave)
      container.removeEventListener('mousedown', handleClick)
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animFrameRef.current)
      container.style.cursor = ''
    }
  }, [resizeCanvases])

  return (
    <div
      ref={containerRef}
      className={styles.reality}
      style={{
        transition: 'opacity 0.6s ease-in-out',
        opacity: isTransitioning ? 0 : 1,
      }}
    >

      <canvas
        ref={splashCanvasRef}
        className={styles.splashCanvas}
        aria-hidden="true"
        tabIndex={-1}
      />

      <canvas
        ref={paintCanvasRef}
        className={styles.paintCanvas}
        aria-hidden="true"
        tabIndex={-1}
      />

      <div className={styles.layerWrapper}>
        <img
          ref={mainRef}
          src="/assets/images/parallax/main.webp"
          alt=""
          className={`${styles.layer} ${styles.layerMain}`}
          draggable={false}
        />

        <img
          ref={cuerpoRef}
          src="/assets/images/parallax/cuerpo.webp"
          alt=""
          className={`${styles.layer} ${styles.layerCuerpo}`}
          draggable={false}
        />

        <img
          ref={faceRef}
          src="/assets/images/parallax/face.webp"
          alt=""
          className={`${styles.layer} ${styles.layerFace}`}
          draggable={false}
        />

        <img
          ref={part1Ref}
          src="/assets/images/parallax/part1.webp"
          alt=""
          className={`${styles.layer} ${styles.layerPart1}`}
          draggable={false}
        />

        <img
          ref={part2Ref}
          src="/assets/images/parallax/part2.webp"
          alt=""
          className={`${styles.layer} ${styles.layerPart2}`}
          draggable={false}
        />

        <img
          ref={pinturaRef}
          src="/assets/images/parallax/pintura.webp"
          alt=""
          className={`${styles.layer} ${styles.layerPintura}`}
          draggable={false}
        />
      </div>

      <div ref={cursorRef} className={styles.cursor} aria-hidden="true">
        <span className={styles.crosshairBracket} data-corner="tl" />
        <span className={styles.crosshairBracket} data-corner="tr" />
        <span className={styles.crosshairBracket} data-corner="bl" />
        <span className={styles.crosshairBracket} data-corner="br" />
        <span className={styles.crosshairRing} />
        <span className={styles.crosshairDot} />
        <span ref={crosshairPulseRef} className={styles.crosshairPulse} />
      </div>

      <div className={styles.content}>
        <p className={styles.tag}>I leave my signature on every project</p>
        <h1 className={styles.name}>Cabornero</h1>
        <p className={styles.tagline}>Building things that move people</p>
      </div>

      <div className={styles.bottomCenter}>
        <RealityButton
          onNext={onNext}
          isTransitioning={isTransitioning}
          className={styles.btn}
        >
          Explore another side
        </RealityButton>
        <ScrollHint className={styles.scrollHint} />
      </div>

    </div>
  )
}

export default RealityParallax
