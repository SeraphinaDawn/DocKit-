export type ThemeMode = 'day' | 'night'

const themeStorageKey = 'dockit-theme-mode'

export function loadThemeMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'day'
  }

  const saved = window.localStorage.getItem(themeStorageKey)
  return saved === 'night' ? 'night' : 'day'
}

export function saveThemeMode(theme: ThemeMode) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(themeStorageKey, theme)
}
