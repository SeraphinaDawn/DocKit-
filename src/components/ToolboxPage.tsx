import { Files, Home, Image, PenTool, ScanText, Scissors, Stamp } from 'lucide-react'
import type { ThemeMode } from '../lib/theme'
import type { ToolId, ToolMeta, ToolStatus } from '../types'
import { PdfMergePage } from '../features/pdf-merge/PdfMergePage'
import { PdfStampTool } from '../features/PdfStampTool'
import { SignatureCutoutTool } from '../features/SignatureCutoutTool'
import { buttonClasses, cx } from './ui-helpers'
import { Flywheel, type FlywheelTool } from './Flywheel'
import { EmptyState, SurfacePanel } from './ui'

type ToolboxPageProps = {
  appIconSrc: string
  themeMode: ThemeMode
  activeTool: ToolId | null
  activeToolMeta: ToolMeta | null
  tools: ToolMeta[]
  onBackToToolbox: () => void
  onOpenHome: () => void
  onOpenTool: (toolId: ToolId) => void
}

export function ToolboxPage({
  appIconSrc,
  themeMode,
  activeTool,
  activeToolMeta,
  tools,
  onBackToToolbox,
  onOpenHome,
  onOpenTool,
}: ToolboxPageProps) {
  const isNight = themeMode === 'night'
  const flywheelTools: FlywheelTool<ToolId>[] = tools.map((tool) => ({
    id: tool.id,
    name: tool.name,
    icon: toolIcons[tool.id],
    available: tool.state === '可用',
  }))

  if (activeTool === 'stamp' && activeToolMeta) {
    return (
      <section className="pt-7">
        <ToolHeader
          isNight={isNight}
          title={activeToolMeta.name}
          state={activeToolMeta.state}
          onBack={onBackToToolbox}
        />
        <PdfStampTool />
      </section>
    )
  }

  if (activeTool === 'sign' && activeToolMeta) {
    return (
      <section className="pt-7">
        <ToolHeader
          isNight={isNight}
          title={activeToolMeta.name}
          state={activeToolMeta.state}
          onBack={onBackToToolbox}
        />
        <SignatureCutoutTool />
      </section>
    )
  }

  if (activeTool === 'merge') {
    return (
      <section className="pt-7">
        <ToolHeader
          isNight={isNight}
          title="多PDF合并"
          state="可用"
          onBack={onBackToToolbox}
        />
        <PdfMergePage />
      </section>
    )
  }

  if (activeToolMeta) {
    return (
      <section className="pt-7">
        <ToolHeader
          isNight={isNight}
          title={activeToolMeta.name}
          state={activeToolMeta.state}
          onBack={onBackToToolbox}
        />
        <PlannedToolPage
          description={activeToolMeta.description}
          isNight={isNight}
        />
      </section>
    )
  }

  return (
    <section className="mx-auto flex h-[calc(100vh-118px)] w-full max-w-[1280px] items-center px-4 py-2 max-lg:h-auto max-lg:flex-col max-lg:gap-10">
      <div className="flex w-1/2 justify-center max-lg:w-full">
        <div className="max-w-xl">
          <p
            className={cx(
              'text-sm font-bold uppercase tracking-[0.36em]',
              isNight ? 'text-slate-400/80' : 'text-slate-500',
            )}
          >
            TOOLBOX
          </p>
          <h1
            className={cx(
              'mt-4 text-[clamp(3.75rem,7vw,7rem)] font-extrabold leading-none',
              isNight ? 'text-white' : 'text-slate-950',
            )}
          >
            工具箱
          </h1>
          <p
            className={cx(
              'mt-5 text-[clamp(1.25rem,2.2vw,2rem)] font-semibold tracking-normal',
              isNight ? 'text-blue-200' : 'text-blue-700',
            )}
          >
            本地处理 · 逐步扩展
          </p>
          <p
            className={cx(
              'mt-6 max-w-lg text-base font-medium leading-8',
              isNight ? 'text-slate-300/82' : 'text-slate-600',
            )}
          >
            这里集中展示当前工具能力。已上线工具可直接进入，未完成工具先保留在规划状态。
          </p>
        </div>
      </div>

      <div className="flex w-1/2 justify-center max-lg:w-full">
        <Flywheel
          appIconSrc={appIconSrc}
          isNight={isNight}
          tools={flywheelTools}
          onOpenHome={onOpenHome}
          onOpenTool={onOpenTool}
        />
      </div>
    </section>
  )
}

function PlannedToolPage({
  description,
  isNight,
}: {
  description: string
  isNight: boolean
}) {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-260px)] max-w-3xl place-items-center px-4 py-10">
      <SurfacePanel
        variant="page"
        className={cx(
          'grid w-full justify-items-center gap-5 px-8 py-16 text-center',
          isNight && 'border-white/10 bg-white/6 shadow-[0_24px_60px_rgba(4,10,26,0.32)]',
        )}
      >
        <EmptyState
          eyebrow="PLANNED"
          title="功能规划中"
          description={`${description} 这个界面已经预留好入口，后续接入功能后会直接在这里开放。`}
          titleClassName={cx(
            'mt-3 text-[38px] font-extrabold tracking-[-0.045em]',
            isNight ? 'text-white' : 'text-slate-900',
          )}
          className="max-w-2xl"
        />
      </SurfacePanel>
    </section>
  )
}

const toolIcons: Record<ToolId, FlywheelTool['icon']> = {
  stamp: Stamp,
  merge: Files,
  extract: Scissors,
  convert: Image,
  sign: PenTool,
  ocr: ScanText,
}

function ToolHeader({
  isNight,
  title,
  state,
  onBack,
}: {
  isNight: boolean
  title: string
  state: ToolStatus
  onBack: () => void
}) {
  return (
    <div className="mb-3.5 flex items-center justify-between gap-4 max-lg:flex-col max-lg:items-start">
      <button
        className={cx(
          buttonClasses.subtlePill,
          isNight &&
            'border border-white/14 bg-white/8 text-slate-100 shadow-[0_14px_32px_rgba(7,14,30,0.28)] hover:border-blue-300/26 hover:bg-white/10 hover:text-white',
        )}
        type="button"
        onClick={onBack}
      >
        <Home size={17} />
        返回工具箱
      </button>
      <div>
        <span className="text-xs font-bold text-blue-600">{state}</span>
        <h1
          className={cx(
            'text-[38px] font-extrabold tracking-tight',
            isNight ? 'text-white' : 'text-slate-900',
          )}
        >
          {title}
        </h1>
      </div>
    </div>
  )
}
