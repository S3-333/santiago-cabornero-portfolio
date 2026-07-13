// ─────────────────────────────────────────────────────────
// CONFIGURACIÓN DEL GRID — editá acá
// ─────────────────────────────────────────────────────────

export const GRID_COLS = 5
export const GRID_ROWS = 4

const BASE = '/assets/images/grid'

// Grilla 2D de imágenes [row][col]
// row: 0=arriba extremo → 4=abajo extremo
// col: 0=izquierda extremo → 4=derecha extremo
// Centro [2][2] = frente
export const IMG_POOL = [
    [
        `${BASE}/arriba_izquierda.webp`,
        `${BASE}/arriba_izquierda_poco.webp`,
        `${BASE}/arriba.webp`,
        `${BASE}/arriba_derecha_poco.webp`,
        `${BASE}/arriba_derecha.webp`,
    ],
    [
        `${BASE}/arriba_izquierda_poco.webp`,
        `${BASE}/arriba_izquierda_poco.webp`,
        `${BASE}/arriba.webp`,
        `${BASE}/arriba_derecha_poco.webp`,
        `${BASE}/arriba_derecha_poco.webp`,
    ],
    [
        `${BASE}/izquierda.webp`,
        `${BASE}/izquierda_poco.webp`,
        `${BASE}/frente.webp`,
        `${BASE}/derecha_poco.webp`,
        `${BASE}/derecha.webp`,
    ],
    [
        `${BASE}/abajo_izquierda_poco.webp`,
        `${BASE}/abajo_izquierda_poco.webp`,
        `${BASE}/abajo.webp`,
        `${BASE}/abajo_derecha_poco.webp`,
        `${BASE}/abajo_derecha_poco.webp`,
    ],
    [
        `${BASE}/abajo_izquierda.webp`,
        `${BASE}/abajo_izquierda_poco.webp`,
        `${BASE}/abajo.webp`,
        `${BASE}/abajo_derecha_poco.webp`,
        `${BASE}/abajo_derecha.webp`,
    ],
]

// Precarga todas las imágenes del pool
export function preloadGazeImages() {
    IMG_POOL.flat().forEach(src => {
        const img = new Image()
        img.src = src
    })
}

// ─────────────────────────────────────────────────────────
// PROYECTOS — editá acá para agregar/quitar proyectos
// cellIndex = fila * GRID_COLS + columna
//
// Layout de índices (5 cols × 4 filas):
//   [0]  [1]  [2]  [3]  [4]
//   [5]  [6]  [7]  [8]  [9]
//   [10] [11] [12] [13] [14]
//   [15] [16] [17] [18] [19]
// ─────────────────────────────────────────────────────────

export const PROJECTS = [
    {
        cellIndex: 2,
        title: 'Bank Transaction Analyzer',
        titleEs: 'Analizador de Transacciones Bancarias',
        description: 'A personal finance tool built with Python and Streamlit that reads bank CSV exports, automatically categorizes transactions using a persistent keyword-rule system stored in SQLite, and visualizes spending and income through interactive dashboards. Designed with a modular architecture that separates categorization logic, data storage and UI, making it easy to extend with new banks or rule sets without touching the core.',
        descriptionEs: 'Una herramienta de finanzas personales construida con Python y Streamlit que lee exportaciones CSV bancarias, categoriza transacciones automáticamente usando un sistema persistente de reglas por palabras clave almacenado en SQLite, y visualiza gastos e ingresos a través de dashboards interactivos. Diseñado con una arquitectura modular que separa la lógica de categorización, el almacenamiento de datos y la UI, haciendo fácil extenderlo con nuevos bancos o conjuntos de reglas sin tocar el núcleo.',
        tags: ['Python', 'Streamlit', 'SQLite', 'Pandas'],
        link: 'https://github.com/S3-333/personal-finance-streamlit',
        demo: null,
        image: null,
        video: '/assets/video/csv_p.webm',
    },
    {
        cellIndex: 7,
        title: 'Payment Engine API',
        titleEs: 'API de Motor de Pagos',
        description: 'A production-ready REST API for account management and concurrent bank transfers, built with FastAPI and SQLAlchemy over MySQL. Implements row-level locking to guarantee no money is lost or duplicated during parallel transactions, a layered architecture separating domain, application, infrastructure and presentation concerns, and schema migrations managed with Alembic. CI runs automatically on Python 3.11 and 3.12 via GitHub Actions on every push.',
        descriptionEs: 'Una API REST lista para producción para gestión de cuentas y transferencias bancarias concurrentes, construida con FastAPI y SQLAlchemy sobre MySQL. Implementa bloqueo a nivel de fila para garantizar que no se pierda ni se duplique dinero durante transacciones paralelas, una arquitectura en capas separando dominio, aplicación, infraestructura y presentación, y migraciones de esquema gestionadas con Alembic. CI se ejecuta automáticamente en Python 3.11 y 3.12 vía GitHub Actions en cada push.',
        tags: ['FastAPI', 'SQLAlchemy', 'MySQL', 'Alembic', 'Docker', 'Pytest', 'GitHub Actions'],
        link: 'https://github.com/S3-333/payments-api',
        demo: null,
        image: '/assets/images/projects/api.webp',
        video: null,
    },
    {
        cellIndex: 12,
        title: 'Music Discovery App',
        titleEs: 'App de Descubrimiento Musical',
        description: 'A full-stack music explorer built with FastAPI and React that connects to the Last.fm API to surface artists, albums and trending tracks. The backend implements an in-memory cache layer that cuts external API calls significantly, while the frontend delivers a premium feel through GSAP animations, smooth scrolling with Lenis, and a minimalist dark/light UI designed to let the music speak rather than the interface.',
        descriptionEs: 'Un explorador musical full-stack construido con FastAPI y React que se conecta a la API de Last.fm para descubrir artistas, álbumes y pistas en tendencia. El backend implementa una capa de caché en memoria que reduce significativamente las llamadas a APIs externas, mientras que el frontend ofrece una sensación premium a través de animaciones GSAP, scroll suave con Lenis y una UI minimalista en modo oscuro/claro diseñada para dejar que la música hable en lugar de la interfaz.',
        tags: ['FastAPI', 'React', 'Vite', 'TypeScript', 'GSAP', 'Lenis', 'HTTPX'],
        link: 'https://github.com/S3-333/Music-Discovery',
        demo: null,
        image: null,
        video: '/assets/video/music_api1.webm',
    },
    {
        cellIndex: 17,
        title: 'Interactive Portfolio',
        titleEs: 'Portafolio Interactivo',
        description: 'A dynamic portfolio featuring a gaze-tracking interactive grid that reacts to mouse movement. The UI delivers a premium aesthetic through smooth micro-animations, a clean typography system, and seamless transitions, providing an engaging way to showcase technical projects and skills.',
        descriptionEs: 'Un portafolio dinámico con una cuadrícula interactiva que sigue la mirada y reacciona al movimiento del mouse. La interfaz de usuario ofrece una estética premium a través de microanimaciones suaves, un sistema de tipografía limpio y transiciones perfectas, proporcionando una forma atractiva de mostrar proyectos y habilidades técnicas.',
        tags: ['React', 'GSAP', 'Vite'],
        link: 'https://github.com/S3-333/santiago-cabornero-portfolio',
        demo: null,
        image: null,
        video: null,
    },
]