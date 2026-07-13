import { useEffect, useRef } from 'react'
import { IMG_POOL } from '../data/grid'

const POOL_COLS = 5
const POOL_ROWS = 5
const CENTER_COL = 2
const CENTER_ROW = 2

function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val))
}

function turnFace(cell, px, py) {
    const r = cell.el.getBoundingClientRect()
    if (!r.width || !r.height) return

    const distX = px - r.left
    const distY = py - r.top

    const turnX = Math.floor(distX / r.width)
    const turnY = Math.floor(distY / r.height)

    const poolCol = clamp(CENTER_COL + turnX, 0, POOL_COLS - 1)
    const poolRow = clamp(CENTER_ROW + turnY, 0, POOL_ROWS - 1)

    const newSrc = IMG_POOL[poolRow][poolCol]
    if (!cell.img.src.endsWith(newSrc)) {
        cell.img.src = newSrc
    }
}

export function useFaceGrid(gridRef, isActive) {
    const pointerRef   = useRef({ x: null, y: null })
    const cellsRef     = useRef([])
    const intervalRef  = useRef(null)
    // Ref para evitar stale closure dentro del interval — mismo patrón que usePixelWorld
    const isActiveRef  = useRef(isActive)

    useEffect(() => {
        isActiveRef.current = isActive
    }, [isActive])

    useEffect(() => {
        if (!gridRef.current) return

        function cacheCells() {
            const els = gridRef.current?.querySelectorAll('[data-cell-index]')
            if (!els) return
            cellsRef.current = Array.from(els).map(el => ({
                el,
                img: el.querySelector('img'),
            }))
        }

        cacheCells()

        // Loop de tracking — setInterval + rAF
        // Pausa si la sección no está activa para evitar trabajo innecesario cada 60ms
        intervalRef.current = setInterval(() => {
            if (!isActiveRef.current) return
            requestAnimationFrame(() => {
                const { x: px, y: py } = pointerRef.current
                if (px === null || py === null) return

                for (const cell of cellsRef.current) {
                    if (!cell.img) continue
                    turnFace(cell, px, py)
                }
            })
        }, 60)

        function onMouseMove(e) {
            pointerRef.current = { x: e.clientX, y: e.clientY }
        }

        function onTouchMove(e) {
            pointerRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        }

        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('touchmove', onTouchMove, { passive: true })

        return () => {
            clearInterval(intervalRef.current)
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('touchmove', onTouchMove)
        }
    }, [gridRef])
}