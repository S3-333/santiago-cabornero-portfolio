import { useEffect, useRef } from 'react'
import styles from './AmbientBlobs.module.css'

export default function AmbientBlobs() {
  const blob1Ref = useRef(null)
  const blob2Ref = useRef(null)
  const blob3Ref = useRef(null)
  const blob4Ref = useRef(null)

  useEffect(() => {
    // Inicializamos con el centro de la pantalla
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    
    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove);

    // Posiciones independientes para hacer un "lerp" (interpolación lineal)
    // hacia la posición del mouse, cada uno a distinta velocidad.
    const pos = {
      b1: { x: mouseX, y: mouseY },
      b2: { x: mouseX, y: mouseY },
      b3: { x: mouseX, y: mouseY },
      b4: { x: mouseX, y: mouseY },
    }

    let animationFrameId;
    const render = () => {
      const time = Date.now() * 0.001; // Para oscilaciones

      // Blob 1 (#b0dcdd): Sigue de cerca al mouse
      pos.b1.x += (mouseX - pos.b1.x) * 0.06;
      pos.b1.y += (mouseY - pos.b1.y) * 0.06;

      // Blob 2 (#e6e3e6): Sigue lento y con un pequeño offset sinusoidal
      pos.b2.x += (mouseX + Math.sin(time) * 100 - pos.b2.x) * 0.03;
      pos.b2.y += (mouseY + Math.cos(time) * 100 - pos.b2.y) * 0.03;

      // Blob 3 (#edd8e1): Órbita más amplia alrededor del mouse
      pos.b3.x += (mouseX + Math.sin(time * 0.5) * 250 - pos.b3.x) * 0.02;
      pos.b3.y += (mouseY + Math.cos(time * 0.5) * 250 - pos.b3.y) * 0.02;

      // Blob 4 (#f0868e): Movimiento casi independiente, muy atraído lentamente
      pos.b4.x += (mouseX + Math.cos(time * 0.3) * 350 - pos.b4.x) * 0.015;
      pos.b4.y += (mouseY + Math.sin(time * 0.4) * 350 - pos.b4.y) * 0.015;

      // Aplicar transformaciones usando translate3d para aceleración por GPU
      if (blob1Ref.current) blob1Ref.current.style.transform = `translate3d(${pos.b1.x}px, ${pos.b1.y}px, 0)`;
      if (blob2Ref.current) blob2Ref.current.style.transform = `translate3d(${pos.b2.x}px, ${pos.b2.y}px, 0)`;
      if (blob3Ref.current) blob3Ref.current.style.transform = `translate3d(${pos.b3.x}px, ${pos.b3.y}px, 0)`;
      if (blob4Ref.current) blob4Ref.current.style.transform = `translate3d(${pos.b4.x}px, ${pos.b4.y}px, 0)`;

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationFrameId);
    }
  }, []);

  return (
    <div className={styles.container}>
      {/* 
        El efecto bokeh/glow se logra con elementos redondos muy desenfocados
        mediante CSS. No bloquean interacciones porque container tiene pointer-events: none.
      */}
      <div ref={blob4Ref} className={`${styles.blob} ${styles.blob4}`}></div>
      <div ref={blob3Ref} className={`${styles.blob} ${styles.blob3}`}></div>
      <div ref={blob2Ref} className={`${styles.blob} ${styles.blob2}`}></div>
      <div ref={blob1Ref} className={`${styles.blob} ${styles.blob1}`}></div>
    </div>
  )
}
