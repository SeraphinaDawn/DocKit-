import { FileUp, Loader2 } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { buttonClasses, cx } from '../../components/ui-helpers'

type UploadZoneProps = {
  disabled?: boolean
  onFilesAccepted: (files: File[]) => void | Promise<void>
}

export function UploadZone({ disabled, onFilesAccepted }: UploadZoneProps) {
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    disabled,
    multiple: true,
    noClick: true,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        void onFilesAccepted(acceptedFiles)
      }
    },
  })

  return (
    <section
      {...getRootProps()}
      className={cx(
        'rounded-[28px] border-2 border-dashed px-6 py-7 transition-all duration-200',
        disabled
          ? 'cursor-not-allowed border-slate-200 bg-slate-50/70 opacity-70'
          : isDragActive
            ? 'border-blue-500 bg-blue-50/90 shadow-soft'
            : 'border-blue-300 bg-white/72 hover:border-blue-400 hover:bg-white/88',
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-3 text-center">
        <div className="grid size-13 place-items-center rounded-2xl bg-blue-50 text-blue-600">
          {disabled ? <Loader2 size={26} className="animate-spin" /> : <FileUp size={26} />}
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold tracking-tight text-slate-900">
            {isDragActive ? '松开即可加入 PDF 文件' : '拖入多个 PDF，或点击按钮选择文件'}
          </h3>
          <p className="text-sm leading-6 text-slate-500">
            支持批量上传、缩略图预览、本地合并导出，全程不离开浏览器。
          </p>
        </div>
        <button
          type="button"
          className={cx(buttonClasses.primaryPill, 'min-w-40')}
          onClick={open}
          disabled={disabled}
        >
          {disabled ? '正在读取文件...' : '选择 PDF 文件'}
        </button>
      </div>
    </section>
  )
}
