import { useRef, useEffect } from 'react'

const TYPEWRITER_SPEED = 35

function startPage(d) {
  clearInterval(d.timer)
  d.fullText = d.pages[d.currentPage]
  d.displayedText = ''
  d.charIndex = 0
  d.finished = false

  d.timer = setInterval(() => {
    d.charIndex++
    d.displayedText = d.fullText.slice(0, d.charIndex)
    if (d.charIndex >= d.fullText.length) {
      clearInterval(d.timer)
      d.finished = true
    }
  }, TYPEWRITER_SPEED)
}

export function useDialog() {
  const dialogRef = useRef({
    active: false,
    pages: [],
    currentPage: 0,
    displayedText: '',
    fullText: '',
    timer: null,
    charIndex: 0,
    finished: false,  // typewriter terminó en la página actual
    conversationFinished: false, // Leyó todas las páginas?
  })

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key.toLowerCase() === 'e') {
        const d = dialogRef.current
        if (!d.active) return

        if (!d.finished) {
          // Si no terminó de escribir, saltea el efecto autocompletando
          clearInterval(d.timer)
          d.displayedText = d.fullText
          d.finished = true
        } else {
          // Si ya terminó de escribir, cambia de página si hay más
          if (d.currentPage < d.pages.length - 1) {
            d.currentPage++
            startPage(d)
          } else {
            // Ya no hay más páginas, terminamos la conversación y la cerramos
            d.conversationFinished = true
            d.active = false
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Llamado cuando el personaje entra al rango de un objeto
  function enterRange(dialogPages) {
    const d = dialogRef.current

    // Si es un objeto distinto al actual, resetear
    if (d.pages !== dialogPages) {
      d.pages = dialogPages
      d.currentPage = 0
      d.conversationFinished = false
    } else {
      // Si el jugador se alejó después de TERMINAR, retoma desde cero en vez de quedar tildado.
      if (d.conversationFinished) {
        d.currentPage = 0
        d.conversationFinished = false
      }
      // De lo contrario, se retoma desde la d.currentPage guardada
    }

    d.active = true
    startPage(d)
  }

  // Llamado cuando el personaje sale del rango
  function exitRange() {
    const d = dialogRef.current
    clearInterval(d.timer)
    d.active = false
    d.displayedText = ''
    d.finished = false
    // Si nos fuimos antes de terminar, `d.currentPage` permanece igual.
  }

  return { dialogRef, enterRange, exitRange }
}