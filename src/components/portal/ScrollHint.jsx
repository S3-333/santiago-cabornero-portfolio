import { useEffect, useRef } from 'react'
import styles from './ScrollHint.module.css'

function ScrollHint({ className = '' }) {
  const hintRef = useRef(null)

  useEffect(() => {
    const handler = () => {
      if (!hintRef.current) return
      hintRef.current.style.opacity = window.scrollY > 50 ? '0' : '1'
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div ref={hintRef} className={`${styles.hint} ${className}`}>
      <span className={styles.text}>scroll</span>
      <div className={styles.line} />
    </div>
  )
}

export default ScrollHint