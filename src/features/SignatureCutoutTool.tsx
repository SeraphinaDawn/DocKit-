import {
  ArchiveRestore,
  CircleHelp,
  Download,
  Eraser,
  Eye,
  ImagePlus,
  Loader2,
  PenTool,
  Save,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UploadCloud,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type DragEvent, type RefObject } from 'react'
import {
  EmptyState,
  InfoTile,
  InlineNotice,
  RangeField,
  SectionHeading,
  SurfacePanel,
} from '../components/ui'
import { buttonClasses, cx } from '../components/ui-helpers'
import { downloadBytes, formatBytes, readFileAsDataUrl } from '../lib/files'
import {
  deleteSignatureDraft,
  getSignatureDraft,
  listSignatureDrafts,
  saveSignatureDraft,
  type SignatureDraftSummary,
} from '../lib/storage'
import { loadImage, removeBackground } from '../lib/stamp'
import type { SignatureDraftRecord } from '../types'

const defaultThreshold = 200
const defaultTolerance = 30
const defaultYellowThreshold = 160

type SignatureSource = {
  name: string
  size: number
  rawDataUrl: string
}

type ProcessedSignature = {
  dataUrl: string
  width: number
  height: number
  pngBytes: Uint8Array
}

export function SignatureCutoutTool() {
  const [source, setSource] = useState<SignatureSource | null>(null)
  const [processed, setProcessed] = useState<ProcessedSignature | null>(null)
  const [threshold, setThreshold] = useState(defaultThreshold)
  const [tolerance, setTolerance] = useState(defaultTolerance)
  const [yellowThreshold, setYellowThreshold] = useState(defaultYellowThreshold)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)
  const [drafts, setDrafts] = useState<SignatureDraftSummary[]>([])
  const [notice, setNotice] = useState('上传手写签名照片后，会在本地自动去掉白纸背景并导出透明 PNG。')
  const inputRef = useRef<HTMLInputElement>(null)
  const beforeCanvasRef = useRef<HTMLCanvasElement>(null)
  const afterCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let active = true

    void listSignatureDrafts().then((items) => {
      if (active) {
        setDrafts(items)
      }
    })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!source) {
      setProcessed(null)
      clearCanvas(beforeCanvasRef.current)
      clearCanvas(afterCanvasRef.current)
      return
    }

    let cancelled = false
    const currentSource = source

    async function processImage() {
      setIsProcessing(true)

      try {
        const [image, result] = await Promise.all([
          loadImage(currentSource.rawDataUrl),
          removeBackground(currentSource.rawDataUrl, {
            threshold,
            tolerance,
            yellowThreshold,
            preserveDarkPixels: true,
          }),
        ])

        if (cancelled) {
          return
        }

        drawCanvas(beforeCanvasRef.current, image, false)

        const outputImage = await loadImage(result.dataUrl)
        if (cancelled) {
          return
        }

        drawCanvas(afterCanvasRef.current, outputImage, true)
        setProcessed({
          dataUrl: result.dataUrl,
          width: result.width,
          height: result.height,
          pngBytes: dataUrlToBytes(result.dataUrl),
        })
        setNotice('已完成透明化预览。拖动滑块微调，满意后可以保存签名草稿或导出 PNG。')
      } catch (error) {
        if (!cancelled) {
          setProcessed(null)
          clearCanvas(afterCanvasRef.current)
          setNotice(error instanceof Error ? error.message : '签名图片处理失败。')
        }
      } finally {
        if (!cancelled) {
          setIsProcessing(false)
        }
      }
    }

    void processImage()

    return () => {
      cancelled = true
    }
  }, [source, threshold, tolerance, yellowThreshold])

  const statusText = useMemo(() => {
    if (isProcessing) {
      return '正在分析像素并去除背景'
    }

    if (!source) {
      return '等待上传签名图片'
    }

    return processed ? '预览已就绪，可以保存签名草稿或导出 PNG' : '等待重新处理'
  }, [isProcessing, processed, source])

  async function refreshDrafts() {
    setDrafts(await listSignatureDrafts())
  }

  async function handleImageFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setNotice('请选择 PNG、JPG 或 WebP 图片。')
      return
    }

    setIsProcessing(true)
    try {
      const rawDataUrl = await readFileAsDataUrl(file)
      setSource({
        name: file.name,
        size: file.size,
        rawDataUrl,
      })
      setNotice(`已载入图片：${file.name}`)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '图片读取失败。')
      setIsProcessing(false)
    }
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault()
    setIsDragActive(false)

    const file = Array.from(event.dataTransfer.files).find((item) => item.type.startsWith('image/'))
    if (file) {
      void handleImageFile(file)
      return
    }

    setNotice('拖拽的文件不是图片，请换成 PNG、JPG 或 WebP。')
  }

  function handleExport() {
    if (!processed) {
      return
    }

    const filename = buildOutputFilename(source?.name)
    downloadBytes(processed.pngBytes, filename, 'image/png')
    setNotice(`已导出 ${filename}`)
  }

  async function handleSaveSignatureDraft() {
    if (!processed) {
      setNotice('请先完成签名去背景处理，再保存草稿。')
      return
    }

    const record: SignatureDraftRecord = {
      id: crypto.randomUUID(),
      name: buildSignatureDraftName(source?.name),
      updatedAt: Date.now(),
      sourceName: source?.name,
      pngBytes: processed.pngBytes.slice().buffer,
      width: processed.width,
      height: processed.height,
    }

    setIsProcessing(true)
    try {
      await saveSignatureDraft(record)
      await refreshDrafts()
      setNotice('透明签名草稿已保存。之后可以在 PDF 盖章里直接引用。')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '签名草稿保存失败。')
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleLoadSignatureDraft(id: string) {
    setIsProcessing(true)

    try {
      const draft = await getSignatureDraft(id)
      if (!draft) {
        setNotice('签名草稿不存在或已被删除。')
        return
      }

      const rawDataUrl = await arrayBufferToDataUrl(draft.pngBytes, 'image/png')
      const bytes = new Uint8Array(draft.pngBytes)
      setSource({
        name: draft.sourceName ?? draft.name,
        size: draft.pngBytes.byteLength,
        rawDataUrl,
      })
      setProcessed({
        dataUrl: rawDataUrl,
        width: draft.width,
        height: draft.height,
        pngBytes: bytes,
      })
      drawCanvas(beforeCanvasRef.current, await loadImage(rawDataUrl), true)
      drawCanvas(afterCanvasRef.current, await loadImage(rawDataUrl), true)
      setNotice(`已载入签名草稿：${draft.name}`)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '签名草稿读取失败。')
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleDeleteSignatureDraft(id: string) {
    await deleteSignatureDraft(id)
    await refreshDrafts()
    setNotice('签名草稿已删除。')
  }

  function handleClearCurrentPhoto() {
    setSource(null)
    setProcessed(null)
    setIsProcessing(false)
    clearCanvas(beforeCanvasRef.current)
    clearCanvas(afterCanvasRef.current)
    setNotice('已移除当前照片，现在可以重新上传另一张签名图。')
  }

  return (
    <section className="rounded-2xl border border-slate-300/70 bg-white/72 p-4.5 shadow-float">
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0]
          if (file) {
            void handleImageFile(file)
          }
          event.currentTarget.value = ''
        }}
      />

      <div className="mb-3.5 flex items-start justify-between gap-4 max-lg:flex-col">
        <div className="max-w-3xl">
          <SectionHeading eyebrow="SIGNATURE CUTOUT" title="手写签名透明化" titleAs="h2" />
          <div className="mt-2 text-base leading-relaxed text-slate-600">
            白纸手写签名拍照后上传，自动识别高亮低饱和度背景，并导出可直接贴进文档的透明 PNG。
            <span className="group relative ml-1 inline-flex align-middle">
              <button
                type="button"
                aria-label="查看处理方式和隐私说明"
                className="inline-flex size-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 align-middle transition-colors hover:border-blue-300 hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
              >
                <CircleHelp size={14} />
              </button>
              <span className="pointer-events-none absolute left-full top-1/2 z-20 ml-3 hidden w-80 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white/98 p-3 text-left text-xs leading-6 text-slate-600 shadow-[0_16px_44px_rgba(15,23,42,0.14)] group-hover:block group-focus-within:block">
                整个流程都在当前设备本地完成：图片会进入 Canvas 逐像素判断亮度、饱和度和偏黄纸特征，再把背景透明化，不会上传到服务器。除非你自己导出或分享，原图和结果都不会离开这台设备。
              </span>
            </span>
          </div>
        </div>

        <InlineNotice icon={isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}>
          {statusText}
        </InlineNotice>
      </div>

      <div className="grid gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragEnter={(event) => {
            event.preventDefault()
            setIsDragActive(true)
          }}
          onDragOver={(event) => {
            event.preventDefault()
            setIsDragActive(true)
          }}
          onDragLeave={(event) => {
            if (event.currentTarget === event.target) {
              setIsDragActive(false)
            }
          }}
          onDrop={handleDrop}
          className={cx(
            'group rounded-[24px] border border-dashed px-4 py-4 text-left transition-all duration-200',
            isDragActive
              ? 'border-blue-500 bg-blue-50 shadow-[0_0_0_5px_rgba(59,130,246,0.08)]'
              : 'border-slate-300 bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(244,248,255,0.9)_100%)] hover:border-blue-300 hover:bg-white',
          )}
        >
          <div className="flex items-start gap-3">
            <span
              className={cx(
                'grid size-11 shrink-0 place-items-center rounded-2xl transition-colors',
                isDragActive ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
              )}
            >
              <UploadCloud size={22} />
            </span>
            <div className="grid gap-1">
              <strong className="text-base font-bold tracking-tight text-slate-800">
                {source ? '再上传一张签名图片' : '上传一张签名图片'}
              </strong>
              <p className="text-sm leading-6 text-slate-500">
                支持手机拍照件、扫描件、截图。也可以直接拖拽图片到这里上传。
              </p>
            </div>
          </div>
        </button>

        <SurfacePanel variant="inset" className="flex flex-wrap gap-2.5 p-3">
          <button className={buttonClasses.toolbar} type="button" onClick={() => inputRef.current?.click()}>
            <ImagePlus size={18} />
            选择签名图片
          </button>
          <button
            className={buttonClasses.toolbar}
            type="button"
            disabled={!processed || isProcessing}
            onClick={() => void handleSaveSignatureDraft()}
          >
            <Save size={18} />
            保存签名草稿
          </button>
          <button
            className={buttonClasses.toolbar}
            type="button"
            disabled={!source}
            onClick={handleClearCurrentPhoto}
          >
            <Trash2 size={18} />
            移除当前照片
          </button>
          <button
            className={buttonClasses.toolbarPrimary}
            type="button"
            disabled={!processed || isProcessing}
            onClick={handleExport}
          >
            <Download size={18} />
            导出 PNG
          </button>
        </SurfacePanel>
      </div>

      <section className="mt-3.5 grid grid-cols-[320px_minmax(0,1fr)] gap-3.5 max-xl:grid-cols-1">
        <SurfacePanel className="flex flex-col gap-4 p-4">
          <section className="grid gap-2.5">
            <h3 className="text-sm font-bold text-slate-800">图片信息</h3>
            <InfoTile
              icon={<PenTool size={22} />}
              title={source?.name ?? '未选择图片'}
              detail={source ? formatBytes(source.size) : '建议白纸拍照或扫描图'}
            />
            <div className="grid grid-cols-2 gap-2">
              <InfoTile
                icon={<Eye size={22} />}
                title={processed ? `${processed.width} × ${processed.height}` : '--'}
                detail="输出尺寸"
              />
              <InfoTile
                icon={<Download size={22} />}
                title={processed ? formatBytes(processed.pngBytes.byteLength) : '--'}
                detail="PNG 大小"
              />
            </div>
          </section>

          <section className="grid gap-2.5">
            <h3 className="text-sm font-bold text-slate-800">背景判断</h3>
            <RangeField label={`亮度阈值 ${threshold}`}>
              <input
                className="w-full accent-blue-600"
                type="range"
                min="150"
                max="255"
                value={threshold}
                onChange={(event) => setThreshold(Number(event.target.value))}
              />
            </RangeField>
            <RangeField label={`低饱和容差 ${tolerance}`}>
              <input
                className="w-full accent-blue-600"
                type="range"
                min="8"
                max="80"
                value={tolerance}
                onChange={(event) => setTolerance(Number(event.target.value))}
              />
            </RangeField>
            <RangeField label={`偏黄纸保护线 ${yellowThreshold}`}>
              <input
                className="w-full accent-blue-600"
                type="range"
                min="120"
                max="220"
                value={yellowThreshold}
                onChange={(event) => setYellowThreshold(Number(event.target.value))}
              />
            </RangeField>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/85 px-3 py-3 text-xs leading-6 text-amber-900">
              判断逻辑不是只抠纯白，而是同时看亮度、饱和度和偏黄纸特征。签名发灰时把亮度阈值调低一点；纸张去不干净时把容差调高一点。
            </div>
          </section>

          <section className="grid gap-2.5">
            <h3 className="text-sm font-bold text-slate-800">签名草稿</h3>
            <div className="grid gap-2">
              {drafts.length === 0 && <p className="text-xs text-slate-500">还没有保存过透明签名草稿。</p>}
              {drafts.map((draft) => (
                <article key={draft.id} className="grid grid-cols-[minmax(0,1fr)_38px] gap-2">
                  <button
                    className={cx(buttonClasses.toolbar, 'justify-start text-xs')}
                    type="button"
                    onClick={() => void handleLoadSignatureDraft(draft.id)}
                  >
                    <ArchiveRestore size={16} />
                    <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                      {draft.name}
                    </span>
                  </button>
                  <button
                    className={buttonClasses.toolbar}
                    type="button"
                    aria-label="删除签名草稿"
                    onClick={() => void handleDeleteSignatureDraft(draft.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-2.5">
            <h3 className="text-sm font-bold text-slate-800">操作建议</h3>
            <div className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 text-xs leading-6 text-slate-600">
              <p>1. 尽量在均匀光线下拍摄，避免阴影压到签名字迹上。</p>
              <p>2. 先看右侧透明棋盘预览，再拖滑块找到边缘最自然的状态。</p>
              <p>3. 保存过签名草稿后，可以直接在 PDF 盖章工具里引用，不用每次重新上传。</p>
            </div>
          </section>

          <InlineNotice icon={<SlidersHorizontal size={16} />}>
            {notice}
          </InlineNotice>
        </SurfacePanel>

        <SurfacePanel className="grid overflow-hidden">
          <div className="grid gap-0 border-b border-slate-200 sm:grid-cols-2">
            <PreviewPanel
              title="原图"
              subtitle="拍照或扫描后的签名底图"
              canvasRef={beforeCanvasRef}
              hasImage={Boolean(source)}
              emptyTitle="上传一张签名图片"
              emptyDescription="支持手机拍照件、扫描件、截图。"
            />
            <PreviewPanel
              title="透明预览"
              subtitle="棋盘背景用于观察透明区域"
              canvasRef={afterCanvasRef}
              hasImage={Boolean(processed)}
              checkerboard
              emptyTitle="处理结果会显示在这里"
              emptyDescription="滑块变化后会自动重新计算。"
            />
          </div>

          {processed && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2 font-semibold text-slate-700">
                <Eraser size={16} />
                已完成去背景，可直接保存签名草稿或导出透明 PNG
              </span>
              <span>
                当前参数：亮度 {threshold} / 容差 {tolerance} / 偏黄纸 {yellowThreshold}
              </span>
            </div>
          )}
        </SurfacePanel>
      </section>
    </section>
  )
}

function PreviewPanel({
  title,
  subtitle,
  canvasRef,
  hasImage,
  emptyTitle,
  emptyDescription,
  checkerboard = false,
}: {
  title: string
  subtitle: string
  canvasRef: RefObject<HTMLCanvasElement | null>
  hasImage: boolean
  emptyTitle: string
  emptyDescription: string
  checkerboard?: boolean
}) {
  return (
    <section className="grid min-h-[420px] grid-rows-[auto_minmax(0,1fr)]">
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
      <div
        className={cx(
          'grid min-h-0 place-items-center p-4',
          checkerboard &&
            'bg-checker bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0]',
        )}
      >
        <canvas
          ref={canvasRef}
          className={cx(
            'max-h-[460px] max-w-full rounded-2xl object-contain shadow-soft',
            hasImage ? 'block' : 'hidden',
          )}
        />
        {!hasImage && (
          <EmptyState
            className="px-8 text-slate-500"
            icon={<ImagePlus size={34} />}
            title={emptyTitle}
            description={emptyDescription}
          />
        )}
      </div>
    </section>
  )
}

function drawCanvas(canvas: HTMLCanvasElement | null, image: HTMLImageElement, transparent: boolean) {
  if (!canvas) {
    return
  }

  const context = canvas.getContext('2d')
  if (!context) {
    return
  }

  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  context.clearRect(0, 0, canvas.width, canvas.height)

  if (!transparent) {
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
  }

  context.drawImage(image, 0, 0)
}

function clearCanvas(canvas: HTMLCanvasElement | null) {
  if (!canvas) {
    return
  }

  const context = canvas.getContext('2d')
  if (!context) {
    return
  }

  context.clearRect(0, 0, canvas.width, canvas.height)
  canvas.width = 0
  canvas.height = 0
}

function buildOutputFilename(name?: string) {
  if (!name) {
    return 'signature-transparent.png'
  }

  return `${name.replace(/\.[^.]+$/, '')}-transparent.png`
}

function buildSignatureDraftName(name?: string) {
  const base = name ? name.replace(/\.[^.]+$/, '') : '手写签名'
  return `${base} 透明签名`
}

function dataUrlToBytes(dataUrl: string) {
  const base64 = dataUrl.split(',')[1] ?? ''
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

function arrayBufferToDataUrl(buffer: ArrayBuffer, type: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      }
    })
    reader.addEventListener('error', () => reject(reader.error ?? new Error('签名草稿读取失败。')))
    reader.readAsDataURL(new Blob([buffer], { type }))
  })
}
