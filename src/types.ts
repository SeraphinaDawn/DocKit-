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

export type PageId = 'home' | 'capabilities' | 'toolbox' | 'guide' | 'drafts' | 'roadmap'

export type ToolId = 'stamp' | 'merge' | 'extract' | 'convert' | 'sign' | 'ocr'

export type ToolStatus = '可用' | '规划中'

export type ToolMeta = {
  id: ToolId
  name: string
  description: string
  state: ToolStatus
}
