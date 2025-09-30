'use client'

import React, { createContext, use } from 'react'

import type { ThemeConfig, ThemeContextValue } from './themes/types.js'

import { useThemeConfig } from './themes/hooks.js'

interface ThemeProviderProps {
  children: React.ReactNode
  config: ThemeConfig
}

const ThemeContext = createContext<null | ThemeContextValue>(null)

export function ThemeProvider({ children, config }: ThemeProviderProps) {
  const themeContext = useThemeConfig(config)

  return <ThemeContext value={themeContext}>{children}</ThemeContext>
}

export function useTheme(): ThemeContextValue {
  const context = use(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
