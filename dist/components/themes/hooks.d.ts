import type { Theme, ThemeConfig, ThemeContextValue } from "./types.js";
declare const ThemeContext: import("react").Context<ThemeContextValue | null>;
/**
 * Hook to access theme context
 */
export declare function useTheme(): ThemeContextValue;
/**
 * Hook to create theme configuration
 */
export declare function useThemeConfig(config: ThemeConfig): ThemeContextValue;
/**
 * Hook to apply theme styles to CSS variables
 */
export declare function useThemeStyles(config: ThemeConfig): Record<string, string>;
/**
 * Hook to get responsive theme configuration
 */
export declare function useResponsiveTheme(baseConfig: ThemeConfig, isMobile: boolean): ThemeConfig;
/**
 * Hook to toggle between light and dark themes
 */
export declare function useThemeToggle(lightConfig: ThemeConfig, darkConfig: ThemeConfig, isDark: boolean): ThemeConfig;
/**
 * Hook to create theme-aware CSS classes
 */
export declare function useThemeClasses(config: ThemeConfig): Record<string, string>;
/**
 * Hook to get theme-aware color values
 */
export declare function useThemeColors(config: ThemeConfig): Theme["colors"];
/**
 * Hook to get theme-aware spacing values
 */
export declare function useThemeSpacing(config: ThemeConfig): Theme["spacing"];
/**
 * Hook to get theme-aware typography values
 */
export declare function useThemeTypography(config: ThemeConfig): Theme["typography"];
/**
 * Hook to detect system theme preference
 */
export declare function useSystemTheme(): "dark" | "light";
/**
 * Hook to create auto theme configuration based on system preference
 */
export declare function useAutoTheme(lightTheme: string, darkTheme: string): string;
/**
 * Hook to create theme with custom overrides
 */
export declare function useCustomTheme(baseThemeName: string, overrides: Partial<ThemeConfig>): ThemeConfig;
export { ThemeContext };
//# sourceMappingURL=hooks.d.ts.map