// MobileApp.jsx
// App entry para dispositivos móviles.
// Usa MobileSectionScroller y las versiones simplificadas/optimizadas de cada mundo.
// Las secciones pesadas (FaceGrid, PaperWorld, Contact) usan React.lazy para
// diferir su descarga hasta que el usuario scrollee hasta ellas,
// reduciendo el payload inicial que bloquea FCP/LCP.

import { lazy, Suspense } from 'react'
import MobileSectionScroller from './components/MobileSectionScroller/MobileSectionScroller'

// Sección 1 — visible de inmediato: carga eager (sin lazy)
import MobilePortal     from './components/portal/MobilePortal/MobilePortal'
// Sección 2 — segunda sección visible pronto: carga eager
import MobilePixelWorld from './components/worlds/PixelWorld/MobilePixelWorld/MobilePixelWorld'

// Secciones 3-5 — fuera de vista al iniciar: lazy-loaded
// stickers.js (30KB), grid.js (19KB) y MobileContact (25KB) se descargan
// solo cuando el usuario llega a cada sección → menos payload inicial
const MobilePaperWorld = lazy(() => import('./components/worlds/PaperWorld/MobilePaperWorld/MobilePaperWorld'))
const MobileFaceGrid   = lazy(() => import('./components/worlds/FaceGrid/MobileFaceGrid/MobileFaceGrid'))
const MobileContact    = lazy(() => import('./components/contact/MobileContact/MobileContact'))

// Fallback mínimo para las secciones lazy — fondo liso sin layout shift
function SectionFallback() {
  return <div style={{ width: '100%', height: '100%', background: '#0a0a0a' }} />
}

// Wrappers que envuelven cada lazy-component en su propio Suspense
function LazyPaperWorld(props)  { return <Suspense fallback={<SectionFallback />}><MobilePaperWorld {...props} /></Suspense> }
function LazyFaceGrid(props)    { return <Suspense fallback={<SectionFallback />}><MobileFaceGrid   {...props} /></Suspense> }
function LazyContact(props)     { return <Suspense fallback={<SectionFallback />}><MobileContact    {...props} /></Suspense> }

const MOBILE_SECTIONS = [
  { id: 'portal',  label: 'Realities', Component: MobilePortal },
  { id: 'pixel',   label: 'Quién soy', Component: MobilePixelWorld },
  { id: 'paper',   label: 'Qué sé',    Component: LazyPaperWorld },
  { id: 'grid',    label: 'Proyectos', Component: LazyFaceGrid },
  { id: 'contact', label: 'Contacto',  Component: LazyContact },
]

export default function MobileApp() {
  return (
    <MobileSectionScroller sections={MOBILE_SECTIONS} />
  )
}

