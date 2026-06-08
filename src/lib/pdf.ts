import { PDFDocument } from 'pdf-lib'
import * as pdfjs from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import type { PdfPagePreview, StampPlacement } from '../types'

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

export async function renderPdfPreviews(pdfBytes: ArrayBuffer, maxWidth = 900) {
  const loadingTask = pdfjs.getDocument({ data: pdfBytes.slice(0) })
  const pdfDocument = await loadingTask.promise
  const pages: PdfPagePreview[] = []

  for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
    const page = await pdfDocument.getPage(pageNumber)
    const baseViewport = page.getViewport({ scale: 1 })
    const scale = Math.min(maxWidth / baseViewport.width, 1.4)
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    if (!context) {
      throw new Error('当前浏览器不支持 PDF 预览渲染。')
    }

    canvas.width = Math.floor(viewport.width)
    canvas.height = Math.floor(viewport.height)

    await page.render({ canvas, canvasContext: context, viewport }).promise

    pages.push({
      pageNumber,
      width: baseViewport.width,
      height: baseViewport.height,
      dataUrl: canvas.toDataURL('image/png'),
    })
  }

  await loadingTask.destroy()

  return pages
}

export async function stampPdf(
  pdfBytes: ArrayBuffer,
  stampPngDataUrl: string,
  placements: StampPlacement[],
) {
  const pdfDocument = await PDFDocument.load(pdfBytes.slice(0))
  const stampImage = await pdfDocument.embedPng(stampPngDataUrl)
  const pages = pdfDocument.getPages()

  placements.forEach((placement) => {
    const page = pages[placement.pageNumber - 1]

    if (!page) {
      return
    }

    const ratio = stampImage.height / stampImage.width
    const width = placement.width
    const height = width * ratio

    page.drawImage(stampImage, {
      x: placement.x,
      y: placement.y,
      width,
      height,
      opacity: placement.opacity,
    })
  })

  return pdfDocument.save()
}
