export type BackgroundRemovalOptions = {
  threshold?: number
  tolerance?: number
  yellowThreshold?: number
  preserveDarkPixels?: boolean
}

export async function removeBackground(
  dataUrl: string,
  options: BackgroundRemovalOptions = {},
) {
  const image = await loadImage(dataUrl)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d', { willReadFrequently: true })

  if (!context) {
    throw new Error('当前浏览器不支持 Canvas 处理。')
  }

  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  context.drawImage(image, 0, 0)

  const {
    threshold = 200,
    tolerance = 30,
    yellowThreshold = 160,
    preserveDarkPixels = false,
  } = options

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  const pixels = imageData.data

  for (let index = 0; index < pixels.length; index += 4) {
    const red = pixels[index]
    const green = pixels[index + 1]
    const blue = pixels[index + 2]
    const brightness = (red + green + blue) / 3
    const maxChannel = Math.max(red, green, blue)
    const minChannel = Math.min(red, green, blue)
    const saturation = maxChannel - minChannel
    const isLowSaturation = saturation < tolerance
    const isYellowishPaper =
      red > 180 &&
      blue < red - 30 &&
      green < red &&
      brightness > yellowThreshold &&
      saturation < tolerance + 24

    if ((brightness > threshold && isLowSaturation) || isYellowishPaper) {
      pixels[index + 3] = 0
      continue
    }

    if (preserveDarkPixels) {
      const inkStrength = 255 - brightness
      if (inkStrength > 40) {
        pixels[index + 3] = Math.max(pixels[index + 3], Math.min(255, 120 + inkStrength))
      }
    }
  }

  context.putImageData(imageData, 0, 0)

  return {
    dataUrl: canvas.toDataURL('image/png'),
    width: canvas.width,
    height: canvas.height,
  }
}

export async function removeLightBackground(dataUrl: string, threshold: number) {
  return removeBackground(dataUrl, {
    threshold: Math.max(threshold, 242),
    tolerance: 32,
    yellowThreshold: Math.max(160, threshold - 28),
    preserveDarkPixels: true,
  })
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', () => reject(new Error('图片加载失败。')))
    image.src = src
  })
}
