import { type Theme } from './types.js'

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
    // Container
    containerMaxWidth: '600px',
    containerMargin: '0 auto',

    // Input
    inputBorderWidth: '2px',
    inputBorderRadius: '0.5rem',
    inputFontSize: '1rem',
    inputPadding: '0.5rem 0.75rem',

    // Results container
    resultsBorderWidth: '1px',
    resultsBorderRadius: '0.5rem',
    resultsMaxHeight: '24rem',
    resultsOffset: '10px',
    resultsPadding: '0',
    resultsZIndex: 1000,

    // Results header
    headerFontSize: '0.875rem',
    headerPadding: '0.75rem 1rem',
    headerGap: '8px',

    // Results list
    resultsListPadding: '2px',
    itemBorderRadius: '0',
    itemMargin: '0',
    itemPadding: '0.5rem',
    resultGap: '12px',
    resultIconSize: '32px',
    resultTitleMargin: '0 0 8px',
    resultDescriptionMargin: '4px 0 0',
    descriptionLineClamp: 2,

    // Result metadata
    metaFontSize: '0.75rem',
    metaPadding: '0.5rem 0',

    // Loading
    loadingPadding: '24px',
    loadingGap: '12px',
    loadingSpinnerSize: '16px',

    // Error
    errorPadding: '16px',
    errorGap: '8px',

    // No results
    noResultsPadding: '40px 20px',

    // Dialog trigger button
    triggerPadding: '0.5rem 0.75rem',
    triggerBorderRadius: '0.5rem',

    // Dialog
    dialogWidth: '640px',
    dialogMaxHeight: '80vh',
    dialogPadding: '1rem',
    dialogBorderRadius: '0.75rem',
    dialogHeaderPadding: '0 0 1rem',
    dialogGap: '0.75rem',

    // Dialog close button
    closeButtonPadding: '0.25rem 0.5rem',
    closeButtonBorderRadius: '0.375rem',

    // Pagination
    paginationPadding: '0.75rem',
    paginationGap: '0.5rem',
    paginationButtonPadding: '0.375rem 0.75rem',
    paginationBorderRadius: '0.375rem',
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
} satisfies Pick<Theme, 'animations' | 'shadows' | 'spacing' | 'typography'>

export const modernTheme: Theme = {
  name: 'modern',
  colors: {
    dialogBackdrop: 'rgba(0, 0, 0, 0.45)',
    // Input
    inputBackground: '#ffffff',
    inputBorder: '#d1d5db',
    inputBorderFocus: '#3b82f6',
    inputPlaceholder: '#6b7280',
    inputText: '#111827',

    // Results
    resultsBackground: '#ffffff',
    resultsBorder: '#d1d5db',
    resultsShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',

    // Header
    headerBackground: '#f9fafb',
    headerBorder: '#e5e7eb',
    headerText: '#6b7280',

    // Result items
    resultBackground: '#ffffff',
    resultBackgroundFocus: '#eff6ff',
    resultBackgroundHover: '#f8fafc',
    resultBorder: '#f3f4f6',

    // Text
    descriptionText: '#6b7280',
    highlightBackground: '#fef3c7',
    highlightText: '#92400e',
    metaText: '#9ca3af',
    titleText: '#111827',

    // Interactive
    collectionBadge: '#dbeafe',
    collectionBadgeText: '#1e40af',
    scoreBadge: '#dcfce7',
    scoreBadgeText: '#166534',

    // States
    errorBackground: '#fef2f2',
    errorText: '#dc2626',
    loadingText: '#6b7280',
    noResultsText: '#6b7280',

    // Facets
    facetActiveBackground: '#3b82f6',
    facetActiveText: '#ffffff',
    facetBackground: '#f3f4f6',
    facetBorder: '#d1d5db',
    facetText: '#374151',
  },
  ...baseTheme,
}

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    dialogBackdrop: 'rgba(0, 0, 0, 0.65)',
    // Input
    inputBackground: '#1f2937',
    inputBorder: '#374151',
    inputBorderFocus: '#3b82f6',
    inputPlaceholder: '#9ca3af',
    inputText: '#f9fafb',

    // Results
    resultsBackground: '#1f2937',
    resultsBorder: '#374151',
    resultsShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',

    // Header
    headerBackground: '#111827',
    headerBorder: '#374151',
    headerText: '#9ca3af',

    // Result items
    resultBackground: '#1f2937',
    resultBackgroundFocus: '#1e3a8a',
    resultBackgroundHover: '#111827',
    resultBorder: '#374151',

    // Text
    descriptionText: '#d1d5db',
    highlightBackground: '#451a03',
    highlightText: '#fbbf24',
    metaText: '#9ca3af',
    titleText: '#f9fafb',

    // Interactive
    collectionBadge: '#1e3a8a',
    collectionBadgeText: '#93c5fd',
    scoreBadge: '#064e3b',
    scoreBadgeText: '#6ee7b7',

    // States
    errorBackground: '#7f1d1d',
    errorText: '#fca5a5',
    loadingText: '#9ca3af',
    noResultsText: '#9ca3af',

    // Facets
    facetActiveBackground: '#3b82f6',
    facetActiveText: '#ffffff',
    facetBackground: '#374151',
    facetBorder: '#4b5563',
    facetText: '#d1d5db',
  },
  ...baseTheme,
}

export const themes: Record<string, Theme> = {
  dark: darkTheme,
  modern: modernTheme,
}

export const defaultTheme = modernTheme
