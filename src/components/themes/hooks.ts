'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'

import { type Theme, type ThemeConfig, type ThemeContextValue } from './types.js'
import {
  applyTheme,
  generateClasses,
  getServerTheme,
  getSystemTheme,
  getThemeVariables,
  isDarkTheme,
  isLightTheme,
  mergeConfig,
  systemTheme,
} from './utils.js'

export function useThemeConfig(config: ThemeConfig): ThemeContextValue {
  const theme = useMemo(() => mergeConfig(config), [config])
  const classes = useMemo(() => generateClasses(theme, config), [theme, config])

  const element = useCallback(
    (element: string, variant?: string) => applyTheme(theme, element, variant, config),
    [theme, config]
  )

  return useMemo(
    () => ({
      applyTheme: element,
      classes,
      config,
      isDark: isDarkTheme(theme),
      isLight: isLightTheme(theme),
      theme,
    }),
    [theme, config, classes, element]
  )
}

export function useThemeStyles(config: ThemeConfig): Record<string, string> {
  return useMemo(() => {
    const theme = mergeConfig(config)

    return getThemeVariables(theme)
  }, [config])
}

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

export function useThemeToggle(
  lightConfig: ThemeConfig,
  darkConfig: ThemeConfig,
  isDark: boolean
): ThemeConfig {
  return isDark ? darkConfig : lightConfig
}

export function useThemeClasses(config: ThemeConfig): ReturnType<typeof generateClasses> {
  return useMemo(() => {
    const theme = mergeConfig(config)

    return generateClasses(theme, config)
  }, [config])
}

export function useThemeColors(config: ThemeConfig): Theme['colors'] {
  return useMemo(() => {
    const theme = mergeConfig(config)

    return theme.colors
  }, [config])
}

export function useThemeSpacing(config: ThemeConfig): Theme['spacing'] {
  return useMemo(() => {
    const theme = mergeConfig(config)

    return theme.spacing
  }, [config])
}

export function useThemeTypography(config: ThemeConfig): Theme['typography'] {
  return useMemo(() => {
    const theme = mergeConfig(config)

    return theme.typography
  }, [config])
}

export function useSystemTheme(): 'dark' | 'light' {
  return useSyncExternalStore(systemTheme, getSystemTheme, getServerTheme)
}

export function useAutoTheme(lightTheme: string, darkTheme: string): string {
  const systemTheme = useSystemTheme()

  return systemTheme === 'dark' ? darkTheme : lightTheme
}

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
