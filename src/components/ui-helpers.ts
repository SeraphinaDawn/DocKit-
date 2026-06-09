export function cx(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(' ')
}

export const buttonClasses = {
  navItem:
    'min-h-10 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold tracking-tight transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-white hover:text-blue-700 hover:shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400',
  subtlePill:
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/75 px-4.5 py-2.5 text-sm font-semibold tracking-tight text-slate-700 shadow-soft transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white hover:text-blue-700 hover:shadow-float focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400',
  primaryPill:
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4.5 py-2.5 text-sm font-semibold tracking-tight text-blue-700 shadow-soft transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-white hover:shadow-float focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400',
  toolbar:
    'inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold tracking-tight text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none',
  toolbarPrimary:
    'inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-blue-700 bg-blue-600 px-3 py-2 text-sm font-semibold tracking-tight text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none',
  pageTab:
    'h-8.5 min-w-9 rounded-lg border text-sm font-semibold transition-colors duration-200',
} as const
