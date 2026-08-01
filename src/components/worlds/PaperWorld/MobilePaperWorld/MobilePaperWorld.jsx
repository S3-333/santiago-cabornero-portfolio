// MobilePaperWorld.jsx
// Versión mobile de PaperWorld. Galería scrolleable por categorías.
// Sin drag libre. Interfaz de cards con modal para detalles.

import { useState } from 'react'
import { STICKERS } from '../data/stickers'
import { useLanguage } from '../../../../context/LanguageContext'
import styles from './MobilePaperWorld.module.css'

const CATEGORIES = {
  es: [
    { key: 'frontend', label: 'Frontend' },
    { key: 'backend',  label: 'Backend & Datos' },
    { key: 'design',   label: 'Diseño e IA' },
    { key: 'tools',    label: 'Herramientas' },
  ],
  en: [
    { key: 'frontend', label: 'Frontend' },
    { key: 'backend',  label: 'Backend & Data' },
    { key: 'design',   label: 'Design & AI' },
    { key: 'tools',    label: 'Tools' },
  ]
}

export default function MobilePaperWorld({ isActive }) {
  const { language, toggleLanguage } = useLanguage()
  const [activeTech, setActiveTech] = useState(null)

  // Filtramos etiquetas y comics (en mobile no usamos comics, o los podríamos usar de fondo).
  const techs = STICKERS.filter(s => !s.isComic && !s.isLabel && !s.isLangToggle)

  const openModal = (tech) => setActiveTech(tech)
  const closeModal = () => setActiveTech(null)

  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <p className={styles.tag}>— WORLD 02</p>
        <h2 className={styles.title}>{language === 'es' ? 'HABILIDADES' : 'SKILLS & KNOWLEDGE'}</h2>
      </div>

      <div className={styles.categories}>
        {CATEGORIES[language].map(cat => {
          const catTechs = techs.filter(t => t.category === cat.key)
          if (catTechs.length === 0) return null

          return (
            <div key={cat.key} className={styles.categoryBlock}>
              <h3 className={styles.categoryTitle}>{cat.label}</h3>
              <div className={styles.scroller}>
                <div className={styles.scrollerInner}>
                  {catTechs.map(tech => (
                    <button
                      key={tech.id}
                      type="button"
                      className={styles.card}
                      onClick={() => openModal(tech)}
                      aria-label={`Ver detalles de ${tech.label}`}
                    >
                      <img src={tech.src} alt="" className={styles.cardIcon} draggable={false} loading="lazy" />
                      <span className={styles.cardLabel}>{tech.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom Sheet / Modal de Información */}
      {activeTech && (
        <div className={styles.modalOverlay}>
          <button
            type="button"
            className={styles.modalBackdrop}
            onClick={closeModal}
            aria-label="Cerrar modal"
          />
          <div
            className={styles.modalSheet}
            onClick={e => e.stopPropagation()}
            role="presentation"
          >
            <button type="button" className={styles.closeBtn} onClick={closeModal} aria-label="Cerrar">
              ✕
            </button>
            <div className={styles.modalHeader}>
              <img src={activeTech.src} alt="" className={styles.modalIcon} />
              <h3 className={styles.modalTitle}>{activeTech.label}</h3>
            </div>
            <div className={styles.modalBody}>
              {(() => {
                const info = language === 'es' && activeTech.info_es ? activeTech.info_es : activeTech.info
                return (
                  <>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>{language === 'es' ? 'Nivel' : 'Level'}:</span>
                      <span className={styles.infoValue}>{info.nivel}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>{language === 'es' ? 'Tiempo' : 'Time'}:</span>
                      <span className={styles.infoValue}>{info.tiempo}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>{language === 'es' ? 'Opinión' : 'Thoughts'}:</span>
                      <p className={styles.infoText}>{info.opinion}</p>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
