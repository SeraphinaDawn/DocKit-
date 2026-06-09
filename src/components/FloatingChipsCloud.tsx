import type { ComponentType } from 'react'
import { FloatWrapper } from './FloatWrapper'
import type { FloatPresetName } from './float-presets'
import { cx } from './ui-helpers'

export type FloatingChipsCloudItem = {
  label: string
  icon: ComponentType<{ size?: number; className?: string }>
  positionClass: string
  desktopPreset: FloatPresetName
  mobilePreset: FloatPresetName
  onClick?: () => void
}

type FloatingChipsCloudProps = {
  items: FloatingChipsCloudItem[]
  className?: string
  chipClassName?: string
}

const defaultChipClassName =
  'inline-flex items-center gap-2 rounded-full border border-white/85 bg-white/92 px-6 py-4 text-base font-semibold tracking-tight text-slate-700 shadow-[0_14px_40px_rgba(148,163,184,0.14)] transition-all duration-300 hover:scale-[1.02] hover:text-blue-700'

const mobileChipClassName =
  'inline-flex items-center gap-2 rounded-full border border-white/85 bg-white/92 px-5 py-3 text-sm font-semibold tracking-tight text-slate-700 shadow-soft transition-colors duration-300 hover:text-blue-700'

export function FloatingChipsCloud({
  items,
  className,
  chipClassName,
}: FloatingChipsCloudProps) {
  return (
    <div className={cx('relative', className)}>
      <div className="relative hidden min-h-[320px] lg:block">
        {items.map((item) => {
          const Icon = item.icon

          return (
            <FloatWrapper
              key={item.label}
              preset={item.desktopPreset}
              className={cx('absolute', item.positionClass)}
            >
              <button
                type="button"
                onClick={item.onClick}
                className={cx(defaultChipClassName, chipClassName)}
              >
                <Icon size={18} className="text-blue-500" />
                {item.label}
              </button>
            </FloatWrapper>
          )
        })}
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-3 lg:hidden">
        {items.map((item) => {
          const Icon = item.icon

          return (
            <FloatWrapper key={item.label} preset={item.mobilePreset}>
              <button
                type="button"
                onClick={item.onClick}
                className={mobileChipClassName}
              >
                <Icon size={16} className="text-blue-500" />
                {item.label}
              </button>
            </FloatWrapper>
          )
        })}
      </div>
    </div>
  )
}
