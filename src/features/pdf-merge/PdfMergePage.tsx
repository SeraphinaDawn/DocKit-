import { AlertCircle, CheckCircle2, Eraser, Files, ShieldAlert, ShieldCheck } from 'lucide-react'
import { InlineNotice, InfoTile, SectionHeading, SurfacePanel } from '../../components/ui'
import { buttonClasses, cx } from '../../components/ui-helpers'
import { formatBytes } from '../../lib/files'
import { MergeButton } from './MergeButton'
import { PdfFileList } from './PdfFileList'
import { UploadZone } from './UploadZone'
import { usePdfMerge } from './usePdfMerge'

export function PdfMergePage() {
  const {
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
  } = usePdfMerge()

  return (
    <section className="grid gap-5">
      <SurfacePanel variant="page" className="p-6 sm:p-7">
        <SectionHeading
          eyebrow="PDF MERGE"
          title="多 PDF 合并"
          description="批量上传 PDF，拖拽调整顺序后直接在浏览器中合并导出。"
          aside={
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className={buttonClasses.toolbar}
                disabled={files.length === 0 || isLoading || isMerging}
                onClick={clearFiles}
              >
                <Eraser size={16} />
                清空列表
              </button>
              <MergeButton disabled={files.length < 2 || isLoading} busy={isMerging} onClick={mergeFiles} />
            </div>
          }
        />

        <div className="mt-6 grid gap-5">
          <div className="grid grid-cols-4 gap-3 max-xl:grid-cols-2 max-sm:grid-cols-1">
            <InfoTile icon={<Files size={22} />} title={`${files.length}`} detail="已加入文件" />
            <InfoTile icon={<CheckCircle2 size={22} />} title={`${totalPages}`} detail="待合并总页数" />
            <InfoTile icon={<ShieldCheck size={22} />} title={formatBytes(totalBytes)} detail="当前总大小" />
            <InfoTile icon={<ShieldAlert size={22} />} title={`${warningCount}`} detail="大文件提醒" />
          </div>

          <div className="grid gap-3 rounded-[24px] border border-slate-200 bg-white/78 p-4">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              输出文件名
              <input
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400"
                value={outputFileName}
                onChange={(event) => updateOutputFileName(event.target.value)}
                placeholder="merged"
              />
            </label>

            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-500">
                <span>合并进度</span>
                <span>{isMerging ? `${mergeProgress}%` : '等待开始'}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-blue-500 transition-[width] duration-300"
                  style={{ width: `${mergeProgress}%` }}
                />
              </div>
            </div>
          </div>

          <UploadZone disabled={isLoading || isMerging} onFilesAccepted={addFiles} />
        </div>
      </SurfacePanel>

      <SurfacePanel variant="page" className="p-6 sm:p-7">
        <SectionHeading
          eyebrow="SORTABLE FILES"
          title="文件列表"
          description="拖拽左侧手柄调整顺序，支持为每个 PDF 单独设置要合并的页码范围。"
          titleAs="h2"
        />

        <div className="mt-6">
          <PdfFileList
            files={files}
            onRemove={removeFile}
            onReorder={reorderFiles}
            onPageRangeChange={updateFilePageRange}
          />
        </div>
      </SurfacePanel>

      <SurfacePanel variant="page" className="p-6 sm:p-7">
        <SectionHeading
          eyebrow="STATUS"
          title="状态提示"
          description="这里会显示解析、排序、页码校验、合并进度和导出结果。"
          titleAs="h2"
        />

        <InlineNotice
          icon={
            status.tone === 'error' ? (
              <AlertCircle size={16} />
            ) : status.tone === 'success' ? (
              <CheckCircle2 size={16} />
            ) : (
              <Files size={16} />
            )
          }
          className={cx(
            'mt-5 max-w-none',
            status.tone === 'error' && 'border-rose-200 bg-rose-50/90 text-rose-700',
            status.tone === 'success' && 'border-emerald-200 bg-emerald-50/90 text-emerald-700',
          )}
        >
          {status.message}
        </InlineNotice>
      </SurfacePanel>
    </section>
  )
}
