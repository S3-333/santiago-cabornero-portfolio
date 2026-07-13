import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    rollupOptions: {
      output: {
        // En Vite 6+ (y Vite 8 con Rolldown), manualChunks debe ser una función.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor'
            }
            if (id.includes('gsap')) {
              return 'gsap-vendor'
            }
            if (id.includes('framer-motion')) {
              return 'framer-vendor'
            }
            return 'vendor'
          }
        }
      },
    },
    // Vite 8 recomienda no forzar 'esbuild' para minify porque es obsoleto o
    // requiere instalación manual. Eliminamos minify: 'esbuild' para usar 
    // el minificador nativo (Oxc/Rolldown) por defecto.
    sourcemap: false,
    chunkSizeWarningLimit: 500,
  },
})
