export interface ThemeColors {
  // Interactive elements
  collectionBadge: string
  collectionBadgeText: string
  descriptionText: string
  errorBackground: string
  errorText: string

  facetActiveBackground: string
  facetActiveText: string
  // Facet colors (if enabled)
  facetBackground: string

  facetBorder: string
  facetText: string
  // Header colors
  headerBackground: string

  headerBorder: string
  headerText: string
  highlightBackground: string
  highlightText: string

  // Input colors
  inputBackground: string
  inputBorder: string
  inputBorderFocus: string
  inputPlaceholder: string
  inputText: string

  // State colors
  loadingText: string
  metaText: string
  noResultsText: string
  // Result item colors
  resultBackground: string

  resultBackgroundFocus: string
  resultBackgroundHover: string
  resultBorder: string
  // Results container colors
  resultsBackground: string

  resultsBorder: string
  resultsShadow: string
  scoreBadge: string
  scoreBadgeText: string
  // Text colors
  titleText: string
}

export interface ThemeSpacing {
  headerFontSize: string
  // Header spacing
  headerPadding: string
  inputBorderRadius: string

  inputFontSize: string
  // Input spacing
  inputPadding: string
  itemBorderRadius: string

  itemMargin: string
  // Item spacing
  itemPadding: string
  metaFontSize: string

  // Meta spacing
  metaPadding: string
  resultsBorderRadius: string

  resultsMaxHeight: string
  // Results spacing
  resultsPadding: string
}

export interface ThemeTypography {
  // Font families
  fontFamily: string
  fontFamilyMono: string

  fontSize2xl: string
  fontSizeBase: string
  fontSizeLg: string
  fontSizeSm: string

  fontSizeXl: string
  // Font sizes
  fontSizeXs: string
  fontWeightBold: string
  fontWeightMedium: string
  // Font weights
  fontWeightNormal: string
  fontWeightSemibold: string

  lineHeightNormal: string
  lineHeightRelaxed: string
  // Line heights
  lineHeightTight: string
}

export interface ThemeAnimations {
  // Animation durations
  animationFast: string
  animationNormal: string
  animationSlow: string

  // Easing functions
  easeIn: string
  easeInOut: string
  easeOut: string

  // Transition durations
  transitionFast: string
  transitionNormal: string
  transitionSlow: string
}

export interface ThemeShadows {
  // Focus shadows
  focusShadow: string
  focusShadowColor: string
  shadowLg: string
  shadowMd: string

  // Shadow definitions
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

  // Custom overrides
  colors?: Partial<ThemeColors>
  // Feature toggles
  enableAnimations?: boolean
  enableRoundedCorners?: boolean
  enableShadows?: boolean
  mobileOptimized?: boolean

  // Responsive settings
  responsive?: boolean
  shadows?: Partial<ThemeShadows>
  spacing?: Partial<ThemeSpacing>

  // Theme selection
  theme: string | Theme
  typography?: Partial<ThemeTypography>
}

export interface ThemeClasses {
  // Badge classes
  collectionBadge: string
  // Container classes
  container: string
  error: string

  // Facet classes (if enabled)
  facetContainer: string
  facetItem: string
  facetItemActive: string

  focusable: string
  // Utility classes
  hidden: string
  // Input classes
  input: string

  inputContainer: string
  inputDisabled: string
  inputFocus: string
  // State classes
  loading: string

  loadingSpinner: string
  noResults: string
  resultDescription: string
  resultHighlight: string

  // Item classes
  resultItem: string
  resultItemActive: string

  resultItemFocus: string
  resultItemHover: string
  resultMeta: string
  // Results classes
  results: string

  resultsContainer: string
  resultsHeader: string
  resultsList: string

  // Content classes
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
