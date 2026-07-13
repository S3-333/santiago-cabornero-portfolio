// MobileFaceGrid.jsx
// Versión mobile de FaceGrid. Sin gaze tracking interactivo.
// Muestra una lista vertical de proyectos 100% responsive.
// En la parte superior, una galería de las caras (arriba, frente, abajo).

import { useState } from 'react'
import { PROJECTS, IMG_POOL } from '../data/grid'
import { useLanguage } from '../../../../context/LanguageContext'
import styles from './MobileFaceGrid.module.css'

export default function MobileFaceGrid({ isActive }) {
  const { language, toggleLanguage } = useLanguage()
  const [expandedProject, setExpandedProject] = useState(null)

  const openProject = (project) => setExpandedProject(project)
  const closeProject = () => setExpandedProject(null)

  // Extraemos la imagen central de IMG_POOL para usarla como placeholder
  const centerFace = IMG_POOL[2][2]

  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <p className={styles.tag}>— WORLD 03</p>
        <h2 className={styles.title}>{language === 'es' ? 'MIS PROYECTOS' : 'MY PROJECTS'}</h2>
      </div>

      <div className={styles.projectsList}>
        {PROJECTS.map(project => (
          <button
            key={project.cellIndex}
            type="button"
            className={styles.projectCard}
            onClick={() => openProject(project)}
            aria-label={`Ver proyecto ${project.title}`}
          >
            <div className={styles.cardImageContainer}>
              {project.video ? (
                <video src={project.video} autoPlay muted loop playsInline className={styles.cardMedia} />
              ) : project.image ? (
                <img src={project.image} alt={project.title} className={styles.cardMedia} loading="lazy" />
              ) : (
                <div className={styles.placeholderMedia} />
              )}
            </div>
            <div className={styles.cardInfo}>
              <h3 className={styles.cardTitle}>{language === 'es' && project.titleEs ? project.titleEs : project.title}</h3>
              <p className={styles.cardDesc}>
                {language === 'es' && project.descriptionEs ? project.descriptionEs : project.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Modal / Pantalla completa de proyecto */}
      {expandedProject && (
        <div className={styles.fullProject}>
          <button type="button" className={styles.closeBtn} onClick={closeProject} aria-label="Cerrar proyecto">✕</button>
          
          <div className={styles.fullMediaContainer}>
            {expandedProject.video ? (
                <video src={expandedProject.video} autoPlay muted loop playsInline className={styles.fullMedia} />
            ) : expandedProject.image ? (
                <img src={expandedProject.image} alt={expandedProject.title} className={styles.fullMedia} loading="lazy" />
            ) : (
                <img src={centerFace} alt="Placeholder" className={styles.fullMedia} />
            )}
          </div>

          <div className={styles.fullInfo}>
            <h2 className={styles.fullTitle}>{language === 'es' && expandedProject.titleEs ? expandedProject.titleEs : expandedProject.title}</h2>
            <div className={styles.tags}>
                {expandedProject.tags.map(t => <span key={t} className={styles.tagBadge}>{t}</span>)}
            </div>
            <p className={styles.fullDesc}>{language === 'es' && expandedProject.descriptionEs ? expandedProject.descriptionEs : expandedProject.description}</p>
            
            <div className={styles.links}>
                {expandedProject.link && <a href={expandedProject.link} target="_blank" rel="noreferrer">GitHub →</a>}
                {expandedProject.demo && <a href={expandedProject.demo} target="_blank" rel="noreferrer">Demo →</a>}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
