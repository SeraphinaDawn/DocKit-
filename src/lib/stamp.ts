export async function removeLightBackground(dataUrl: string, threshold: number) {
  const image = await loadImage(dataUrl)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d', { willReadFrequently: true })

  if (!context) {
    throw new Error('当前浏览器不支持 Canvas 处理。')
  }

  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  context.drawImage(image, 0, 0)

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  const pixels = imageData.data

  for (let index = 0; index < pixels.length; index += 4) {
    const red = pixels[index]
    const green = pixels[index + 1]
    const blue = pixels[index + 2]
    const brightness = (red + green + blue) / 3
    const isLowSaturation = Math.max(red, green, blue) - Math.min(red, green, blue) < 32
    const strongRed = red > 105 && red > green * 1.05 && red > blue * 1.05

    if (brightness >= Math.max(threshold, 242) && isLowSaturation) {
      pixels[index + 3] = 0
    } else if (strongRed) {
      pixels[index + 3] = Math.max(140, 255 - Math.max(0, brightness - 150) * 2)
    } else if (brightness > threshold - 10) {
      pixels[index + 3] = Math.min(pixels[index + 3], 20)
    }
  }

  context.putImageData(imageData, 0, 0)

  return {
    dataUrl: canvas.toDataURL('image/png'),
    width: canvas.width,
    height: canvas.height,
  }
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', () => reject(new Error('图片加载失败。')))
    image.src = src
  })
}
