export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result)
        return
      }

      reject(new Error('文件读取结果不是 ArrayBuffer。'))
    })
    reader.addEventListener('error', () => {
      reject(reader.error ?? new Error('文件读取失败。'))
    })
    reader.readAsArrayBuffer(file)
  })
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('文件读取结果不是 Data URL。'))
    })
    reader.addEventListener('error', () => {
      reject(reader.error ?? new Error('文件读取失败。'))
    })
    reader.readAsDataURL(file)
  })
}

export function formatBytes(bytes: number) {
  if (!bytes) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** index

  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`
}

export function downloadBytes(bytes: Uint8Array, filename: string, type: string) {
  const data = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(data).set(bytes)
  const blob = new Blob([data], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
