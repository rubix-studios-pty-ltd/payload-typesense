export interface ThemeColors {
  // Interactive
  collectionBadge: string
  collectionBadgeText: string

  // Text
  descriptionText: string

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
  highlightBackground: string
  highlightText: string
  // Input
  inputBackground: string
  inputBorder: string
  inputBorderFocus: string
  inputPlaceholder: string
  inputText: string
  loadingText: string
  metaText: string
  noResultsText: string

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
  titleText: string
}

export interface ThemeSpacing {
  headerFontSize: string
  headerPadding: string

  inputBorderRadius: string
  inputFontSize: string
  inputPadding: string

  itemBorderRadius: string
  itemMargin: string
  itemPadding: string

  metaFontSize: string
  metaPadding: string

  resultsBorderRadius: string
  resultsMaxHeight: string
  resultsPadding: string
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
  theme: string | Theme
  typography?: Partial<ThemeTypography>
}

export interface ThemeClasses {
  // Badges
  collectionBadge: string
  // Containers
  container: string

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
  loadingSpinner: string
  noResults: string

  // Content
  resultDescription: string
  resultHighlight: string

  // Result items
  resultItem: string
  resultItemActive: string
  resultItemFocus: string
  resultItemHover: string
  resultMeta: string
  results: string
  resultsContainer: string
  resultsHeader: string
  resultsList: string
  resultTitle: string
  scoreBadge: string
  visible: string
}

export interface ThemeContextValue {
  applyTheme: (element: string, variant?: string) => string
  classes: ThemeClasses
  config: ThemeConfig
  isDark: boolean
  isLight: boolean
  theme: Theme
}
