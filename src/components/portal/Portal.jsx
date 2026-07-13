import { useState, useCallback, useRef } from 'react'
import GlitchOverlay from './GlitchOverlay'
import useGlitch from './realities/hooks/useGlitch'

import RealityAscii from './realities/RealityAscii/RealityAscii'
import RealityBasicRect from './realities/RealityBasicRect/RealityBasicRect'
import RealityBrutalista from './realities/RealityBrutalista/RealityBrutalista'
import RealityChangeColor from './realities/RealityChangeColor/RealityChangeColor'
import RealityParallax from './realities/RealityParallax/RealityParallax'
import RealityVideo from './realities/RealityVideo/RealityVideo'

import styles from './Portal.module.css'

const REALITIES = [
  RealityBrutalista,
  RealityBasicRect,
  RealityAscii,
  RealityVideo,
  RealityParallax,
  RealityChangeColor
]

const REALITY_THEMES = [
  '#0a0a0a', // RealityBrutalista
  '#ffffff', // RealityBasicRect
  '#075b1c', // RealityAscii
  '#000000', // RealityVideo
  '#003681', // RealityParallax
  '#436c6b'  // RealityChangeColor
]

function Portal() {
  const [currentReality, setCurrentReality] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const overlayRef = useRef(null)
  const { triggerGlitch } = useGlitch(overlayRef)

  const handleNext = useCallback(() => {
    if (isTransitioning) return

    setIsTransitioning(true)
    triggerGlitch(() => {
      setCurrentReality((prev) => (prev + 1) % REALITIES.length)
      setIsTransitioning(false)
    })
  }, [isTransitioning, triggerGlitch])

  const CurrentReality = REALITIES[currentReality]
  const themeBg = REALITY_THEMES[currentReality]

  return (
    <section className={styles.portal}>
      <GlitchOverlay ref={overlayRef} themeBg={themeBg} />
      <CurrentReality
        onNext={handleNext}
        isTransitioning={isTransitioning}
      />
    </section>
  )
}

export default Portal
