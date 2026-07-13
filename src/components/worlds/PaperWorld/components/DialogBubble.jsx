import { useLanguage } from '../../../../context/LanguageContext'
import styles from './DialogBubble.module.css'

export default function DialogBubble({ info, label, onClose }) {
    const { language } = useLanguage()
    return (
        <div className={styles.bubble} onMouseDown={e => e.stopPropagation()}>
            <button type="button" className={styles.close} onClick={onClose}>✕</button>
            <p className={styles.name}>{label}</p>
            <div className={styles.row}><span>{language === 'es' ? 'Nivel' : 'Level'}</span><span>{info.nivel}</span></div>
            <div className={styles.row}><span>{language === 'es' ? 'Tiempo' : 'Time'}</span><span>{info.tiempo}</span></div>
            <p className={styles.opinion}>"{info.opinion}"</p>
        </div>
    )
}