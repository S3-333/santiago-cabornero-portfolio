/** Paleta extraída de pintura.webp — azul royal / Klein */
export const PAINT = {
  core: '#1a4fe0',
  body: '#2563eb',
  bright: '#3d7aff',
  gloss: '#9ec8ff',
  deep: '#0a2d72',
  shadow: '#051838',
  drip: '#123d96',
}

const MAX_SPLATS = 40

function mulberry32(seed) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3
}

function easeOutBack(t) {
  const c = 1.4
  return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2
}

/** Contorno irregular de salpicadura */
function traceSplatContour(ctx, cx, cy, radius, rng, lobes = 14) {
  const points = []
  for (let i = 0; i < lobes; i++) {
    const angle = (i / lobes) * Math.PI * 2
    const wobble = 0.45 + rng() * 0.85
    const spike = rng() < 0.22 ? 1.15 + rng() * 0.55 : 1
    const r = radius * wobble * spike
    points.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    })
  }
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 0; i < points.length; i++) {
    const curr = points[i]
    const next = points[(i + 1) % points.length]
    const mx = (curr.x + next.x) / 2
    const my = (curr.y + next.y) / 2
    ctx.quadraticCurveTo(curr.x, curr.y, mx, my)
  }
  ctx.closePath()
}

/** Mancha de pintura húmeda con volumen y brillo especular */
function drawWetSplat(ctx, x, y, radius, seed, alpha = 1, expansion = 1) {
  if (radius < 0.5) return
  const rng = mulberry32(seed)
  const r = radius * expansion
  const rot = rng() * Math.PI * 2

  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(x, y)
  ctx.rotate(rot)

  traceSplatContour(ctx, 0, 0, r, rng)
  const shadowGrad = ctx.createRadialGradient(-r * 0.2, r * 0.15, 0, 0, 0, r * 1.15)
  shadowGrad.addColorStop(0, PAINT.body)
  shadowGrad.addColorStop(0.55, PAINT.core)
  shadowGrad.addColorStop(1, PAINT.deep)
  ctx.fillStyle = shadowGrad
  ctx.fill()

  traceSplatContour(ctx, 0, 0, r * 0.92, mulberry32(seed + 7))
  const bodyGrad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.05, 0, 0, r)
  bodyGrad.addColorStop(0, PAINT.bright)
  bodyGrad.addColorStop(0.35, PAINT.body)
  bodyGrad.addColorStop(0.75, PAINT.core)
  bodyGrad.addColorStop(1, PAINT.deep)
  ctx.fillStyle = bodyGrad
  ctx.fill()

  ctx.beginPath()
  ctx.ellipse(-r * 0.28, -r * 0.32, r * 0.38, r * 0.22, -0.6, 0, Math.PI * 2)
  const gloss = ctx.createRadialGradient(-r * 0.3, -r * 0.34, 0, -r * 0.28, -r * 0.3, r * 0.5)
  gloss.addColorStop(0, `rgba(255,255,255,${0.72 * alpha})`)
  gloss.addColorStop(0.45, `rgba(158,200,255,${0.35 * alpha})`)
  gloss.addColorStop(1, 'rgba(37,99,235,0)')
  ctx.fillStyle = gloss
  ctx.fill()

  ctx.restore()
}

function drawSpeck(ctx, x, y, radius, seed, alpha) {
  const rng = mulberry32(seed)
  drawWetSplat(ctx, x, y, radius, seed, alpha * (0.7 + rng() * 0.3))
}

function drawDrip(ctx, x, y, length, width, seed, alpha = 1) {
  if (length < 2) return
  const rng = mulberry32(seed)
  const w = width * (0.85 + rng() * 0.3)
  const bulb = w * (1.4 + rng() * 0.5)

  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(x, y)

  const grad = ctx.createLinearGradient(0, 0, 0, length)
  grad.addColorStop(0, PAINT.body)
  grad.addColorStop(0.6, PAINT.drip)
  grad.addColorStop(1, PAINT.deep)

  ctx.beginPath()
  ctx.moveTo(-w * 0.5, 0)
  ctx.quadraticCurveTo(-w * 0.35, length * 0.45, -w * 0.25, length * 0.85)
  ctx.arc(0, length, bulb, Math.PI, 0, false)
  ctx.quadraticCurveTo(w * 0.35, length * 0.45, w * 0.5, 0)
  ctx.closePath()
  ctx.fillStyle = grad
  ctx.fill()

  ctx.beginPath()
  ctx.ellipse(-w * 0.12, length * 0.35, w * 0.22, length * 0.12, 0, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(255,255,255,${0.18 * alpha})`
  ctx.fill()

  ctx.restore()
}

/** Proyectil alargado en dirección del movimiento */
function drawProjectile(ctx, p) {
  const speed = Math.hypot(p.vx, p.vy) || 1
  const angle = Math.atan2(p.vy, p.vx)
  const stretch = 1.4 + speed * 0.06

  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(angle)

  const w = p.size * stretch * 2.2
  const h = p.size * 0.9
  const grad = ctx.createRadialGradient(-w * 0.2, 0, 0, 0, 0, w)
  grad.addColorStop(0, PAINT.gloss)
  grad.addColorStop(0.35, PAINT.bright)
  grad.addColorStop(0.7, PAINT.core)
  grad.addColorStop(1, PAINT.deep)

  ctx.beginPath()
  ctx.ellipse(0, 0, w, h, 0, 0, Math.PI * 2)
  ctx.fillStyle = grad
  ctx.fill()

  ctx.beginPath()
  ctx.ellipse(-w * 0.35, -h * 0.25, w * 0.35, h * 0.35, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.fill()

  ctx.restore()

  if (p.trail?.length) {
    for (let i = 0; i < p.trail.length; i++) {
      const t = p.trail[i]
      const fade = (i + 1) / p.trail.length
      drawWetSplat(ctx, t.x, t.y, p.size * 0.45 * fade, p.seed + i, fade * 0.35)
    }
  }
}

function createImpact(particles, x, y, vx, vy) {
  const speed = Math.hypot(vx, vy)
  const impactForce = Math.min(speed / 14, 1.4)
  const seed = (Math.random() * 1e9) | 0
  const targetRadius = (22 + Math.random() * 38) * impactForce

  particles.push({
    type: 'splat',
    x,
    y,
    radius: 0,
    targetRadius,
    growth: 0,
    seed,
    vx: vx * 0.04,
    vy: vy * 0.04,
    age: 0,
    drips: Array.from({ length: 2 + (Math.random() * 3) | 0 }, () => ({
      offsetX: (Math.random() - 0.5) * targetRadius * 0.7,
      length: 0,
      maxLength: 18 + Math.random() * 55,
      width: 2.5 + Math.random() * 3.5,
      speed: 0.55 + Math.random() * 1.1,
      seed: (Math.random() * 1e9) | 0,
      delay: Math.random() * 12,
    })),
  })

  const dropCount = 8 + (Math.random() * 12) | 0
  for (let i = 0; i < dropCount; i++) {
    const angle = Math.random() * Math.PI * 2
    const spd = (2 + Math.random() * 10) * impactForce
    particles.push({
      type: 'droplet',
      x,
      y,
      vx: Math.cos(angle) * spd + vx * 0.08,
      vy: Math.sin(angle) * spd + vy * 0.08,
      radius: 1.5 + Math.random() * 5.5,
      seed: (Math.random() * 1e9) | 0,
      settled: false,
      settleAge: 0,
    })
  }

  const streakCount = 3 + (Math.random() * 4) | 0
  for (let i = 0; i < streakCount; i++) {
    const angle = Math.atan2(vy, vx) + (Math.random() - 0.5) * 1.2
    const len = 12 + Math.random() * 35
    particles.push({
      type: 'streak',
      x,
      y,
      angle,
      length: 0,
      maxLength: len,
      width: 3 + Math.random() * 5,
      seed: (Math.random() * 1e9) | 0,
      growth: 0,
    })
  }
}

function cullOldSplats(particles) {
  const splats = particles.filter((p) => p.type === 'splat')
  if (splats.length <= MAX_SPLATS) return
  const remove = splats.length - MAX_SPLATS
  let removed = 0
  for (let i = 0; i < particles.length && removed < remove; i++) {
    if (particles[i].type === 'splat') {
      particles.splice(i, 1)
      i--
      removed++
    }
  }
}

export function createBackgroundSplashes(w, h) {
  const splashes = []
  const area = w * h
  const count = Math.min(42, Math.max(14, Math.floor(area / 32000)))
  const rng = mulberry32(0x9e3779b9)

  for (let i = 0; i < count; i++) {
    const kindRoll = rng()
    splashes.push({
      x: rng() * w,
      y: rng() * h,
      radius:
        kindRoll < 0.15
          ? 2 + rng() * 4
          : kindRoll < 0.4
            ? 5 + rng() * 10
            : 10 + rng() * 32,
      depth: 22 + rng() * 95,
      seed: (rng() * 1e9) | 0,
      kind: kindRoll < 0.08 ? 'drip' : kindRoll < 0.42 ? 'speck' : 'splat',
      opacity: 0.035 + rng() * 0.11,
      rotation: rng() * Math.PI * 2,
      dripLength: 14 + rng() * 45,
    })
  }
  return splashes
}

export function drawBackgroundSplashes(ctx, splashes, parallaxX, parallaxY, w, h) {
  ctx.clearRect(0, 0, w, h)

  const bg = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.75)
  bg.addColorStop(0, '#060a14')
  bg.addColorStop(0.45, '#030508')
  bg.addColorStop(1, '#010102')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)

  const sorted = splashes.toSorted((a, b) => a.depth - b.depth)

  for (const s of sorted) {
    const ox = parallaxX / s.depth
    const oy = parallaxY / s.depth
    let x = s.x + ox
    let y = s.y + oy

    if (x < -120 || x > w + 120 || y < -120 || y > h + 120) continue

    ctx.save()
    ctx.globalAlpha = s.opacity
    ctx.translate(x, y)
    ctx.rotate(s.rotation)

    if (s.kind === 'drip') {
      drawDrip(ctx, 0, 0, s.dripLength, s.radius * 0.35, s.seed, s.opacity * 2.2)
    } else if (s.kind === 'speck') {
      drawSpeck(ctx, 0, 0, s.radius, s.seed, s.opacity * 2.5)
    } else {
      drawWetSplat(ctx, 0, 0, s.radius, s.seed, s.opacity * 2.2)
    }
    ctx.restore()
  }

  ctx.globalAlpha = 1
}

/** Dispara desde el origen (centro del personaje) hasta el punto de mira */
export function spawnPaintBurst(particles, originX, originY, targetX, targetY) {
  const dx = targetX - originX
  const dy = targetY - originY
  const dist = Math.hypot(dx, dy)

  if (dist < 6) {
    createImpact(particles, targetX, targetY, 0, 0)
    return
  }

  const nx = dx / dist
  const ny = dy / dist
  const speed = 20 + Math.random() * 5

  particles.push({
    type: 'projectile',
    x: originX,
    y: originY,
    vx: nx * speed,
    vy: ny * speed,
    targetX,
    targetY,
    size: 5.5 + Math.random() * 3,
    seed: (Math.random() * 1e9) | 0,
    trail: [],
  })
}

export function updateAndDrawPaint(ctx, particles) {

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]

    if (p.type === 'projectile') {
      p.trail.push({ x: p.x, y: p.y })
      if (p.trail.length > 7) p.trail.shift()

      const distBefore = Math.hypot(p.targetX - p.x, p.targetY - p.y)
      const step = Math.hypot(p.vx, p.vy)

      if (distBefore <= step + 2) {
        createImpact(particles, p.targetX, p.targetY, p.vx, p.vy)
        particles.splice(i, 1)
        continue
      }

      p.x += p.vx
      p.y += p.vy

      const distAfter = Math.hypot(p.targetX - p.x, p.targetY - p.y)
      if (distAfter <= step + 2 || distAfter > distBefore) {
        createImpact(particles, p.targetX, p.targetY, p.vx, p.vy)
        particles.splice(i, 1)
      }
    } else if (p.type === 'droplet') {
      if (!p.settled) {
        p.vx *= 0.92
        p.vy *= 0.92
        p.vy += 0.18
        p.x += p.vx
        p.y += p.vy
        if (Math.hypot(p.vx, p.vy) < 0.35) {
          p.settled = true
          p.settleAge = 0
        }
      } else {
        p.settleAge++
      }
    } else if (p.type === 'splat') {
      p.growth = Math.min(1, p.growth + 0.14)
      p.radius = lerp(0, p.targetRadius, easeOutBack(p.growth))
      p.x += p.vx
      p.y += p.vy
      p.vx *= 0.9
      p.vy *= 0.9
      p.age++

      for (const d of p.drips) {
        if (p.age > d.delay) {
          d.length = Math.min(d.maxLength, d.length + d.speed)
        }
      }
    } else if (p.type === 'streak') {
      p.growth = Math.min(1, p.growth + 0.22)
      p.length = p.maxLength * easeOutCubic(p.growth)
    }
  }

  cullOldSplats(particles)

  for (const p of particles) {
    if (p.type === 'splat') {
      const alpha = 0.92 + Math.min(p.age / 30, 0.08)
      drawWetSplat(ctx, p.x, p.y, p.radius, p.seed, alpha, 1)
      for (const d of p.drips) {
        if (d.length > 1) {
          drawDrip(
            ctx,
            p.x + d.offsetX,
            p.y + p.radius * 0.55,
            d.length,
            d.width,
            d.seed,
            alpha,
          )
        }
      }
    }
  }

  for (const p of particles) {
    if (p.type === 'streak' && p.length > 0) {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.angle)
      ctx.globalAlpha = 0.75
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(p.length, 0)
      ctx.strokeStyle = PAINT.bright
      ctx.lineWidth = p.width
      ctx.lineCap = 'round'
      ctx.stroke()
      traceSplatContour(ctx, p.length * 0.85, 0, p.width * 1.1, mulberry32(p.seed), 8)
      ctx.fillStyle = PAINT.body
      ctx.fill()
      ctx.restore()
    }
  }

  for (const p of particles) {
    if (p.type === 'droplet') {
      const scale = p.settled ? Math.min(1, 0.4 + p.settleAge * 0.08) : 1
      drawWetSplat(ctx, p.x, p.y, p.radius * scale, p.seed, 0.88)
    }
  }

  for (const p of particles) {
    if (p.type === 'projectile') drawProjectile(ctx, p)
  }
}