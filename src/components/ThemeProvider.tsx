'use client'

import { createContext, type ReactNode, use } from 'react'

import { useThemeConfig } from './themes/hooks.js'
import { type ThemeConfig, type ThemeContextValue } from './themes/types.js'

interface ThemeProviderProps {
  children: ReactNode
  config: ThemeConfig
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children, config }: ThemeProviderProps) {
  const value = useThemeConfig(config)

  return <ThemeContext value={value}>{children}</ThemeContext>
}

export function useTheme(): ThemeContextValue {
  const context = use(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}

export function useComponentTheme(theme?: string | ThemeConfig): ThemeContextValue {
  const context = use(ThemeContext)
  return useThemeConfig(
    typeof theme === 'string' ? { theme } : (theme ?? context?.config ?? { theme: 'modern' })
  )
}
