import { arrayMove } from '@dnd-kit/sortable'
import { PDFDocument } from 'pdf-lib'
import { useMemo, useState } from 'react'
import { downloadBytes } from '../../lib/files'
import { renderPdfThumbnail } from '../../lib/pdf'
import type { MergeStatusTone, PdfFile } from './types'

type MergeStatus = {
  tone: MergeStatusTone
  message: string
}

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024

export function usePdfMerge() {
  const [files, setFiles] = useState<PdfFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isMerging, setIsMerging] = useState(false)
  const [outputFileName, setOutputFileName] = useState('merged')
  const [mergeProgress, setMergeProgress] = useState(0)
  const [status, setStatus] = useState<MergeStatus>({
    tone: 'idle',
    message: '文件只会在当前浏览器中处理，不会上传到服务器。',
  })

  const totalPages = useMemo(
    () => files.reduce((sum, file) => sum + file.selectedPages.length, 0),
    [files],
  )

  const totalBytes = useMemo(
    () => files.reduce((sum, file) => sum + file.sizeBytes, 0),
    [files],
  )

  const warningCount = useMemo(
    () => files.filter((file) => file.sizeWarning !== null).length,
    [files],
  )

  async function addFiles(inputFiles: File[]) {
    const pdfFiles = inputFiles.filter(
      (file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'),
    )

    if (pdfFiles.length === 0) {
      setStatus({
        tone: 'error',
        message: '请先选择 PDF 文件。',
      })
      return
    }

    setIsLoading(true)
    setStatus({
      tone: 'loading',
      message: `正在解析 ${pdfFiles.length} 个 PDF 文件...`,
    })

    try {
      const loadedFiles = await Promise.all(pdfFiles.map(loadPdfFile))

      setFiles((current) => {
        const nextFiles = [...current, ...loadedFiles]

        if (!outputFileName || outputFileName === 'merged') {
          const firstName = nextFiles[0]?.name.replace(/\.pdf$/i, '') ?? 'merged'
          setOutputFileName(`${firstName}-merged`)
        }

        return nextFiles
      })

      const warningMessages = loadedFiles
        .filter((file) => file.sizeWarning)
        .map((file) => `${file.name} 超过 50MB`)

      setStatus({
        tone: warningMessages.length > 0 ? 'loading' : 'success',
        message:
          warningMessages.length > 0
            ? `已加入 ${loadedFiles.length} 个 PDF。注意：${warningMessages.join('，')}。`
            : `已加入 ${loadedFiles.length} 个 PDF，可拖拽调整合并顺序。`,
      })
    } catch (error) {
      setStatus({
        tone: 'error',
        message: error instanceof Error ? error.message : 'PDF 读取失败，请重试。',
      })
    } finally {
      setIsLoading(false)
    }
  }

  function removeFile(id: string) {
    setFiles((current) => current.filter((item) => item.id !== id))
    setStatus({
      tone: 'idle',
      message: '已从列表移除文件。',
    })
  }

  function clearFiles() {
    setFiles([])
    setMergeProgress(0)
    setOutputFileName('merged')
    setStatus({
      tone: 'idle',
      message: '文件列表已清空。',
    })
  }

  function reorderFiles(activeId: string, overId: string) {
    if (activeId === overId) {
      return
    }

    setFiles((current) => {
      const oldIndex = current.findIndex((item) => item.id === activeId)
      const newIndex = current.findIndex((item) => item.id === overId)

      if (oldIndex < 0 || newIndex < 0) {
        return current
      }

      return arrayMove(current, oldIndex, newIndex)
    })

    setStatus({
      tone: 'idle',
      message: '合并顺序已更新。',
    })
  }

  function updateOutputFileName(value: string) {
    setOutputFileName(value)
  }

  function updateFilePageRange(id: string, value: string) {
    setFiles((current) =>
      current.map((file) => {
        if (file.id !== id) {
          return file
        }

        const selectedPages = parsePageRange(value, file.pageCount)

        return {
          ...file,
          pageRangeInput: value,
          selectedPages,
        }
      }),
    )

    setStatus({
      tone: 'idle',
      message: '页码范围已更新。',
    })
  }

  async function mergeFiles() {
    if (files.length < 2) {
      setStatus({
        tone: 'error',
        message: '至少添加 2 个 PDF 后才能合并。',
      })
      return
    }

    if (files.some((file) => file.selectedPages.length === 0)) {
      setStatus({
        tone: 'error',
        message: '存在页码范围无效的 PDF，请检查后再合并。',
      })
      return
    }

    setIsMerging(true)
    setMergeProgress(0)
    setStatus({
      tone: 'loading',
      message: '正在合并 PDF，请稍候...',
    })

    try {
      const merged = await PDFDocument.create()

      for (let index = 0; index < files.length; index += 1) {
        const item = files[index]
        const bytes = await item.file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(bytes)
        const pageIndexes = item.selectedPages.map((page) => page - 1)
        const pages = await merged.copyPages(pdfDoc, pageIndexes)
        pages.forEach((page) => merged.addPage(page))
        setMergeProgress(Math.round(((index + 1) / files.length) * 100))
      }

      const bytes = await merged.save()
      downloadBytes(bytes, buildMergedFilename(outputFileName), 'application/pdf')
      setStatus({
        tone: 'success',
        message: `已合并 ${files.length} 个 PDF，并开始下载文件。`,
      })
    } catch (error) {
      setStatus({
        tone: 'error',
        message: error instanceof Error ? error.message : 'PDF 合并失败，请重试。',
      })
    } finally {
      setIsMerging(false)
    }
  }

  return {
    files,
    isLoading,
    isMerging,
    outputFileName,
    mergeProgress,
    status,
    totalPages,
    totalBytes,
    warningCount,
    addFiles,
    removeFile,
    clearFiles,
    reorderFiles,
    updateOutputFileName,
    updateFilePageRange,
    mergeFiles,
  }
}

async function loadPdfFile(file: File): Promise<PdfFile> {
  const arrayBuffer = await file.arrayBuffer()
  const pdfDoc = await PDFDocument.load(arrayBuffer)
  const pageCount = pdfDoc.getPageCount()
  const thumbnail = await renderPdfThumbnail(arrayBuffer)
  const sizeWarning =
    file.size > MAX_FILE_SIZE_BYTES ? '文件超过 50MB，处理时可能较慢。' : null

  return {
    id: crypto.randomUUID(),
    file,
    name: file.name,
    pageCount,
    thumbnail,
    sizeKB: Math.round(file.size / 1024),
    sizeBytes: file.size,
    pageRangeInput: 'all',
    selectedPages: createAllPages(pageCount),
    sizeWarning,
  }
}

function buildMergedFilename(value: string) {
  const trimmed = value.trim().replace(/\.pdf$/i, '')
  return `${trimmed || 'merged'}.pdf`
}

function createAllPages(pageCount: number) {
  return Array.from({ length: pageCount }, (_, index) => index + 1)
}

function parsePageRange(value: string, pageCount: number) {
  const normalized = value.trim().toLowerCase()

  if (!normalized || normalized === 'all' || normalized === '*') {
    return createAllPages(pageCount)
  }

  const pages = new Set<number>()
  const parts = normalized.split(',').map((part) => part.trim()).filter(Boolean)

  for (const part of parts) {
    if (part.includes('-')) {
      const [startRaw, endRaw] = part.split('-')
      const start = Number(startRaw)
      const end = Number(endRaw)

      if (!Number.isInteger(start) || !Number.isInteger(end) || start > end) {
        return []
      }

      for (let page = start; page <= end; page += 1) {
        if (page < 1 || page > pageCount) {
          return []
        }
        pages.add(page)
      }
      continue
    }

    const page = Number(part)

    if (!Number.isInteger(page) || page < 1 || page > pageCount) {
      return []
    }

    pages.add(page)
  }

  return Array.from(pages).sort((a, b) => a - b)
}
