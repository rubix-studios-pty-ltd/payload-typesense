import { toKebab } from '../utils/index.js'
import { parts, unitless } from './constant.js'
import { defaultTheme, themes } from './themes.js'
import {
  type Theme,
  type ThemeClasses,
  type ThemeConfig,
  type ThemePart,
  type ThemeVariant,
} from './types.js'

type Declarations = Record<string, number | string | undefined>
type Styles = Record<string, number | string | undefined | Declarations>

const SYSTEM_THEME_QUERY = '(prefers-color-scheme: dark)'

export function getSystemTheme(): ThemeVariant {
  return window.matchMedia(SYSTEM_THEME_QUERY).matches ? 'dark' : 'light'
}

export function getServerTheme(): ThemeVariant {
  return 'light'
}

export function systemTheme(callback: () => void): () => void {
  const media = window.matchMedia(SYSTEM_THEME_QUERY)

  media.addEventListener('change', callback)

  return () => media.removeEventListener('change', callback)
}

export function getTheme(name: string): Theme {
  return Object.hasOwn(themes, name) ? (themes[name] ?? defaultTheme) : defaultTheme
}

export function mergeConfig(config: ThemeConfig): Theme {
  const base = typeof config.theme === 'string' ? getTheme(config.theme) : config.theme

  return {
    ...base,
    animations: {
      ...defaultTheme.animations,
      ...base.animations,
      ...config.animations,
    },
    colors: {
      ...defaultTheme.colors,
      ...base.colors,
      ...config.colors,
    },
    shadows: {
      ...defaultTheme.shadows,
      ...base.shadows,
      ...config.shadows,
    },
    spacing: {
      ...defaultTheme.spacing,
      ...base.spacing,
      ...config.spacing,
    },
    typography: {
      ...defaultTheme.typography,
      ...base.typography,
      ...config.typography,
    },
  }
}

function serialize(styles: Declarations): string {
  return Object.entries(styles)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => {
      const needsUnit =
        typeof value === 'number' && value !== 0 && !unitless.has(key) && !key.startsWith('--')

      return `${toKebab(key)}:${needsUnit ? `${value}px` : value}`
    })
    .join(';')
}

export function css(styles: Styles): string {
  return Object.entries(styles)
    .map(([key, value]) =>
      typeof value === 'object' ? `${key}{${serialize(value)}}` : serialize({ [key]: value })
    )
    .filter(Boolean)
    .join(';')
}

export function generateClasses(_theme: Theme, _config: Partial<ThemeConfig> = {}): ThemeClasses {
  return Object.fromEntries(
    parts.map((part) => [part, `typesense-search-${part}`])
  ) as unknown as ThemeClasses
}

export function generateStyles(theme: Theme, config: Partial<ThemeConfig>, scope: string): string {
  if (config.unstyled) return ''

  const classes = generateClasses(theme, config)

  const root = `:where([data-search-theme="${scope}"])`

  const color = theme.colors
  const spacing = theme.spacing
  const typography = theme.typography

  const rounded = config.enableRoundedCorners !== false
  const animated = config.enableAnimations !== false
  const shadows = config.enableShadows !== false

  const transition = animated
    ? `all ${theme.animations.transitionFast} ${theme.animations.easeInOut}`
    : 'none'

  const focus = {
    outline: 'none',
    borderColor: color.inputBorderFocus,
    boxShadow: shadows ? `${theme.shadows.focusShadow} ${theme.shadows.focusShadowColor}` : 'none',
    ...config.styles?.inputFocus,
  }

  const button = {
    backgroundColor: color.triggerBackground ?? color.inputBackground,
    color: color.triggerText ?? color.inputText,
    border: `1px solid ${color.triggerBorder ?? color.inputBorder}`,
    borderRadius: rounded ? spacing.triggerBorderRadius : '0',
    cursor: 'pointer',
    fontSize: typography.fontSizeSm,
    padding: spacing.triggerPadding,
    transition,
  }

  const styles: Partial<Record<ThemePart, Styles>> = {
    container: {
      margin: spacing.containerMargin,
      maxWidth: spacing.containerMaxWidth,
      position: 'relative',
      width: '100%',
    },
    inputContainer: {
      position: 'relative',
      width: '100%',
    },
    input: {
      backgroundColor: color.inputBackground,
      border: `${spacing.inputBorderWidth} solid ${color.inputBorder}`,
      borderRadius: rounded ? spacing.inputBorderRadius : '0',
      color: color.inputText,
      boxSizing: 'border-box',
      fontSize: spacing.inputFontSize,
      fontWeight: typography.fontWeightNormal,
      lineHeight: typography.lineHeightNormal,
      padding: spacing.inputPadding,
      width: '100%',
      outline: 'none',
      transition,
      ':focus': focus,
      '::placeholder': {
        color: color.inputPlaceholder,
      },
      ':disabled': {
        opacity: 0.6,
        cursor: 'not-allowed',
      },
    },
    inputFocus: focus,
    inputDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
    resultsContainer: {
      backgroundColor: color.resultsBackground,
      border: `${spacing.resultsBorderWidth} solid ${color.resultsBorder}`,
      borderRadius: rounded ? spacing.resultsBorderRadius : '0',
      boxShadow: shadows ? (config.colors?.resultsShadow ?? theme.shadows.shadowLg) : 'none',
      boxSizing: 'border-box',
      display: 'flex',
      marginTop: spacing.resultsOffset,
      maxHeight: spacing.resultsMaxHeight,
      overflow: 'hidden',
      padding: spacing.resultsPadding,
      position: 'absolute',
      left: 0,
      right: 0,
      top: '100%',
      zIndex: spacing.resultsZIndex,
      animation: animated
        ? `typesenseSearchSlideDown ${theme.animations.animationNormal} ${theme.animations.easeOut}`
        : 'none',
    },
    results: {
      flex: 1,
      minHeight: 0,
      minWidth: 0,
      overflowY: 'auto',
      position: 'relative',
      width: '100%',
    },
    resultsHeader: {
      alignItems: 'center',
      backgroundColor: color.headerBackground,
      borderBottom: `1px solid ${color.headerBorder}`,
      color: color.headerText,
      display: 'flex',
      fontSize: spacing.headerFontSize,
      fontWeight: typography.fontWeightMedium,
      gap: spacing.headerGap,
      padding: spacing.headerPadding,
    },
    resultsList: {
      padding: spacing.resultsListPadding,
    },
    resultItem: {
      backgroundColor: color.resultBackground,
      borderBottom: `1px solid ${color.resultBorder}`,
      borderRadius: rounded ? spacing.itemBorderRadius : '0',
      color: color.titleText,
      cursor: 'pointer',
      margin: spacing.itemMargin,
      padding: spacing.itemPadding,
      outline: 'none',
      transition,
      ':hover': {
        backgroundColor: color.resultBackgroundHover,
        ...config.styles?.resultItemHover,
      },
      ':focus': {
        backgroundColor: color.resultBackgroundFocus,
        ...config.styles?.resultItemFocus,
      },
      ':focus-visible': focus,
      ':last-child': {
        borderBottom: 'none',
      },
    },
    resultItemHover: {
      backgroundColor: color.resultBackgroundHover,
    },
    resultItemFocus: {
      backgroundColor: color.resultBackgroundFocus,
    },
    resultItemActive: {
      backgroundColor: color.resultBackgroundFocus,
    },
    resultLayout: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: spacing.resultGap,
      overflow: 'hidden',
    },
    resultIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      width: spacing.resultIconSize,
      height: spacing.resultIconSize,
      borderRadius: rounded ? spacing.inputBorderRadius : '0',
      backgroundColor: color.collectionBadge,
      color: color.collectionBadgeText,
      fontSize: typography.fontSizeBase,
      fontWeight: typography.fontWeightMedium,
    },
    resultBody: { flex: 1, minWidth: 0 },
    resultTitle: {
      color: color.titleText,
      fontSize: typography.fontSizeBase,
      fontWeight: typography.fontWeightSemibold,
      lineHeight: typography.lineHeightTight,
      margin: spacing.resultTitleMargin,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    resultDescription: {
      color: color.descriptionText,
      display: '-webkit-box',
      fontSize: typography.fontSizeSm,
      fontWeight: typography.fontWeightNormal,
      lineHeight: typography.lineHeightNormal,
      margin: spacing.resultDescriptionMargin,
      overflow: 'hidden',
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: spacing.descriptionLineClamp,
      mark: {
        backgroundColor: color.highlightBackground,
        color: color.highlightText,
      },
    },
    resultHighlight: {
      backgroundColor: color.highlightBackground,
      color: color.highlightText,
    },
    resultMeta: {
      alignItems: 'center',
      display: 'flex',
      color: color.metaText,
      fontSize: spacing.metaFontSize,
      gap: spacing.resultGap,
      padding: spacing.metaPadding,
    },
    resultMetaItem: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: spacing.headerGap,
    },
    collectionBadge: {
      display: 'inline-block',
      backgroundColor: color.collectionBadge,
      color: color.collectionBadgeText,
      padding: spacing.itemPadding,
      borderRadius: rounded ? spacing.itemBorderRadius : '0',
    },
    scoreBadge: {
      display: 'inline-block',
      backgroundColor: color.scoreBadge,
      color: color.scoreBadgeText,
      fontSize: typography.fontSizeXs,
    },
    loading: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.loadingGap,
      padding: spacing.loadingPadding,
      color: color.loadingText,
      fontSize: typography.fontSizeSm,
    },
    loadingIndicator: {
      position: 'absolute',
      right: spacing.resultGap,
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
    },
    loadingSpinner: {
      width: spacing.loadingSpinnerSize,
      height: spacing.loadingSpinnerSize,
      border: `2px solid ${color.inputBorder}`,
      borderTopColor: color.inputBorderFocus,
      borderRadius: '50%',
      animation: animated ? 'typesenseSearchSpin 1s linear infinite' : 'none',
    },
    error: {
      alignItems: 'center',
      display: 'flex',
      backgroundColor: color.errorBackground,
      color: color.errorText,
      fontSize: typography.fontSizeSm,
      padding: spacing.errorPadding,
      gap: spacing.errorGap,
    },
    noResults: {
      color: color.noResultsText,
      fontSize: typography.fontSizeSm,
      padding: spacing.noResultsPadding,
      textAlign: 'center',
    },
    noResultsTitle: {
      color: color.titleText,
      fontSize: typography.fontSizeSm,
      fontWeight: typography.fontWeightMedium,
      margin: 0,
    },
    noResultsDescription: {
      color: color.descriptionText,
      fontSize: typography.fontSizeSm,
      margin: 0,
    },
    facetContainer: {
      backgroundColor: color.headerBackground,
      borderBottom: `1px solid ${color.headerBorder}`,
      padding: spacing.headerPadding,
    },
    facetItem: {
      ...button,
      backgroundColor: color.facetBackground,
      color: color.facetText,
      borderColor: color.facetBorder,
      ':hover': {
        backgroundColor: color.facetActiveBackground,
        color: color.facetActiveText,
      },
    },
    facetItemActive: {
      backgroundColor: color.facetActiveBackground,
      color: color.facetActiveText,
    },
    focusable: {
      ':focus-visible': focus,
    },
    hidden: {
      display: 'none',
    },
    visible: {
      display: 'block',
    },
    trigger: {
      ...button,
      ':focus-visible': focus,
      ':disabled': {
        opacity: 0.6,
        cursor: 'not-allowed',
      },
    },
    dialog: {
      position: 'fixed',
      inset: 0,
      margin: 'auto',
      height: 'fit-content',
      minHeight: 0,
      backgroundColor: color.dialogBackground ?? color.resultsBackground,
      color: color.inputText,
      border: `${spacing.resultsBorderWidth} solid ${color.resultsBorder}`,
      borderRadius: rounded ? spacing.dialogBorderRadius : '0',
      boxShadow: shadows ? theme.shadows.shadowXl : 'none',
      boxSizing: 'border-box',
      width: spacing.dialogWidth,
      maxWidth: 'calc(100vw - 2rem)',
      maxHeight: spacing.dialogMaxHeight,
      padding: spacing.dialogPadding,
      overflowY: 'auto',
      '::backdrop': {
        backgroundColor: color.dialogBackdrop ?? 'rgba(0,0,0,0.45)',
        ...config.styles?.dialogBackdrop,
      },
    },
    dialogBackdrop: {
      backgroundColor: color.dialogBackdrop,
    },
    dialogHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.dialogGap,
      padding: spacing.dialogHeaderPadding,
    },
    dialogTitle: {
      color: color.titleText,
      fontSize: typography.fontSizeLg,
      fontWeight: typography.fontWeightSemibold,
      margin: 0,
    },
    closeButton: {
      appearance: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      flex: '0 0 auto',
      boxSizing: 'border-box',
      position: 'static',
      margin: 0,
      width: 'auto',
      height: 'auto',
      minWidth: 0,
      minHeight: 0,
      backgroundColor: 'transparent',
      color: color.inputText,
      border: `1px solid ${color.resultsBorder}`,
      borderRadius: rounded ? (spacing.closeButtonBorderRadius ?? '0.375rem') : '0',
      padding: spacing.closeButtonPadding ?? '0.25rem 0.5rem',
      cursor: 'pointer',
      fontSize: typography.fontSizeSm,
      fontWeight: typography.fontWeightMedium,
      lineHeight: typography.lineHeightTight,
      whiteSpace: 'nowrap',
      textTransform: 'none',
      transition,
      ':hover': {
        backgroundColor: color.resultBackgroundHover,
      },
      ':focus-visible': focus,
    },
    dialogContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing.dialogGap,
      minHeight: 0,
    },
    dialogResults: {
      maxHeight: spacing.resultsMaxHeight,
      overflowY: 'auto',
      minHeight: 0,
    },
    pagination: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.paginationPadding,
      gap: spacing.paginationGap,
      borderTop: `1px solid ${color.headerBorder}`,
    },
    paginationButton: {
      ...button,
      backgroundColor: color.paginationBackground ?? color.inputBackground,
      color: color.paginationText ?? color.inputText,
      borderColor: color.paginationBorder ?? color.inputBorder,
      padding: spacing.paginationButtonPadding,
      borderRadius: rounded ? spacing.paginationBorderRadius : '0',
      ':focus-visible': focus,
      ':disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
    },
    paginationStatus: {
      color: color.metaText,
      fontSize: typography.fontSizeSm,
    },
  }

  const rules = parts
    .map((part) => {
      const selector = `${root} .${classes[part]},${root}.${classes[part]}`
      const style = { ...styles[part], ...config.styles?.[part] }
      const plain: Declarations = {}
      const nested: string[] = []

      for (const [key, value] of Object.entries(style)) {
        if (typeof value === 'object' && value !== null) {
          const suffix = key.startsWith(':') ? key : ` ${key}`
          nested.push(
            `${selector
              .split(',')
              .map((s) => `${s}${suffix}`)
              .join(',')}{${serialize(value as Declarations)}}`
          )
        } else {
          plain[key] = value
        }
      }

      return `${selector}{${serialize(plain)}}${nested.join('')}`
    })
    .join('\n')

  const keyframes = `
    @keyframes typesenseSearchSpin{to{transform:rotate(360deg)}}
    @keyframes typesenseSearchSlideDown{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`

  const reducedMotion = `
    @media(prefers-reduced-motion:reduce){${root} *,${root}{animation:none!important;transition:none!important}}`

  return `${rules}\n${keyframes}\n${reducedMotion}`
}

export function applyTheme(
  theme: Theme,
  element: string,
  variant?: string,
  config: Partial<ThemeConfig> = {}
): string {
  const classes = generateClasses(theme, config)
  const base = classes[element as ThemePart] ?? ''

  const key = variant
    ? (`${element}${variant.charAt(0).toUpperCase()}${variant.slice(1)}` as ThemePart)
    : undefined

  return [base, key ? classes[key] : ''].filter(Boolean).join(' ')
}

export function isDarkTheme(theme: Theme): boolean {
  return (
    theme.name === 'dark' ||
    theme.colors.inputBackground.includes('#1f') ||
    theme.colors.inputBackground.includes('#0f')
  )
}

export function isLightTheme(theme: Theme): boolean {
  return !isDarkTheme(theme)
}

export function getThemeVariables(theme: Theme): Record<string, string> {
  const variables: Record<string, string> = {}

  for (const [key, value] of Object.entries(theme.colors)) {
    if (value !== undefined) variables[`--search-${toKebab(key)}`] = value
  }

  for (const [key, value] of Object.entries(theme.spacing)) {
    if (value !== undefined) variables[`--search-${toKebab(key)}`] = String(value)
  }

  Object.assign(variables, {
    '--search-input-bg': theme.colors.inputBackground,
    '--search-results-bg': theme.colors.resultsBackground,
    '--search-header-bg': theme.colors.headerBackground,
    '--search-result-bg': theme.colors.resultBackground,
    '--search-result-bg-hover': theme.colors.resultBackgroundHover,
    '--search-error-bg': theme.colors.errorBackground,
    '--search-highlight-bg': theme.colors.highlightBackground,
    '--search-facet-bg': theme.colors.facetBackground,
    '--search-facet-active-bg': theme.colors.facetActiveBackground,
  })

  return variables
}
