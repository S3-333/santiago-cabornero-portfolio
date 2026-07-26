import { useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import DialogBubble from './DialogBubble'
import { STICKER_SIZE } from '../data/stickers'
import { useLanguage } from '../../../../context/LanguageContext'
import styles from './Sticker.module.css'

export default function Sticker({ sticker, onOpenDialog, activeDialogId }) {
    const { language, toggleLanguage } = useLanguage()
    const ref = useRef(null)
    const shadowRef = useRef(null)

    const [pos, setPos] = useState({ x: sticker.x, y: sticker.y })
    const dragState = useRef({
        dragging: false,
        startMouseX: 0,
        startMouseY: 0,
        startPosX: 0,
        startPosY: 0,
    })

    const isDialogOpen = activeDialogId === sticker.id

    // ── Animación de ablandamiento al agarrar ────────
    function playGrabAnim() {
        if (!ref.current) return

        gsap.killTweensOf(ref.current)
        if (shadowRef.current) gsap.killTweensOf(shadowRef.current)

        gsap.fromTo(ref.current,
            { skewX: 0, skewY: 0, scale: 1 },
            {
                keyframes: [
                    { skewX: -4, skewY: 2, scale: 1.06, duration: 0.08 },
                    { skewX: 3, skewY: -1, scale: 1.04, duration: 0.08 },
                    { skewX: 0, skewY: 0, scale: 1.05, duration: 0.1 },
                ],
                ease: 'none',
            }
        )

        // Mostrar la sombra al agarrar
        if (shadowRef.current) {
            gsap.to(shadowRef.current, { opacity: 0.4, duration: 0.15, ease: 'power2.out' })
        }
    }

    function playReleaseAnim() {
        if (!ref.current) return

        gsap.to(ref.current, {
            skewX: 0, skewY: 0, scale: 1,
            duration: 0.35,
            ease: 'elastic.out(1, 0.4)',
        })

        // Ocultar la sombra al soltar
        if (shadowRef.current) {
            gsap.to(shadowRef.current, { opacity: 0, duration: 0.25, ease: 'power2.inOut' })
        }
    }

    // ── Drag del sticker ─────────────────────────────
    // FIX: pos.x/pos.y are captured into startPosX/Y at drag-start — no need to list
    // pos as a dep since we only read it once on mousedown and write it in callbacks.
    // isDialogOpen is read directly from activeDialogId in the closure (both stable refs).
    const onMouseDown = useCallback((e) => {
        e.stopPropagation()   // no iniciar drag del mundo

        playGrabAnim()

        dragState.current.dragging = true
        dragState.current.startMouseX = e.clientX
        dragState.current.startMouseY = e.clientY
        dragState.current.startPosX = pos.x
        dragState.current.startPosY = pos.y

        function onMove(e) {
            if (!dragState.current.dragging) return
            const dx = e.clientX - dragState.current.startMouseX
            const dy = e.clientY - dragState.current.startMouseY
            // Convertir desplazamiento de pantalla a coordenadas del mundo
            setPos({
                x: dragState.current.startPosX + dx,
                y: dragState.current.startPosY + dy,
            })
        }

        function onUp(e) {
            dragState.current.dragging = false
            playReleaseAnim()
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseup', onUp)

            // Si no se movió mucho → es un click → abrir/cerrar diálogo
            const totalDist = Math.hypot(
                e.clientX - dragState.current.startMouseX,
                e.clientY - dragState.current.startMouseY
            )
            if (totalDist < 6 && !sticker.isComic && !sticker.isLabel && !sticker.isLangToggle) {
                onOpenDialog(activeDialogId === sticker.id ? null : sticker.id)
            } else if (totalDist < 6 && sticker.isLangToggle) {
                toggleLanguage()
            }
        }

        // eslint-disable-next-line react-doctor/effect-needs-cleanup
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pos.x, pos.y, activeDialogId, sticker, onOpenDialog])

    // Touch
    const onTouchStart = useCallback((e) => {
        e.stopPropagation()
        playGrabAnim()
        const t = e.touches[0]
        dragState.current.dragging = true
        dragState.current.startMouseX = t.clientX
        dragState.current.startMouseY = t.clientY
        dragState.current.startPosX = pos.x
        dragState.current.startPosY = pos.y

        function onMove(e) {
            const t = e.touches[0]
            const dx = t.clientX - dragState.current.startMouseX
            const dy = t.clientY - dragState.current.startMouseY
            setPos({ x: dragState.current.startPosX + dx, y: dragState.current.startPosY + dy })
        }
        function onEnd(e) {
            dragState.current.dragging = false
            playReleaseAnim()
            window.removeEventListener('touchmove', onMove)
            // FIX: add { passive: true } — handler doesn't call preventDefault(), so passive is safe
            window.removeEventListener('touchend', onEnd)
            const t = e.changedTouches[0]
            const totalDist = Math.hypot(
                t.clientX - dragState.current.startMouseX,
                t.clientY - dragState.current.startMouseY
            )
            if (totalDist < 6 && !sticker.isComic && !sticker.isLabel && !sticker.isLangToggle) {
                onOpenDialog(activeDialogId === sticker.id ? null : sticker.id)
            } else if (totalDist < 6 && sticker.isLangToggle) {
                toggleLanguage()
            }
        }
        // eslint-disable-next-line react-doctor/effect-needs-cleanup
        window.addEventListener('touchmove', onMove, { passive: true })
        // FIX: add { passive: true } — handler does not call event.preventDefault()
        window.addEventListener('touchend', onEnd, { passive: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pos.x, pos.y, activeDialogId, sticker, onOpenDialog])


    // ── Labels de categoría ──────────────────────────
    if (sticker.isLabel) {
        return (
            // FIX: add role="button" + keyboard handler — static div with interaction
            <button
                type="button"
                className={styles.label}
                style={{ left: pos.x, top: pos.y }}
                onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}
                aria-label={language === 'es' && sticker.text_es ? sticker.text_es : sticker.text}
                onKeyDown={e => e.key === 'Enter' && onMouseDown(e)}
            >
                {language === 'es' && sticker.text_es ? sticker.text_es : sticker.text}
            </button>
        )
    }

    if (sticker.isLangToggle) {
        return (
            // FIX: add role="button" + keyboard handler + move large inline style to CSS classes
            <button
                type="button"
                className={`${styles.wrapper} ${styles.langToggleWrapper}`}
                style={{ left: pos.x, top: pos.y }}
                onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}
                aria-label={language === 'es' ? 'Cambiar idioma a inglés' : 'Switch language to Spanish'}
                onKeyDown={e => e.key === 'Enter' && toggleLanguage()}
            >
                <div ref={shadowRef} className={`${styles.shadow} ${styles.langToggleShadow}`}>
                    {language === 'es' ? 'es' : 'en'}
                </div>
                <div ref={ref} className={`${styles.stickerMain} ${styles.langToggleMain}`}>
                    {language === 'es' ? 'es' : 'en'}
                </div>
            </button>
        )
    }

    const dropShadowId = `dropShadow-${sticker.id}`
    const outerStrokeId = `outerStroke-${sticker.id}`
    const expandAndFillId = `expandAndFill-${sticker.id}`

    return (
        // FIX: add role="button" + keyboard handler so screen readers can interact
        <button
            type="button"
            className={styles.wrapper}
            style={{ left: pos.x, top: pos.y, width: sticker.size ?? STICKER_SIZE, height: sticker.size ?? STICKER_SIZE }}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            aria-label={sticker.label ?? 'Sticker'}
            aria-expanded={isDialogOpen}
            onKeyDown={e => {
                if (e.key === 'Enter') {
                    if (!sticker.isComic && !sticker.isLabel && !sticker.isLangToggle) {
                        onOpenDialog(isDialogOpen ? null : sticker.id)
                    }
                }
            }}
        >
            {isDialogOpen && !sticker.isComic && !sticker.isLangToggle && (
                <DialogBubble
                    info={language === 'es' && sticker.info_es ? sticker.info_es : sticker.info}
                    label={sticker.label}
                    onClose={() => onOpenDialog(null)}
                />
            )}

            <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
                <defs>
                    <filter id={dropShadowId}>
                        <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#000" floodOpacity="0.3" />
                    </filter>
                    <filter id={outerStrokeId}>
                        <feMorphology in="SourceAlpha" operator="dilate" radius="2" result="DILATED" />
                        <feFlood floodColor="white" floodOpacity="1" result="WHITE" />
                        <feComposite in="WHITE" in2="DILATED" operator="in" result="OUTLINE" />
                        <feMerge>
                            <feMergeNode in="OUTLINE" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id={expandAndFillId}>
                        <feMorphology in="SourceAlpha" operator="dilate" radius="2" result="DILATED" />
                        <feFlood floodColor="white" floodOpacity="1" result="WHITE" />
                        <feComposite in="WHITE" in2="DILATED" operator="in" />
                    </filter>
                </defs>
            </svg>

            <div ref={ref} className={styles.stickerContainer}>
                <div ref={shadowRef} className={styles.shadow}>
                    <img src={sticker.src} className={styles.shadowImage} style={{ filter: `url(#${expandAndFillId})` }} alt="" loading="lazy" />
                </div>

                <div className={styles.stickerMain} style={{ filter: `url(#${dropShadowId})` }}>
                    <img src={sticker.src} className={styles.stickerImage} style={{ filter: `url(#${outerStrokeId})` }} alt={sticker.label || ''} draggable={false} loading="lazy" />
                </div>

                <div className={styles.flap}>
                    <img src={sticker.src} className={styles.flapImage} style={{ filter: `url(#${expandAndFillId})` }} alt="" loading="lazy" />
                </div>
            </div>

            {sticker.label && !sticker.isComic && (
                <span className={styles.labelText}>{sticker.label}</span>
            )}
        </button>
    )
}
