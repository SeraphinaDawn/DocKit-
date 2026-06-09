export interface PdfFile {
  id: string
  file: File
  name: string
  pageCount: number
  thumbnail: string
  sizeKB: number
  sizeBytes: number
  pageRangeInput: string
  selectedPages: number[]
  sizeWarning: string | null
}

export type MergeStatusTone = 'idle' | 'loading' | 'success' | 'error'
