// FaceGrid.jsx
// FIXES DE AUDITORÍA aplicados:
//   #5  — collapseGrid: eliminado setTimeout suelto, se usa onComplete de GSAP
//          para evitar que el setState se ejecute sobre un componente desmontado.
//   #6  — isActive (prop) ya no hace shadow con la variable local de celda:
//          la variable local se renombra a `isActiveCell`.
//   #12 — preloadImages: eliminado el useCallback innecesario (deps=[]).
//   NEW — isInView converted from useState to useRef (value never rendered on screen)
//   NEW — added type="button" to all buttons
//   NEW — added accessible label to unlabeled lang toggle button
//   NEW — interactive static divs now use role="button" + keyboard handler

import { useRef, useState, useCallback, useEffect } from 'react'
import gsap from 'gsap'
import { GRID_COLS, GRID_ROWS, PROJECTS, IMG_POOL, preloadGazeImages } from './data/grid'
import { useFaceGrid } from './hooks/useFaceGrid'
import { useLanguage } from '../../../context/LanguageContext'
import styles from './FaceGrid.module.css'

const TOTAL_CELLS = GRID_COLS * GRID_ROWS

// Map rápido de cellIndex → proyecto
const PROJECT_MAP = Object.fromEntries(PROJECTS.map(p => [p.cellIndex, p]))

export default function FaceGrid({ isActive }) {
    const { language, toggleLanguage } = useLanguage()
    const gridRef    = useRef(null)
    const sectionRef = useRef(null)

    const [activeProject,   setActiveProject]   = useState(null)
    const [isExpanded,      setIsExpanded]       = useState(false)
    // FIX: isInView is only used in a handler (IntersectionObserver) and never rendered —
    // use useRef instead of useState so it doesn't trigger unnecessary re-renders
    const isInViewRef = useRef(false)
    const [isIntroVisible,  setIsIntroVisible]   = useState(true)

    useFaceGrid(gridRef, isActive)

    // FIX #12: sin useCallback innecesario — las deps eran [] así que nunca cambiaba
    useEffect(() => { preloadGazeImages() }, [])

    // ── Expandir celda de proyecto ───────────────────
    const expandCell = useCallback((project) => {
        if (isExpanded) return

        const col = project.cellIndex % GRID_COLS
        const row = Math.floor(project.cellIndex / GRID_COLS)

        setActiveProject(project)
        setIsExpanded(true)

        if (!gridRef.current) return
        const cells = gridRef.current.querySelectorAll('[data-cell-index]')

        cells.forEach(cell => {
            const idx     = parseInt(cell.dataset.cellIndex)
            const cellCol = idx % GRID_COLS
            const cellRow = Math.floor(idx / GRID_COLS)

            const isActiveCol = cellCol === col
            const isActiveRow = cellRow === row

            if (isActiveCol && isActiveRow) {
                gsap.to(cell, { width: '100vw', height: '100dvh', duration: 0.55, ease: 'power3.inOut' })
            } else {
                gsap.to(cell, {
                    width:    isActiveCol ? '100vw' : '0px',
                    height:   isActiveRow ? '100dvh' : '0px',
                    overflow: 'hidden',
                    duration: 0.55,
                    ease: 'power3.inOut',
                })
            }
        })
    }, [isExpanded])

    // ── Colapsar de vuelta al grid ───────────────────
    // FIX #5: eliminado el setTimeout de 200ms.
    const collapseGrid = useCallback(() => {
        if (!isExpanded || !gridRef.current) return

        const cellW = `${100 / GRID_COLS}vw`
        const cellH = `${100 / GRID_ROWS}dvh`
        const cells = gridRef.current.querySelectorAll('[data-cell-index]')

        const content = gridRef.current.querySelector(`.${styles.projectContent}`)

        const expandCells = () => {
            if (!gridRef.current) return
            setActiveProject(null)
            setIsExpanded(false)
            cells.forEach(cell => {
                gsap.to(cell, { width: cellW, height: cellH, overflow: 'visible', duration: 0.45, ease: 'power3.out' })
            })
        }

        if (content) {
            gsap.to(content, {
                opacity:    0,
                duration:   0.2,
                ease:       'power1.out',
                onComplete: expandCells,
            })
        } else {
            expandCells()
        }
    }, [isExpanded])

    // Escape para cerrar
    useEffect(() => {
        function onKey(e) {
            if (e.key === 'Escape') collapseGrid()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [collapseGrid])

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

    return (
        <section ref={sectionRef} className={styles.wrapper}>
            {isIntroVisible && (
                // role="button" + keyboard handler for accessible interaction on static element
                <button
                  type="button"
                  className={styles.introOverlay}
                  onClick={handleStart}
                  aria-label={language === 'es' ? 'Presiona Enter o haz click para entrar' : 'Press Enter or click to enter'}
                  onKeyDown={e => e.key === 'Enter' && handleStart(e)}
                >
                    <div className={styles.introBox}>
                        <p className={styles.introTag}>— WORLD 03</p>
                        <h2 className={styles.introTitle}>{language === 'es' ? 'MIS PROYECTOS' : 'MY PROJECTS'}</h2>
                        <p className={styles.introDesc}>
                            {language === 'es' ? (
                                <>Los recuadros centrales ocultan proyectos.<br />Haz click para descubrirlos.</>
                            ) : (
                                <>The central tiles hide projects.<br />Click to discover them.</>
                            )}
                        </p>
                        <p className={styles.introPrompt}>{language === 'es' ? '[ PRESIONA ENTER ]' : '[ PRESS ENTER ]'}</p>
                    </div>
                </button>
            )}
            <div
                ref={gridRef}
                className={styles.grid}
                style={{
                    gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
                    gridTemplateRows:    `repeat(${GRID_ROWS}, 1fr)`,
                }}
            >
                {Array.from({ length: TOTAL_CELLS }, (_, i) => {
                    const project = PROJECT_MAP[i]
                    const isProject = !!project

                    // FIX #6: renombrado de `isActive` a `isActiveCell`
                    const isActiveCell = activeProject?.cellIndex === i

                    return (
                        <div
                            key={i}
                            data-cell-index={i}
                            className={`
                              ${styles.cell}
                              ${isProject   ? styles.cellProject : ''}
                              ${isActiveCell ? styles.cellActive  : ''}
                            `}
                            // FIX: add role + keyboard handler so screen readers can trigger clicks
                            role={isProject || (isExpanded && isActiveCell) ? 'button' : 'presentation'}
                            tabIndex={isProject || (isExpanded && isActiveCell) ? 0 : undefined}
                            aria-label={isProject ? (language === 'es' && project.titleEs ? project.titleEs : project.title) : undefined}
                            onClick={() => {
                                if (isExpanded && isActiveCell) collapseGrid()
                                else if (isProject && !isExpanded) expandCell(project)
                            }}
                            onKeyDown={e => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    if (isExpanded && isActiveCell) collapseGrid()
                                    else if (isProject && !isExpanded) expandCell(project)
                                }
                            }}
                        >
                            <img
                                src={IMG_POOL[2][2]}
                                alt=""
                                className={styles.cellImg}
                                draggable={false}
                                loading="lazy"
                            />
                            {isProject && !isExpanded && (
                                <div className={styles.projectHint}>
                                    <span>{language === 'es' && project.titleEs ? project.titleEs : project.title}</span>
                                </div>
                            )}
                            {isActiveCell && isExpanded && (
                                <div className={styles.projectContent}>
                                    <button type="button" className={styles.closeBtn} onClick={collapseGrid} aria-label="Cerrar proyecto">✕</button>
                                    <button type="button" className={styles.langToggleBtn} onClick={(e) => {
                                        e.stopPropagation()
                                        toggleLanguage()
                                    }} aria-label={language === 'es' ? 'Cambiar idioma a inglés' : 'Switch language to Spanish'}>
                                        {language === 'es' ? 'ES' : 'EN'}
                                    </button>
                                    {project.video ? (
                                        <video src={project.video} title={project.title} autoPlay muted loop playsInline className={styles.projectImg} />
                                    ) : project.image && (
                                        <img src={project.image} alt={project.title} className={styles.projectImg} loading="lazy" />
                                    )}
                                    <div className={styles.projectInfo}>
                                        <h2 className={styles.projectTitle}>{language === 'es' && project.titleEs ? project.titleEs : project.title}</h2>
                                        <p className={styles.projectDesc}>{language === 'es' && project.descriptionEs ? project.descriptionEs : project.description}</p>
                                        <div className={styles.tags}>
                                            {project.tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
                                        </div>
                                        <div className={styles.links}>
                                            {project.link && <a href={project.link} target="_blank" rel="noreferrer">GitHub →</a>}
                                            {project.demo && <a href={project.demo} target="_blank" rel="noreferrer">Demo →</a>}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </section>
    )
}