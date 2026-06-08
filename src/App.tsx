import {
  Archive,
  BadgeCheck,
  BookOpen,
  FileArchive,
  FileImage,
  FileStack,
  FileText,
  GitBranch,
  HeartHandshake,
  Home,
  Merge,
  Scissors,
  Sparkles,
  Stamp,
} from 'lucide-react'
import { useState } from 'react'
import { PdfStampTool } from './features/PdfStampTool'

type ToolId = 'stamp' | 'merge' | 'extract' | 'convert' | 'sign' | 'ocr'

const tools: Array<{
  id: ToolId
  name: string
  description: string
  icon: React.ComponentType<{ size?: number }>
  state: '可用' | '规划中'
}> = [
  {
    id: 'stamp',
    name: 'PDF 盖章去白底',
    description: '上传 PDF 与印章图片，本地去白底后合成导出。',
    icon: Stamp,
    state: '可用',
  },
  {
    id: 'merge',
    name: '多 PDF 合并',
    description: '把多个文档按顺序合并为一个 PDF。',
    icon: Merge,
    state: '规划中',
  },
  {
    id: 'extract',
    name: '页面提取',
    description: '选取指定页码，单独导出新文件。',
    icon: Scissors,
    state: '规划中',
  },
  {
    id: 'convert',
    name: '图片 PDF 转换',
    description: '图片与 PDF 双向转换，适合归档扫描件。',
    icon: FileImage,
    state: '规划中',
  },
  {
    id: 'sign',
    name: '手写签名',
    description: '生成透明背景签名图，便于贴入文书。',
    icon: BadgeCheck,
    state: '规划中',
  },
  {
    id: 'ocr',
    name: '离线 OCR',
    description: '纯前端文本识别，不上传原始文件。',
    icon: FileText,
    state: '规划中',
  },
]

const navItems = ['首页', '当前能力', '工具箱', '使用教程', '本地草稿', '版本计划']

const navItemBase =
  'min-h-10 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold tracking-tight transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-white hover:text-blue-700 hover:shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400'

const subtleButton =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/75 px-4.5 py-2.5 text-sm font-semibold tracking-tight text-slate-700 shadow-soft transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:text-blue-700 hover:shadow-float focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400'

function App() {
  const [activeTool, setActiveTool] = useState<ToolId | null>(null)
  const activeToolMeta = tools.find((tool) => tool.id === activeTool)

  return (
    <main className="min-h-screen overflow-x-hidden bg-page-grid px-4 py-4 text-zinc-950 antialiased sm:px-8">
      <nav
        className="sticky top-4 z-20 mx-auto mb-6 flex min-h-17 w-full max-w-[1428px] items-center justify-between gap-4 rounded-full border border-slate-300/70 bg-white/80 px-4 py-3 shadow-float backdrop-blur-xl max-lg:static max-lg:flex-col max-lg:items-start max-lg:rounded-[22px]"
        aria-label="主导航"
      >
        <a
          className="flex items-center gap-3 rounded-full px-2 py-1 text-lg font-bold tracking-tight text-zinc-900 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:text-blue-700"
          href="#home"
          onClick={() => setActiveTool(null)}
        >
          <span className="size-2.5 rounded-full bg-blue-500 shadow-[0_0_0_6px_rgba(79,125,243,0.14)]" />
          <span className="grid size-7 place-items-center rounded-lg border border-blue-200 bg-sky-50 text-blue-600">
            <FileArchive size={17} />
          </span>
          <strong>DocKit</strong>
        </a>
        <div className="flex gap-2 overflow-x-auto rounded-full border border-slate-200 bg-slate-50/70 p-1 max-lg:w-full">
          {navItems.map((item) => (
            <a
              key={item}
              className={`${navItemBase} ${
                item === '首页'
                  ? 'bg-blue-50 text-blue-700 shadow-[inset_0_0_0_1px_#d5e4fb]'
                  : 'text-slate-600'
              }`}
              href={`#${item}`}
            >
              {item}
            </a>
          ))}
        </div>
      </nav>

      <section
        className={
          activeTool
            ? 'relative z-10 mx-auto w-full max-w-[1440px] pt-7'
            : 'relative z-10 mx-auto grid min-h-[calc(100vh-188px)] w-full max-w-4xl place-items-center'
        }
        id="home"
      >
        {!activeTool && (
          <>
            <section className="grid min-h-[460px] w-full place-items-center content-center gap-7 px-4 py-12 text-center max-lg:min-h-[420px]">
              <div className="grid size-18 place-items-center rounded-2xl border border-blue-100 bg-white/75 text-blue-600 shadow-glow">
                <FileStack size={34} />
              </div>
              <div className="grid justify-items-center gap-4">
                <h1 className="text-[clamp(3.25rem,6vw,5.25rem)] font-extrabold leading-none tracking-[-0.055em] text-slate-900 max-lg:text-5xl">
                  DocKit
                </h1>
                <p className="max-w-2xl text-[clamp(1rem,1.6vw,1.125rem)] font-medium leading-relaxed text-slate-600">
                  一个聚合式、隐私友好的本地文书工具箱。适合处理盖章、签名、PDF 合并、页面提取与离线文档整理。
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4.5 py-2.5 text-sm font-semibold tracking-tight text-blue-700 shadow-soft transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-white hover:shadow-float focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
                  type="button"
                  onClick={() => setActiveTool('stamp')}
                >
                  <Stamp size={17} />
                  打开盖章工具
                </button>
                <a className={subtleButton} href="#toolbox">
                  <Archive size={17} />
                  查看工具箱
                </a>
                <a className={subtleButton} href="#roadmap">
                  <BookOpen size={17} />
                  实施计划
                </a>
              </div>
            </section>

            <section className="mt-6 w-full border-t border-slate-400/30 pt-6" id="当前能力">
              <h2 className="text-[34px] font-extrabold tracking-[-0.045em] text-slate-900">
                当前能力
              </h2>
              <div className="mt-5 grid grid-cols-2 gap-x-11 gap-y-4 max-lg:grid-cols-1">
                <p className="relative pl-5 text-base font-medium leading-relaxed text-slate-600 before:absolute before:left-0 before:text-slate-700 before:content-['•']">
                  支持 PDF 页面预览、Canvas 印章去白底、pdf-lib 合成导出。
                </p>
                <p className="relative pl-5 text-base font-medium leading-relaxed text-slate-600 before:absolute before:left-0 before:text-slate-700 before:content-['•']">
                  支持 localForage 草稿箱，适配数 MB 至数十 MB 文档暂存。
                </p>
                <p className="relative pl-5 text-base font-medium leading-relaxed text-slate-600 before:absolute before:left-0 before:text-slate-700 before:content-['•']">
                  支持 PWA 离线缓存，安装后可作为独立窗口运行。
                </p>
                <p className="relative pl-5 text-base font-medium leading-relaxed text-slate-600 before:absolute before:left-0 before:text-slate-700 before:content-['•']">
                  预留 Tauri 桌面端路径，后续接入原生另存为与拖拽体验。
                </p>
              </div>
            </section>

            <section className="mt-11 w-full" id="toolbox">
              <div className="mb-5 flex items-end justify-between gap-4">
                <h2 className="text-[34px] font-extrabold tracking-[-0.045em] text-slate-900">
                  工具箱
                </h2>
                <span className="text-sm font-semibold text-slate-500">本地处理 · 逐步扩展</span>
              </div>
              <div className="grid grid-cols-2 gap-3.5 max-lg:grid-cols-1">
                {tools.map((tool) => {
                  const Icon = tool.icon
                  return (
                    <button
                      key={tool.id}
                      className="relative grid min-h-42 content-start gap-2.5 rounded-lg border border-slate-200 bg-white/80 p-4.5 text-left text-slate-700 shadow-soft transition-all duration-200 ease-out hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-float focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
                      type="button"
                      onClick={() => {
                        if (tool.id === 'stamp') {
                          setActiveTool(tool.id)
                        }
                      }}
                    >
                      <span className="grid size-10 place-items-center rounded-lg bg-blue-50 text-blue-600">
                        <Icon size={22} />
                      </span>
                      <strong className="text-[17px] font-bold tracking-tight text-slate-800">
                        {tool.name}
                      </strong>
                      <small className="text-sm font-medium leading-relaxed text-slate-500">
                        {tool.description}
                      </small>
                      <em className="absolute right-4 top-4 text-xs font-bold not-italic text-blue-600">
                        {tool.state}
                      </em>
                    </button>
                  )
                })}
              </div>
            </section>
          </>
        )}

        {activeTool === 'stamp' && (
          <section>
            <div className="mb-3.5 flex items-center justify-between gap-4 max-lg:flex-col max-lg:items-start">
              <button className={subtleButton} type="button" onClick={() => setActiveTool(null)}>
                <Home size={17} />
                返回首页
              </button>
              <div>
                <span className="text-xs font-bold text-blue-600">{activeToolMeta?.state}</span>
                <h1 className="text-[38px] font-extrabold tracking-[-0.045em] text-slate-900">
                  {activeToolMeta?.name}
                </h1>
              </div>
            </div>
            <PdfStampTool />
          </section>
        )}
      </section>

      <footer
        className="relative z-10 mx-auto mt-13 flex flex-wrap justify-center gap-4.5 text-sm font-semibold text-slate-500"
        id="roadmap"
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
          隐私友好型文书工具
        </span>
      </footer>
    </main>
  )
}

export default App
