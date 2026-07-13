// DesktopApp.jsx
// Contiene la experiencia desktop original intacta.
// Solo se carga cuando useMobile() retorna false.
// FaviconAnimator NO se importa aquí — ya se monta en App.jsx para evitar doble instancia.

import SectionScroller from './components/SectionScroller/SectionScroller'

import Portal     from './components/portal/Portal'
import PixelWorld from './components/worlds/PixelWorld/PixelWorld'
import PaperWorld from './components/worlds/PaperWorld/PaperWorld'
import FaceGrid   from './components/worlds/FaceGrid/FaceGrid'
import Contact    from './components/contact/Contact'

const SECTIONS = [
  { id: 'portal',  label: 'Realities',  Component: Portal     },
  { id: 'pixel',   label: 'Quién soy',  Component: PixelWorld },
  { id: 'paper',   label: 'Qué sé',     Component: PaperWorld },
  { id: 'grid',    label: 'Proyectos',  Component: FaceGrid   },
  { id: 'contact', label: 'Contacto',   Component: Contact    },
]

export default function DesktopApp() {
  return (
    <SectionScroller sections={SECTIONS} />
  )
}
