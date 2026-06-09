import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { cx } from './ui-helpers'

const surfaceClasses = {
  page: 'rounded-[32px] border border-slate-300/70 bg-white/70 shadow-float',
  panel: 'rounded-lg border border-slate-200 bg-white/80',
  inset: 'rounded-lg border border-slate-200 bg-slate-50/70',
} as const

type SurfacePanelProps = HTMLAttributes<HTMLDivElement> & {
  variant?: keyof typeof surfaceClasses
}

export function SurfacePanel({
  variant = 'panel',
  className,
  ...props
}: SurfacePanelProps) {
  return <div className={cx(surfaceClasses[variant], className)} {...props} />
}

type SectionHeadingProps = {
  eyebrow?: string
  title: string
  description?: ReactNode
  aside?: ReactNode
  className?: string
  titleAs?: 'h1' | 'h2'
  titleClassName?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  aside,
  className,
  titleAs = 'h1',
  titleClassName,
}: SectionHeadingProps) {
  const TitleTag = titleAs

  return (
    <div className={cx('flex items-end justify-between gap-4 max-lg:flex-col max-lg:items-start', className)}>
      <div>
        {eyebrow && <p className="text-sm font-bold tracking-[0.18em] text-blue-600">{eyebrow}</p>}
        <TitleTag
          className={cx(
            titleAs === 'h1'
              ? 'mt-2 text-[40px] font-extrabold tracking-[-0.045em] text-slate-900'
              : 'text-[28px] font-extrabold tracking-[-0.035em] text-slate-900',
            titleClassName,
          )}
        >
          {title}
        </TitleTag>
        {description && (
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-600">{description}</p>
        )}
      </div>
      {aside}
    </div>
  )
}

type ActionCardProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode
  heading: string
  description: string
  badge?: ReactNode
}

export function ActionCard({
  icon,
  heading,
  description,
  badge,
  className,
  ...props
}: ActionCardProps) {
  return (
    <button
      className={cx(
        'relative grid min-h-42 content-start gap-2.5 rounded-2xl border border-slate-200 bg-white/80 p-5 text-left text-slate-700 shadow-soft transition-all duration-200 ease-out hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-float focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400',
        className,
      )}
      type="button"
      {...props}
    >
      <span className="grid size-10 place-items-center rounded-lg bg-blue-50 text-blue-600">
        {icon}
      </span>
      <strong className="text-[17px] font-bold tracking-tight text-slate-800">{heading}</strong>
      <small className="text-sm font-medium leading-relaxed text-slate-500">{description}</small>
      {badge && <em className="absolute right-5 top-5 text-xs font-bold not-italic text-blue-600">{badge}</em>}
    </button>
  )
}

type InfoTileProps = HTMLAttributes<HTMLDivElement> & {
  icon: ReactNode
  title: string
  detail: string
}

export function InfoTile({ icon, title, detail, className, ...props }: InfoTileProps) {
  return (
    <div
      className={cx(
        'grid grid-cols-[28px_minmax(0,1fr)] items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50/70 p-3',
        className,
      )}
      {...props}
    >
      {icon}
      <div className="min-w-0">
        <strong className="block overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold text-slate-800">
          {title}
        </strong>
        <span className="block overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-500">
          {detail}
        </span>
      </div>
    </div>
  )
}

type RangeFieldProps = {
  label: string
  children: ReactNode
}

export function RangeField({ label, children }: RangeFieldProps) {
  return (
    <label className="grid gap-2 text-xs font-semibold text-slate-600">
      {label}
      {children}
    </label>
  )
}

type EmptyStateProps = {
  icon?: ReactNode
  title: string
  description?: ReactNode
  eyebrow?: string
  className?: string
  titleClassName?: string
}

export function EmptyState({
  icon,
  title,
  description,
  eyebrow,
  className,
  titleClassName,
}: EmptyStateProps) {
  return (
    <div className={cx('grid place-items-center content-center gap-2.5 text-center', className)}>
      {icon}
      <div>
        {eyebrow && <p className="text-sm font-bold tracking-[0.24em] text-blue-600">{eyebrow}</p>}
        <h2 className={cx('text-xl font-bold text-slate-800', titleClassName)}>{title}</h2>
        {description && <p className="mt-2 text-base leading-relaxed text-slate-600">{description}</p>}
      </div>
    </div>
  )
}

type InlineNoticeProps = HTMLAttributes<HTMLDivElement> & {
  icon: ReactNode
  children: ReactNode
}

export function InlineNotice({ icon, children, className, ...props }: InlineNoticeProps) {
  return (
    <div
      className={cx(
        'flex min-h-9 max-w-xl items-center gap-2 rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm font-medium text-slate-600',
        className,
      )}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </div>
  )
}
