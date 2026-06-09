export type PdfPagePreview = {
  pageNumber: number
  width: number
  height: number
  dataUrl: string
}

export type StampPlacement = {
  id: string
  pageNumber: number
  imageDataUrl: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
}

export type StampSourceKind = 'upload' | 'signature-draft'

export type DraftRecord = {
  id: string
  name: string
  updatedAt: number
  pdfName: string
  pdfBytes: ArrayBuffer
  stampKind?: StampSourceKind
  stampName?: string
  stampBytes?: ArrayBuffer
  threshold: number
  stampScale: number
  placements: StampPlacement[]
}

export type SignatureDraftRecord = {
  id: string
  name: string
  updatedAt: number
  sourceName?: string
  pngBytes: ArrayBuffer
  width: number
  height: number
}
