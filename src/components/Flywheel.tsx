import type { LucideIcon } from 'lucide-react'
import { FileStack } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { cx } from './ui-helpers'

export type FlywheelTool<TId extends string = string> = {
  id: TId
  name: string
  icon: LucideIcon
  available: boolean
}

type FlywheelPoint = {
  x: number
  y: number
  angle: number
}

type FlywheelProps<TId extends string = string> = {
  appIconSrc: string
  isNight?: boolean
  tools: FlywheelTool<TId>[]
  onOpenHome?: () => void
  onOpenTool?: (toolId: TId) => void
}

const orbitPath =
  'M 290 35 C 520 10 610 130 575 255 C 545 365 460 570 290 565 C 130 560 15 470 30 310 C 45 155 80 55 290 35 Z'

export function Flywheel<TId extends string = string>({
  appIconSrc,
  isNight = true,
  tools,
  onOpenHome,
  onOpenTool,
}: FlywheelProps<TId>) {
  const pathRef = useRef<SVGPathElement | null>(null)
  const [points, setPoints] = useState<FlywheelPoint[]>([])
  const safeTools = useMemo(() => tools.slice(0, 6), [tools])

  useEffect(() => {
    const path = pathRef.current
    if (!path || safeTools.length === 0) {
      return
    }

    const length = path.getTotalLength()
    const nextPoints = safeTools.map((_, index) => {
      const distance = (length / safeTools.length) * index
      const point = path.getPointAtLength(distance)
      const tangentPoint = path.getPointAtLength((distance + 1) % length)
      const angle =
        (Math.atan2(tangentPoint.y - point.y, tangentPoint.x - point.x) * 180) / Math.PI

      return { x: point.x, y: point.y, angle }
    })

    setPoints(nextPoints)
  }, [safeTools])

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[600px] min-w-[340px] overflow-visible">
      <div
        className={cx(
          'absolute inset-[12%] rounded-full blur-3xl',
          isNight ? 'bg-blue-400/8' : 'bg-blue-300/18',
        )}
      />

      <div className="flywheel-group absolute inset-0 animate-[float_5s_ease-in-out_infinite]">
        <div className="flywheel-spin absolute inset-0">
          <svg className="absolute inset-0 size-full" viewBox="0 0 600 600" aria-hidden="true">
            <path
              ref={pathRef}
              d={orbitPath}
              fill="none"
              stroke={isNight ? 'white' : '#2563eb'}
              strokeDasharray="8 6"
              strokeLinecap="round"
              strokeOpacity={isNight ? '0.4' : '0.28'}
              strokeWidth="1.5"
            />
          </svg>

          {safeTools.map((tool, index) => (
            <FlywheelNode
              key={tool.id}
              index={index}
              isNight={isNight}
              point={points[index]}
              tool={tool}
              onOpenTool={onOpenTool}
            />
          ))}
        </div>
      </div>

      <button
        className={cx(
          'absolute left-1/2 top-1/2 grid size-36 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border shadow-[0_24px_70px_rgba(15,23,42,0.24),inset_0_1px_0_rgba(255,255,255,0.62)] backdrop-blur-xl transition-transform duration-200 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400',
          isNight ? 'border-white/14 bg-white/80' : 'border-blue-100 bg-white/88',
        )}
        type="button"
        aria-label="返回首页"
        onClick={onOpenHome}
      >
        <div className="grid size-18 place-items-center overflow-hidden rounded-2xl border border-blue-100 bg-sky-50 shadow-soft">
          <img className="size-full object-cover" src={appIconSrc} alt="DocKit Logo" />
        </div>
      </button>
    </div>
  )
}

function FlywheelNode<TId extends string>({
  index,
  isNight,
  point,
  tool,
  onOpenTool,
}: {
  index: number
  isNight: boolean
  point?: FlywheelPoint
  tool: FlywheelTool<TId>
  onOpenTool?: (toolId: TId) => void
}) {
  const Icon = tool.icon ?? FileStack
  const x = point?.x ?? 300
  const y = point?.y ?? 300
  const floatClass = nodeFloatClasses[index % nodeFloatClasses.length]

  return (
    <div
      className={cx('absolute left-0 top-0', floatClass)}
      style={{
        left: `${(x / 600) * 100}%`,
        top: `${(y / 600) * 100}%`,
      }}
    >
      <button
        className={cx(
          'flywheel-node-card flywheel-counter-spin grid min-h-20 w-[120px] -translate-x-1/2 -translate-y-1/2 place-items-center gap-2 rounded-xl border px-3 py-3 text-center shadow-[0_18px_44px_rgba(2,8,23,0.24)] backdrop-blur-xl transition-transform duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300',
          tool.available
            ? 'border-white/70 bg-white text-slate-900 hover:scale-110 hover:border-blue-200 hover:shadow-[0_26px_64px_rgba(96,165,250,0.24)]'
            : isNight
              ? 'cursor-not-allowed border-white/14 bg-white/10 text-slate-100 opacity-60'
              : 'cursor-not-allowed border-slate-200 bg-white/70 text-slate-500 opacity-70',
        )}
        type="button"
        disabled={!tool.available}
        onClick={() => onOpenTool?.(tool.id)}
      >
        <span
          className={cx(
            'grid size-9 place-items-center rounded-lg',
            tool.available
              ? 'bg-blue-50 text-blue-600'
              : isNight
                ? 'bg-white/10 text-slate-100'
                : 'bg-slate-100 text-slate-500',
          )}
        >
          <Icon size={19} />
        </span>
        <span className="text-[13px] font-bold leading-snug">{tool.name}</span>
      </button>
    </div>
  )
}

const nodeFloatClasses = [
  'animate-[float_4.8s_ease-in-out_infinite] [animation-delay:-0.15s]',
  'animate-[float_5.5s_ease-in-out_infinite] [animation-delay:-1.1s]',
  'animate-[float_4.2s_ease-in-out_infinite] [animation-delay:-0.65s]',
  'animate-[float_6.1s_ease-in-out_infinite] [animation-delay:-1.75s]',
  'animate-[float_5.0s_ease-in-out_infinite] [animation-delay:-2.25s]',
  'animate-[float_5.8s_ease-in-out_infinite] [animation-delay:-0.95s]',
] as const
