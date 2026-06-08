export type PdfPagePreview = {
  pageNumber: number
  width: number
  height: number
  dataUrl: string
}

export type StampPlacement = {
  pageNumber: number
  x: number
  y: number
  width: number
  opacity: number
}

export type DraftRecord = {
  id: string
  name: string
  updatedAt: number
  pdfName: string
  pdfBytes: ArrayBuffer
  stampName?: string
  stampBytes?: ArrayBuffer
  threshold: number
  placements: StampPlacement[]
}
