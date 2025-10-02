import type { Theme, ThemeClasses, ThemeConfig } from "./types.js";
/**
 * Get a theme by name or return the default theme
 */
export declare function getTheme(themeName: string): Theme;
/**
 * Merge theme configurations with custom overrides
 */
export declare function mergeThemeConfig(config: ThemeConfig): Theme;
/**
 * Generate CSS classes from theme configuration
 */
export declare function generateThemeClasses(theme: Theme, config?: Partial<ThemeConfig>): ThemeClasses;
/**
 * Apply theme to a CSS class with optional variant
 */
export declare function applyTheme(theme: Theme, element: string, variant?: string): string;
/**
 * Check if theme is dark mode
 */
export declare function isDarkTheme(theme: Theme): boolean;
/**
 * Check if theme is light mode
 */
export declare function isLightTheme(theme: Theme): boolean;
/**
 * Get theme-specific CSS variables
 */
export declare function getThemeVariables(theme: Theme): Record<string, string>;
//# sourceMappingURL=utils.d.ts.map