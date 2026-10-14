import { type CSSProperties } from 'react'

export interface ThemeColors {
  // Interactive
  collectionBadge: string
  collectionBadgeText: string

  // Text
  titleText: string
  descriptionText: string
  metaText: string
  noResultsText: string

  // States
  errorBackground: string
  errorText: string

  // Facets
  facetActiveBackground: string
  facetActiveText: string
  facetBackground: string
  facetBorder: string
  facetText: string

  // Header
  headerBackground: string
  headerBorder: string
  headerText: string

  // Highlight
  highlightBackground: string
  highlightText: string

  // Input
  inputBackground: string
  inputBorder: string
  inputBorderFocus: string
  inputPlaceholder: string
  inputText: string
  loadingText: string

  paginationBackground?: string
  paginationBorder?: string
  paginationText?: string

  // Result items
  resultBackground: string
  resultBackgroundFocus: string
  resultBackgroundHover: string
  resultBorder: string

  // Results
  resultsBackground: string
  resultsBorder: string
  resultsShadow: string
  scoreBadge: string
  scoreBadgeText: string

  // Dialog button
  triggerBackground?: string
  triggerBorder?: string
  triggerText?: string

  // Dialog
  dialogBackdrop?: string
  dialogBackground?: string
}

export interface ThemeSpacing {
  containerMargin?: string
  containerMaxWidth?: string
  descriptionLineClamp?: number

  dialogBorderRadius?: string
  dialogGap?: string
  dialogHeaderPadding?: string
  dialogMaxHeight?: string
  dialogPadding?: string
  dialogWidth?: string

  // Dialog close
  closeButtonBorderRadius?: string
  closeButtonPadding?: string

  errorGap?: string
  errorPadding?: string
  headerFontSize: string
  headerGap?: string
  headerPadding: string

  inputBorderRadius: string
  inputBorderWidth?: string
  inputFontSize: string
  inputPadding: string

  itemBorderRadius: string
  itemMargin: string
  itemPadding: string
  loadingGap?: string
  loadingPadding?: string
  loadingSpinnerSize?: string

  metaFontSize: string
  metaPadding: string
  noResultsPadding?: string
  paginationBorderRadius?: string
  paginationButtonPadding?: string
  paginationGap?: string
  paginationPadding?: string
  resultDescriptionMargin?: string
  resultGap?: string
  resultIconSize?: string

  resultsBorderRadius: string
  resultsBorderWidth?: string
  resultsListPadding?: string
  resultsMaxHeight: string
  resultsOffset?: string
  resultsPadding: string
  resultsZIndex?: number
  resultTitleMargin?: string
  triggerBorderRadius?: string
  triggerPadding?: string
}

export interface ThemeTypography {
  fontFamily: string
  fontFamilyMono: string

  fontSize2xl: string
  fontSizeBase: string
  fontSizeLg: string
  fontSizeSm: string
  fontSizeXl: string
  fontSizeXs: string

  fontWeightBold: string
  fontWeightMedium: string
  fontWeightNormal: string
  fontWeightSemibold: string

  lineHeightNormal: string
  lineHeightRelaxed: string
  lineHeightTight: string
}

export interface ThemeAnimations {
  animationFast: string
  animationNormal: string
  animationSlow: string

  easeIn: string
  easeInOut: string
  easeOut: string

  transitionFast: string
  transitionNormal: string
  transitionSlow: string
}

export interface ThemeShadows {
  focusShadow: string
  focusShadowColor: string

  shadowLg: string
  shadowMd: string
  shadowSm: string
  shadowXl: string
}

export interface Theme {
  animations: ThemeAnimations
  colors: ThemeColors
  name: string
  shadows: ThemeShadows
  spacing: ThemeSpacing
  typography: ThemeTypography
}

export interface ThemeConfig {
  animations?: Partial<ThemeAnimations>
  colors?: Partial<ThemeColors>

  enableAnimations?: boolean
  enableRoundedCorners?: boolean
  enableShadows?: boolean

  mobileOptimized?: boolean
  responsive?: boolean
  shadows?: Partial<ThemeShadows>
  spacing?: Partial<ThemeSpacing>

  styles?: Partial<Record<ThemePart, CSSProperties>>
  theme: string | Theme
  typography?: Partial<ThemeTypography>

  unstyled?: boolean
}

export interface ThemeClasses {
  closeButton: string

  // Badges
  collectionBadge: string

  // Containers
  container: string
  dialog: string
  dialogBackdrop: string
  dialogContent: string
  dialogHeader: string
  dialogResults: string
  dialogRoot: string
  dialogTitle: string

  // States
  error: string

  // Facets
  facetContainer: string
  facetItem: string
  facetItemActive: string

  // Utilities
  focusable: string
  hidden: string

  // Input
  input: string
  inputContainer: string
  inputDisabled: string
  inputFocus: string
  loading: string
  loadingIndicator: string
  loadingSpinner: string
  noResults: string
  noResultsDescription: string
  noResultsTitle: string
  pagination: string
  paginationButton: string
  paginationStatus: string
  resultBody: string

  // Content
  resultDescription: string
  resultHighlight: string
  resultIcon: string

  // Result items
  resultItem: string
  resultItemActive: string
  resultItemFocus: string
  resultItemHover: string
  resultLayout: string
  resultMeta: string
  resultMetaItem: string
  results: string
  resultsContainer: string
  resultsHeader: string
  resultsList: string
  resultTitle: string
  scoreBadge: string
  trigger: string
  visible: string
}

export type ThemePart = keyof ThemeClasses

export interface ThemeContextValue {
  applyTheme: (element: string, variant?: string) => string
  classes: ThemeClasses
  config: ThemeConfig
  isDark: boolean
  isLight: boolean
  theme: Theme
}
