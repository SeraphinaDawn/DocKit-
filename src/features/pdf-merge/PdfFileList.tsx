import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Files } from 'lucide-react'
import { EmptyState } from '../../components/ui'
import type { PdfFile } from './types'
import { PdfFileItem } from './PdfFileItem'

type PdfFileListProps = {
  files: PdfFile[]
  onRemove: (id: string) => void
  onReorder: (activeId: string, overId: string) => void
  onPageRangeChange: (id: string, value: string) => void
}

export function PdfFileList({ files, onRemove, onReorder, onPageRangeChange }: PdfFileListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over) {
      return
    }

    onReorder(String(active.id), String(over.id))
  }

  if (files.length === 0) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white/72 px-6 py-12">
        <EmptyState
          icon={<Files size={32} className="text-blue-600" />}
          title="先加入需要合并的 PDF"
          description="上传后会自动显示文件名、页数和第一页缩略图。"
          className="text-slate-500"
        />
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={files.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className="grid gap-3">
          {files.map((file) => (
            <PdfFileItem
              key={file.id}
              file={file}
              onRemove={onRemove}
              onPageRangeChange={onPageRangeChange}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
