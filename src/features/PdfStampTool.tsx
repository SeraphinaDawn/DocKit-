import {
  ArchiveRestore,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Download,
  FileDown,
  FileText,
  ImagePlus,
  Loader2,
  RotateCcw,
  RotateCw,
  Save,
  Search,
  Trash2,
  Upload,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  EmptyState,
  InfoTile,
  InlineNotice,
  RangeField,
  SectionHeading,
  SurfacePanel,
} from '../components/ui'
import { buttonClasses, cx } from '../components/ui-helpers'
import { downloadBytes, formatBytes, readFileAsArrayBuffer, readFileAsDataUrl } from '../lib/files'
import { renderPdfPreviews, stampPdf } from '../lib/pdf'
import { deleteDraft, getDraft, listDrafts, saveDraft, type DraftSummary } from '../lib/storage'
import { removeLightBackground } from '../lib/stamp'
import type { DraftRecord, PdfPagePreview, StampPlacement } from '../types'

const defaultThreshold = 236
const defaultStampScale = 1
const minPlacementSize = 60
const maxPlacementScale = 0.72

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

type DragState = {
  pointerId: number
  placementId: string
  startX: number
  startY: number
  originX: number
  originY: number
}

export function PdfStampTool() {
  const [pdf, setPdf] = useState<PdfSource | null>(null)
  const [stamp, setStamp] = useState<StampSource | null>(null)
  const [stampPreviewUrl, setStampPreviewUrl] = useState('')
  const [stampNaturalSize, setStampNaturalSize] = useState({ width: 1, height: 1 })
  const [pages, setPages] = useState<PdfPagePreview[]>([])
  const [placements, setPlacements] = useState<StampPlacement[]>([])
  const [selectedPlacementId, setSelectedPlacementId] = useState<string | null>(null)
  const [threshold, setThreshold] = useState(defaultThreshold)
  const [stampScale, setStampScale] = useState(defaultStampScale)
  const [drafts, setDrafts] = useState<DraftSummary[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [busyLabel, setBusyLabel] = useState('')
  const [notice, setNotice] = useState('所有文件仅在当前设备处理，不会上传到服务器。')
  const [dragState, setDragState] = useState<DragState | null>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)
  const stampInputRef = useRef<HTMLInputElement>(null)
  const stageRefs = useRef<Record<number, HTMLDivElement | null>>({})

  const selectedPlacement = useMemo(
    () => placements.find((placement) => placement.id === selectedPlacementId) ?? null,
    [placements, selectedPlacementId],
  )

  const placementCountByPage = useMemo(() => {
    const counts = new Map<number, number>()
    placements.forEach((placement) => {
      counts.set(placement.pageNumber, (counts.get(placement.pageNumber) ?? 0) + 1)
    })
    return counts
  }, [placements])

  const statusText = useMemo(() => {
    if (busyLabel) {
      return busyLabel
    }
    if (!pdf) {
      return '等待上传 PDF'
    }
    if (!stampPreviewUrl) {
      return '等待上传印章图片'
    }
    if (placements.length === 0) {
      return '可以开始落章'
    }
    return `已放置 ${placements.length} 枚印章`
  }, [busyLabel, pdf, placements.length, stampPreviewUrl])

  const canExport = Boolean(pdf && stampPreviewUrl && placements.length > 0)
  const canPlaceStamp = Boolean(stampPreviewUrl && pages.length > 0)

  const stampAspectRatio = useMemo(() => {
    return stampNaturalSize.height / Math.max(stampNaturalSize.width, 1)
  }, [stampNaturalSize.height, stampNaturalSize.width])

  useEffect(() => {
    let active = true

    void listDrafts().then((items) => {
      if (active) {
        setDrafts(items)
      }
    })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!stamp) {
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
          setNotice(`已处理印章：${currentStamp.name}`)
        }
      } catch (error) {
        setNotice(error instanceof Error ? error.message : '印章处理失败。')
      } finally {
        if (!cancelled) {
          setBusyLabel('')
        }
      }
    }

    void processStamp()

    return () => {
      cancelled = true
    }
  }, [stamp, threshold])

  async function refreshDrafts() {
    setDrafts(await listDrafts())
  }

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
      setPlacements([])
      setSelectedPlacementId(null)
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
      setNotice(`已载入印章：${file.name}`)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '印章读取失败。')
    } finally {
      setBusyLabel('')
    }
  }

  function setStageRef(pageNumber: number, element: HTMLDivElement | null) {
    stageRefs.current[pageNumber] = element
  }

  function buildPlacement(pageNumber: number, clientX?: number, clientY?: number) {
    const stage = stageRefs.current[pageNumber]
    if (!stage || !stampPreviewUrl) {
      return null
    }

    const rect = stage.getBoundingClientRect()
    const baseWidth = Math.max(110, Math.min(180, rect.width * 0.2)) * stampScale
    const width = Math.max(minPlacementSize, Math.min(baseWidth, rect.width * maxPlacementScale))
    const height = Math.max(minPlacementSize, width * stampAspectRatio)

    let x = rect.width / 2 - width / 2
    let y = rect.height / 2 - height / 2

    if (typeof clientX === 'number' && typeof clientY === 'number') {
      x = clientX - rect.left - width / 2
      y = clientY - rect.top - height / 2
    }

    return {
      id: crypto.randomUUID(),
      pageNumber,
      x: clamp(x, 0, rect.width - width),
      y: clamp(y, 0, rect.height - height),
      width,
      height,
      rotation: -10,
      opacity: 1,
    } satisfies StampPlacement
  }

  function addPlacement(pageNumber: number, clientX?: number, clientY?: number) {
    const placement = buildPlacement(pageNumber, clientX, clientY)

    if (!placement) {
      setNotice('请先载入 PDF 和印章图片。')
      return
    }

    setPlacements((items) => [...items, placement])
    setSelectedPlacementId(placement.id)
  }

  function updatePlacementPosition(placementId: string, nextX: number, nextY: number) {
    setPlacements((items) =>
      items.map((placement) => {
        if (placement.id !== placementId) {
          return placement
        }

        const stage = stageRefs.current[placement.pageNumber]
        if (!stage) {
          return placement
        }

        const rect = stage.getBoundingClientRect()
        return {
          ...placement,
          x: clamp(nextX, 0, rect.width - placement.width),
          y: clamp(nextY, 0, rect.height - placement.height),
        }
      }),
    )
  }

  function updateSelectedPlacement(mutator: (placement: StampPlacement) => StampPlacement) {
    if (!selectedPlacementId) {
      return
    }

    setPlacements((items) =>
      items.map((placement) => (placement.id === selectedPlacementId ? mutator(placement) : placement)),
    )
  }

  function resizeSelectedPlacement(delta: number) {
    updateSelectedPlacement((placement) => {
      const stage = stageRefs.current[placement.pageNumber]
      if (!stage) {
        return placement
      }

      const rect = stage.getBoundingClientRect()
      const nextWidth = clamp(placement.width + delta, minPlacementSize, rect.width * maxPlacementScale)
      const ratio = nextWidth / placement.width
      const nextHeight = Math.max(minPlacementSize, placement.height * ratio)

      return {
        ...placement,
        width: nextWidth,
        height: nextHeight,
        x: clamp(placement.x, 0, rect.width - nextWidth),
        y: clamp(placement.y, 0, rect.height - nextHeight),
      }
    })
  }

  function rotateSelectedPlacement(delta: number) {
    updateSelectedPlacement((placement) => ({
      ...placement,
      rotation: placement.rotation + delta,
    }))
  }

  function nudgeSelectedPlacement(dx: number, dy: number) {
    if (!selectedPlacementId || !selectedPlacement) {
      return
    }

    updatePlacementPosition(selectedPlacementId, selectedPlacement.x + dx, selectedPlacement.y + dy)
  }

  function deleteSelectedPlacement() {
    if (!selectedPlacementId) {
      return
    }

    setPlacements((items) => items.filter((placement) => placement.id !== selectedPlacementId))
    setSelectedPlacementId(null)
  }

  function clearPlacements() {
    setPlacements([])
    setSelectedPlacementId(null)
  }

  async function handleSaveDraft() {
    if (!pdf) {
      setNotice('请先载入 PDF。')
      return
    }

    const record: DraftRecord = {
      id: crypto.randomUUID(),
      name: `${pdf.name.replace(/\.pdf$/i, '')} 盖章草稿`,
      updatedAt: Date.now(),
      pdfName: pdf.name,
      pdfBytes: pdf.bytes,
      stampName: stamp?.name,
      stampBytes: stamp?.bytes,
      threshold,
      stampScale,
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
      setStampScale(draft.stampScale ?? defaultStampScale)
      setPlacements(draft.placements)
      setSelectedPlacementId(draft.placements[0]?.id ?? null)

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
        setStampPreviewUrl('')
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
    if (!pdf || !stampPreviewUrl || placements.length === 0) {
      setNotice('请先放置至少一个印章。')
      return
    }

    setBusyLabel('正在合成 PDF')
    try {
      const normalizedPlacements = placements.map((placement) => {
        const preview = pages.find((page) => page.pageNumber === placement.pageNumber)
        const stage = stageRefs.current[placement.pageNumber]

        if (!preview || !stage) {
          return placement
        }

        const rect = stage.getBoundingClientRect()
        const scaleX = preview.width / rect.width
        const scaleY = preview.height / rect.height

        return {
          ...placement,
          x: placement.x * scaleX,
          y: preview.height - placement.y * scaleY - placement.height * scaleY,
          width: placement.width * scaleX,
          height: placement.height * scaleY,
        }
      })

      const stampedBytes = await stampPdf(pdf.bytes, stampPreviewUrl, normalizedPlacements)
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
      void handlePdfFile(pdfFile)
    }

    if (imageFile) {
      void handleStampFile(imageFile)
    }
  }

  function handlePageClick(pageNumber: number, event: React.MouseEvent<HTMLDivElement>) {
    if (!canPlaceStamp) {
      setNotice('请先载入印章图片后再落章。')
      return
    }

    if ((event.target as HTMLElement).closest('[data-placement-id]')) {
      return
    }

    addPlacement(pageNumber, event.clientX, event.clientY)
  }

  function handlePlacementPointerDown(placementId: string, event: React.PointerEvent<HTMLButtonElement>) {
    const placement = placements.find((item) => item.id === placementId)
    if (!placement) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    setSelectedPlacementId(placementId)
    setDragState({
      pointerId: event.pointerId,
      placementId,
      startX: event.clientX,
      startY: event.clientY,
      originX: placement.x,
      originY: placement.y,
    })
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePlacementPointerMove(placementId: string, event: React.PointerEvent<HTMLButtonElement>) {
    if (
      !dragState ||
      dragState.placementId !== placementId ||
      dragState.pointerId !== event.pointerId
    ) {
      return
    }

    const dx = event.clientX - dragState.startX
    const dy = event.clientY - dragState.startY
    updatePlacementPosition(placementId, dragState.originX + dx, dragState.originY + dy)
  }

  function endPlacementDrag(placementId: string, event: React.PointerEvent<HTMLButtonElement>) {
    if (
      !dragState ||
      dragState.placementId !== placementId ||
      dragState.pointerId !== event.pointerId
    ) {
      return
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    setDragState(null)
  }

  function handlePlacementWheel(placementId: string, event: React.WheelEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()
    setSelectedPlacementId(placementId)
    resizeSelectedPlacement(event.deltaY > 0 ? -10 : 10)
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
            void handlePdfFile(file)
          }
          event.currentTarget.value = ''
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
            void handleStampFile(file)
          }
          event.currentTarget.value = ''
        }}
      />

      <div className="mb-3.5 flex items-start justify-between gap-4 max-lg:flex-col">
        <SectionHeading eyebrow="当前工具" title="PDF 盖章去白底" titleAs="h2" />
        <InlineNotice icon={busyLabel ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}>
          {statusText}
        </InlineNotice>
      </div>

      <SurfacePanel variant="inset" className="flex flex-wrap gap-2.5 p-3" aria-label="文件工具栏">
        <button className={buttonClasses.toolbar} type="button" onClick={() => pdfInputRef.current?.click()}>
          <Upload size={18} />
          上传 PDF
        </button>
        <button className={buttonClasses.toolbar} type="button" onClick={() => stampInputRef.current?.click()}>
          <ImagePlus size={18} />
          上传印章
        </button>
        <button
          className={buttonClasses.toolbar}
          type="button"
          onClick={handleSaveDraft}
          disabled={!pdf || Boolean(busyLabel)}
        >
          <Save size={18} />
          保存草稿
        </button>
        <button
          className={buttonClasses.toolbarPrimary}
          type="button"
          onClick={handleExport}
          disabled={!canExport || Boolean(busyLabel)}
        >
          <FileDown size={18} />
          导出 PDF
        </button>
      </SurfacePanel>

      <section className="mt-3.5 grid grid-cols-[320px_minmax(0,1fr)] gap-3.5 max-xl:grid-cols-1">
        <SurfacePanel className="flex min-h-[760px] flex-col gap-4 p-4 max-xl:min-h-0">
          <section className="grid gap-2.5">
            <h3 className="text-sm font-bold text-slate-800">文件状态</h3>
            <InfoTile
              icon={<FileText size={22} />}
              title={pdf?.name ?? '未选择 PDF'}
              detail={pdf ? `${pages.length} 页 · ${formatBytes(pdf.size)}` : '拖入或点击上传'}
            />
            <InfoTile
              icon={<ImagePlus size={22} />}
              title={stamp?.name ?? '未选择印章'}
              detail={stamp ? formatBytes(stamp.size) : '支持 PNG / JPG / WebP'}
            />
            <div className="grid grid-cols-2 gap-2">
              <InfoTile
                icon={<Search size={22} />}
                title={`${pages.length}`}
                detail="PDF 页数"
              />
              <InfoTile
                icon={<Download size={22} />}
                title={`${placements.length}`}
                detail="已盖印章"
              />
            </div>
          </section>

          <section className="grid gap-2.5">
            <h3 className="text-sm font-bold text-slate-800">印章处理</h3>
            <RangeField label={`去白底阈值 ${threshold}`}>
              <input
                className="w-full accent-blue-600"
                type="range"
                min="190"
                max="255"
                value={threshold}
                onChange={(event) => setThreshold(Number(event.target.value))}
              />
            </RangeField>
            <RangeField label={`默认落章尺寸 ${Math.round(stampScale * 100)}%`}>
              <input
                className="w-full accent-blue-600"
                type="range"
                min="0.6"
                max="1.8"
                step="0.1"
                value={stampScale}
                onChange={(event) => setStampScale(Number(event.target.value))}
              />
            </RangeField>
            {stampPreviewUrl && (
              <SurfacePanel className="grid min-h-30 place-items-center border-dashed border-slate-300 bg-checker bg-[length:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0] p-3">
                <img className="max-h-26 max-w-48 object-contain" src={stampPreviewUrl} alt="印章预览" />
              </SurfacePanel>
            )}
            <p className="text-xs leading-6 text-slate-500">
              上传印章后会自动去白底。点击页面空白处可直接落章，鼠标滚轮可缩放，拖动可调整位置。
            </p>
          </section>

          <section className="grid gap-2.5">
            <h3 className="text-sm font-bold text-slate-800">选中印章微调</h3>
            <div className="grid grid-cols-3 gap-2">
              <div />
              <button
                type="button"
                className={buttonClasses.toolbar}
                disabled={!selectedPlacement}
                onClick={() => nudgeSelectedPlacement(0, -8)}
              >
                <ArrowUp size={16} />
                上移
              </button>
              <div />
              <button
                type="button"
                className={buttonClasses.toolbar}
                disabled={!selectedPlacement}
                onClick={() => nudgeSelectedPlacement(-8, 0)}
              >
                <ArrowLeft size={16} />
                左移
              </button>
              <button
                type="button"
                className={buttonClasses.toolbar}
                disabled={!selectedPlacement}
                onClick={() => nudgeSelectedPlacement(0, 8)}
              >
                <ArrowDown size={16} />
                下移
              </button>
              <button
                type="button"
                className={buttonClasses.toolbar}
                disabled={!selectedPlacement}
                onClick={() => nudgeSelectedPlacement(8, 0)}
              >
                <ArrowRight size={16} />
                右移
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={buttonClasses.toolbar}
                disabled={!selectedPlacement}
                onClick={() => resizeSelectedPlacement(-16)}
              >
                <ZoomOut size={16} />
                缩小
              </button>
              <button
                type="button"
                className={buttonClasses.toolbar}
                disabled={!selectedPlacement}
                onClick={() => resizeSelectedPlacement(16)}
              >
                <ZoomIn size={16} />
                放大
              </button>
              <button
                type="button"
                className={buttonClasses.toolbar}
                disabled={!selectedPlacement}
                onClick={() => rotateSelectedPlacement(-5)}
              >
                <RotateCcw size={16} />
                左旋
              </button>
              <button
                type="button"
                className={buttonClasses.toolbar}
                disabled={!selectedPlacement}
                onClick={() => rotateSelectedPlacement(5)}
              >
                <RotateCw size={16} />
                右旋
              </button>
            </div>
            {selectedPlacement && (
              <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs leading-6 text-slate-600">
                当前章：第 {selectedPlacement.pageNumber} 页 · {Math.round(selectedPlacement.width)} x{' '}
                {Math.round(selectedPlacement.height)} px · 旋转 {Math.round(selectedPlacement.rotation)}°
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={cx(buttonClasses.toolbar, 'border-rose-200 text-rose-700 hover:border-rose-300 hover:text-rose-800')}
                disabled={!selectedPlacement}
                onClick={deleteSelectedPlacement}
              >
                <Trash2 size={16} />
                删除选中章
              </button>
              <button
                type="button"
                className={buttonClasses.toolbar}
                disabled={placements.length === 0}
                onClick={clearPlacements}
              >
                <Trash2 size={16} />
                清空全部章
              </button>
            </div>
          </section>

          <section className="grid gap-2.5">
            <h3 className="text-sm font-bold text-slate-800">草稿箱</h3>
            <div className="grid gap-2">
              {drafts.length === 0 && <p className="text-xs text-slate-500">暂无本地草稿</p>}
              {drafts.map((draft) => (
                <article key={draft.id} className="grid grid-cols-[minmax(0,1fr)_38px] gap-2">
                  <button
                    className={cx(buttonClasses.toolbar, 'justify-start text-xs')}
                    type="button"
                    onClick={() => void handleLoadDraft(draft.id)}
                  >
                    <ArchiveRestore size={16} />
                    <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{draft.name}</span>
                  </button>
                  <button
                    className={buttonClasses.toolbar}
                    type="button"
                    aria-label="删除草稿"
                    onClick={() => void handleDeleteDraft(draft.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </article>
              ))}
            </div>
          </section>

          <InlineNotice icon={<FileText size={16} />} className="mt-auto">
            {notice}
          </InlineNotice>
        </SurfacePanel>

        <SurfacePanel className="grid min-h-[760px] grid-rows-[auto_minmax(0,1fr)] overflow-hidden max-xl:min-h-0">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 max-sm:flex-col max-sm:items-start max-sm:gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">PDF 预览区</h3>
              <p className="text-xs text-slate-500">点击页面空白处落章，支持多页多章、拖动、滚轮缩放和旋转微调。</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">共 {pages.length} 页</span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1">{statusText}</span>
            </div>
          </div>

          {pages.length > 0 ? (
            <div className="overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_24%),linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] p-4">
              <div className="mx-auto grid max-w-5xl gap-8">
                {pages.map((page) => {
                  const pagePlacements = placements.filter((placement) => placement.pageNumber === page.pageNumber)

                  return (
                    <section key={page.pageNumber} className="grid gap-3">
                      <div className="flex items-center justify-between gap-3 max-sm:flex-col max-sm:items-start">
                        <div className="text-sm font-bold text-slate-700">
                          第 {page.pageNumber} 页
                          <span className="ml-2 text-xs font-medium text-slate-500">
                            已放 {placementCountByPage.get(page.pageNumber) ?? 0} 枚
                          </span>
                        </div>
                        <button
                          type="button"
                          className={buttonClasses.toolbar}
                          disabled={!canPlaceStamp}
                          onClick={() => addPlacement(page.pageNumber)}
                        >
                          <ImagePlus size={16} />
                          本页居中放章
                        </button>
                      </div>

                      <div
                        ref={(element) => setStageRef(page.pageNumber, element)}
                        className="relative cursor-crosshair overflow-hidden rounded-[28px] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.12)] ring-1 ring-slate-200"
                        onClick={(event) => handlePageClick(page.pageNumber, event)}
                      >
                        <img className="block h-auto w-full select-none" src={page.dataUrl} alt={`PDF 第 ${page.pageNumber} 页预览`} />
                        {pagePlacements.map((placement) => (
                          <button
                            key={placement.id}
                            type="button"
                            data-placement-id={placement.id}
                            className={cx(
                              'absolute cursor-move touch-none select-none transition-[filter,opacity,box-shadow] duration-150',
                              selectedPlacementId === placement.id
                                ? 'opacity-100 drop-shadow-[0_0_10px_rgba(225,29,72,0.38)]'
                                : 'opacity-90',
                            )}
                            style={{
                              left: `${placement.x}px`,
                              top: `${placement.y}px`,
                              width: `${placement.width}px`,
                              height: `${placement.height}px`,
                              transform: `rotate(${placement.rotation}deg)`,
                              transformOrigin: 'center center',
                            }}
                            onPointerDown={(event) => handlePlacementPointerDown(placement.id, event)}
                            onPointerMove={(event) => handlePlacementPointerMove(placement.id, event)}
                            onPointerUp={(event) => endPlacementDrag(placement.id, event)}
                            onPointerCancel={(event) => endPlacementDrag(placement.id, event)}
                            onWheel={(event) => handlePlacementWheel(placement.id, event)}
                            onClick={(event) => {
                              event.stopPropagation()
                              setSelectedPlacementId(placement.id)
                            }}
                          >
                            <img
                              className="pointer-events-none h-full w-full object-contain"
                              src={stampPreviewUrl}
                              alt=""
                              style={{ opacity: placement.opacity }}
                            />
                          </button>
                        ))}
                      </div>
                    </section>
                  )
                })}
              </div>
            </div>
          ) : (
            <EmptyState
              className="min-h-full p-7 text-slate-500"
              icon={<Download size={34} />}
              title="先上传需要盖章的 PDF"
              description="上传后会自动生成逐页预览。再上传印章图片，就可以直接在页面上点击落章。"
            />
          )}
        </SurfacePanel>
      </section>
    </section>
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
