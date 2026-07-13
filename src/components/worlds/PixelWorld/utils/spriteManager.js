// ─────────────────────────────────────────────────────────────────────────────
// spriteManager.js
// Carga los PNG individuales del personaje y expone drawCharacter()
// ─────────────────────────────────────────────────────────────────────────────

// Renombrá tus archivos a estos nombres, o editá los paths acá.
// Todos viven en /assets/sprites/character/
const BASE = '/assets/images/pixel/character'

const SPRITE_MAP = {
  'front-open':   `${BASE}/front-open.webp`,
  'front-closed': `${BASE}/front-closed.webp`,
  'up-1':         `${BASE}/up-1.webp`,
  'up-2':         `${BASE}/up-2.webp`,
  'down-1':       `${BASE}/down-1.webp`,
  'down-2':       `${BASE}/down-2.webp`,
  'left-1':       `${BASE}/left-1.webp`,
  'left-2':       `${BASE}/left-2.webp`,
  'left-idle':    `${BASE}/left-idle.webp`,
  'right-1':      `${BASE}/right-1.webp`,
  'right-2':      `${BASE}/right-2.webp`,
  'right-idle':   `${BASE}/right-idle.webp`,
}

// ─── Carga asíncrona de todos los sprites ────────────────────────────────────
// Devuelve un Map<key, HTMLImageElement>. Si alguno falla, se omite silenciosamente.

export function loadSprites() {
  const images = new Map()

  const promises = Object.entries(SPRITE_MAP).map(([key, src]) =>
    new Promise((resolve) => {
      const img = new Image()
      img.onload  = () => { images.set(key, img); resolve() }
      img.onerror = () => {
        console.warn(`[spriteManager] No se pudo cargar: ${src}`)
        resolve()
      }
      img.src = src
    })
  )

  return Promise.all(promises).then(() => images)
}

// Mitad del bbox de dibujo (todos los frames) — para límites del mapa
export function getCharacterDrawBounds(images, scale) {
  let maxW = 0
  let maxH = 0
  for (const img of images.values()) {
    if (!img?.naturalWidth) continue
    maxW = Math.max(maxW, img.naturalWidth * scale)
    maxH = Math.max(maxH, img.naturalHeight * scale)
  }
  if (maxW === 0) maxW = 16 * scale
  if (maxH === 0) maxH = 24 * scale
  return { halfW: maxW / 2, halfH: maxH / 2 }
}

// ─── Qué frame dibujar según el estado del personaje ─────────────────────────

function resolveFrame({ facing, isWalking, walkFrame, isBlinking }) {
  if (!isWalking) {
    // Quieto
    if (facing === 'down')  return isBlinking ? 'front-closed' : 'front-open'
    if (facing === 'up')    return isBlinking ? 'front-closed' : 'front-open'
    if (facing === 'left')  return 'left-idle'
    if (facing === 'right') return 'right-idle'
  }

  // Caminando — arriba/abajo: 2 frames; izquierda/derecha: paso → idle → paso
  if (facing === 'left' || facing === 'right') {
    const side = facing
    const phase = walkFrame % 3
    if (phase === 0) return `${side}-1`
    if (phase === 1) return `${side}-idle`
    return `${side}-2`
  }

  const f = (walkFrame % 2) + 1   // → 1 o 2
  if (facing === 'up')    return `up-${f}`
  if (facing === 'down')  return `down-${f}`

  return 'front-open'
}

// ─── Dibujar el personaje en el canvas ───────────────────────────────────────

export function drawCharacter({ ctx, images, characterState, camX, camY, scale, zoom = 1 }) {
  const key = resolveFrame(characterState)
  const img = images.get(key)
  if (!img) return

  const drawW = img.naturalWidth  * scale * zoom
  const drawH = img.naturalHeight * scale * zoom

  const screenX = Math.round((characterState.x - camX) * zoom - drawW / 2)
  const screenY = Math.round((characterState.y - camY) * zoom - drawH / 2)

  ctx.imageSmoothingEnabled = false
  ctx.drawImage(img, screenX, screenY, drawW, drawH)
}

// ─── Placeholder: personajito generado por código ─────────────────────────────
// Se usa cuando los PNGs reales no cargaron (desarrollo sin assets todavía)

export function drawPlaceholderCharacter({ ctx, characterState, camX, camY, scale, zoom = 1 }) {
  const { x, y, facing, isWalking, walkFrame, isBlinking } = characterState

  const W = 16 * scale * zoom
  const H = 24 * scale * zoom
  const sx = Math.round((x - camX) * zoom - W / 2)
  const sy = Math.round((y - camY) * zoom - H / 2)

  const p = scale * zoom  // 1 pixel lógico en pantalla

  // Body
  ctx.fillStyle = '#5B8DD9'
  ctx.fillRect(sx + 3 * p, sy + 10 * p, 10 * p, 8 * p)

  // Legs (swing al caminar)
  let swing = 0
  if (isWalking) {
    if (facing === 'left' || facing === 'right') {
      const phase = walkFrame % 3
      swing = phase === 0 ? p : phase === 2 ? -p : 0
    } else {
      swing = (walkFrame % 2 === 0 ? 1 : -1) * p
    }
  }
  ctx.fillStyle = '#2D3A4A'
  ctx.fillRect(sx + 3 * p,  sy + 17 * p + swing,  4 * p, 5 * p)
  ctx.fillRect(sx + 9 * p,  sy + 17 * p - swing,  4 * p, 5 * p)

  // Head
  ctx.fillStyle = '#F4C58B'
  ctx.fillRect(sx + 3 * p, sy + 2 * p, 10 * p, 9 * p)

  // Hair
  ctx.fillStyle = '#3D2B1F'
  ctx.fillRect(sx + 3 * p, sy + 2 * p, 10 * p, 3 * p)

  // Eyes
  if (!isBlinking) {
    ctx.fillStyle = '#1A1A1A'
    ctx.fillRect(sx + 5 * p, sy + 6 * p, 2 * p, 2 * p)
    ctx.fillRect(sx + 9 * p, sy + 6 * p, 2 * p, 2 * p)
  } else {
    ctx.fillStyle = '#1A1A1A'
    ctx.fillRect(sx + 5 * p, sy + 7 * p, 2 * p, 1 * p)
    ctx.fillRect(sx + 9 * p, sy + 7 * p, 2 * p, 1 * p)
  }

  // Direction indicator (pequeño triángulo encima de la cabeza)
  ctx.fillStyle = 'rgba(144,238,144,0.6)'
  if (facing === 'up')    ctx.fillRect(sx + 7 * p, sy,           2 * p, 2 * p)
  if (facing === 'down')  ctx.fillRect(sx + 7 * p, sy - 3 * p,  2 * p, 2 * p)
  if (facing === 'left')  ctx.fillRect(sx,          sy + 5 * p,  2 * p, 2 * p)
  if (facing === 'right') ctx.fillRect(sx + 14 * p, sy + 5 * p, 2 * p, 2 * p)
}
