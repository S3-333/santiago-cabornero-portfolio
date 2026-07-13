// useMobile.js
// Detecta si el dispositivo es móvil UNA sola vez al montar.
// Combina ancho de pantalla (<= 768px) con capacidad de touch.
// No es reactivo al resize para evitar re-renders inesperados mid-session.

import { useState } from 'react'

function detectMobile() {
  if (typeof window === 'undefined') return false
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const isNarrow = window.innerWidth <= 768
  return hasTouch && isNarrow
}

export function useMobile() {
  const [isMobile] = useState(detectMobile)
  return isMobile
}
