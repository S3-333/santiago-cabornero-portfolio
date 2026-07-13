// App.jsx
// Punto de entrada principal.
// Detecta el dispositivo y carga SOLO el bundle correspondiente
// (desktop o mobile) via React.lazy — code splitting automático de Vite.

import { lazy, Suspense } from 'react'
import { useMobile } from './hooks/useMobile'
import FaviconAnimator from './components/FaviconAnimator/FaviconAnimator'

const DesktopApp = lazy(() => import('./DesktopApp'))
const MobileApp  = lazy(() => import('./MobileApp'))

function SplashLoader() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: '#fff',
        opacity: 0.6,
        animation: 'pulse 1.2s ease-in-out infinite',
      }} />
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.4); }
        }
      `}</style>
    </div>
  )
}

export default function App() {
  const isMobile = useMobile()

  return (
    <>
      {/* FaviconAnimator solo en desktop — en mobile el favicon queda estático (a.webp desde index.html) */}
      {!isMobile && <FaviconAnimator />}
      <Suspense fallback={<SplashLoader />}>
        {isMobile ? <MobileApp /> : <DesktopApp />}
      </Suspense>
    </>
  )
}
