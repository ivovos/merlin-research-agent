import React, { createContext, useContext, useCallback, useMemo, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

export type ThemeName = 'slate-light' | 'slate-dark' | 'stone-light' | 'stone-dark'

interface ThemeContextValue {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function applyThemeToDOM(theme: ThemeName) {
  const root = document.documentElement
  root.setAttribute('data-theme', theme)
  if (theme.endsWith('-dark')) {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeRaw] = useLocalStorage<ThemeName>('merlin-theme', 'slate-light')

  const setTheme = useCallback((next: ThemeName) => {
    applyThemeToDOM(next)
    setThemeRaw(next)
  }, [setThemeRaw])

  // Sync DOM on mount with stored value
  useEffect(() => {
    applyThemeToDOM(theme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync DOM when theme changes from cross-tab storage event
  useEffect(() => {
    applyThemeToDOM(theme)
  }, [theme])

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
