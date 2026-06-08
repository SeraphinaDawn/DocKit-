import {
  ArchiveRestore,
  Download,
  FileDown,
  FileText,
  ImagePlus,
  Loader2,
  Save,
  Trash2,
  Upload,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { downloadBytes, formatBytes, readFileAsArrayBuffer, readFileAsDataUrl } from '../lib/files'
import { renderPdfPreviews, stampPdf } from '../lib/pdf'
import { deleteDraft, getDraft, listDrafts, saveDraft, type DraftSummary } from '../lib/storage'
import { removeLightBackground } from '../lib/stamp'
import type { DraftRecord, PdfPagePreview, StampPlacement } from '../types'

const defaultThreshold = 236
const defaultStampWidth = 150

const toolbarButton =
  'inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold tracking-tight text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 hover:shadow-soft disabled:hover:translate-y-0 disabled:hover:shadow-none'

const panelClass = 'rounded-lg border border-slate-200 bg-white/80'

type PdfSource = {
  name: string
  size: number
  bytes: ArrayBuffer
}

type StampSource = {
  name: string
  size: number
  bytes?: ArrayBuffer
  rawDataUrl: string
}

export function PdfStampTool() {
  const [pdf, setPdf] = useState<PdfSource | null>(null)
  const [stamp, setStamp] = useState<StampSource | null>(null)
  const [stampPreviewUrl, setStampPreviewUrl] = useState('')
  const [stampNaturalSize, setStampNaturalSize] = useState({ width: 1, height: 1 })
  const [pages, setPages] = useState<PdfPagePreview[]>([])
  const [placements, setPlacements] = useState<StampPlacement[]>([])
  const [selectedPage, setSelectedPage] = useState(1)
  const [threshold, setThreshold] = useState(defaultThreshold)
  const [drafts, setDrafts] = useState<DraftSummary[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [busyLabel, setBusyLabel] = useState('')
  const [notice, setNotice] = useState('所有文件只在当前设备处理。')
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const stampInputRef = useRef<HTMLInputElement>(null)

  const currentPlacement = placements.find((placement) => placement.pageNumber === selectedPage)
  const activePage = pages.find((page) => page.pageNumber === selectedPage)
  const canExport = Boolean(pdf && stampPreviewUrl && placements.length)

  const stampAspectRatio = useMemo(() => {
    return stampNaturalSize.height / Math.max(stampNaturalSize.width, 1)
  }, [stampNaturalSize.height, stampNaturalSize.width])

  const refreshDrafts = useCallback(async () => {
    setDrafts(await listDrafts())
  }, [])

  useEffect(() => {
    refreshDrafts()
  }, [refreshDrafts])

  useEffect(() => {
    if (!stamp) {
      setStampPreviewUrl('')
      return
    }

    let cancelled = false
    const currentStamp = stamp

    async function processStamp() {
      setBusyLabel('正在去除印章白底')
      try {
        const processed = await removeLightBackground(currentStamp.rawDataUrl, threshold)
        if (!cancelled) {
          setStampPreviewUrl(processed.dataUrl)
          setStampNaturalSize({ width: processed.width, height: processed.height })
        }
      } catch (error) {
        setNotice(error instanceof Error ? error.message : '印章处理失败。')
      } finally {
        if (!cancelled) {
          setBusyLabel('')
        }
      }
    }

    processStamp()

    return () => {
      cancelled = true
    }
  }, [stamp, threshold])

  async function handlePdfFile(file: File) {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setNotice('请选择 PDF 文件。')
      return
    }

    setBusyLabel('正在解析 PDF')
    try {
      const bytes = await readFileAsArrayBuffer(file)
      const renderedPages = await renderPdfPreviews(bytes)
      setPdf({ name: file.name, size: file.size, bytes })
      setPages(renderedPages)
      setSelectedPage(1)
      setPlacements([])
      setNotice(`已载入 ${file.name}，共 ${renderedPages.length} 页。`)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'PDF 解析失败。')
    } finally {
      setBusyLabel('')
    }
  }

  async function handleStampFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setNotice('请选择 PNG、JPG 或 WebP 图片作为印章。')
      return
    }

    setBusyLabel('正在读取印章图片')
    try {
      const [rawDataUrl, bytes] = await Promise.all([
        readFileAsDataUrl(file),
        readFileAsArrayBuffer(file),
      ])
      setStamp({ name: file.name, size: file.size, rawDataUrl, bytes })
      setNotice(`已载入印章 ${file.name}。`)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '印章读取失败。')
    } finally {
      setBusyLabel('')
    }
  }

  function addOrMoveStamp(event: React.MouseEvent<HTMLButtonElement>) {
    if (!activePage || !stampPreviewUrl) {
      setNotice('请先载入 PDF 和印章图片。')
      return
    }

    const bounds = event.currentTarget.getBoundingClientRect()
    const scaleX = activePage.width / bounds.width
    const scaleY = activePage.height / bounds.height
    const width = currentPlacement?.width ?? defaultStampWidth
    const height = width * stampAspectRatio
    const x = clamp((event.clientX - bounds.left) * scaleX - width / 2, 0, activePage.width - width)
    const yFromTop = (event.clientY - bounds.top) * scaleY
    const y = clamp(activePage.height - yFromTop - height / 2, 0, activePage.height - height)
    const nextPlacement: StampPlacement = {
      pageNumber: activePage.pageNumber,
      x,
      y,
      width,
      opacity: currentPlacement?.opacity ?? 1,
    }

    setPlacements((items) => [
      ...items.filter((placement) => placement.pageNumber !== activePage.pageNumber),
      nextPlacement,
    ])
  }

  function updateCurrentPlacement(partial: Partial<StampPlacement>) {
    if (!currentPlacement) {
      return
    }

    setPlacements((items) =>
      items.map((placement) =>
        placement.pageNumber === selectedPage ? { ...placement, ...partial } : placement,
      ),
    )
  }

  async function handleSaveDraft() {
    if (!pdf) {
      setNotice('请先载入 PDF。')
      return
    }

    const record: DraftRecord = {
      id: crypto.randomUUID(),
      name: `${pdf.name.replace(/\.pdf$/i, '')} 草稿`,
      updatedAt: Date.now(),
      pdfName: pdf.name,
      pdfBytes: pdf.bytes,
      stampName: stamp?.name,
      stampBytes: stamp?.bytes,
      threshold,
      placements,
    }

    setBusyLabel('正在保存草稿')
    try {
      await saveDraft(record)
      await refreshDrafts()
      setNotice('草稿已保存到本机 IndexedDB。')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '草稿保存失败。')
    } finally {
      setBusyLabel('')
    }
  }

  async function handleLoadDraft(id: string) {
    setBusyLabel('正在载入草稿')
    try {
      const draft = await getDraft(id)

      if (!draft) {
        setNotice('草稿不存在或已被删除。')
        return
      }

      const renderedPages = await renderPdfPreviews(draft.pdfBytes)
      setPdf({ name: draft.pdfName, size: draft.pdfBytes.byteLength, bytes: draft.pdfBytes })
      setPages(renderedPages)
      setThreshold(draft.threshold)
      setPlacements(draft.placements)
      setSelectedPage(draft.placements[0]?.pageNumber ?? 1)

      if (draft.stampBytes && draft.stampName) {
        const blob = new Blob([draft.stampBytes])
        const dataUrl = await blobToDataUrl(blob)
        setStamp({
          name: draft.stampName,
          size: draft.stampBytes.byteLength,
          rawDataUrl: dataUrl,
          bytes: draft.stampBytes,
        })
      } else {
        setStamp(null)
      }

      setNotice(`已载入草稿：${draft.name}`)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '草稿载入失败。')
    } finally {
      setBusyLabel('')
    }
  }

  async function handleDeleteDraft(id: string) {
    await deleteDraft(id)
    await refreshDrafts()
    setNotice('草稿已删除。')
  }

  async function handleExport() {
    if (!pdf || !stampPreviewUrl || !placements.length) {
      setNotice('请先放置至少一个印章。')
      return
    }

    setBusyLabel('正在合成 PDF')
    try {
      const stampedBytes = await stampPdf(pdf.bytes, stampPreviewUrl, placements)
      const filename = `${pdf.name.replace(/\.pdf$/i, '')}-DocKit.pdf`
      downloadBytes(stampedBytes, filename, 'application/pdf')
      setNotice(`已生成 ${filename}。`)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'PDF 导出失败。')
    } finally {
      setBusyLabel('')
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    const files = Array.from(event.dataTransfer.files)
    const pdfFile = files.find((file) => file.type === 'application/pdf' || file.name.endsWith('.pdf'))
    const imageFile = files.find((file) => file.type.startsWith('image/'))

    if (pdfFile) {
      handlePdfFile(pdfFile)
    }

    if (imageFile) {
      handleStampFile(imageFile)
    }
  }

  return (
    <section
      className={`rounded-2xl border border-slate-300/70 bg-white/70 p-4.5 shadow-float transition outline-offset-[-10px] ${
        isDragging ? 'outline-3 outline-blue-600' : 'outline-0 outline-transparent'
      }`}
      onDragEnter={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        if (event.currentTarget === event.target) {
          setIsDragging(false)
        }
      }}
      onDrop={handleDrop}
    >
      <input
        ref={pdfInputRef}
        className="sr-only"
        type="file"
        accept="application/pdf"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0]
          if (file) {
            handlePdfFile(file)
          }
        }}
      />
      <input
        ref={stampInputRef}
        className="sr-only"
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0]
          if (file) {
            handleStampFile(file)
          }
        }}
      />

      <header className="mb-3.5 flex items-start justify-between gap-4 max-lg:flex-col">
        <div>
          <p className="mb-1 text-xs font-bold text-blue-600">当前工具</p>
          <h2 className="text-[28px] font-extrabold tracking-[-0.035em] text-slate-900">
            PDF 盖章去白底
          </h2>
        </div>
        <div className="flex min-h-9 max-w-xl items-center gap-2 rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm font-medium text-slate-600">
          {busyLabel ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
          <span>{busyLabel || notice}</span>
        </div>
      </header>

      <section
        className="flex flex-wrap gap-2.5 rounded-lg border border-slate-200 bg-slate-50/70 p-3"
        aria-label="文件工具栏"
      >
        <button className={toolbarButton} type="button" onClick={() => pdfInputRef.current?.click()}>
          <Upload size={18} />
          PDF
        </button>
        <button className={toolbarButton} type="button" onClick={() => stampInputRef.current?.click()}>
          <ImagePlus size={18} />
          印章
        </button>
        <button className={toolbarButton} type="button" onClick={handleSaveDraft} disabled={!pdf || Boolean(busyLabel)}>
          <Save size={18} />
          保存草稿
        </button>
        <button
          className={`${toolbarButton} border-blue-700 bg-blue-600 text-white hover:bg-blue-700 hover:text-white`}
          type="button"
          onClick={handleExport}
          disabled={!canExport || Boolean(busyLabel)}
        >
          <FileDown size={18} />
          导出 PDF
        </button>
      </section>

      <section className="mt-3.5 grid grid-cols-[300px_minmax(0,1fr)] gap-3.5 max-lg:grid-cols-1">
        <aside className={`${panelClass} flex min-h-[680px] flex-col gap-4 p-4 max-lg:min-h-0`}>
          <section className="grid gap-2.5">
            <h3 className="text-sm font-bold text-slate-800">文件</h3>
            <FileBox
              icon={<FileText size={22} />}
              title={pdf?.name ?? '未选择 PDF'}
              detail={pdf ? `${pages.length} 页 · ${formatBytes(pdf.size)}` : '拖入或点击上传'}
            />
            <FileBox
              icon={<ImagePlus size={22} />}
              title={stamp?.name ?? '未选择印章'}
              detail={stamp ? formatBytes(stamp.size) : 'PNG、JPG、WebP'}
            />
          </section>

          <section className="grid gap-2.5">
            <h3 className="text-sm font-bold text-slate-800">印章</h3>
            <RangeLabel label="去白底阈值">
              <input
                className="w-full accent-blue-600"
                type="range"
                min="190"
                max="255"
                value={threshold}
                onChange={(event) => setThreshold(Number(event.target.value))}
              />
            </RangeLabel>
            <RangeLabel label="宽度">
              <input
                className="w-full accent-blue-600"
                type="range"
                min="60"
                max="260"
                value={currentPlacement?.width ?? defaultStampWidth}
                disabled={!currentPlacement}
                onChange={(event) => updateCurrentPlacement({ width: Number(event.target.value) })}
              />
            </RangeLabel>
            <RangeLabel label="透明度">
              <input
                className="w-full accent-blue-600"
                type="range"
                min="0.2"
                max="1"
                step="0.05"
                value={currentPlacement?.opacity ?? 1}
                disabled={!currentPlacement}
                onChange={(event) => updateCurrentPlacement({ opacity: Number(event.target.value) })}
              />
            </RangeLabel>
            {stampPreviewUrl && (
              <div className="grid min-h-26 place-items-center rounded-lg border border-dashed border-slate-300 bg-checker bg-[length:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0] p-3">
                <img className="max-h-23 max-w-45" src={stampPreviewUrl} alt="去白底后的印章预览" />
              </div>
            )}
          </section>

          <section className="grid gap-2.5">
            <h3 className="text-sm font-bold text-slate-800">草稿箱</h3>
            <div className="grid gap-2">
              {drafts.length === 0 && <p className="text-xs text-slate-500">暂无本地草稿</p>}
              {drafts.map((draft) => (
                <article key={draft.id} className="grid grid-cols-[minmax(0,1fr)_38px] gap-2">
                  <button className={`${toolbarButton} justify-start text-xs`} type="button" onClick={() => handleLoadDraft(draft.id)}>
                    <ArchiveRestore size={16} />
                    <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{draft.name}</span>
                  </button>
                  <button className={toolbarButton} type="button" aria-label="删除草稿" onClick={() => handleDeleteDraft(draft.id)}>
                    <Trash2 size={16} />
                  </button>
                </article>
              ))}
            </div>
          </section>
        </aside>

        <section className={`${panelClass} grid min-h-[680px] grid-rows-[auto_minmax(0,1fr)] overflow-hidden max-lg:min-h-0`}>
          {pages.length > 0 ? (
            <>
              <nav className="flex gap-2 overflow-x-auto border-b border-slate-200 p-3" aria-label="页面">
                {pages.map((page) => (
                  <button
                    key={page.pageNumber}
                    type="button"
                    className={`h-8.5 min-w-9 rounded-lg border text-sm font-semibold ${
                      page.pageNumber === selectedPage
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                    onClick={() => setSelectedPage(page.pageNumber)}
                  >
                    {page.pageNumber}
                  </button>
                ))}
              </nav>
              {activePage && (
                <button
                  className="relative mx-auto my-4 block w-[min(860px,calc(100%-32px))] border-0 bg-transparent p-0 shadow-[0_18px_54px_rgba(38,34,31,0.16)]"
                  type="button"
                  onClick={addOrMoveStamp}
                >
                  <img className="block h-auto w-full bg-white" src={activePage.dataUrl} alt={`PDF 第 ${activePage.pageNumber} 页预览`} />
                  {currentPlacement && stampPreviewUrl && (
                    <img
                      className="pointer-events-none absolute h-auto"
                      src={stampPreviewUrl}
                      alt=""
                      style={{
                        width: `${(currentPlacement.width / activePage.width) * 100}%`,
                        left: `${(currentPlacement.x / activePage.width) * 100}%`,
                        bottom: `${(currentPlacement.y / activePage.height) * 100}%`,
                        opacity: currentPlacement.opacity,
                      }}
                    />
                  )}
                </button>
              )}
            </>
          ) : (
            <div className="grid min-h-full place-items-center content-center gap-2.5 p-7 text-center text-slate-500">
              <Download size={34} />
              <h2 className="text-xl font-bold text-slate-800">拖入 PDF 和印章图片</h2>
              <p>点击页面任意位置即可放置或移动印章。</p>
            </div>
          )}
        </section>
      </section>
    </section>
  )
}

function FileBox({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  return (
    <div className="grid grid-cols-[28px_minmax(0,1fr)] items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50/70 p-3">
      {icon}
      <div className="min-w-0">
        <strong className="block overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold text-slate-800">
          {title}
        </strong>
        <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-500">
          {detail}
        </span>
      </div>
    </div>
  )
}

function RangeLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-xs font-semibold text-slate-600">
      {label}
      {children}
    </label>
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      }
    })
    reader.addEventListener('error', () => reject(reader.error ?? new Error('Blob 读取失败。')))
    reader.readAsDataURL(blob)
  })
}
