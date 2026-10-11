'use client'

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from 'react'

import { type Theme, type ThemeConfig, type ThemeContextValue } from './types.js'
import {
  applyTheme,
  generateThemeClasses,
  getThemeVariables,
  isDarkTheme,
  isLightTheme,
  mergeThemeConfig,
} from './utils.js'

const ThemeContext = createContext<null | ThemeContextValue>(null)

const SYSTEM_THEME_QUERY = '(prefers-color-scheme: dark)'

function getSystemTheme(): 'dark' | 'light' {
  return window.matchMedia(SYSTEM_THEME_QUERY).matches ? 'dark' : 'light'
}

function getServerTheme(): 'dark' | 'light' {
  return 'light'
}

function subscribeSystemTheme(callback: () => void): () => void {
  const media = window.matchMedia(SYSTEM_THEME_QUERY)

  media.addEventListener('change', callback)

  return () => media.removeEventListener('change', callback)
}

/**
 * Hook to access theme context
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}

/**
 * Hook to create theme configuration
 */
export function useThemeConfig(config: ThemeConfig): ThemeContextValue {
  const theme = useMemo(() => mergeThemeConfig(config), [config])
  const classes = useMemo(() => generateThemeClasses(theme, config), [theme, config])

  const applyThemeToElement = useCallback(
    (element: string, variant?: string) => applyTheme(theme, element, variant),
    [theme]
  )

  return useMemo(
    () => ({
      applyTheme: applyThemeToElement,
      classes,
      config,
      isDark: isDarkTheme(theme),
      isLight: isLightTheme(theme),
      theme,
    }),
    [theme, config, classes, applyThemeToElement]
  )
}

/**
 * Hook to apply theme styles to CSS variables
 */
export function useThemeStyles(config: ThemeConfig): Record<string, string> {
  return useMemo(() => {
    const theme = mergeThemeConfig(config)
    return getThemeVariables(theme)
  }, [config])
}

/**
 * Hook to get responsive theme configuration
 */
export function useResponsiveTheme(baseConfig: ThemeConfig, isMobile: boolean): ThemeConfig {
  return useMemo(() => {
    if (!baseConfig.responsive || !isMobile) {
      return baseConfig
    }

    return {
      ...baseConfig,
      spacing: {
        ...baseConfig.spacing,
        headerPadding: '0.75rem 1rem',
        inputFontSize: '16px',
        inputPadding: '0.875rem 1rem',
        itemPadding: '0.875rem 1rem',
        resultsMaxHeight: '20rem',
      },
      animations: {
        ...baseConfig.animations,
        transitionFast: '0s',
        transitionNormal: '0s',
        transitionSlow: '0s',
      },
    } as ThemeConfig
  }, [baseConfig, isMobile])
}

/**
 * Hook to toggle between light and dark themes
 */
export function useThemeToggle(
  lightConfig: ThemeConfig,
  darkConfig: ThemeConfig,
  isDark: boolean
): ThemeConfig {
  return isDark ? darkConfig : lightConfig
}

/**
 * Hook to create theme-aware CSS classes
 */
export function useThemeClasses(config: ThemeConfig): ReturnType<typeof generateThemeClasses> {
  return useMemo(() => {
    const theme = mergeThemeConfig(config)
    return generateThemeClasses(theme, config)
  }, [config])
}

/**
 * Hook to get theme-aware color values
 */
export function useThemeColors(config: ThemeConfig): Theme['colors'] {
  return useMemo(() => {
    const theme = mergeThemeConfig(config)
    return theme.colors
  }, [config])
}

/**
 * Hook to get theme-aware spacing values
 */
export function useThemeSpacing(config: ThemeConfig): Theme['spacing'] {
  return useMemo(() => {
    const theme = mergeThemeConfig(config)
    return theme.spacing
  }, [config])
}

/**
 * Hook to get theme-aware typography values
 */
export function useThemeTypography(config: ThemeConfig): Theme['typography'] {
  return useMemo(() => {
    const theme = mergeThemeConfig(config)
    return theme.typography
  }, [config])
}

/**
 * Hook to detect system theme preference
 */
export function useSystemTheme(): 'dark' | 'light' {
  return useSyncExternalStore(subscribeSystemTheme, getSystemTheme, getServerTheme)
}

/**
 * Hook to create auto theme configuration based on system preference
 */
export function useAutoTheme(lightTheme: string, darkTheme: string): string {
  const systemTheme = useSystemTheme()

  return systemTheme === 'dark' ? darkTheme : lightTheme
}

/**
 * Hook to create theme with custom overrides
 */
export function useCustomTheme(
  baseThemeName: string,
  overrides: Partial<ThemeConfig>
): ThemeConfig {
  return useMemo(
    () => ({
      theme: baseThemeName,
      ...overrides,
    }),
    [baseThemeName, overrides]
  )
}

export { ThemeContext }
