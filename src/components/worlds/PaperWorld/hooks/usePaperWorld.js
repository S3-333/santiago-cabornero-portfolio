import { useEffect, useRef } from 'react'
import { WORLD_WIDTH, WORLD_HEIGHT } from '../data/stickers'

export function usePaperWorld(worldRef, sectionRef) {
    const stateRef = useRef({
        // Posición del mundo (transform translate)
        x: 0,
        y: 0,
        // Inercia
        vx: 0,
        vy: 0,
        // Drag del mundo
        dragging: false,
        startMouseX: 0,
        startMouseY: 0,
        startWorldX: 0,
        startWorldY: 0,
        lastMouseX: 0,
        lastMouseY: 0,
        lastMouseTime: 0,
        rafId: null,
    })

    useEffect(() => {
        const world = worldRef.current
        const viewport = sectionRef.current
        if (!world || !viewport) return

        const state = stateRef.current

        // Centrar el mundo al inicio
        const vw = viewport.offsetWidth
        const vh = viewport.offsetHeight
        state.x = (vw - WORLD_WIDTH) / 2
        state.y = (vh - WORLD_HEIGHT) / 2
        applyTransform()

        function applyTransform() {
            world.style.transform = `translate(${state.x}px, ${state.y}px)`
        }

        function clampWorld() {
            const vw = viewport.offsetWidth
            const vh = viewport.offsetHeight
            const minX = Math.min(0, vw - WORLD_WIDTH)
            const minY = Math.min(0, vh - WORLD_HEIGHT)
            state.x = Math.max(minX, Math.min(0, state.x))
            state.y = Math.max(minY, Math.min(0, state.y))
        }

        // ── Inercia RAF ───────────────────────────────────
        function inertiaLoop() {
            if (Math.abs(state.vx) < 0.1 && Math.abs(state.vy) < 0.1) {
                state.vx = 0
                state.vy = 0
                return
            }
            state.x += state.vx
            state.y += state.vy
            state.vx *= 0.92   // fricción
            state.vy *= 0.92
            clampWorld()
            applyTransform()
            state.rafId = requestAnimationFrame(inertiaLoop)
        }

        // ── Eventos del mundo ─────────────────────────────
        function onWorldMouseDown(e) {
            // Solo iniciar drag si el target es el fondo (no un sticker)
            if (e.target !== world && !e.target.classList.contains('paper-bg')) return

            cancelAnimationFrame(state.rafId)
            state.dragging = true
            state.startMouseX = e.clientX
            state.startMouseY = e.clientY
            state.startWorldX = state.x
            state.startWorldY = state.y
            state.lastMouseX = e.clientX
            state.lastMouseY = e.clientY
            state.lastMouseTime = performance.now()
            state.vx = 0
            state.vy = 0

            viewport.style.cursor = 'grabbing'
            e.preventDefault()
        }

        function onMouseMove(e) {
            if (!state.dragging) return

            const dx = e.clientX - state.startMouseX
            const dy = e.clientY - state.startMouseY
            state.x = state.startWorldX + dx
            state.y = state.startWorldY + dy
            clampWorld()
            applyTransform()

            // Calcular velocidad para inercia
            const now = performance.now()
            const dt = now - state.lastMouseTime
            if (dt > 0) {
                state.vx = (e.clientX - state.lastMouseX) / dt * 16  // normalizado a ~60fps
                state.vy = (e.clientY - state.lastMouseY) / dt * 16
            }
            state.lastMouseX = e.clientX
            state.lastMouseY = e.clientY
            state.lastMouseTime = now
        }

        function onMouseUp() {
            if (!state.dragging) return
            state.dragging = false
            viewport.style.cursor = ''

            // Lanzar inercia
            state.rafId = requestAnimationFrame(inertiaLoop)
        }

        viewport.addEventListener('mousedown', onWorldMouseDown)
        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)

        // Touch
        function onTouchStart(e) {
            if (e.target !== world && !e.target.classList.contains('paper-bg')) return
            const t = e.touches[0]
            cancelAnimationFrame(state.rafId)
            state.dragging = true
            state.startMouseX = t.clientX
            state.startMouseY = t.clientY
            state.startWorldX = state.x
            state.startWorldY = state.y
            state.lastMouseX = t.clientX
            state.lastMouseY = t.clientY
            state.lastMouseTime = performance.now()
            state.vx = 0
            state.vy = 0
        }

        function onTouchMove(e) {
            if (!state.dragging) return
            e.preventDefault()
            const t = e.touches[0]
            const dx = t.clientX - state.startMouseX
            const dy = t.clientY - state.startMouseY
            state.x = state.startWorldX + dx
            state.y = state.startWorldY + dy
            clampWorld()
            applyTransform()

            const now = performance.now()
            const dt = now - state.lastMouseTime
            if (dt > 0) {
                state.vx = (t.clientX - state.lastMouseX) / dt * 16
                state.vy = (t.clientY - state.lastMouseY) / dt * 16
            }
            state.lastMouseX = t.clientX
            state.lastMouseY = t.clientY
            state.lastMouseTime = now
        }

        function onTouchEnd() {
            if (!state.dragging) return
            state.dragging = false
            state.rafId = requestAnimationFrame(inertiaLoop)
        }

        viewport.addEventListener('touchstart', onTouchStart, { passive: true })
        viewport.addEventListener('touchmove', onTouchMove, { passive: false })
        viewport.addEventListener('touchend', onTouchEnd, { passive: true })

        return () => {
            cancelAnimationFrame(state.rafId)
            viewport.removeEventListener('mousedown', onWorldMouseDown)
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseUp)
            viewport.removeEventListener('touchstart', onTouchStart)
            viewport.removeEventListener('touchmove', onTouchMove)
            viewport.removeEventListener('touchend', onTouchEnd)
        }
    }, [worldRef, sectionRef])
}