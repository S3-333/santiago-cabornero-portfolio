// Objetos con los que el personaje no puede compartir espacio
export function blocksMovement(obj) {
  if (obj.flat) return false
  return obj.type === 'solid' || obj.type === 'interactive'
}

// Rectángulo del personaje (hitbox de pies — mitad inferior del sprite)
function getCharRect(char, scale) {
    // Restaurando la hitbox clásica para enfocar colisiones solo en la parte inferior.
    // Usamos el width original o bounds, pero nos centramos en los pies
    const w = 16 * scale
    const h = 16 * scale
    return {
      left:   char.x - w / 2,
      right:  char.x + w / 2,
      top:    char.y - h / 2,
      bottom: char.y + h / 2,
    }
  }
  
  // Rectángulo de un objeto del JSON
  function getObjRect(obj) {
    return {
      left:   obj.x,
      right:  obj.x + obj.width,
      top:    obj.y,
      bottom: obj.y + obj.height,
    }
  }
  
  // ¿Dos rectángulos se solapan?
  function rectsOverlap(a, b) {
    return a.left < b.right &&
           a.right > b.left &&
           a.top < b.bottom &&
           a.bottom > b.top
  }
  
  // Distancia entre el centro del personaje y el centro de un objeto
  export function distToObject(char, obj) {
    const cx = obj.x + obj.width  / 2
    const cy = obj.y + obj.height / 2
    const dx = char.x - cx
    const dy = char.y - cy
    return Math.sqrt(dx * dx + dy * dy)
  }
  
  // Resuelve la colisión empujando al personaje fuera del objeto
  // Devuelve { x, y } corregidos
  export function resolveCollision(char, obj, scale) {
    const cr = getCharRect(char, scale)
    const or = getObjRect(obj)
  
    if (!rectsOverlap(cr, or)) return { x: char.x, y: char.y }
  
    // Overlap en cada eje
    const overlapLeft   = cr.right  - or.left
    const overlapRight  = or.right  - cr.left
    const overlapTop    = cr.bottom - or.top
    const overlapBottom = or.bottom - cr.top
  
    // Empujar por el eje con menor overlap (más natural)
    const minX = Math.min(overlapLeft, overlapRight)
    const minY = Math.min(overlapTop,  overlapBottom)
  
    let x = char.x
    let y = char.y
  
    if (minX < minY) {
      x += overlapLeft < overlapRight ? -overlapLeft : overlapRight
    } else {
      y += overlapTop < overlapBottom ? -overlapTop  : overlapBottom
    }
  
    return { x, y }
  }