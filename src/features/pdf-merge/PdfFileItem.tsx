import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import { buttonClasses, cx } from '../../components/ui-helpers'
import type { PdfFile } from './types'

type PdfFileItemProps = {
  file: PdfFile
  onRemove: (id: string) => void
  onPageRangeChange: (id: string, value: string) => void
}

export function PdfFileItem({ file, onRemove, onPageRangeChange }: PdfFileItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: file.id,
  })

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cx(
        'group grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-4 rounded-2xl border border-slate-200 bg-white/84 p-3 shadow-soft transition-all duration-200',
        'hover:bg-blue-50/72',
        isDragging && 'scale-95 opacity-50 shadow-none',
      )}
    >
      <button
        type="button"
        className="grid size-11 cursor-grab place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 active:cursor-grabbing"
        aria-label={`拖拽排序 ${file.name}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={18} />
      </button>

      <div className="grid grid-cols-[72px_minmax(0,1fr)] items-start gap-4 max-sm:grid-cols-1">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <img className="h-21 w-full object-cover object-top" src={file.thumbnail} alt={`${file.name} 首页缩略图`} />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-slate-900">{file.name}</h3>
          <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
            <span className="rounded-full bg-slate-100 px-2.5 py-1">{file.pageCount} 页</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1">{file.sizeKB} KB</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1">合并 {file.selectedPages.length} 页</span>
          </div>

          <div className="mt-3 grid gap-2">
            <label className="text-xs font-semibold text-slate-500">
              页码范围
              <input
                className={cx(
                  'mt-1 h-10 w-full rounded-xl border bg-white px-3 text-sm text-slate-700 outline-none transition',
                  file.selectedPages.length === 0
                    ? 'border-rose-300 focus:border-rose-400'
                    : 'border-slate-200 focus:border-blue-400',
                )}
                value={file.pageRangeInput}
                onChange={(event) => onPageRangeChange(file.id, event.target.value)}
                placeholder="all 或 1-3,5"
              />
            </label>
            <p className="text-xs leading-5 text-slate-500">支持 `all`、`1-3`、`1,3,5`、`2-4,8`</p>
            {file.sizeWarning && <p className="text-xs font-semibold text-amber-600">{file.sizeWarning}</p>}
            {file.selectedPages.length === 0 && (
              <p className="text-xs font-semibold text-rose-600">页码范围无效，请重新输入。</p>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        className={cx(
          buttonClasses.toolbar,
          'border-rose-200 text-rose-700 hover:border-rose-300 hover:text-rose-800',
        )}
        onClick={() => onRemove(file.id)}
      >
        <Trash2 size={16} />
        删除
      </button>
    </article>
  )
}
