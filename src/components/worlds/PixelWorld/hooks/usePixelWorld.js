// ─────────────────────────────────────────────────────────────────────────────
// usePixelWorld.js
// Engine completo del mundo pixel art: RAF, input, física, cámara, animación.
// El componente solo consume el canvasRef y este hook hace todo lo demás.
//
// FIXES DE AUDITORÍA aplicados:
//   #4  — RAF pausado cuando isActive=false (sección oculta) → sin quema de GPU
//   #7  — performance.now() capturado UNA sola vez por frame y pasado a update/render
//   #8  — array `renderables` reutilizado entre frames (evita GC cada frame)
//   #1  — ruta MAP_SRC corregida (sin /public/)
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react'
import {
  loadSprites,
  drawCharacter,
  drawPlaceholderCharacter,
  getCharacterDrawBounds,
} from '../utils/spriteManager'
import { loadWorldObjects } from '../utils/objectManager'
import { resolveCollision, distToObject, blocksMovement } from '../utils/collision'
import { loadClouds, initClouds, updateClouds } from '../utils/cloudManager'

// ─── Configuración ────────────────────────────────────────────────────────────

const CONFIG = {
  // Mapa
  MAP_WIDTH:  1920,
  MAP_HEIGHT: 1080,
  // FIX #1: ruta sin /public/ — en build de producción no existe ese prefijo
  MAP_SRC: '/assets/images/pixel/fondo.png',
  OBJECTS_SRC: new URL('../data/world-objects.json', import.meta.url).href,

  // Cámara (>1 acerca la vista; 1 = sin zoom)
  ZOOM: 1.30,

  // Personaje
  SCALE: 0.2,
  WALK_SPEED: 5,
  CLICK_MOVE_SPEED: 8,
  WALK_FPS_VERTICAL: 3,
  WALK_FPS_HORIZONTAL: 7,

  // Blink (parpadeo idle)
  BLINK_INTERVAL_MIN: 2500,
  BLINK_INTERVAL_MAX: 5500,
  BLINK_DURATION: 800,

  // Click-to-move
  ARRIVE_THRESHOLD: 45,
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePixelWorld(canvasRef, _dialogRef, enterRange, exitRange, language, isActive) {
  // Toda la lógica mutable vive en este ref — sin setState, sin re-renders
  const engineRef = useRef(null)
  const enterRangeRef = useRef(enterRange ?? (() => {}))
  const exitRangeRef  = useRef(exitRange  ?? (() => {}))
  const languageRef   = useRef(language)
  const isActiveRef   = useRef(isActive)

  // Sincronizar refs con valores actuales sin re-ejecutar el efecto principal
  useEffect(() => {
    enterRangeRef.current = enterRange ?? (() => {})
    exitRangeRef.current  = exitRange  ?? (() => {})
    languageRef.current   = language
    isActiveRef.current   = isActive
  }, [enterRange, exitRange, language, isActive])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false

    // ── Resize ─────────────────────────────────────────────────────────────
    // FIX forced-reflow: leer offsetWidth/Height fuerza al browser a recalcular
    // el layout. ResizeObserver ya entrega el tamaño en entries[0].contentRect
    // sin coste de reflow. La llamada inicial (sin entries) usa window como fallback.
    function resize(entries) {
      let w, h
      if (entries && entries.length > 0) {
        // contentRect es el tamaño ya calculado — sin forzar reflow
        const cr = entries[0].contentRect
        w = Math.round(cr.width)  || window.innerWidth
        h = Math.round(cr.height) || window.innerHeight
      } else {
        // Primera llamada: el observer aún no existe.
        // visualViewport.height refleja el viewport visual real (igual que dvh),
        // más preciso que window.innerHeight en móvil cuando la barra de direcciones
        // está visible o en transición.
        w = window.innerWidth
        h = (window.visualViewport?.height) ?? window.innerHeight
      }
      canvas.width  = w
      canvas.height = h
      CONFIG.ZOOM = w <= 768 ? 1.1 : 1.30
    }
    resize()  // llamada inicial sin entries (usa fallback de window)
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // ── Estado del engine ──────────────────────────────────────────────────
    const engine = {
      char: {
        x: CONFIG.MAP_WIDTH  / 2,
        y: CONFIG.MAP_HEIGHT / 2,
        facing:    'down',
        isWalking: false,
        walkFrame: 0,
        walkTimer: 0,
        isBlinking:   false,
        nextBlinkAt:  performance.now() + randBlink(),
        blinkEndsAt:  0,
      },

      cam: { x: 0, y: 0 },

      keys:   { w: false, a: false, s: false, d: false },
      target: null,

      bgImage:      null,
      bgReady:      false,
      sprites:      new Map(),
      spritesReady: false,
      charBounds:   getCharacterDrawBounds(new Map(), CONFIG.SCALE),

      objects:      [],
      objectsReady:   false,
      activeObject:   null,

      clouds:       [],
      cloudsReady:  false,
      cloudImages:  [],

      // FIX #8: array pre-alocado y reutilizado cada frame para evitar GC
      renderables: [],

      rafId:    null,
      lastTime: performance.now(),
    }
    engineRef.current = engine

    // ── Cargar assets ──────────────────────────────────────────────────────

    const bg = new Image()
    bg.onload  = () => { engine.bgImage = bg; engine.bgReady = true }
    bg.onerror = () => { engine.bgReady = true }
    bg.src = CONFIG.MAP_SRC

    loadSprites().then(images => {
      engine.sprites      = images
      engine.spritesReady = true
      engine.charBounds   = getCharacterDrawBounds(images, CONFIG.SCALE)
    })

    loadWorldObjects(CONFIG.OBJECTS_SRC)
      .then(objects => {
        engine.objects      = objects
        engine.objectsReady = true
      })
      .catch(() => {
        engine.objectsReady = true
      })

    loadClouds().then(images => {
      if (images.length > 0) {
        engine.cloudImages = images
        engine.clouds = initClouds(CONFIG.MAP_WIDTH, CONFIG.MAP_HEIGHT, images, 15)
        engine.cloudsReady = true
      }
    })

    // ── Input ──────────────────────────────────────────────────────────────

    function onKeyDown(e) {
      if (!isActiveRef.current) return
      const k = e.key.toLowerCase()
      if (k === 'w') { e.preventDefault(); engine.keys.w = true;  engine.target = null }
      if (k === 'a') { e.preventDefault(); engine.keys.a = true;  engine.target = null }
      if (k === 's') { e.preventDefault(); engine.keys.s = true;  engine.target = null }
      if (k === 'd') { e.preventDefault(); engine.keys.d = true;  engine.target = null }
    }

    function onKeyUp(e) {
      if (!isActiveRef.current) return
      const k = e.key.toLowerCase()
      if (k === 'w') engine.keys.w = false
      if (k === 'a') engine.keys.a = false
      if (k === 's') engine.keys.s = false
      if (k === 'd') engine.keys.d = false
    }

    function onCanvasClick(e) {
      if (!isActiveRef.current) return
      const rect = canvas.getBoundingClientRect()
      const zoom = CONFIG.ZOOM
      engine.target = {
        x: (e.clientX - rect.left)  / zoom + engine.cam.x,
        y: (e.clientY - rect.top)   / zoom + engine.cam.y,
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup',   onKeyUp)
    canvas.addEventListener('click',   onCanvasClick)

    // ── Touch-to-move (mobile tap) ────────────────────────────────────────
    // El usuario toca el canvas y el personaje se dirige a ese punto.
    // Mismo mecanismo que click-to-move, adaptado a touch.
    let touchMoved = false
    function onTouchStartCanvas(e) {
      touchMoved = false
    }
    function onTouchMoveCanvas() {
      touchMoved = true  // si se mueve es scroll, no tap
    }
    function onTouchEndCanvas(e) {
      if (!isActiveRef.current) return
      if (touchMoved) return          // ignorar si fue scroll
      const t = e.changedTouches[0]
      const rect = canvas.getBoundingClientRect()
      const zoom = CONFIG.ZOOM
      engine.target = {
        x: (t.clientX - rect.left) / zoom + engine.cam.x,
        y: (t.clientY - rect.top)  / zoom + engine.cam.y,
      }
    }
    canvas.addEventListener('touchstart', onTouchStartCanvas, { passive: true })
    canvas.addEventListener('touchmove',  onTouchMoveCanvas,  { passive: true })
    canvas.addEventListener('touchend',   onTouchEndCanvas,   { passive: true })

    // ── RAF loop ───────────────────────────────────────────────────────────

    function tick(now) {
      engine.rafId = requestAnimationFrame(tick)

      // FIX #4: si la sección no está activa, pausar el loop de update/render.
      // Se resetea lastTime para evitar un dt gigante al reactivarse.
      if (!isActiveRef.current) {
        engine.lastTime = now
        return
      }

      // FIX #7: performance.now() capturado una vez y pasado como argumento.
      // Antes se llamaba hasta 4 veces por frame (update + render + target indicator).
      const dt = Math.min(now - engine.lastTime, 50)
      engine.lastTime = now

      update(dt, now)
      render(now)
    }

    // ── Update ─────────────────────────────────────────────────────────────

    // FIX #7: recibe `now` como parámetro en lugar de llamar performance.now()
    function update(dt, now) {
      const { char, keys, cam } = engine

      let dx = 0
      let dy = 0
      let movedByClick = false

      // WASD
      const keySpeed = CONFIG.WALK_SPEED
      if (keys.w) dy -= keySpeed
      if (keys.s) dy += keySpeed
      if (keys.a) dx -= keySpeed
      if (keys.d) dx += keySpeed

      const usingKeys = dx !== 0 || dy !== 0

      // Click-to-move (solo si no hay tecla activa)
      if (engine.target && !usingKeys) {
        const diffX = engine.target.x - char.x
        const diffY = engine.target.y - char.y
        const dist  = Math.sqrt(diffX * diffX + diffY * diffY)
        if (dist < CONFIG.ARRIVE_THRESHOLD) {
          engine.target = null
        } else {
          const clickSpeed = CONFIG.CLICK_MOVE_SPEED
          dx = (diffX / dist) * clickSpeed
          dy = (diffY / dist) * clickSpeed
          movedByClick = true
        }
      }

      // Diagonal normalizada (solo teclado)
      if (!movedByClick && dx !== 0 && dy !== 0) {
        const inv = 1 / Math.sqrt(2)
        dx *= inv
        dy *= inv
      }

      char.isWalking = dx !== 0 || dy !== 0

      if (char.isWalking) {
        if (Math.abs(dx) >= Math.abs(dy)) {
          char.facing = dx > 0 ? 'right' : 'left'
        } else {
          char.facing = dy > 0 ? 'down' : 'up'
        }
      }

      // Mover con límites y colisiones
      const { halfW, halfH } = engine.charBounds
      let newX = clamp(char.x + dx, halfW, Math.max(halfW, CONFIG.MAP_WIDTH  - halfW))
      let newY = clamp(char.y + dy, halfH, Math.max(halfH, CONFIG.MAP_HEIGHT - halfH))

      if (engine.objectsReady) {
        for (const obj of engine.objects) {
          if (!blocksMovement(obj)) continue
          const resolved = resolveCollision(
            { ...char, x: newX, y: newY },
            obj,
            CONFIG.SCALE,
            engine.charBounds
          )
          newX = resolved.x
          newY = resolved.y
        }
        newX = clamp(newX, halfW, Math.max(halfW, CONFIG.MAP_WIDTH  - halfW))
        newY = clamp(newY, halfH, Math.max(halfH, CONFIG.MAP_HEIGHT - halfH))
      }

      char.x = newX
      char.y = newY

      // Cámara centrada en el personaje
      const viewW = canvas.width  / CONFIG.ZOOM
      const viewH = canvas.height / CONFIG.ZOOM
      cam.x = clamp(char.x - viewW / 2, 0, Math.max(0, CONFIG.MAP_WIDTH  - viewW))
      cam.y = clamp(char.y - viewH / 2, 0, Math.max(0, CONFIG.MAP_HEIGHT - viewH))

      // Animación walking
      if (char.isWalking) {
        const isHorizontal = char.facing === 'left' || char.facing === 'right'
        const frameCount = isHorizontal ? 3 : 2
        const walkFps    = isHorizontal ? CONFIG.WALK_FPS_HORIZONTAL : CONFIG.WALK_FPS_VERTICAL

        char.walkTimer += dt
        const frameDuration = 1000 / walkFps
        if (char.walkTimer >= frameDuration) {
          char.walkTimer -= frameDuration
          char.walkFrame  = (char.walkFrame + 1) % frameCount
        }
      } else {
        char.walkFrame = 0
        char.walkTimer = 0
      }

      // FIX #7: usar `now` pasado como argumento en lugar de performance.now()
      if (!char.isWalking) {
        if (!char.isBlinking && now >= char.nextBlinkAt) {
          char.isBlinking  = true
          char.blinkEndsAt = now + CONFIG.BLINK_DURATION
        }
        if (char.isBlinking && now >= char.blinkEndsAt) {
          char.isBlinking  = false
          char.nextBlinkAt = now + randBlink()
        }
      } else if (char.isBlinking) {
        char.isBlinking = false
      }

      // Proximidad a objetos interactivos → diálogo
      if (engine.objectsReady) {
        let nearest     = null
        let nearestDist = Infinity

        for (const obj of engine.objects) {
          if (obj.type !== 'interactive') continue
          const dist = distToObject(char, obj)
          if (dist <= obj.interactionRadius && dist < nearestDist) {
            nearest     = obj
            nearestDist = dist
          }
        }

        if (nearest !== engine.activeObject) {
          if (engine.activeObject) exitRangeRef.current()
          if (nearest) {
            const dialog = languageRef.current === 'es' && nearest.dialog_es
              ? nearest.dialog_es
              : nearest.dialog
            enterRangeRef.current(dialog)
          }
          engine.activeObject = nearest
        }
      }

      // Nubes
      if (engine.cloudsReady && engine.clouds.length > 0) {
        updateClouds(engine.clouds, dt, CONFIG.MAP_WIDTH, CONFIG.MAP_HEIGHT, engine.cloudImages)
      }
    }

    // ── Render ─────────────────────────────────────────────────────────────

    // FIX #7: recibe `now` como parámetro
    // FIX #8: reutiliza engine.renderables en lugar de crear un array nuevo cada frame
    function render(now) {
      const { char, cam, bgImage, bgReady, sprites, spritesReady } = engine
      const W    = canvas.width
      const H    = canvas.height
      const zoom = CONFIG.ZOOM
      const viewW = W / zoom
      const viewH = H / zoom

      ctx.clearRect(0, 0, W, H)

      // Fondo
      if (bgReady && bgImage) {
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(bgImage, cam.x, cam.y, viewW, viewH, 0, 0, W, H)
      } else {
        drawPlaceholderBg(ctx, W, H, cam, zoom, viewW, viewH)
      }

      // FIX #8: limpiar el array reutilizable en lugar de crear uno nuevo
      const renderables = engine.renderables
      renderables.length = 0

      // 1. Agregar objetos al array
      if (engine.objectsReady) {
        for (const obj of engine.objects) {
          if (!obj._img) continue

          // Culling
          if (
            obj.x + obj.width  < cam.x ||
            obj.x              > cam.x + viewW ||
            obj.y + obj.height < cam.y ||
            obj.y              > cam.y + viewH
          ) continue

          renderables.push({
            type:    'object',
            bottomY: obj.flat ? -Infinity : (obj.y + obj.height),
            obj,
          })
        }
      }

      // 2. Agregar el personaje
      const charBottomY = char.y + (engine.charBounds ? engine.charBounds.halfH : 12 * CONFIG.SCALE)
      renderables.push({ type: 'character', bottomY: charBottomY })

      // 3. Ordenar por base Y (Y-sorting)
      renderables.sort((a, b) => a.bottomY - b.bottomY)

      // 4. Dibujar en orden
      for (const item of renderables) {
        if (item.type === 'object') {
          const o = item.obj

          let img = o._img
          // FIX #7: usar `now` en lugar de performance.now() para animaciones de frame
          if (o.frames && o._imgs) {
            const frameIndex = Math.floor(now / 800) % o.frames
            img = o._imgs[frameIndex] || o._img
          }

          ctx.imageSmoothingEnabled = false
          ctx.drawImage(
            img,
            (o.x - cam.x) * zoom,
            (o.y - cam.y) * zoom,
            o.width  * zoom,
            o.height * zoom
          )
        } else if (item.type === 'character') {
          if (spritesReady && sprites.size > 0) {
            drawCharacter({ ctx, images: sprites, characterState: char, camX: cam.x, camY: cam.y, scale: CONFIG.SCALE, zoom })
          } else if (spritesReady) {
            drawPlaceholderCharacter({ ctx, characterState: char, camX: cam.x, camY: cam.y, scale: CONFIG.SCALE, zoom })
          }
        }
      }

      // Nubes (capa superior con parallax)
      if (engine.cloudsReady) {
        const cloudParallax = 0.8
        for (const c of engine.clouds) {
          ctx.globalAlpha = c.opacity
          const drawW   = c.img.naturalWidth  * c.scale * zoom
          const drawH   = c.img.naturalHeight * c.scale * zoom
          const screenX = (c.x - cam.x * cloudParallax) * zoom
          const screenY = (c.y - cam.y * cloudParallax) * zoom
          ctx.imageSmoothingEnabled = false
          ctx.drawImage(c.img, screenX, screenY, drawW, drawH)
        }
        ctx.globalAlpha = 1.0
      }

      // Indicador de destino click-to-move
      // FIX #7: pasar `now` en lugar de llamar performance.now() dentro
      if (engine.target) {
        drawTargetIndicator(ctx, engine.target, cam, zoom, now)
      }
    }

    engine.rafId = requestAnimationFrame(tick)

    // ── Cleanup ────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(engine.rafId)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup',   onKeyUp)
      canvas.removeEventListener('click',   onCanvasClick)
      canvas.removeEventListener('touchstart', onTouchStartCanvas)
      canvas.removeEventListener('touchmove',  onTouchMoveCanvas)
      canvas.removeEventListener('touchend',   onTouchEndCanvas)
      ro.disconnect()
      if (engine.activeObject) {
        exitRangeRef.current()
        engine.activeObject = null
      }
    }

  }, [canvasRef])
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

function randBlink() {
  return CONFIG.BLINK_INTERVAL_MIN +
    Math.random() * (CONFIG.BLINK_INTERVAL_MAX - CONFIG.BLINK_INTERVAL_MIN)
}

// FIX #7: `now` recibido como parámetro
function drawTargetIndicator(ctx, target, cam, zoom = 1, now) {
  const sx = Math.round((target.x - cam.x) * zoom)
  const sy = Math.round((target.y - cam.y) * zoom)
  const pulse = Math.sin(now / 180) * 0.35 + 0.65

  ctx.save()
  ctx.globalAlpha = pulse * 0.85
  ctx.strokeStyle = '#90EE90'
  ctx.lineWidth   = 1.5
  ctx.imageSmoothingEnabled = false

  const S = 7
  ctx.beginPath()
  ctx.moveTo(sx - S, sy); ctx.lineTo(sx + S, sy)
  ctx.moveTo(sx, sy - S); ctx.lineTo(sx, sy + S)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(sx,       sy - S - 4)
  ctx.lineTo(sx + S + 4, sy)
  ctx.lineTo(sx,       sy + S + 4)
  ctx.lineTo(sx - S - 4, sy)
  ctx.closePath()
  ctx.stroke()

  ctx.restore()
}

function drawPlaceholderBg(ctx, W, H, cam, zoom = 1, viewW = W, viewH = H) {
  const T  = 32 * zoom
  const BT = T * 5

  const ox  = (cam.x % 32) * zoom
  const oy  = (cam.y % 32) * zoom
  const tx0 = Math.floor(cam.x / 32)
  const ty0 = Math.floor(cam.y / 32)

  for (let col = -1; col <= Math.ceil(viewW / 32) + 1; col++) {
    for (let row = -1; row <= Math.ceil(viewH / 32) + 1; row++) {
      const even = (tx0 + col + ty0 + row) % 2 === 0
      ctx.fillStyle = even ? '#141e14' : '#172017'
      ctx.fillRect(col * T - ox, row * T - oy, T, T)
    }
  }

  ctx.fillStyle = '#1e2e1e'
  const bx = (cam.x % (32 * 5)) * zoom
  const by = (cam.y % (32 * 5)) * zoom
  for (let col = -1; col <= Math.ceil(viewW / 32) + 1; col++) {
    ctx.fillRect(col * BT - bx, 0, 1, H)
  }
  for (let row = -1; row <= Math.ceil(viewH / 32) + 1; row++) {
    ctx.fillRect(0, row * BT - by, W, 1)
  }
}
