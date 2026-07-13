import { useCallback } from 'react'
import { gsap } from 'gsap'

function useGlitch(overlayRef) {
  const triggerGlitch = useCallback((onSwap) => {
    if (!overlayRef.current) return

    const el = overlayRef.current
    const slicesH = el.querySelectorAll('.js-glitch-slice-h')
    const slicesV = el.querySelectorAll('.js-glitch-slice-v')
    const redLayers = el.querySelectorAll('.js-slice-red')
    const blueLayers = el.querySelectorAll('.js-slice-blue')
    const baseLayers = el.querySelectorAll('.js-slice-base')

    if (!slicesH.length && !slicesV.length) {
      onSwap?.()
      return
    }

    const tl = gsap.timeline()

    // 1. Initial Reset
    tl.set(slicesH, { x: 0, skewX: 0, scaleY: 1 })
      .set(slicesV, { y: 0, skewY: 0, scaleX: 1 })
      .set([redLayers, blueLayers, baseLayers], { opacity: 0, x: 0, y: 0 })

    // Peak timeline is at t = 0.60s (longer transition to show it off)
    // --- PHASE 1: IN (0.0s to 0.60s) ---
    
    // Distort horizontal slices independently
    slicesH.forEach((slice) => {
      const randomX = gsap.utils.random(-180, 180)
      const randomSkew = gsap.utils.random(-35, 35)
      const randomScaleY = gsap.utils.random(1.5, 4.0) // Scale up to overlap and cover
      
      tl.to(slice, {
        x: randomX,
        skewX: randomSkew,
        scaleY: randomScaleY,
        duration: 0.60,
        ease: 'power3.in',
      }, 0)
    })

    // Distort vertical slices independently
    slicesV.forEach((slice) => {
      const randomY = gsap.utils.random(-180, 180)
      const randomSkew = gsap.utils.random(-35, 35)
      const randomScaleX = gsap.utils.random(1.5, 4.0) // Scale up to overlap and cover
      
      tl.to(slice, {
        y: randomY,
        skewY: randomSkew,
        scaleX: randomScaleX,
        duration: 0.60,
        ease: 'power3.in',
      }, 0)
    })

    // Activate chromatic aberration on slices
    // Red offsets left/up, Blue offsets right/down
    tl.to(redLayers, {
      opacity: 0.9,
      x: -45,
      y: -15,
      duration: 0.55,
      ease: 'power2.in',
    }, 0)
    .to(blueLayers, {
      opacity: 0.9,
      x: 45,
      y: 15,
      duration: 0.55,
      ease: 'power2.in',
    }, 0)
    .to(baseLayers, {
      opacity: 0.95,
      duration: 0.55,
      ease: 'power2.in',
    }, 0.05)

    // Swap components at the exact peak (0.60s)
    // We flash the container background using the active reality theme background color
    tl.to(el, {
      backgroundColor: 'var(--theme-bg, #050505)',
      duration: 0.12,
      ease: 'none',
    }, 0.54)
    .call(onSwap, null, 0.60)
    .to(el, {
      backgroundColor: 'transparent',
      duration: 0.12,
      ease: 'none',
    }, 0.66)

    // --- PHASE 2: OUT (0.60s to 1.20s) ---
    
    // Restore horizontal slices
    slicesH.forEach((slice) => {
      tl.to(slice, {
        x: 0,
        skewX: 0,
        scaleY: 1,
        duration: 0.60,
        ease: 'power3.out',
      }, 0.60)
    })

    // Restore vertical slices
    slicesV.forEach((slice) => {
      tl.to(slice, {
        y: 0,
        skewY: 0,
        scaleX: 1,
        duration: 0.60,
        ease: 'power3.out',
      }, 0.60)
    })

    // Fade out chromatic aberration layers
    tl.to([redLayers, blueLayers], {
      opacity: 0,
      x: 0,
      y: 0,
      duration: 0.50,
      ease: 'power2.out',
    }, 0.60)
    .to(baseLayers, {
      opacity: 0,
      duration: 0.50,
      ease: 'power2.out',
    }, 0.60)

  }, [overlayRef])

  return { triggerGlitch }
}

export default useGlitch