import { defaultTheme, themes } from './themes.js'
import { type Theme, type ThemeClasses, type ThemeConfig } from './types.js'

export function getTheme(themeName: string): Theme {
  return themes[themeName] || defaultTheme
}

export function mergeThemeConfig(config: ThemeConfig): Theme {
  const baseTheme = typeof config.theme === 'string' ? getTheme(config.theme) : config.theme

  return {
    ...baseTheme,
    animations: {
      ...baseTheme.animations,
      ...config.animations,
    },
    colors: {
      ...baseTheme.colors,
      ...config.colors,
    },
    shadows: {
      ...baseTheme.shadows,
      ...config.shadows,
    },
    spacing: {
      ...baseTheme.spacing,
      ...config.spacing,
    },
    typography: {
      ...baseTheme.typography,
      ...config.typography,
    },
  }
}

export function css(
  styles: Record<string, number | Record<string, number | string> | string>
): string {
  const toKebab = (key: string) => key.replace(/([A-Z])/g, '-$1').toLowerCase()

  const serialize = (obj: Record<string, number | string>) =>
    Object.entries(obj)
      .map(([prop, val]) => `${toKebab(prop)}: ${val}`)
      .join('; ')

  return Object.entries(styles)
    .map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return `${toKebab(key)} { ${serialize(value)} }`
      }
      return `${toKebab(key)}: ${value}`
    })
    .join('; ')
}

export function generateThemeClasses(
  theme: Theme,
  config: Partial<ThemeConfig> = {}
): ThemeClasses {
  const enableAnimations = config.enableAnimations !== false
  const enableShadows = config.enableShadows !== false
  const enableRoundedCorners = config.enableRoundedCorners !== false

  const containerStyles = css({
    margin: '0 auto',
    maxWidth: '600px',
    position: 'relative',
    width: '100%',
  })

  const inputContainerStyles = css({
    position: 'relative',
    width: '100%',
  })

  const resultsContainerStyles = css({
    backgroundColor: theme.colors.resultsBackground,
    border: `1px solid ${theme.colors.resultsBorder}`,
    borderRadius: enableRoundedCorners ? theme.spacing.resultsBorderRadius : '0',
    boxShadow: enableShadows ? theme.shadows.shadowLg : 'none',
    left: '0',
    marginBottom: '2px',
    marginTop: '2px',
    maxHeight: theme.spacing.resultsMaxHeight,
    overflowY: 'auto',
    position: 'absolute',
    right: '0',
    top: '100%',
    zIndex: '1000',
    ...(enableAnimations && {
      animation: 'slideDown 0.2s ease-out',
    }),
  })

  const inputStyles = css({
    '::placeholder': {
      color: theme.colors.inputPlaceholder,
    },
    ':disabled': {
      backgroundColor: theme.colors.inputBackground,
      cursor: 'not-allowed',
      opacity: '0.6',
    },
    ':focus': {
      borderColor: theme.colors.inputBorderFocus,
      boxShadow: enableShadows
        ? `${theme.shadows.focusShadow} ${theme.shadows.focusShadowColor}`
        : 'none',
    },
    backgroundColor: theme.colors.inputBackground,
    border: `2px solid ${theme.colors.inputBorder}`,
    borderRadius: enableRoundedCorners ? theme.spacing.inputBorderRadius : '0',
    boxShadow: 'none',
    color: theme.colors.inputText,
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.spacing.inputFontSize,
    fontWeight: theme.typography.fontWeightNormal,
    lineHeight: theme.typography.lineHeightNormal,
    outline: 'none',
    padding: theme.spacing.inputPadding,
    transition: enableAnimations
      ? `all ${theme.animations.transitionNormal} ${theme.animations.easeInOut}`
      : 'none',
    width: '100%',
  })

  const resultsStyles = css({
    backgroundColor: theme.colors.resultsBackground,
    border: `1px solid ${theme.colors.resultsBorder}`,
    borderRadius: enableRoundedCorners ? theme.spacing.resultsBorderRadius : '0',
    boxShadow: enableShadows ? theme.shadows.shadowLg : 'none',
    left: '0',
    maxHeight: theme.spacing.resultsMaxHeight,
    overflowY: 'auto',
    position: 'absolute',
    right: '0',
    top: '100%',
    zIndex: '1000',
  })

  const resultsHeaderStyles = css({
    alignItems: 'center',
    backgroundColor: theme.colors.headerBackground,
    borderBottom: `1px solid ${theme.colors.headerBorder}`,
    color: theme.colors.headerText,
    display: 'flex',
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.spacing.headerFontSize,
    fontWeight: theme.typography.fontWeightMedium,
    justifyContent: 'space-between',
    padding: theme.spacing.headerPadding,
  })

  const resultsListStyles = css({
    padding: '4px',
  })

  const resultItemStyles = css({
    ':focus': {
      backgroundColor: theme.colors.resultBackgroundFocus,
      boxShadow: enableShadows ? `inset 0 0 0 2px ${theme.colors.inputBorderFocus}` : 'none',
    },
    ':hover': {
      backgroundColor: theme.colors.resultBackgroundHover,
      transform: enableAnimations ? 'translateX(2px)' : 'none',
    },
    ':last-child': {
      borderBottom: 'none',
    },
    backgroundColor: theme.colors.resultBackground,
    borderBottom: `1px solid ${theme.colors.resultBorder}`,
    cursor: 'pointer',
    outline: 'none',
    padding: theme.spacing.itemPadding,
    transition: enableAnimations
      ? `all ${theme.animations.transitionFast} ${theme.animations.easeInOut}`
      : 'none',
  })

  const resultTitleStyles = css({
    color: theme.colors.titleText,
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSizeLg,
    fontWeight: theme.typography.fontWeightSemibold,
    lineHeight: theme.typography.lineHeightTight,
    marginBottom: '8px',
  })

  const resultDescriptionStyles = css({
    color: theme.colors.descriptionText,
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSizeSm,
    lineHeight: theme.typography.lineHeightNormal,
    marginBottom: '8px',
  })

  const resultHighlightStyles = css({
    backgroundColor: theme.colors.highlightBackground,
    borderRadius: enableRoundedCorners ? '6px' : '0',
    color: theme.colors.descriptionText,
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSizeSm,
    lineHeight: theme.typography.lineHeightNormal,
    marginBottom: '8px',
    mark: {
      backgroundColor: theme.colors.highlightBackground,
      borderRadius: enableRoundedCorners ? '3px' : '0',
      color: theme.colors.highlightText,
      fontWeight: theme.typography.fontWeightMedium,
      padding: '2px 4px',
    },
    padding: '8px 12px',
  })

  const resultMetaStyles = css({
    alignItems: 'center',
    color: theme.colors.metaText,
    display: 'flex',
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSizeXs,
    justifyContent: 'space-between',
    marginTop: '8px',
  })

  const collectionBadgeStyles = css({
    backgroundColor: theme.colors.collectionBadge,
    borderRadius: enableRoundedCorners ? '12px' : '0',
    color: theme.colors.collectionBadgeText,
    display: 'inline-block',
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSizeXs,
    fontWeight: theme.typography.fontWeightSemibold,
    letterSpacing: '0.5px',
    padding: '4px 8px',
    textTransform: 'uppercase',
  })

  const scoreBadgeStyles = css({
    backgroundColor: theme.colors.scoreBadge,
    borderRadius: enableRoundedCorners ? '4px' : '0',
    color: theme.colors.scoreBadgeText,
    display: 'inline-block',
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSizeXs,
    fontWeight: theme.typography.fontWeightMedium,
    padding: '2px 6px',
  })

  const loadingStyles = css({
    alignItems: 'center',
    color: theme.colors.loadingText,
    display: 'flex',
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSizeSm,
    gap: '12px',
    justifyContent: 'center',
    padding: '24px',
  })

  const loadingSpinnerStyles = css({
    animation: enableAnimations ? `spin 1s linear infinite` : 'none',
    border: `2px solid ${theme.colors.inputBorder}`,
    borderRadius: '50%',
    borderTop: `2px solid ${theme.colors.inputBorderFocus}`,
    height: '20px',
    width: '20px',
  })

  const errorStyles = css({
    alignItems: 'center',
    backgroundColor: theme.colors.errorBackground,
    borderBottom: `1px solid ${theme.colors.resultBorder}`,
    color: theme.colors.errorText,
    display: 'flex',
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSizeSm,
    gap: '8px',
    padding: '16px',
  })

  const noResultsStyles = css({
    color: theme.colors.noResultsText,
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSizeSm,
    padding: '40px 20px',
    textAlign: 'center',
  })

  const facetContainerStyles = css({
    backgroundColor: theme.colors.headerBackground,
    borderBottom: `1px solid ${theme.colors.headerBorder}`,
    padding: '16px',
  })

  const facetItemStyles = css({
    ':hover': {
      backgroundColor: theme.colors.facetActiveBackground,
      borderColor: theme.colors.facetActiveBackground,
      color: theme.colors.facetActiveText,
    },
    backgroundColor: theme.colors.facetBackground,
    border: `1px solid ${theme.colors.facetBorder}`,
    borderRadius: enableRoundedCorners ? '16px' : '0',
    color: theme.colors.facetText,
    cursor: 'pointer',
    display: 'inline-block',
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSizeXs,
    fontWeight: theme.typography.fontWeightMedium,
    margin: '4px',
    padding: '6px 12px',
    transition: enableAnimations
      ? `all ${theme.animations.transitionFast} ${theme.animations.easeInOut}`
      : 'none',
  })

  const facetItemActiveStyles = css({
    backgroundColor: theme.colors.facetActiveBackground,
    borderColor: theme.colors.facetActiveBackground,
    color: theme.colors.facetActiveText,
  })

  const hiddenStyles = css({
    display: 'none',
  })

  const visibleStyles = css({
    display: 'block',
  })

  const focusableStyles = css({
    ':focus': {
      boxShadow: enableShadows ? `0 0 0 2px ${theme.colors.inputBorderFocus}` : 'none',
    },
    outline: 'none',
  })

  return {
    // Container classes
    container: containerStyles,
    inputContainer: inputContainerStyles,
    resultsContainer: resultsContainerStyles,

    // Input classes
    input: inputStyles,
    inputDisabled: '',
    inputFocus: '',

    // Results classes
    results: resultsStyles,
    resultsHeader: resultsHeaderStyles,
    resultsList: resultsListStyles,

    // Item classes
    resultItem: resultItemStyles,
    resultItemActive: '',
    resultItemFocus: '',
    resultItemHover: '',

    // Content classes
    resultDescription: resultDescriptionStyles,
    resultHighlight: resultHighlightStyles,
    resultMeta: resultMetaStyles,
    resultTitle: resultTitleStyles,

    // Badge classes
    collectionBadge: collectionBadgeStyles,
    scoreBadge: scoreBadgeStyles,

    // State classes
    error: errorStyles,
    loading: loadingStyles,
    loadingSpinner: loadingSpinnerStyles,
    noResults: noResultsStyles,

    // Facet classes
    facetContainer: facetContainerStyles,
    facetItem: facetItemStyles,
    facetItemActive: facetItemActiveStyles,

    // Utility classes
    focusable: focusableStyles,
    hidden: hiddenStyles,
    visible: visibleStyles,
  }
}

/**
 * Apply theme to a CSS class with optional variant
 */
export function applyTheme(theme: Theme, element: string, variant?: string): string {
  const classes = generateThemeClasses(theme)

  if (variant) {
    const variantKey = `${element}${
      variant.charAt(0).toUpperCase() + variant.slice(1)
    }` as keyof ThemeClasses
    return `${(classes)[element] || ''} ${(classes)[variantKey] || ''}`
  }

  return classes[element as keyof ThemeClasses] || ''
}

/**
 * Check if theme is dark mode
 */
export function isDarkTheme(theme: Theme): boolean {
  return (
    theme.name === 'dark' ||
    theme.colors.inputBackground.includes('#1f') ||
    theme.colors.inputBackground.includes('#0f')
  )
}

/**
 * Check if theme is light mode
 */
export function isLightTheme(theme: Theme): boolean {
  return !isDarkTheme(theme)
}

/**
 * Get theme-specific CSS variables
 */
export function getThemeVariables(theme: Theme): Record<string, string> {
  return {
    '--search-collection-badge': theme.colors.collectionBadge,
    '--search-collection-badge-text': theme.colors.collectionBadgeText,
    '--search-description-text': theme.colors.descriptionText,
    '--search-error-bg': theme.colors.errorBackground,
    '--search-error-text': theme.colors.errorText,
    '--search-facet-active-bg': theme.colors.facetActiveBackground,
    '--search-facet-active-text': theme.colors.facetActiveText,
    '--search-facet-bg': theme.colors.facetBackground,
    '--search-facet-border': theme.colors.facetBorder,
    '--search-facet-text': theme.colors.facetText,
    '--search-header-bg': theme.colors.headerBackground,
    '--search-header-text': theme.colors.headerText,
    '--search-highlight-bg': theme.colors.highlightBackground,
    '--search-highlight-text': theme.colors.highlightText,
    '--search-input-bg': theme.colors.inputBackground,
    '--search-input-border': theme.colors.inputBorder,
    '--search-input-border-focus': theme.colors.inputBorderFocus,
    '--search-input-placeholder': theme.colors.inputPlaceholder,
    '--search-input-text': theme.colors.inputText,
    '--search-loading-text': theme.colors.loadingText,
    '--search-meta-text': theme.colors.metaText,
    '--search-no-results-text': theme.colors.noResultsText,
    '--search-result-bg': theme.colors.resultBackground,
    '--search-result-bg-hover': theme.colors.resultBackgroundHover,
    '--search-results-bg': theme.colors.resultsBackground,
    '--search-results-border': theme.colors.resultsBorder,
    '--search-score-badge': theme.colors.scoreBadge,
    '--search-score-badge-text': theme.colors.scoreBadgeText,
    '--search-title-text': theme.colors.titleText,
  }
}
