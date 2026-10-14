import { toKebab } from '../utils/index.js'
import { parts, unitless } from './constant.js'
import { defaultTheme, themes } from './themes.js'
import { type Theme, type ThemeClasses, type ThemeConfig, type ThemePart } from './types.js'

type Declarations = Record<string, number | string | undefined>
type Styles = Record<string, number | string | undefined | Declarations>

const SYSTEM_THEME_QUERY = '(prefers-color-scheme: dark)'

export function getSystemTheme(): 'dark' | 'light' {
  return window.matchMedia(SYSTEM_THEME_QUERY).matches ? 'dark' : 'light'
}

export function getServerTheme(): 'dark' | 'light' {
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
    animations: { ...defaultTheme.animations, ...base.animations, ...config.animations },
    colors: { ...defaultTheme.colors, ...base.colors, ...config.colors },
    shadows: { ...defaultTheme.shadows, ...base.shadows, ...config.shadows },
    spacing: { ...defaultTheme.spacing, ...base.spacing, ...config.spacing },
    typography: { ...defaultTheme.typography, ...base.typography, ...config.typography },
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

export function generateThemeStyles(
  theme: Theme,
  config: Partial<ThemeConfig>,
  scope: string
): string {
  if (config.unstyled) return ''
  const c = theme.colors
  const s = theme.spacing
  const t = theme.typography

  const rounded = config.enableRoundedCorners !== false
  const animated = config.enableAnimations !== false
  const shadows = config.enableShadows !== false

  const transition = animated
    ? `all ${theme.animations.transitionFast} ${theme.animations.easeInOut}`
    : 'none'

  const focus = {
    outline: 'none',
    borderColor: c.inputBorderFocus,
    boxShadow: shadows ? `${theme.shadows.focusShadow} ${theme.shadows.focusShadowColor}` : 'none',
    ...config.styles?.inputFocus,
  }

  const button = {
    backgroundColor: c.triggerBackground ?? c.inputBackground,
    color: c.triggerText ?? c.inputText,
    border: `1px solid ${c.triggerBorder ?? c.inputBorder}`,
    borderRadius: rounded ? s.triggerBorderRadius : '0',
    cursor: 'pointer',
    fontFamily: t.fontFamily,
    fontSize: t.fontSizeSm,
    padding: s.triggerPadding,
    transition,
  }

  const styles: Partial<Record<ThemePart, Styles>> = {
    container: {
      margin: s.containerMargin,
      maxWidth: s.containerMaxWidth,
      position: 'relative',
      width: '100%',
      fontFamily: t.fontFamily,
    },
    inputContainer: { position: 'relative', width: '100%' },
    input: {
      backgroundColor: c.inputBackground,
      border: `${s.inputBorderWidth} solid ${c.inputBorder}`,
      borderRadius: rounded ? s.inputBorderRadius : '0',
      color: c.inputText,
      boxSizing: 'border-box',
      fontFamily: t.fontFamily,
      fontSize: s.inputFontSize,
      fontWeight: t.fontWeightNormal,
      lineHeight: t.lineHeightNormal,
      padding: s.inputPadding,
      width: '100%',
      outline: 'none',
      transition,
      ':focus': focus,
      '::placeholder': { color: c.inputPlaceholder },
      ':disabled': { opacity: 0.6, cursor: 'not-allowed' },
    },
    inputFocus: focus,
    inputDisabled: { opacity: 0.6, cursor: 'not-allowed' },
    resultsContainer: {
      backgroundColor: c.resultsBackground,
      border: `${s.resultsBorderWidth} solid ${c.resultsBorder}`,
      borderRadius: rounded ? s.resultsBorderRadius : '0',
      boxShadow: shadows ? (config.colors?.resultsShadow ?? theme.shadows.shadowLg) : 'none',
      boxSizing: 'border-box',
      marginTop: s.resultsOffset,
      maxHeight: s.resultsMaxHeight,
      overflowY: 'auto',
      padding: s.resultsPadding,
      position: 'absolute',
      left: 0,
      right: 0,
      top: '100%',
      zIndex: s.resultsZIndex,
      animation: animated
        ? `typesenseSearchSlideDown ${theme.animations.animationNormal} ${theme.animations.easeOut}`
        : 'none',
    },
    results: { minHeight: 0, width: '100%' },
    resultsHeader: {
      alignItems: 'center',
      backgroundColor: c.headerBackground,
      borderBottom: `1px solid ${c.headerBorder}`,
      color: c.headerText,
      display: 'flex',
      fontFamily: t.fontFamily,
      fontSize: s.headerFontSize,
      fontWeight: t.fontWeightMedium,
      gap: s.headerGap,
      padding: s.headerPadding,
    },
    resultsList: { padding: s.resultsListPadding },
    resultItem: {
      backgroundColor: c.resultBackground,
      borderBottom: `1px solid ${c.resultBorder}`,
      borderRadius: rounded ? s.itemBorderRadius : '0',
      color: c.titleText,
      cursor: 'pointer',
      fontFamily: t.fontFamily,
      margin: s.itemMargin,
      padding: s.itemPadding,
      outline: 'none',
      transition,
      ':hover': { backgroundColor: c.resultBackgroundHover, ...config.styles?.resultItemHover },
      ':focus': { backgroundColor: c.resultBackgroundFocus, ...config.styles?.resultItemFocus },
      ':focus-visible': focus,
      ':last-child': { borderBottom: 'none' },
    },
    resultItemHover: { backgroundColor: c.resultBackgroundHover },
    resultItemFocus: { backgroundColor: c.resultBackgroundFocus },
    resultItemActive: { backgroundColor: c.resultBackgroundFocus },
    resultLayout: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: s.resultGap,
      overflow: 'hidden',
    },
    resultIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      width: s.resultIconSize,
      height: s.resultIconSize,
      borderRadius: rounded ? s.inputBorderRadius : '0',
      backgroundColor: c.collectionBadge,
      color: c.collectionBadgeText,
      fontSize: t.fontSizeBase,
      fontWeight: t.fontWeightMedium,
    },
    resultBody: { flex: 1, minWidth: 0 },
    resultTitle: {
      color: c.titleText,
      fontFamily: t.fontFamily,
      fontSize: t.fontSizeBase,
      fontWeight: t.fontWeightSemibold,
      lineHeight: t.lineHeightTight,
      margin: s.resultTitleMargin,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    resultDescription: {
      color: c.descriptionText,
      display: '-webkit-box',
      fontFamily: t.fontFamily,
      fontSize: t.fontSizeSm,
      fontWeight: t.fontWeightNormal,
      lineHeight: t.lineHeightNormal,
      margin: s.resultDescriptionMargin,
      overflow: 'hidden',
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: s.descriptionLineClamp,
      mark: { backgroundColor: c.highlightBackground, color: c.highlightText },
    },
    resultHighlight: { backgroundColor: c.highlightBackground, color: c.highlightText },
    resultMeta: {
      alignItems: 'center',
      display: 'flex',
      color: c.metaText,
      fontFamily: t.fontFamily,
      fontSize: s.metaFontSize,
      gap: s.resultGap,
      padding: s.metaPadding,
    },
    resultMetaItem: { display: 'inline-flex', alignItems: 'center', gap: s.headerGap },
    collectionBadge: {
      display: 'inline-block',
      backgroundColor: c.collectionBadge,
      color: c.collectionBadgeText,
      padding: s.itemPadding,
      borderRadius: rounded ? s.itemBorderRadius : '0',
    },
    scoreBadge: {
      display: 'inline-block',
      backgroundColor: c.scoreBadge,
      color: c.scoreBadgeText,
      fontSize: t.fontSizeXs,
    },
    loading: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s.loadingGap,
      padding: s.loadingPadding,
      color: c.loadingText,
      fontSize: t.fontSizeSm,
    },
    loadingIndicator: {
      position: 'absolute',
      right: s.resultGap,
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
    },
    loadingSpinner: {
      width: s.loadingSpinnerSize,
      height: s.loadingSpinnerSize,
      border: `2px solid ${c.inputBorder}`,
      borderTopColor: c.inputBorderFocus,
      borderRadius: '50%',
      animation: animated ? 'typesenseSearchSpin 1s linear infinite' : 'none',
    },
    error: {
      alignItems: 'center',
      display: 'flex',
      backgroundColor: c.errorBackground,
      color: c.errorText,
      fontFamily: t.fontFamily,
      fontSize: t.fontSizeSm,
      padding: s.errorPadding,
      gap: s.errorGap,
    },
    noResults: {
      color: c.noResultsText,
      fontFamily: t.fontFamily,
      fontSize: t.fontSizeSm,
      padding: s.noResultsPadding,
      textAlign: 'center',
    },
    noResultsTitle: {
      color: c.titleText,
      fontSize: t.fontSizeSm,
      fontWeight: t.fontWeightMedium,
      margin: 0,
    },
    noResultsDescription: { color: c.descriptionText, fontSize: t.fontSizeSm, margin: 0 },
    facetContainer: {
      backgroundColor: c.headerBackground,
      borderBottom: `1px solid ${c.headerBorder}`,
      padding: s.headerPadding,
    },
    facetItem: {
      ...button,
      backgroundColor: c.facetBackground,
      color: c.facetText,
      borderColor: c.facetBorder,
      ':hover': { backgroundColor: c.facetActiveBackground, color: c.facetActiveText },
    },
    facetItemActive: { backgroundColor: c.facetActiveBackground, color: c.facetActiveText },
    focusable: { ':focus-visible': focus },
    hidden: { display: 'none' },
    visible: { display: 'block' },
    dialogRoot: { fontFamily: t.fontFamily },
    trigger: {
      ...button,
      ':focus-visible': focus,
      ':disabled': { opacity: 0.6, cursor: 'not-allowed' },
    },
    dialog: {
      position: 'fixed',
      inset: 0,
      margin: 'auto',
      height: 'fit-content',
      minHeight: 0,
      backgroundColor: c.dialogBackground ?? c.resultsBackground,
      color: c.inputText,
      border: `${s.resultsBorderWidth} solid ${c.resultsBorder}`,
      borderRadius: rounded ? s.dialogBorderRadius : '0',
      boxShadow: shadows ? theme.shadows.shadowXl : 'none',
      boxSizing: 'border-box',
      fontFamily: t.fontFamily,
      width: s.dialogWidth,
      maxWidth: 'calc(100vw - 2rem)',
      maxHeight: s.dialogMaxHeight,
      padding: s.dialogPadding,
      overflowY: 'auto',
      '::backdrop': {
        backgroundColor: c.dialogBackdrop ?? 'rgba(0,0,0,0.45)',
        ...config.styles?.dialogBackdrop,
      },
    },
    dialogBackdrop: { backgroundColor: c.dialogBackdrop },
    dialogHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: s.dialogGap,
      padding: s.dialogHeaderPadding,
    },
    dialogTitle: {
      color: c.titleText,
      fontSize: t.fontSizeLg,
      fontWeight: t.fontWeightSemibold,
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
      color: c.inputText,
      border: `1px solid ${c.resultsBorder}`,
      borderRadius: rounded ? (s.closeButtonBorderRadius ?? '0.375rem') : '0',
      padding: s.closeButtonPadding ?? '0.25rem 0.5rem',
      cursor: 'pointer',
      fontFamily: t.fontFamily,
      fontSize: t.fontSizeSm,
      fontWeight: t.fontWeightMedium,
      lineHeight: t.lineHeightTight,
      whiteSpace: 'nowrap',
      textTransform: 'none',
      transition,
      ':hover': { backgroundColor: c.resultBackgroundHover },
      ':focus-visible': focus,
    },
    dialogContent: { display: 'flex', flexDirection: 'column', gap: s.dialogGap, minHeight: 0 },
    dialogResults: { maxHeight: s.resultsMaxHeight, overflowY: 'auto', minHeight: 0 },
    pagination: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: s.paginationPadding,
      gap: s.paginationGap,
      borderTop: `1px solid ${c.headerBorder}`,
    },
    paginationButton: {
      ...button,
      backgroundColor: c.paginationBackground ?? c.inputBackground,
      color: c.paginationText ?? c.inputText,
      borderColor: c.paginationBorder ?? c.inputBorder,
      padding: s.paginationButtonPadding,
      borderRadius: rounded ? s.paginationBorderRadius : '0',
      ':focus-visible': focus,
      ':disabled': { opacity: 0.5, cursor: 'not-allowed' },
    },
    paginationStatus: { color: c.metaText, fontSize: t.fontSizeSm },
  }

  const classes = generateClasses(theme, config)
  const root = `:where([data-search-theme="${scope}"])`

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
  return `${rules}\n@keyframes typesenseSearchSpin{to{transform:rotate(360deg)}}
@keyframes typesenseSearchSlideDown{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
@media(prefers-reduced-motion:reduce){${root} *,${root}{animation:none!important;transition:none!important}}`
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
