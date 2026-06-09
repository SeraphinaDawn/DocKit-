import { Download, Loader2 } from 'lucide-react'
import { buttonClasses, cx } from '../../components/ui-helpers'

type MergeButtonProps = {
  disabled?: boolean
  busy?: boolean
  onClick: () => void | Promise<void>
}

export function MergeButton({ disabled, busy, onClick }: MergeButtonProps) {
  return (
    <button
      type="button"
      className={cx(buttonClasses.toolbarPrimary, 'min-w-44 rounded-full px-5 py-3')}
      disabled={disabled || busy}
      onClick={() => void onClick()}
    >
      {busy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
      {busy ? '正在合并...' : '合并并导出 PDF'}
    </button>
  )
}
