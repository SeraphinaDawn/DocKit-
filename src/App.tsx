import {
  ArrowUp,
  ArrowRight,
  BookOpen,
  FileArchive,
  Files,
  GitBranch,
  Hammer,
  HeartHandshake,
  Layers3,
  Lock,
  Loader2,
  PenTool,
  Scissors,
  Sparkles,
  Stamp,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { FloatWrapper } from './components/FloatWrapper'
import {
  FloatingChipsCloud,
  type FloatingChipsCloudItem,
} from './components/FloatingChipsCloud'
import { NavBar } from './components/NavBar'
import { ToolboxPage } from './components/ToolboxPage'
import { loadThemeMode, saveThemeMode, type ThemeMode } from './lib/theme'
import {
  EmptyState,
  SectionHeading,
  SurfacePanel,
} from './components/ui'
import { buttonClasses, cx } from './components/ui-helpers'
import type { PageId, ToolId, ToolMeta } from './types'

type NavItem = {
  id: PageId
  label: string
}

const copy = {
  available: '可用',
  planned: '规划中',
  home: '首页',
  capabilities: '当前能力',
  toolbox: '工具箱',
  guide: '使用教程',
  drafts: '本地草稿',
  roadmap: '版本规划',
  stampTool: 'PDF盖章去白底',
  stampToolDesc: '上传 PDF 和印章图片，在本地去白底后完成盖章导出。',
  mergeTool: '多PDF合并',
  mergeToolDesc: '按顺序合并多个 PDF，输出为一个新的 PDF 文件。',
  extractTool: '页面提取',
  extractToolDesc: '提取指定页码，快速生成新的 PDF 文件。',
  convertTool: '图片PDF转换',
  convertToolDesc: '支持图片与 PDF 双向转换，适合扫描归档整理。',
  signTool: '手写签名',
  signToolDesc: '生成透明背景签名图，方便贴入文书。',
  ocrTool: '离线OCR',
  ocrToolDesc: '纯前端文字识别，不上传原始文档。',
  toolboxDesc: '这里集中展示当前工具能力。已上线工具可直接进入，未完成工具先保留在规划状态。',
  localProcessing: '本地处理 · 逐步扩展',
  backToToolbox: '返回工具箱',
} as const

const navItems: NavItem[] = [
  { id: 'home', label: copy.home },
  { id: 'capabilities', label: copy.capabilities },
  { id: 'toolbox', label: copy.toolbox },
  { id: 'guide', label: copy.guide },
  { id: 'drafts', label: copy.drafts },
  { id: 'roadmap', label: copy.roadmap },
]

const tools: ToolMeta[] = [
  {
    id: 'stamp',
    name: copy.stampTool,
    description: copy.stampToolDesc,
    state: copy.available,
  },
  {
    id: 'merge',
    name: copy.mergeTool,
    description: copy.mergeToolDesc,
    state: copy.available,
  },
  {
    id: 'extract',
    name: copy.extractTool,
    description: copy.extractToolDesc,
    state: copy.planned,
  },
  {
    id: 'convert',
    name: copy.convertTool,
    description: copy.convertToolDesc,
    state: copy.planned,
  },
  {
    id: 'sign',
    name: copy.signTool,
    description: copy.signToolDesc,
    state: copy.available,
  },
  {
    id: 'ocr',
    name: copy.ocrTool,
    description: copy.ocrToolDesc,
    state: copy.planned,
  },
]

const appIconSrc = '/generated-image.png'
const daytimeBackgroundSrc = '/generated-daytime.png'
const nightBackgroundSrc = '/generated-night.png'

function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => loadThemeMode())
  const [currentPage, setCurrentPage] = useState<PageId>('home')
  const [activeTool, setActiveTool] = useState<ToolId | null>(null)
  const isNight = themeMode === 'night'
  const isToolboxLanding = currentPage === 'toolbox' && activeTool === null
  const isCompactNav = currentPage !== 'home' || activeTool !== null
  const toolIds = tools.map((tool) => tool.id)

  useEffect(() => {
    saveThemeMode(themeMode)
  }, [themeMode])

  useEffect(() => {
    const handleHashChange = () => {
      const nextHash = window.location.hash.replace('#', '') as PageId | ToolId | ''

      if (toolIds.includes(nextHash as ToolId)) {
        setCurrentPage('toolbox')
        setActiveTool(nextHash as ToolId)
        return
      }

      const matchedPage = navItems.find((item) => item.id === nextHash)
      if (matchedPage) {
        setCurrentPage(matchedPage.id)
        setActiveTool(null)
        return
      }

      setCurrentPage('home')
      setActiveTool(null)
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [toolIds])

  const activeToolMeta = useMemo(
    () => tools.find((tool) => tool.id === activeTool) ?? null,
    [activeTool],
  )

  function navigateToPage(pageId: PageId) {
    window.location.hash = pageId
  }

  function openTool(toolId: ToolId) {
    window.location.hash = toolId
  }

  return (
    <main
      className={cx(
        'relative overflow-x-hidden px-4 py-4 antialiased transition-colors duration-500 sm:px-8',
        isToolboxLanding ? 'h-screen overflow-hidden' : 'min-h-screen',
        isNight ? 'bg-[#050b18] text-slate-50' : 'bg-page-grid text-zinc-950',
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500"
        style={{ backgroundImage: `url(${isNight ? nightBackgroundSrc : daytimeBackgroundSrc})` }}
      />
      <div
        className={cx(
          'pointer-events-none absolute inset-0 z-0 transition-opacity duration-500',
          isNight
            ? 'bg-[linear-gradient(180deg,rgba(5,10,24,0.78)_0%,rgba(6,12,28,0.54)_30%,rgba(5,12,28,0.3)_54%,rgba(5,12,28,0.82)_100%)]'
            : isToolboxLanding
              ? 'bg-[linear-gradient(180deg,rgba(247,250,255,0.94)_0%,rgba(239,246,255,0.86)_42%,rgba(234,242,252,0.92)_100%)]'
              : 'bg-[linear-gradient(180deg,rgba(236,243,252,0.82)_0%,rgba(244,248,255,0.62)_36%,rgba(248,251,255,0.18)_58%,rgba(238,244,251,0.86)_100%)]',
        )}
      />
      <div
        className={cx(
          'pointer-events-none absolute inset-0 z-0 transition-opacity duration-500',
          isNight
            ? 'bg-[radial-gradient(circle_at_50%_24%,rgba(117,163,255,0.34),transparent_24%),radial-gradient(circle_at_50%_62%,rgba(189,216,255,0.16),transparent_18%)]'
            : 'bg-[radial-gradient(circle_at_50%_22%,rgba(96,165,250,0.18),transparent_26%)]',
        )}
      />

      {!isNight && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 overflow-hidden">
          <div className="absolute bottom-[18px] left-1/2 h-[220px] w-[132vw] max-w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.9)_24%,rgba(245,249,255,0.58)_48%,rgba(255,255,255,0.14)_66%,transparent_82%)] opacity-95 blur-[30px] sm:bottom-[24px] sm:h-[260px] sm:max-w-[940px] sm:blur-[36px] lg:bottom-[28px] lg:h-[340px] lg:max-w-[1220px] lg:blur-[48px]" />
          <div className="absolute bottom-[42px] left-[6%] h-[180px] w-[64vw] min-w-[260px] max-w-[420px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.96)_0%,rgba(248,251,255,0.72)_34%,rgba(255,255,255,0.18)_62%,transparent_82%)] opacity-90 blur-[36px] sm:left-[10%] sm:bottom-[44px] sm:h-[210px] sm:max-w-[470px] sm:blur-[40px] lg:left-[16%] lg:bottom-[54px] lg:h-[280px] lg:max-w-[560px] lg:blur-[52px]" />
          <div className="absolute bottom-[36px] right-[4%] h-[190px] w-[66vw] min-w-[280px] max-w-[440px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.94)_0%,rgba(241,246,255,0.68)_36%,rgba(255,255,255,0.16)_64%,transparent_82%)] opacity-90 blur-[38px] sm:right-[8%] sm:bottom-[38px] sm:h-[220px] sm:max-w-[500px] sm:blur-[42px] lg:right-[12%] lg:bottom-[48px] lg:h-[290px] lg:max-w-[580px] lg:blur-[54px]" />
          <div className="absolute bottom-[72px] left-1/2 h-[130px] w-[92vw] max-w-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(232,242,255,0.74)_0%,rgba(255,255,255,0.3)_52%,transparent_80%)] opacity-80 blur-[26px] sm:bottom-[84px] sm:h-[150px] sm:max-w-[860px] lg:bottom-[104px] lg:h-[190px] lg:max-w-[980px] lg:blur-[34px]" />
        </div>
      )}

      <NavBar
        appIconSrc={appIconSrc}
        currentPage={currentPage}
        isCompact={isCompactNav}
        navItems={navItems}
        themeMode={themeMode}
        onNavigate={navigateToPage}
        onToggleTheme={() => setThemeMode(isNight ? 'day' : 'night')}
      />

      <section className="relative z-10 mx-auto w-full max-w-[1440px]">
        {currentPage === 'home' && (
          <HomePage
            themeMode={themeMode}
            onNavigate={navigateToPage}
            onOpenTool={openTool}
          />
        )}

        {currentPage === 'capabilities' && (
          <CapabilitiesPage themeMode={themeMode} onOpenStamp={() => openTool('stamp')} />
        )}

        {currentPage === 'toolbox' && (
          <ToolboxPage
            appIconSrc={appIconSrc}
            themeMode={themeMode}
            activeTool={activeTool}
            activeToolMeta={activeToolMeta}
            tools={tools}
            onBackToToolbox={() => navigateToPage('toolbox')}
            onOpenHome={() => navigateToPage('home')}
            onOpenTool={openTool}
          />
        )}

        {currentPage === 'guide' && (
          <UnderConstructionPage
            themeMode={themeMode}
            title="使用教程"
            description="教程内容正在整理中，后续会加入图文引导与常见问题说明。"
          />
        )}
        {currentPage === 'drafts' && (
          <UnderConstructionPage
            themeMode={themeMode}
            title="本地草稿"
            description="草稿管理页正在开发中，后续会集中展示已保存的本地任务。"
          />
        )}
        {currentPage === 'roadmap' && <RoadmapPage themeMode={themeMode} />}
      </section>

      {currentPage !== 'toolbox' && (
        <>
          <footer
            className={cx(
              'relative z-10 mx-auto mt-13 flex flex-wrap justify-center gap-4.5 text-sm font-semibold',
              isNight ? 'text-slate-300/78' : 'text-slate-500',
            )}
          >
            <span className="inline-flex items-center gap-2">
              <Sparkles size={16} />
              100% 本地运行
            </span>
            <span className="inline-flex items-center gap-2">
              <GitBranch size={16} />
              Vite + React + Tailwind
            </span>
            <span className="inline-flex items-center gap-2">
              <HeartHandshake size={16} />
              隐私友好的文书工具
            </span>
          </footer>

          <button
            type="button"
            aria-label="返回顶部"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={cx(
              'fixed right-4 bottom-24 z-30 inline-flex size-12 items-center justify-center rounded-full border shadow-float backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 sm:right-6',
              isNight
                ? 'border-white/12 bg-white/10 text-slate-100 hover:bg-white/14 hover:text-blue-300'
                : 'border-slate-200 bg-white/88 text-slate-600 hover:border-blue-200 hover:bg-white hover:text-blue-700',
            )}
          >
            <ArrowUp size={18} />
          </button>
        </>
      )}
    </main>
  )
}

function HomePage({
  themeMode,
  onNavigate,
  onOpenTool,
}: {
  themeMode: ThemeMode
  onNavigate: (pageId: PageId) => void
  onOpenTool: (toolId: ToolId) => void
}) {
  const isNight = themeMode === 'night'

  return (
    <section className="mx-auto grid min-h-[calc(100vh-188px)] w-full max-w-4xl place-items-center">
      <section className="grid min-h-[460px] w-full place-items-center content-center gap-7 px-4 py-12 text-center max-lg:min-h-[420px]">
        <div
          className={cx(
            'grid size-18 place-items-center overflow-hidden rounded-2xl shadow-glow',
            isNight
              ? 'border border-white/10 bg-white/6 shadow-[0_24px_70px_rgba(110,153,255,0.26)]'
              : 'border border-blue-100 bg-white/75',
          )}
        >
          <img className="size-full object-cover" src={appIconSrc} alt="DocKit 图标" />
        </div>
        <div className="grid justify-items-center gap-4">
          <h1
            className={cx(
              'text-[clamp(3.25rem,6vw,5.25rem)] font-extrabold leading-none max-lg:text-5xl',
              isNight
                ? 'text-white drop-shadow-[0_0_34px_rgba(180,210,255,0.34)]'
                : 'text-slate-900',
            )}
          >
            DocKit
          </h1>
          <p
            className={cx(
              'max-w-2xl text-[clamp(1rem,1.6vw,1.125rem)] font-medium leading-relaxed',
              isNight ? 'text-slate-200/80' : 'text-slate-600',
            )}
          >
            {isNight
              ? '轻量、好用的文档处理工具集，帮你更高效地完成 PDF 工作。'
              : '一个聚合式、隐私友好的本地文书工具箱，适合处理盖章、签名、PDF 合并、页面提取与离线文档整理。'}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            className={cx(
              buttonClasses.primaryPill,
              isNight &&
                'border-blue-400/30 bg-[linear-gradient(180deg,rgba(63,112,255,0.96)_0%,rgba(36,84,230,0.94)_100%)] text-white shadow-[0_14px_36px_rgba(59,106,255,0.32)] hover:bg-[linear-gradient(180deg,rgba(74,122,255,1)_0%,rgba(44,94,238,1)_100%)]',
            )}
            type="button"
            onClick={() => (isNight ? onNavigate('toolbox') : onOpenTool('stamp'))}
          >
            <Stamp size={17} />
            {isNight ? '进入工具箱' : '打开盖章工具'}
          </button>
          <button
            className={cx(
              buttonClasses.subtlePill,
              isNight &&
                'border border-white/14 bg-white/8 text-slate-100 shadow-[0_14px_32px_rgba(7,14,30,0.28)] hover:border-blue-300/26 hover:bg-white/10 hover:text-white',
            )}
            type="button"
            onClick={() => onNavigate(isNight ? 'capabilities' : 'toolbox')}
          >
            {isNight ? <BookOpen size={17} /> : <Hammer size={17} />}
            {isNight ? '查看能力' : '查看工具箱'}
          </button>
          <button
            className={cx(
              buttonClasses.subtlePill,
              isNight &&
                'border border-white/14 bg-white/8 text-slate-100 shadow-[0_14px_32px_rgba(7,14,30,0.28)] hover:border-blue-300/26 hover:bg-white/10 hover:text-white',
            )}
            type="button"
            onClick={() => onNavigate(isNight ? 'guide' : 'roadmap')}
          >
            <BookOpen size={17} />
            {isNight ? '使用教程' : '版本计划'}
          </button>
        </div>

        <FeatureOrbit themeMode={themeMode} onNavigate={onNavigate} onOpenTool={onOpenTool} />
      </section>
    </section>
  )
}

function FeatureOrbit({
  themeMode,
  onNavigate,
  onOpenTool,
}: {
  themeMode: ThemeMode
  onNavigate: (pageId: PageId) => void
  onOpenTool: (toolId: ToolId) => void
}) {
  const isNight = themeMode === 'night'
  const floatingChips: FloatingChipsCloudItem[] = [
    {
      label: '签名',
      icon: PenTool,
      positionClass: 'top-[22%] left-[2%]',
      desktopPreset: 'driftA',
      mobilePreset: 'mobileA',
      onClick: () => onOpenTool('sign'),
    },
    {
      label: '页面提取',
      icon: Scissors,
      positionClass: 'top-[20%] left-[40%]',
      desktopPreset: 'driftB',
      mobilePreset: 'mobileB',
      onClick: () => onOpenTool('extract'),
    },
    {
      label: '压缩 PDF',
      icon: FileArchive,
      positionClass: 'top-[20%] left-[79%]',
      desktopPreset: 'driftC',
      mobilePreset: 'mobileC',
      onClick: () => onNavigate('roadmap'),
    },
    {
      label: 'PDF 合并',
      icon: Files,
      positionClass: 'top-[38%] left-[18%]',
      desktopPreset: 'driftD',
      mobilePreset: 'mobileD',
      onClick: () => onOpenTool('merge'),
    },
    {
      label: '批量处理',
      icon: Layers3,
      positionClass: 'top-[37%] left-[61%]',
      desktopPreset: 'driftE',
      mobilePreset: 'mobileA',
      onClick: () => onNavigate('roadmap'),
    },
    {
      label: '盖章工具',
      icon: Stamp,
      positionClass: 'top-[60%] left-[10%]',
      desktopPreset: 'driftF',
      mobilePreset: 'mobileB',
      onClick: () => onOpenTool('stamp'),
    },
    {
      label: '加密保护',
      icon: Lock,
      positionClass: 'top-[58%] left-[64%]',
      desktopPreset: 'driftG',
      mobilePreset: 'mobileC',
      onClick: () => onNavigate('roadmap'),
    },
  ]

  return (
    <section className="mt-3 w-full max-w-5xl">
      <div
        className={cx(
          'relative mx-auto flex min-h-14 w-full max-w-3xl items-center justify-between gap-4 rounded-full px-5 text-left transition-all duration-300 sm:px-7',
          isNight
            ? 'border border-white/14 bg-[#111d36]/78 shadow-[0_18px_54px_rgba(4,10,28,0.36),inset_0_1px_0_rgba(255,255,255,0.06)]'
            : 'border border-white/80 bg-white/92 shadow-soft',
        )}
      >
        <span
          className={cx(
            'inline-flex size-8 items-center justify-center rounded-full',
            isNight ? 'bg-blue-500/14 text-blue-300' : 'bg-blue-50 text-blue-500',
          )}
        >
          <Sparkles size={15} />
        </span>
        <span
          className={cx(
            'flex flex-1 flex-wrap items-center justify-center gap-1.5 text-center text-base font-medium tracking-tight sm:text-[1.05rem]',
            isNight ? 'text-slate-300/80' : 'text-slate-400',
          )}
        >
          <span>试试：</span>
          <button
            type="button"
            onClick={() => onOpenTool('merge')}
            className={cx(
              'rounded-full px-3 py-1 font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400',
              isNight
                ? 'text-blue-200 hover:bg-blue-400/18 hover:text-white active:bg-blue-400/24'
                : 'text-blue-700 hover:bg-blue-50 hover:text-blue-800 active:bg-blue-100',
            )}
          >
            合并 PDF
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={() => onOpenTool('sign')}
            className={cx(
              'rounded-full px-3 py-1 font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400',
              isNight
                ? 'text-blue-200 hover:bg-blue-400/18 hover:text-white active:bg-blue-400/24'
                : 'text-blue-700 hover:bg-blue-50 hover:text-blue-800 active:bg-blue-100',
            )}
          >
            插入签名
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={() => onOpenTool('extract')}
            className={cx(
              'rounded-full px-3 py-1 font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400',
              isNight
                ? 'text-blue-200 hover:bg-blue-400/18 hover:text-white active:bg-blue-400/24'
                : 'text-blue-700 hover:bg-blue-50 hover:text-blue-800 active:bg-blue-100',
            )}
          >
            提取页面
          </button>
        </span>
        <span
          className={cx(
            'inline-flex size-8 items-center justify-center rounded-full',
            isNight ? 'text-slate-300/76' : 'text-slate-400',
          )}
        >
          <ArrowRight size={18} />
        </span>
      </div>

      <div className="relative mt-6">
        <div
          className={cx(
            'pointer-events-none absolute inset-x-8 top-8 h-28 rounded-full blur-3xl',
            isNight
              ? 'bg-[radial-gradient(circle,rgba(84,130,255,0.24),transparent_72%)]'
              : 'bg-[radial-gradient(circle,rgba(96,165,250,0.14),transparent_72%)]',
          )}
        />
        <div
          className={cx(
            'pointer-events-none absolute right-12 top-24 h-28 w-40 rounded-full blur-3xl',
            isNight
              ? 'bg-[radial-gradient(circle,rgba(184,214,255,0.16),transparent_68%)]'
              : 'bg-[radial-gradient(circle,rgba(251,191,36,0.12),transparent_68%)]',
          )}
        />

        <FloatingChipsCloud
          items={floatingChips}
          chipClassName={
            isNight
              ? 'border border-white/12 bg-[#121f39]/78 text-slate-100 shadow-[0_18px_44px_rgba(5,10,24,0.34),inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-blue-300/20 hover:bg-[#17284a]/84 hover:text-white'
              : undefined
          }
        />

        <div className="mt-6 flex justify-center">
          <FloatWrapper preset="soft">
            <button
              type="button"
              onClick={() => onOpenTool('stamp')}
              className={cx(
                'inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-tight transition-colors duration-300',
                isNight
                  ? 'border border-white/14 bg-[#101b33]/82 text-slate-300 shadow-[0_16px_38px_rgba(5,10,24,0.36)] hover:text-blue-300'
                  : 'border border-white/85 bg-white/92 text-slate-400 shadow-soft hover:text-blue-700',
              )}
            >
              最近使用：
              <span className="text-blue-700">盖章工具</span>
            </button>
          </FloatWrapper>
        </div>
      </div>
    </section>
  )
}

function CapabilitiesPage({
  themeMode,
  onOpenStamp,
}: {
  themeMode: ThemeMode
  onOpenStamp: () => void
}) {
  const isNight = themeMode === 'night'
  const capabilities = [
    '支持 PDF 页面预览、Canvas 印章去白底与 pdf-lib 合成导出。',
    '支持本地草稿暂存，适合较大 PDF 的阶段性处理。',
    '支持 PWA 离线缓存，安装后可作为独立窗口运行。',
    '预留桌面端扩展路径，方便后续接入原生文件能力。',
  ]

  return (
    <section className="mx-auto max-w-5xl px-4 py-8">
      <SurfacePanel
        variant="page"
        className={cx(
          'p-7',
          isNight && 'border-white/10 bg-white/6 shadow-[0_24px_60px_rgba(4,10,26,0.32)]',
        )}
      >
        <SectionHeading
          eyebrow="CURRENT CAPABILITIES"
          title="当前能力"
          description="这一页专门展示现在已经可用的能力，方便从导航直接查看，不再和首页内容混在一起。"
          aside={
            <button
              className={cx(
                buttonClasses.subtlePill,
                isNight &&
                  'border border-white/14 bg-white/8 text-slate-100 shadow-[0_14px_32px_rgba(7,14,30,0.28)] hover:border-blue-300/26 hover:bg-white/10 hover:text-white',
              )}
              type="button"
              onClick={onOpenStamp}
            >
              <Stamp size={17} />
              直接进入盖章工具
            </button>
          }
        />

        <div className="mt-8 grid gap-4">
          {capabilities.map((item) => (
            <SurfacePanel
              key={item}
              variant="inset"
              className={cx(
                'rounded-2xl p-5 text-base font-medium leading-relaxed shadow-soft',
                isNight
                  ? 'border-white/10 bg-white/6 text-slate-100'
                  : 'text-slate-700',
              )}
            >
              {item}
            </SurfacePanel>
          ))}
        </div>
      </SurfacePanel>
    </section>
  )
}


function RoadmapPage({ themeMode }: { themeMode: ThemeMode }) {
  const isNight = themeMode === 'night'
  const roadmapItems = [
    '补齐多 PDF 合并与页面提取，形成基础文书处理闭环。',
    '加入签名、OCR 与图片转换，覆盖常见轻办公场景。',
    '补充教程页、草稿页与批量处理体验，减少首次使用门槛。',
  ]

  return (
    <section className="mx-auto max-w-5xl px-4 py-8">
      <SurfacePanel
        variant="page"
        className={cx(
          'p-7',
          isNight && 'border-white/10 bg-white/6 shadow-[0_24px_60px_rgba(4,10,26,0.32)]',
        )}
      >
        <SectionHeading eyebrow="ROADMAP" title="版本计划" />

        <div className="mt-8 grid gap-4">
          {roadmapItems.map((item, index) => (
            <SurfacePanel
              key={item}
              variant="inset"
              className={cx(
                'rounded-2xl p-5 shadow-soft',
                isNight && 'border-white/10 bg-white/6',
              )}
            >
              <p className="text-sm font-bold text-blue-600">阶段 {index + 1}</p>
              <p className={cx('mt-2 text-base font-medium leading-relaxed', isNight ? 'text-slate-100' : 'text-slate-700')}>
                {item}
              </p>
            </SurfacePanel>
          ))}
        </div>
      </SurfacePanel>
    </section>
  )
}

function UnderConstructionPage({
  themeMode,
  title,
  description,
}: {
  themeMode: ThemeMode
  title: string
  description: string
}) {
  const isNight = themeMode === 'night'

  return (
    <section className="mx-auto grid min-h-[calc(100vh-260px)] max-w-3xl place-items-center px-4 py-10">
      <SurfacePanel
        variant="page"
        className={cx(
          'grid w-full justify-items-center gap-5 px-8 py-16 text-center',
          isNight && 'border-white/10 bg-white/6 shadow-[0_24px_60px_rgba(4,10,26,0.32)]',
        )}
      >
        <div
          className={cx(
            'grid size-18 place-items-center rounded-full text-blue-600 shadow-glow',
            isNight ? 'bg-blue-500/12' : 'bg-blue-50',
          )}
        >
          <Loader2 size={34} className="animate-spin" />
        </div>
        <EmptyState
          eyebrow="IN PROGRESS"
          title={`${title}开发中`}
          description={description}
          titleClassName="mt-3 text-[38px] font-extrabold tracking-[-0.045em] text-slate-900"
        />
      </SurfacePanel>
    </section>
  )
}

export default App
