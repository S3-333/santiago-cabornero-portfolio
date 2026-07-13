import { useMemo } from 'react'
import styles from './GlitchOverlay.module.css'

// React 19: ref is a normal prop — forwardRef is no longer needed
function GlitchOverlay({ themeBg = '#000000', ref }) {
  // Define horizontal slices (varying positions and heights)
  const hSlices = useMemo(() => [
    { top: '0%', height: '12%' },
    { top: '12%', height: '8%' },
    { top: '20%', height: '15%' },
    { top: '35%', height: '5%' },
    { top: '40%', height: '18%' },
    { top: '58%', height: '10%' },
    { top: '68%', height: '12%' },
    { top: '80%', height: '7%' },
    { top: '87%', height: '13%' },
  ], [])

  // Define vertical slices (varying positions and widths)
  const vSlices = useMemo(() => [
    { left: '0%', width: '10%' },
    { left: '15%', width: '15%' },
    { left: '35%', width: '8%' },
    { left: '48%', width: '12%' },
    { left: '65%', width: '10%' },
    { left: '80%', width: '20%' },
  ], [])

  return (
    <div
      ref={ref}
      className={styles.overlayContainer}
      style={{ '--theme-bg': themeBg }}
    >
      {/* Horizontal Slices */}
      <div className={styles.slicesH}>
        {hSlices.map((slice, i) => (
          <div
            key={`h-${i}`}
            className={`${styles.sliceH} js-glitch-slice-h`}
            style={{ top: slice.top, height: slice.height }}
          >
            <div className={`${styles.sliceLayer} ${styles.red} js-slice-red`} />
            <div className={`${styles.sliceLayer} ${styles.blue} js-slice-blue`} />
            <div className={`${styles.sliceLayer} ${styles.base} js-slice-base`} />
          </div>
        ))}
      </div>

      {/* Vertical Slices */}
      <div className={styles.slicesV}>
        {vSlices.map((slice, i) => (
          <div
            key={`v-${i}`}
            className={`${styles.sliceV} js-glitch-slice-v`}
            style={{ left: slice.left, width: slice.width }}
          >
            <div className={`${styles.sliceLayer} ${styles.red} js-slice-red`} />
            <div className={`${styles.sliceLayer} ${styles.blue} js-slice-blue`} />
            <div className={`${styles.sliceLayer} ${styles.base} js-slice-base`} />
          </div>
        ))}
      </div>
    </div>
  )
}

GlitchOverlay.displayName = 'GlitchOverlay'
export default GlitchOverlay