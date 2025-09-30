/**
 * Pre-built themes for HeadlessSearchInput
 */

import type { Theme } from './types.js'

// Base theme with common values
const baseTheme = {
  animations: {
    animationFast: '0.15s',
    animationNormal: '0.2s',
    animationSlow: '0.3s',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    transitionFast: '0.15s',
    transitionNormal: '0.2s',
    transitionSlow: '0.3s',
  },
  shadows: {
    focusShadow: '0 0 0 3px',
    focusShadowColor: 'rgba(59, 130, 246, 0.1)',
    shadowLg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    shadowMd: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    shadowSm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    shadowXl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  spacing: {
    headerFontSize: '0.875rem',
    headerPadding: '0.75rem 1rem',
    inputBorderRadius: '0.5rem',
    inputFontSize: '1rem',
    inputPadding: '0.75rem 1rem',
    itemBorderRadius: '0',
    itemMargin: '0',
    itemPadding: '0.75rem 1rem',
    metaFontSize: '0.75rem',
    metaPadding: '0.5rem 0',
    resultsBorderRadius: '0 0 0.5rem 0.5rem',
    resultsMaxHeight: '24rem',
    resultsPadding: '0',
  },
  typography: {
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontFamilyMono:
      'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
    fontSize2xl: '1.5rem',
    fontSizeBase: '1rem',
    fontSizeLg: '1.125rem',
    fontSizeSm: '0.875rem',
    fontSizeXl: '1.25rem',
    fontSizeXs: '0.75rem',
    fontWeightBold: '700',
    fontWeightMedium: '500',
    fontWeightNormal: '400',
    fontWeightSemibold: '600',
    lineHeightNormal: '1.5',
    lineHeightRelaxed: '1.625',
    lineHeightTight: '1.25',
  },
}

// Modern theme - clean, professional, with subtle shadows
export const modernTheme: Theme = {
  name: 'modern',
  colors: {
    // Input colors
    inputBackground: '#ffffff',
    inputBorder: '#d1d5db',
    inputBorderFocus: '#3b82f6',
    inputPlaceholder: '#6b7280',
    inputText: '#111827',

    // Results container colors
    resultsBackground: '#ffffff',
    resultsBorder: '#d1d5db',
    resultsShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',

    // Header colors
    headerBackground: '#f9fafb',
    headerBorder: '#e5e7eb',
    headerText: '#6b7280',

    // Result item colors
    resultBackground: '#ffffff',
    resultBackgroundFocus: '#eff6ff',
    resultBackgroundHover: '#f8fafc',
    resultBorder: '#f3f4f6',

    // Text colors
    descriptionText: '#6b7280',
    highlightBackground: '#fef3c7',
    highlightText: '#92400e',
    metaText: '#9ca3af',
    titleText: '#111827',

    // Interactive elements
    collectionBadge: '#dbeafe',
    collectionBadgeText: '#1e40af',
    scoreBadge: '#dcfce7',
    scoreBadgeText: '#166534',

    // State colors
    errorBackground: '#fef2f2',
    errorText: '#dc2626',
    loadingText: '#6b7280',
    noResultsText: '#6b7280',

    // Facet colors
    facetActiveBackground: '#3b82f6',
    facetActiveText: '#ffffff',
    facetBackground: '#f3f4f6',
    facetBorder: '#d1d5db',
    facetText: '#374151',
  },
  ...baseTheme,
  spacing: {
    ...baseTheme.spacing,
    headerPadding: '1rem 1.25rem',
    inputBorderRadius: '0.75rem',
    inputFontSize: '1.125rem',
    inputPadding: '1rem 1.25rem',
    itemPadding: '1rem 1.25rem',
    resultsBorderRadius: '0 0 0.75rem 0.75rem',
    resultsMaxHeight: '28rem',
  },
}

// Minimal theme - clean, flat design with minimal styling
export const minimalTheme: Theme = {
  name: 'minimal',
  colors: {
    // Input colors
    inputBackground: '#ffffff',
    inputBorder: '#e5e7eb',
    inputBorderFocus: '#000000',
    inputPlaceholder: '#9ca3af',
    inputText: '#111827',

    // Results container colors
    resultsBackground: '#ffffff',
    resultsBorder: '#e5e7eb',
    resultsShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',

    // Header colors
    headerBackground: '#ffffff',
    headerBorder: '#f3f4f6',
    headerText: '#6b7280',

    // Result item colors
    resultBackground: '#ffffff',
    resultBackgroundFocus: '#f5f5f5',
    resultBackgroundHover: '#fafafa',
    resultBorder: '#f5f5f5',

    // Text colors
    descriptionText: '#6b7280',
    highlightBackground: '#f3f4f6',
    highlightText: '#111827',
    metaText: '#9ca3af',
    titleText: '#000000',

    // Interactive elements
    collectionBadge: '#f3f4f6',
    collectionBadgeText: '#374151',
    scoreBadge: '#f3f4f6',
    scoreBadgeText: '#374151',

    // State colors
    errorBackground: '#fef2f2',
    errorText: '#dc2626',
    loadingText: '#6b7280',
    noResultsText: '#6b7280',

    // Facet colors
    facetActiveBackground: '#000000',
    facetActiveText: '#ffffff',
    facetBackground: '#ffffff',
    facetBorder: '#e5e7eb',
    facetText: '#374151',
  },
  ...baseTheme,
  shadows: {
    ...baseTheme.shadows,
    focusShadow: '0 0 0 2px',
    focusShadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowLg: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    shadowMd: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    shadowSm: 'none',
    shadowXl: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  spacing: {
    ...baseTheme.spacing,
    headerPadding: '0.75rem 1rem',
    inputBorderRadius: '0',
    inputFontSize: '1rem',
    inputPadding: '0.75rem 1rem',
    itemPadding: '1rem 1rem',
    resultsBorderRadius: '0',
    resultsMaxHeight: '24rem',
  },
}

// Elegant theme - sophisticated, with subtle gradients and premium feel
export const elegantTheme: Theme = {
  name: 'elegant',
  colors: {
    // Input colors
    inputBackground: '#ffffff',
    inputBorder: '#e2e8f0',
    inputBorderFocus: '#8b5cf6',
    inputPlaceholder: '#64748b',
    inputText: '#1e293b',

    // Results container colors
    resultsBackground: '#ffffff',
    resultsBorder: '#e2e8f0',
    resultsShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

    // Header colors
    headerBackground: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    headerBorder: '#e2e8f0',
    headerText: '#475569',

    // Result item colors
    resultBackground: '#ffffff',
    resultBackgroundFocus: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    resultBackgroundHover: 'linear-gradient(135deg, #fefefe 0%, #f8fafc 100%)',
    resultBorder: '#f1f5f9',

    // Text colors
    descriptionText: '#475569',
    highlightBackground: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    highlightText: '#92400e',
    metaText: '#64748b',
    titleText: '#0f172a',

    // Interactive elements
    collectionBadge: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
    collectionBadgeText: '#3730a3',
    scoreBadge: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
    scoreBadgeText: '#166534',

    // State colors
    errorBackground: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
    errorText: '#dc2626',
    loadingText: '#64748b',
    noResultsText: '#64748b',

    // Facet colors
    facetActiveBackground: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    facetActiveText: '#ffffff',
    facetBackground: '#f8fafc',
    facetBorder: '#e2e8f0',
    facetText: '#334155',
  },
  ...baseTheme,
  animations: {
    ...baseTheme.animations,
    easeInOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    transitionNormal: '0.3s',
    transitionSlow: '0.5s',
  },
  spacing: {
    ...baseTheme.spacing,
    headerPadding: '1rem 1.5rem',
    inputBorderRadius: '1rem',
    inputFontSize: '1.125rem',
    inputPadding: '1.25rem 1.5rem',
    itemPadding: '1.25rem 1.5rem',
    resultsBorderRadius: '0 0 1rem 1rem',
    resultsMaxHeight: '32rem',
  },
}

// Dark theme - perfect for dark mode applications
export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    // Input colors
    inputBackground: '#1f2937',
    inputBorder: '#374151',
    inputBorderFocus: '#3b82f6',
    inputPlaceholder: '#9ca3af',
    inputText: '#f9fafb',

    // Results container colors
    resultsBackground: '#1f2937',
    resultsBorder: '#374151',
    resultsShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',

    // Header colors
    headerBackground: '#111827',
    headerBorder: '#374151',
    headerText: '#9ca3af',

    // Result item colors
    resultBackground: '#1f2937',
    resultBackgroundFocus: '#1e3a8a',
    resultBackgroundHover: '#111827',
    resultBorder: '#374151',

    // Text colors
    descriptionText: '#d1d5db',
    highlightBackground: '#451a03',
    highlightText: '#fbbf24',
    metaText: '#9ca3af',
    titleText: '#f9fafb',

    // Interactive elements
    collectionBadge: '#1e3a8a',
    collectionBadgeText: '#93c5fd',
    scoreBadge: '#064e3b',
    scoreBadgeText: '#6ee7b7',

    // State colors
    errorBackground: '#7f1d1d',
    errorText: '#fca5a5',
    loadingText: '#9ca3af',
    noResultsText: '#9ca3af',

    // Facet colors
    facetActiveBackground: '#3b82f6',
    facetActiveText: '#ffffff',
    facetBackground: '#374151',
    facetBorder: '#4b5563',
    facetText: '#d1d5db',
  },
  ...baseTheme,
  spacing: {
    ...baseTheme.spacing,
    headerPadding: '1rem 1.25rem',
    inputBorderRadius: '0.75rem',
    inputFontSize: '1.125rem',
    inputPadding: '1rem 1.25rem',
    itemPadding: '1rem 1.25rem',
    resultsBorderRadius: '0 0 0.75rem 0.75rem',
    resultsMaxHeight: '28rem',
  },
}

// Colorful theme - vibrant, modern with bright accents
export const colorfulTheme: Theme = {
  name: 'colorful',
  colors: {
    // Input colors
    inputBackground: '#ffffff',
    inputBorder: '#e879f9',
    inputBorderFocus: '#ec4899',
    inputPlaceholder: '#a855f7',
    inputText: '#1f2937',

    // Results container colors
    resultsBackground: '#ffffff',
    resultsBorder: '#e879f9',
    resultsShadow: '0 25px 50px -12px rgba(236, 72, 153, 0.25)',

    // Header colors
    headerBackground: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
    headerBorder: '#f3e8ff',
    headerText: '#be185d',

    // Result item colors
    resultBackground: '#ffffff',
    resultBackgroundFocus: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    resultBackgroundHover: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
    resultBorder: '#f3e8ff',

    // Text colors
    descriptionText: '#6b7280',
    highlightBackground: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    highlightText: '#92400e',
    metaText: '#a855f7',
    titleText: '#1f2937',

    // Interactive elements
    collectionBadge: 'linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%)',
    collectionBadgeText: '#6d28d9',
    scoreBadge: 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)',
    scoreBadgeText: '#dc2626',

    // State colors
    errorBackground: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
    errorText: '#dc2626',
    loadingText: '#a855f7',
    noResultsText: '#a855f7',

    // Facet colors
    facetActiveBackground: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    facetActiveText: '#ffffff',
    facetBackground: '#fdf2f8',
    facetBorder: '#f3e8ff',
    facetText: '#be185d',
  },
  ...baseTheme,
  animations: {
    ...baseTheme.animations,
    easeInOut: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    transitionNormal: '0.3s',
    transitionSlow: '0.5s',
  },
  spacing: {
    ...baseTheme.spacing,
    headerPadding: '1rem 1.5rem',
    inputBorderRadius: '1.5rem',
    inputFontSize: '1.125rem',
    inputPadding: '1rem 1.25rem',
    itemPadding: '1.25rem 1.5rem',
    resultsBorderRadius: '0 0 1.5rem 1.5rem',
    resultsMaxHeight: '28rem',
  },
}

// All available themes
export const themes: Record<string, Theme> = {
  colorful: colorfulTheme,
  dark: darkTheme,
  elegant: elegantTheme,
  minimal: minimalTheme,
  modern: modernTheme,
}

// Default theme
export const defaultTheme = modernTheme
