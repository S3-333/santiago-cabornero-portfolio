// Cache de imágenes de objetos (evita recargar)
const imageCache = new Map()

function loadImage(src) {
  if (!src) return Promise.resolve(null)
  if (imageCache.has(src)) return Promise.resolve(imageCache.get(src))

  return new Promise((resolve) => {
    const img = new Image()
    img.onload  = () => { imageCache.set(src, img); resolve(img) }
    img.onerror = () => { imageCache.set(src, null); resolve(null) }
    img.src = src
  })
}

// Carga el JSON y preloadea todas las imágenes
// Devuelve el array de objetos con su imagen ya resuelta
export async function loadWorldObjects(jsonPath) {
  const res  = await fetch(jsonPath)
  const data = await res.json()

  // Performance: all image loads run in parallel with Promise.all instead of sequentially
  await Promise.all(
    data.map(async (obj) => {
      if (obj.frames) {
        const srcs = Array.from({ length: obj.frames }, (_, i) =>
          obj.sprite.replace('1.webp', `${i + 1}.webp`)
        )
        // Load all frames in parallel
        obj._imgs = await Promise.all(srcs.map(loadImage))
        obj._img = obj._imgs[0]
      } else {
        obj._img = await loadImage(obj.sprite)
      }
    })
  )

  return data
}

