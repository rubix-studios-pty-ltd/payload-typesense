export interface ThemeColors {
    collectionBadge: string;
    collectionBadgeText: string;
    descriptionText: string;
    errorBackground: string;
    errorText: string;
    facetActiveBackground: string;
    facetActiveText: string;
    facetBackground: string;
    facetBorder: string;
    facetText: string;
    headerBackground: string;
    headerBorder: string;
    headerText: string;
    highlightBackground: string;
    highlightText: string;
    inputBackground: string;
    inputBorder: string;
    inputBorderFocus: string;
    inputPlaceholder: string;
    inputText: string;
    loadingText: string;
    metaText: string;
    noResultsText: string;
    resultBackground: string;
    resultBackgroundFocus: string;
    resultBackgroundHover: string;
    resultBorder: string;
    resultsBackground: string;
    resultsBorder: string;
    resultsShadow: string;
    scoreBadge: string;
    scoreBadgeText: string;
    titleText: string;
}
export interface ThemeSpacing {
    headerFontSize: string;
    headerPadding: string;
    inputBorderRadius: string;
    inputFontSize: string;
    inputPadding: string;
    itemBorderRadius: string;
    itemMargin: string;
    itemPadding: string;
    metaFontSize: string;
    metaPadding: string;
    resultsBorderRadius: string;
    resultsMaxHeight: string;
    resultsPadding: string;
}
export interface ThemeTypography {
    fontFamily: string;
    fontFamilyMono: string;
    fontSize2xl: string;
    fontSizeBase: string;
    fontSizeLg: string;
    fontSizeSm: string;
    fontSizeXl: string;
    fontSizeXs: string;
    fontWeightBold: string;
    fontWeightMedium: string;
    fontWeightNormal: string;
    fontWeightSemibold: string;
    lineHeightNormal: string;
    lineHeightRelaxed: string;
    lineHeightTight: string;
}
export interface ThemeAnimations {
    animationFast: string;
    animationNormal: string;
    animationSlow: string;
    easeIn: string;
    easeInOut: string;
    easeOut: string;
    transitionFast: string;
    transitionNormal: string;
    transitionSlow: string;
}
export interface ThemeShadows {
    focusShadow: string;
    focusShadowColor: string;
    shadowLg: string;
    shadowMd: string;
    shadowSm: string;
    shadowXl: string;
}
export interface Theme {
    animations: ThemeAnimations;
    colors: ThemeColors;
    name: string;
    shadows: ThemeShadows;
    spacing: ThemeSpacing;
    typography: ThemeTypography;
}
export interface ThemeConfig {
    animations?: Partial<ThemeAnimations>;
    colors?: Partial<ThemeColors>;
    enableAnimations?: boolean;
    enableRoundedCorners?: boolean;
    enableShadows?: boolean;
    mobileOptimized?: boolean;
    responsive?: boolean;
    shadows?: Partial<ThemeShadows>;
    spacing?: Partial<ThemeSpacing>;
    theme: string | Theme;
    typography?: Partial<ThemeTypography>;
}
export interface ThemeClasses {
    collectionBadge: string;
    container: string;
    error: string;
    facetContainer: string;
    facetItem: string;
    facetItemActive: string;
    focusable: string;
    hidden: string;
    input: string;
    inputContainer: string;
    inputDisabled: string;
    inputFocus: string;
    loading: string;
    loadingSpinner: string;
    noResults: string;
    resultDescription: string;
    resultHighlight: string;
    resultItem: string;
    resultItemActive: string;
    resultItemFocus: string;
    resultItemHover: string;
    resultMeta: string;
    results: string;
    resultsContainer: string;
    resultsHeader: string;
    resultsList: string;
    resultTitle: string;
    scoreBadge: string;
    visible: string;
}
export interface ThemeContextValue {
    applyTheme: (element: string, variant?: string) => string;
    classes: ThemeClasses;
    config: ThemeConfig;
    isDark: boolean;
    isLight: boolean;
    theme: Theme;
}
//# sourceMappingURL=types.d.ts.map