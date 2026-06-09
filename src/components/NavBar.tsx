import { motion } from 'framer-motion'
import { CloudMoon, SunMedium } from 'lucide-react'
import type { ThemeMode } from '../lib/theme'
import type { PageId } from '../types'
import { buttonClasses, cx } from './ui-helpers'

type NavItem = {
  id: PageId
  label: string
}

type NavBarProps = {
  appIconSrc: string
  currentPage: PageId
  isCompact: boolean
  navItems: NavItem[]
  themeMode: ThemeMode
  onNavigate: (pageId: PageId) => void
  onToggleTheme: () => void
}

export function NavBar({
  appIconSrc,
  currentPage,
  isCompact,
  navItems,
  themeMode,
  onNavigate,
  onToggleTheme,
}: NavBarProps) {
  const isNight = themeMode === 'night'

  return (
    <motion.nav
      layout
      transition={{ type: 'spring', stiffness: 440, damping: 36 }}
      className={cx(
        'sticky top-4 z-20 mb-6 flex w-full items-center justify-between gap-3 backdrop-blur-xl max-lg:static max-lg:flex-col max-lg:items-start',
        isCompact
          ? 'mx-auto max-w-[1180px] rounded-[24px] px-3.5 py-2.5'
          : 'mx-auto min-h-17 max-w-[1428px] rounded-full px-4 py-3 max-lg:rounded-[22px]',
        isNight
          ? 'border border-white/10 bg-white/6 shadow-[0_24px_60px_rgba(2,8,24,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]'
          : 'border border-slate-300/70 bg-white/80 shadow-float',
      )}
      aria-label="Primary navigation"
    >
      <motion.button
        layout
        className={cx(
          'flex items-center gap-3 rounded-full border-0 bg-transparent px-2 py-1 text-lg font-bold tracking-tight transition-all duration-200 ease-out hover:-translate-y-0.5',
          isNight ? 'text-white hover:text-blue-300' : 'text-zinc-900 hover:text-blue-700',
        )}
        type="button"
        onClick={() => onNavigate('home')}
      >
        <span className="size-2.5 rounded-full bg-blue-500 shadow-[0_0_0_6px_rgba(79,125,243,0.14)]" />
        <span
          className={cx(
            'grid place-items-center overflow-hidden rounded-lg shadow-sm',
            isCompact ? 'size-6' : 'size-7',
            isNight ? 'border border-white/12 bg-white/8' : 'border border-blue-200 bg-sky-50',
          )}
        >
          <img className="size-full object-cover" src={appIconSrc} alt="DocKit icon" />
        </span>
        <strong>DocKit</strong>
      </motion.button>

      <motion.div
        layout
        key="nav-menu"
        initial={{ opacity: 0, scale: 0.98, x: 16 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={cx(
          'flex flex-1 gap-2 overflow-x-auto p-1 max-lg:w-full max-lg:flex-none',
          isCompact ? 'justify-end max-lg:justify-start' : 'justify-center',
          isNight
            ? 'rounded-full border border-white/8 bg-white/[0.03]'
            : 'rounded-full border border-slate-200 bg-slate-50/70',
        )}
      >
        {navItems.map((item) => (
          <button
            key={item.id}
            className={cx(
              buttonClasses.navItem,
              isCompact && 'min-h-9 px-4 py-2 text-[13px]',
              currentPage === item.id
                ? isNight
                  ? 'bg-white/8 text-blue-300 shadow-[inset_0_0_0_1px_rgba(96,165,250,0.24)]'
                  : 'bg-blue-50 text-blue-700 shadow-[inset_0_0_0_1px_#d5e4fb]'
                : isNight
                  ? 'text-slate-200 hover:bg-white/6 hover:text-white'
                  : 'text-slate-600',
            )}
            type="button"
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
      </motion.div>

      <motion.button
        layout
        key="theme-toggle"
        type="button"
        onClick={onToggleTheme}
        initial={{ opacity: 0, scale: 0.98, x: 16 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={cx(
          'inline-flex items-center gap-2 rounded-full text-sm font-semibold tracking-tight transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400',
          isCompact ? 'min-h-10 px-3.5 py-2' : 'min-h-11 px-4 py-2.5',
          isNight
            ? 'border border-white/12 bg-white/8 text-slate-100 hover:bg-white/12'
            : 'border border-slate-200 bg-white/78 text-slate-700 shadow-soft hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700',
        )}
      >
        {isNight ? <SunMedium size={16} /> : <CloudMoon size={16} />}
        <span className={cx(isCompact && 'hidden sm:inline')}>
          {isNight ? '切换白天' : '切换夜晚'}
        </span>
      </motion.button>
    </motion.nav>
  )
}
