# Santiago Cabornero — Portfolio

Portfolio personal interactivo construido con React y Vite. Presenta proyectos y habilidades a través de experiencias visuales inmersivas: un portal de realidades, un mundo pixel art navegable, un mundo de papel con stickers animados, una grilla de proyectos y un formulario de contacto.

Sitio en producción: https://santiago-cabornero-portfolio.pages.dev

## Características

- **Portal / Realities** — Galería introductoria con fotografías, video y efectos visuales (parallax, ASCII, glitch, etc.).
- **Pixel World** — RPG de pixel art navegable con teclado o tap. Contiene información personal.
- **Paper World** — Mundo de papel con stickers animados que describen habilidades técnicas.
- **Proyectos** — Grilla interactiva de proyectos personales y profesionales con enlaces a GitHub y demos.
- **Contacto** — Formulario de contacto directo.
- **Soporte bilingüe** — Alternancia entre español e inglés.
- **Experiencias separadas** — Bundles distintos para desktop y mobile con code splitting automático (Vite + `React.lazy`).
- **Optimización mobile** — Versiones simplificadas de cada sección con carga diferida para mejorar FCP/LCP.

## Tecnologías

- **Framework**: React 19
- **Build tool**: Vite 8
- **Animaciones**: GSAP, Framer Motion
- **Estilos**: CSS Modules
- **Linting**: ESLint

## Requisitos

- [Node.js](https://nodejs.org/) (versión LTS recomendada)

## Scripts disponibles

| Comando           | Descripción                                       |
| ----------------- | ------------------------------------------------- |
| `npm run dev`     | Servidor de desarrollo en `http://localhost:5173` |
| `npm run build`   | Genera la carpeta `dist` lista para producción    |
| `npm run preview` | Previsualiza el build de producción localmente    |
| `npm run lint`    | Ejecuta ESLint sobre el proyecto                  |

## Estructura del proyecto

```
portfolio/
├── public/              # Assets estáticos (robots.txt, llms.txt, imágenes, fuentes)
├── src/
│   ├── components/
│   │   ├── contact/     # Formulario de contacto (desktop y mobile)
│   │   ├── portal/      # Portal / Realities y variantes mobile
│   │   └── worlds/      # PixelWorld, PaperWorld, FaceGrid
│   ├── context/         # Contexto de idioma (es/en)
│   ├── hooks/           # Hooks compartidos (detección mobile, etc.)
│   ├── App.jsx          # Entry point con code splitting desktop/mobile
│   ├── DesktopApp.jsx   # Experiencia desktop
│   └── MobileApp.jsx    # Experiencia mobile optimizada
├── index.html
└── vite.config.js
```

## Build de producción

```bash
npm run build
```

El resultado se genera en `dist/` y puede desplegarse en cualquier hosting estático (Vercel, Netlify, GitHub Pages, etc.).

## SEO y LLMs

- `public/robots.txt` — Permite el rastreo completo del sitio.
- `public/llms.txt` — Metadatos para crawlers de IA con descripción del sitio y secciones.
