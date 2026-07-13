export const WORLD_WIDTH = 3000;
export const WORLD_HEIGHT = 1750;
export const STICKER_SIZE = 140;

export const STICKERS = [
  // ── Frontend ──────────────────────────────────────
  {
    id: "javascript",
    category: "frontend",
    x: 200,
    y: 250,
    src: "/assets/images/papel/techs/js.svg",
    label: "JavaScript",
    info: {
      nivel: "Intermediate",
      tiempo: "2.5 years",
      opinion: "I'd pick this over TypeScript any day",
    },
    info_es: {
      nivel: "Intermedio",
      tiempo: "2.5 años",
      opinion: "Lo elegiría sobre TypeScript cualquier día",
    }
  },
  {
    id: "react",
    category: "frontend",
    x: 450,
    y: 350,
    src: "/assets/images/papel/techs/react.svg",
    label: "React",
    info: {
      nivel: "Intermediate",
      tiempo: "2 years",
      opinion: "My go-to frontend framework",
    },
    info_es: {
      nivel: "Intermedio",
      tiempo: "2 años",
      opinion: "Mi framework frontend de cabecera",
    }
  },
  {
    id: "astro",
    category: "frontend",
    x: 700,
    y: 250,
    src: "/assets/images/papel/techs/astro.svg",
    label: "Astro",
    info: {
      nivel: "Intermediate",
      tiempo: "1 year",
      opinion: "Perfect for static sites",
    },
    info_es: {
      nivel: "Intermedio",
      tiempo: "1 año",
      opinion: "Perfecto para sitios estáticos",
    }
  },
  {
    id: "tailwind",
    category: "frontend",
    x: 950,
    y: 350,
    src: "/assets/images/papel/techs/tailwind.svg",
    label: "Tailwind",
    info: {
      nivel: "Advanced",
      tiempo: "2 years",
      opinion: "Fast and clean. My replacement for Sass on static or light projects",
    },
    info_es: {
      nivel: "Avanzado",
      tiempo: "2 años",
      opinion: "Rápido y limpio. Mi reemplazo para Sass en proyectos estáticos o ligeros",
    }
  },

  // ── Backend & Data ────────────────────────────────
  {
    id: "python",
    category: "backend",
    x: 200,
    y: 1250,
    src: "/assets/images/papel/techs/py.svg",
    label: "Python",
    info: {
      nivel: "Advanced",
      tiempo: "2.5 years",
      opinion: "My favorite. Versatile, readable, gets out of your way",
    },
    info_es: {
      nivel: "Avanzado",
      tiempo: "2.5 años",
      opinion: "Mi favorito. Versátil, legible, no se interpone en el camino",
    }
  },
  {
    id: "fastapi",
    category: "backend",
    x: 450,
    y: 1350,
    src: "/assets/images/papel/techs/fastapi.svg",
    label: "FastAPI",
    info: {
      nivel: "Intermediate",
      tiempo: "1 year",
      opinion: "Django is overkill for what I do",
    },
    info_es: {
      nivel: "Intermedio",
      tiempo: "1 año",
      opinion: "Django es demasiado para lo que hago",
    }
  },
  {
    id: "docker",
    category: "backend",
    x: 700,
    y: 1250,
    src: "/assets/images/papel/techs/docker.svg",
    label: "Docker",
    info: {
      nivel: "Intermediate",
      tiempo: "1 year",
      opinion: "Essential for not breaking prod",
    },
    info_es: {
      nivel: "Intermedio",
      tiempo: "1 año",
      opinion: "Esencial para no romper producción",
    }
  },
  {
    id: "sql",
    category: "backend",
    x: 950,
    y: 1350,
    src: "/assets/images/papel/techs/sql.svg",
    label: "SQL",
    info: {
      nivel: "Intermediate",
      tiempo: "2 years",
      opinion: "MySQL and PostgreSQL specifically",
    },
    info_es: {
      nivel: "Intermedio",
      tiempo: "2 años",
      opinion: "MySQL y PostgreSQL específicamente",
    }
  },
  {
    id: "pandas",
    category: "backend",
    x: 1200,
    y: 1250,
    src: "/assets/images/papel/techs/pandas.svg",
    label: "Pandas",
    info: {
      nivel: "Intermediate",
      tiempo: "1 year",
      opinion: "Powerful when you know what you're doing",
    },
    info_es: {
      nivel: "Intermedio",
      tiempo: "1 año",
      opinion: "Poderoso cuando sabes lo que haces",
    }
  },
  {
    id: "r",
    category: "backend",
    x: 700,
    y: 1500,
    src: "/assets/images/papel/techs/r.svg",
    label: "R",
    info: {
      nivel: "Basic",
      tiempo: "1 year",
      opinion: "I use it when I have to. Not a day more",
    },
    info_es: {
      nivel: "Básico",
      tiempo: "1 año",
      opinion: "Lo uso cuando tengo que hacerlo. Ni un día más",
    }
  },

  // ── Design & AI ───────────────────────────────────
  {
    id: "figma",
    category: "design",
    x: 1800,
    y: 350,
    src: "/assets/images/papel/techs/figma.svg",
    label: "Figma",
    info: {
      nivel: "Intermediate",
      tiempo: "1.5 years",
      opinion: "I design here before touching code. AI tools are changing this space fast though",
    },
    info_es: {
      nivel: "Intermedio",
      tiempo: "1.5 años",
      opinion: "Diseño aquí antes de tocar código. Aunque las herramientas de IA están cambiando este espacio rápido",
    }
  },
  {
    id: "photoshop",
    category: "design",
    x: 2100,
    y: 250,
    src: "/assets/images/papel/techs/ps.svg",
    label: "Photoshop",
    info: {
      nivel: "Advanced",
      tiempo: "4 years",
      opinion: "I edit everything here. My oldest tool",
    },
    info_es: {
      nivel: "Avanzado",
      tiempo: "4 años",
      opinion: "Edito todo aquí. Mi herramienta más antigua",
    }
  },
  {
    id: "cursor",
    category: "tools",
    x: 2650,
    y: 250,
    src: "/assets/images/papel/techs/cursor.svg",
    label: "Cursor",
    info: {
      nivel: "Advanced",
      tiempo: "1 year",
      opinion: "Changed how I work. Permanently",
    },
    info_es: {
      nivel: "Avanzado",
      tiempo: "1 año",
      opinion: "Cambió cómo trabajo. Permanentemente",
    }
  },
  {
    id: "claudecode",
    category: "tools",
    x: 2380,
    y: 350,
    src: "/assets/images/papel/techs/claude.svg",
    label: "Claude Code",
    info: {
      nivel: "Advanced",
      tiempo: "1 year",
      opinion: "Useful for everything. Reshaped the whole industry in no time",
    },
    info_es: {
      nivel: "Avanzado",
      tiempo: "1 año",
      opinion: "Útil para todo. Reformó toda la industria en poco tiempo",
    }
  },

  // ── Tools ─────────────────────────────────────────
  {
    id: "git",
    category: "tools",
    x: 1700,
    y: 1270,
    src: "/assets/images/papel/techs/git.svg",
    label: "Git",
    info: {
      nivel: "Basic",
      tiempo: "1 years",
      opinion: "Day-to-day version control. Branching, commits, the essentials",
    },
    info_es: {
      nivel: "Básico",
      tiempo: "1 año",
      opinion: "Control de versiones del día a día. Branching, commits, lo esencial",
    }
  },
  {
    id: "github",
    category: "tools",
    x: 1950,
    y: 1370,
    src: "/assets/images/papel/techs/github.svg",
    label: "GitHub",
    info: {
      nivel: "Intermediate",
      tiempo: "1.5 years",
      opinion: "My real portfolio",
    },
    info_es: {
      nivel: "Intermedio",
      tiempo: "1.5 años",
      opinion: "Mi verdadero portfolio",
    }
  },
  {
    id: "notion",
    category: "tools",
    x: 2200,
    y: 1270,
    src: "/assets/images/papel/techs/notion.svg",
    label: "Notion",
    info: {
      nivel: "Advanced",
      tiempo: "2 years",
      opinion: "My second brain",
    },
    info_es: {
      nivel: "Avanzado",
      tiempo: "2 años",
      opinion: "Mi segundo cerebro",
    }
  },
  {
    id: "jira",
    category: "tools",
    x: 2450,
    y: 1370,
    src: "/assets/images/papel/techs/jira.svg",
    label: "Jira",
    info: {
      nivel: "Intermediate",
      tiempo: "6 months",
      opinion: "Used it in a real work environment. Gets the job done",
    },
    info_es: {
      nivel: "Intermedio",
      tiempo: "6 meses",
      opinion: "Lo usé en un entorno de trabajo real. Cumple su función",
    }
  },
  {
    id: "flstudio",
    category: "tools",
    x: 2700,
    y: 1270,
    src: "/assets/images/papel/techs/fl.webp",
    label: "FL Studio",
    info: {
      nivel: "Advanced",
      tiempo: "4 years",
      opinion: "Hobby first, but it's ended up in some specific projects too",
    },
    info_es: {
      nivel: "Avanzado",
      tiempo: "4 años",
      opinion: "Pasatiempo primero, pero ha terminado en algunos proyectos específicos también",
    }
  },

  // ── Cómicos (centro 1430 x 798) ───────────────────────────────────────
  { id: "comic-1", category: "comic", isComic: true, x: 616, y: 798, src: "/assets/images/papel/comics/me1.webp" },
  { id: "comic-2", category: "comic", isComic: true, x: 1162, y: 798, src: "/assets/images/papel/comics/me2.webp" },
  { id: "comic-3", category: "comic", isComic: true, x: 70, y: 798, src: "/assets/images/papel/comics/me3.webp" },
  { id: "comic-4", category: "comic", isComic: true, x: 1430, y: 1600, src: "/assets/images/papel/comics/me4.webp" },
  { id: "comic-5", category: "comic", isComic: true, x: 1708, y: 798, src: "/assets/images/papel/comics/me5.webp" },
  { id: "comic-6", category: "comic", isComic: true, x: 2254, y: 798, src: "/assets/images/papel/comics/me6.webp" },
  { id: "comic-7", category: "comic", isComic: true, x: 2800, y: 798, src: "/assets/images/papel/comics/me7.webp" },
  { id: "comic-8", category: "comic", isComic: true, x: 1430, y: 0, src: "/assets/images/papel/comics/me8.webp" },
  { id: "hands", category: "comic", isComic: true, x: 1325, y: 695, src: "/assets/images/papel/comics/hands.webp", size: 350 },

  // ── Labels ────────────────────────────────────────
  { id: "label-frontend", category: "label", isLabel: true, x: 620, y: 100, text: "Frontend", text_es: "Frontend" },
  { id: "label-backend", category: "label", isLabel: true, x: 650, y: 1150, text: "Backend & Data", text_es: "Backend y Datos" },
  { id: "label-design", category: "label", isLabel: true, x: 2250, y: 100, text: "Design & IA", text_es: "Diseño e IA" },
  { id: "label-tools", category: "label", isLabel: true, x: 2220, y: 1150, text: "Tools", text_es: "Herramientas" },

  // ── Language Toggle ───────────────────────────────────
  { id: "lang-toggle", isLangToggle: true, x: 1450, y: 500, text: "EN - ES" },
];