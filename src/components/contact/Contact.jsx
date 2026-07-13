import { useState, useEffect, useRef } from 'react'
import styles from './Contact.module.css'
import AmbientBlobs from './AmbientBlobs'
import { useLanguage } from '../../context/LanguageContext'

// Moved to module scope — pure function, doesn't use local state
// Method of email obfuscation via array + getter to avoid hardcoding the string
function getEmail() {
  const parts = ["santiagoivan", "cabornero", "gmail", "com"]
  return `${parts[0]}${parts[1]}@${parts[2]}.${parts[3]}`
}

const handleMailTo = (e) => {
  e.preventDefault()
  e.stopPropagation()
  window.location.href = `mailto:${getEmail()}`
}

// ─── Clock ────────────────────────────────────────────────────────────────────
function LiveClock() {
  // FIX: Initialize state directly so there's no extra render with empty "time"
  const [time, setTime] = useState(() => {
    return new Date().toLocaleTimeString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  })

  useEffect(() => {
    const fmt = () => {
      const now = new Date()
      const formatted = now.toLocaleTimeString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
      setTime(formatted)
    }
    const id = setInterval(fmt, 1000)
    return () => clearInterval(id)
  }, [])

  return <span className={styles.clockText}>{time}</span>
}

// ─── Contact ──────────────────────────────────────────────────────────────────────────────
export default function Contact() {
  const { language } = useLanguage()
  const [flipped, setFlipped] = useState(false)
  const [copied, setCopied] = useState(false)
  const [fpState, setFpState] = useState('idle') // idle | scanning | matched

  // MEJORA-06: refs para los timeouts de fingerprint — cleanup al desmontar
  const fpTimerMatchedRef = useRef(null)
  const fpTimerIdleRef    = useRef(null)
  const fpIntervalRef     = useRef(null)

  // Cleanup de todos los timers al desmontar el componente
  useEffect(() => {
    return () => {
      clearTimeout(fpTimerMatchedRef.current)
      clearTimeout(fpTimerIdleRef.current)
      clearInterval(fpIntervalRef.current)
    }
  }, [])

  const handleCopyMail = (e) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(getEmail()).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleFingerprintClick = (e) => {
    e.stopPropagation()
    if (fpState !== 'idle') return

    // Cancelar timers anteriores si los hubiera
    clearTimeout(fpTimerMatchedRef.current)
    clearTimeout(fpTimerIdleRef.current)
    clearInterval(fpIntervalRef.current)

    setFpState('scanning')

    let prog = 0
    fpIntervalRef.current = setInterval(() => {
      prog += Math.floor(Math.random() * 6) + 2
      if (prog >= 100) {
        clearInterval(fpIntervalRef.current)
        fpTimerMatchedRef.current = setTimeout(() => setFpState('matched'), 300)
        fpTimerIdleRef.current    = setTimeout(() => setFpState('idle'), 3400)
      }
    }, 80)
  }

  return (
    <div className={styles.root}>
      
      {/* ── Fondo interactivo (Luces ambientales) ── */}
      <AmbientBlobs />

      {/* ── DNI Flip Card ── */}
      <div
        role="button"
        tabIndex={0}
        className={`${styles.scene} ${flipped ? styles.sceneFlipped : ''}`}
        onClick={() => setFlipped(f => !f)}
        aria-label="Dar vuelta el DNI"
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setFlipped(f => !f)
          }
        }}
      >
        <div className={styles.card}>

          {/* ════════════════ FRENTE ════════════════ */}
          <div className={styles.cardFace}>
            <img
              src="/assets/images/dni/dni_frontaldef1.webp"
              alt="DNI frente"
              className={styles.dniImage}
              draggable={false}
            />

            {/* ── Overlays de texto – mover a gusto ── */}

            {/* LinkedIn */}
            <div className={`${styles.overlay} ${styles.overlayLinkedin}`}>
              <div className={styles.linkSubtitle}>LINKEDIN</div>
              <a
                href="https://www.linkedin.com/in/santiago-ivan-cabornero"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
                onClick={e => e.stopPropagation()}
              >
                <span className={styles.linkItem}>
                  LinkedIn
                  <img src="/assets/images/dni/ln.svg" alt="LinkedIn" className={styles.linkIcon} />
                </span>
              </a>
            </div>

            {/* GitHub */}
            <div className={`${styles.overlay} ${styles.overlayGithub}`}>
              <div className={styles.linkSubtitle}>GITHUB</div>
              <a
                href="https://github.com/S3-333" 
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
                onClick={e => e.stopPropagation()}
              >
                <span className={styles.linkItem}>
                  GitHub
                  <img
                    src="/assets/images/papel/techs/github.svg"
                    alt="GitHub"
                    className={styles.linkIcon}
                  />
                </span>
              </a>
            </div>

            {/* IP (número de DNI ficticio) */}
            <div className={`${styles.overlay} ${styles.overlayIp}`}>
              <div className={styles.linkSubtitle}>IP ADDRESS</div>
              <span className={styles.dataText}>192.168.4.72</span>
            </div>

            {/* Mail */}
            <div className={`${styles.overlay} ${styles.overlayMail}`}>
              <div className={styles.linkSubtitle}>MAIL</div>
              <div className={styles.linkItem}>
                {/* El texto abre el mailto — use button instead of <a href="#"> for in-page action */}
                <button
                  type="button"
                  className={styles.link}
                  onClick={handleMailTo}
                  title="Enviar correo"
                  aria-label="Enviar correo a Santiago"
                >
                  {/* Ofuscación visual en el DOM */}
                  <span style={{ display: 'none' }}>bot-trap</span>
                  <span>santiagoivan</span>
                  <span>cabornero</span>
                  <span>@</span>
                  <span>gmail.com</span>
                </button>
                
                {/* El icono copia al portapapeles — use button for interactive img */}
                <button
                  type="button"
                  className={`${styles.copyIcon} ${copied ? styles.copyIconActive : ''}`}
                  onClick={handleCopyMail}
                  title="Copiar correo"
                  aria-label="Copiar dirección de email al portapapeles"
                >
                  <img 
                    src="/assets/images/dni/gmail.svg" 
                    alt=""
                    className={styles.linkIcon}
                  />
                </button>
                {copied && <span className={styles.copyFeedback}>{language === 'es' ? 'Copiado' : 'Copied'}</span>}
              </div>
            </div>

            {/* CV Descargable */}
            <div className={`${styles.overlay} ${styles.overlayCv}`}>
              <div className={styles.linkSubtitle}>CURRICULUM VITAE / RESUME</div>
              <a
                href="/assets/pdf/CV_Santiago_Cabornero.pdf"
                download
                className={`${styles.link} ${styles.cvLink}`}
                onClick={e => e.stopPropagation()}
              >
                <span className={styles.linkItem}>
                  CV_PDF
                  <img src="/assets/images/dni/download.svg" alt="CV" className={styles.linkIcon} />
                </span>
              </a>
            </div>

            {/* Reloj — abajo a la izquierda */}
            <div className={`${styles.overlay} ${styles.overlayClock}`}>
              <div className={styles.linkSubtitle}>BUENOS AIRES, AR</div>
              <LiveClock />
            </div>

            {/* Título Principal*/}
            <div className={`${styles.overlay} ${styles.overlayTitle}`}>
              <h1 className={styles.mainTitle}>CONTACTS</h1>
            </div>

          </div>

          {/* ════════════════ TRASERO ════════════════ */}
          <div className={`${styles.cardFace} ${styles.cardBack}`}>
            <img
              src="/assets/images/dni/dni_trasero1.webp"
              alt="DNI trasero"
              className={styles.dniImage}
              draggable={false}
            />

            {/* Mensaje de despedida (Arriba a la izquierda) */}
            <div className={`${styles.overlay} ${styles.overlayFarewellTopLeft}`}>
              <p className={styles.farewellTitle}>Always open to new proposals, challenges, and networking.
                <br /> <br />No dudes en contactarme </p>
            </div>

            {/* ── Huella Dactilar — Arriba a la derecha ── */}
            {/* role="button" replaced with native button semantics (div-role → button) */}
            <button
              type="button"
              className={`${styles.overlay} ${styles.overlayFingerprint}`}
              onClick={handleFingerprintClick}
              tabIndex={flipped ? 0 : -1}
              aria-label="Escanear huella dactilar"
              onKeyDown={e => e.key === 'Enter' && handleFingerprintClick(e)}
            >
              {/* Contenedor de la huella con efectos */}
              <div className={`${styles.fingerprintWrap} ${fpState !== 'idle' ? styles.fingerprintActive : ''} ${fpState === 'matched' ? styles.fingerprintMatched : ''}`}>
                <img
                  src="/assets/images/dni/huella.webp"
                  alt="Huella dactilar"
                  className={styles.fingerprintImg}
                  draggable={false}
                  loading="lazy"
                />

                {/* Línea de escaneo */}
                {fpState === 'scanning' && (
                  <div className={styles.scanLine} />
                )}

                {/* Grid de análisis */}
                {(fpState === 'scanning' || fpState === 'matched') && (
                  <div className={`${styles.scanGrid} ${fpState === 'matched' ? styles.scanGridMatched : ''}`} />
                )}

                {/* Puntos de feature detection */}
                {fpState === 'matched' && (
                  <>
                    <div className={`${styles.fpDot} ${styles.fpDot1}`} />
                    <div className={`${styles.fpDot} ${styles.fpDot2}`} />
                    <div className={`${styles.fpDot} ${styles.fpDot3}`} />
                    <div className={`${styles.fpDot} ${styles.fpDot4}`} />
                    <div className={`${styles.fpDot} ${styles.fpDot5}`} />
                  </>
                )}
              </div>
            </button>

            {/* Mensaje de despedida (Abajo al centro) */}
            <div className={`${styles.overlay} ${styles.overlayFarewellBottomCenter}`}>
              <p className={styles.farewellBody}>
                GRACIAS&lt;&lt;&lt;&lt;&lt;POR&lt;&lt;&lt;VISITAR&lt;&lt;&lt;MI&lt;&lt;&lt;PORTFOLIO&lt;<br />
                THANKS&lt;&lt;&lt;FOR&lt;&lt;&lt;&lt;VISITING&lt;&lt;&lt;MY&lt;&lt;&lt;PORTFOLIO&lt;<br />
                SEE&lt;&lt;&lt;&lt;YOU&lt;&lt;&lt;&lt;SOON&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
              </p>
            </div>
            
          </div>

        </div>
      </div>

    </div>
  )
}
