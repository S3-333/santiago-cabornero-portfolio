// ─────────────────────────────────────────────────────────────────────────────
// cloudManager.js
// Maneja la carga, actualización y renderizado de las nubes del mundo.
// ─────────────────────────────────────────────────────────────────────────────

export function loadClouds() {
  const images = []
  const CLOUD_COUNT = 7
  // Ajuste de ruta al sistema publico de vite/next
  const BASE_URL = '/assets/images/pixel/clouds' 
  
  for (let i = 1; i <= CLOUD_COUNT; i++) {
    const src = `${BASE_URL}/Cloud${i}.webp`
    images.push(new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => {
        console.warn(`[cloudManager] No se pudo cargar: ${src}`)
        resolve(null)
      }
      img.src = src
    }))
  }
  
  return Promise.all(images).then(res => res.filter(i => i !== null))
}

export function initClouds(mapWidth, mapHeight, images, maxClouds = 20) {
  const clouds = []
  for (let i = 0; i < maxClouds; i++) {
    clouds.push(createCloud(mapWidth, mapHeight, images, true))
  }
  return clouds
}

function createCloud(mapWidth, mapHeight, images, randomX = false) {
  const img = images[Math.floor(Math.random() * images.length)]
  const scale = 2 + Math.random() * 2 // tamaños variados (más controlados)
  const opacity = 0.25 + Math.random() * 0.35 // Transparencia para que no tapen
  const speedX = 5 + Math.random() * 30 // Movimiento suave
  
  // Extendemos la zona Y para cubrir bien el parallax
  const y = -100 + Math.random() * (mapHeight + 200) 
  
  const width = img ? img.naturalWidth * scale : 200
  const startX = -50 - width
  const endX = mapWidth + 100 // Un límite derecho ajustado para el parallax
  
  const x = randomX ? (startX + Math.random() * (endX - startX)) : startX

  return { img, scale, opacity, speedX, x, y }
}

export function updateClouds(clouds, dt, mapWidth, mapHeight, images) {
  for (let i = 0; i < clouds.length; i++) {
    const c = clouds[i]
    c.x += (c.speedX * dt) / 1000
    
    // Si la nube sale del mapa (considerando parallax), la respawneamos
    const rightBound = mapWidth + 200 // Ajustado para que el reciclo ocurra antes
    if (c.x > rightBound) {
      clouds[i] = createCloud(mapWidth, mapHeight, images, false)
    }
  }
}
