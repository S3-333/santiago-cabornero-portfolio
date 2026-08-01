import { useRef, useState, useCallback, useEffect } from 'react'
import { usePaperWorld } from './hooks/usePaperWorld'
import { STICKERS, WORLD_WIDTH, WORLD_HEIGHT } from './data/stickers'
import Sticker from './components/Sticker'
import { useLanguage } from '../../../context/LanguageContext'
import styles from './PaperWorld.module.css'

export default function PaperWorld({ isActive }) {
    const { language } = useLanguage()
    const worldRef = useRef(null)
    const sectionRef = useRef(null)
    const [activeDialogId, setActiveDialogId] = useState(null)
    // FIX: isInView is only set in an IntersectionObserver callback and never rendered —
    // use useRef instead of useState to avoid unnecessary re-renders
    const isInViewRef = useRef(false)
    const [isIntroVisible, setIsIntroVisible] = useState(true)

    usePaperWorld(worldRef, sectionRef)

    const handleOpenDialog = useCallback((id) => {
        setActiveDialogId(id)
    }, [])

    // Cerrar diálogo al clickear el fondo
    function onViewportClick(e) {
        if (isIntroVisible) return
        if (e.target === worldRef.current) {
            setActiveDialogId(null)
        }
    }

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { isInViewRef.current = entry.isIntersecting },
            { threshold: 0.3 }
        )
        if (sectionRef.current) observer.observe(sectionRef.current)
        return () => observer.disconnect()
    }, [])

    const handleStart = useCallback((e) => {
        if (!isActive) return
        if (e.key === 'Enter' || e.type === 'click') {
            setIsIntroVisible(false)
        }
    }, [isActive])

    useEffect(() => {
        window.addEventListener('keydown', handleStart)
        return () => window.removeEventListener('keydown', handleStart)
    }, [handleStart])

    useEffect(() => {
        function handleEscape(e) {
            if (e.key === 'Escape') setActiveDialogId(null)
        }
        window.addEventListener('keydown', handleEscape)
        return () => window.removeEventListener('keydown', handleEscape)
    }, [])

    return (
        <section
            ref={sectionRef}
            className={styles.viewport}
        >
            {isIntroVisible && (
                // FIX: static div with click handler needs role + keyboard handler for accessibility
                <button
                  type="button"
                  className={styles.introOverlay}
                  onClick={handleStart}
                  aria-label={language === 'es' ? 'Presiona Enter o haz click para explorar' : 'Press Enter or click to explore'}
                  onKeyDown={e => e.key === 'Enter' && handleStart(e)}
                >
                    <div className={styles.introBox}>
                        <p className={styles.introTag}>— WORLD 02</p>
                        <h2 className={styles.introTitle}>{language === 'es' ? 'HABILIDADES' : 'SKILLS & KNOWLEDGE'}</h2>
                        <p className={styles.introDesc}>
                            {language === 'es' ? 'Explora el tablero. Haz click en los stickers para saber más.' : 'Explore the board. Click on the stickers to learn more.'}
                        </p>
                        <p className={styles.introPrompt}>{language === 'es' ? '[ PRESIONA ENTER ]' : '[ PRESS ENTER ]'}</p>
                    </div>
                </button>
            )}
            <div
                ref={worldRef}
                className={`${styles.world} paper-bg`}
                style={{ width: WORLD_WIDTH, height: WORLD_HEIGHT }}
                onClick={onViewportClick}
                role="presentation"
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onViewportClick(e) }}
            >
                {STICKERS.map(sticker => (
                    <Sticker
                        key={sticker.id}
                        sticker={sticker}
                        onOpenDialog={handleOpenDialog}
                        activeDialogId={activeDialogId}
                    />
                ))}
            </div>
        </section>
    )
}