"use client";
import { createContext, useCallback, useContext, useMemo } from "react";
import { applyTheme, generateThemeClasses, getThemeVariables, isDarkTheme, isLightTheme, mergeThemeConfig } from "./utils.js";
// Theme context
const ThemeContext = createContext(null);
/**
 * Hook to access theme context
 */ export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
/**
 * Hook to create theme configuration
 */ export function useThemeConfig(config) {
    const theme = useMemo(()=>mergeThemeConfig(config), [
        config
    ]);
    const classes = useMemo(()=>generateThemeClasses(theme, config), [
        theme,
        config
    ]);
    const applyThemeToElement = useCallback((element, variant)=>applyTheme(theme, element, variant), [
        theme
    ]);
    return useMemo(()=>({
            applyTheme: applyThemeToElement,
            classes,
            config,
            isDark: isDarkTheme(theme),
            isLight: isLightTheme(theme),
            theme
        }), [
        theme,
        config,
        classes,
        applyThemeToElement
    ]);
}
/**
 * Hook to apply theme styles to CSS variables
 */ export function useThemeStyles(config) {
    return useMemo(()=>{
        const theme = mergeThemeConfig(config);
        return getThemeVariables(theme);
    }, [
        config
    ]);
}
/**
 * Hook to get responsive theme configuration
 */ export function useResponsiveTheme(baseConfig, isMobile) {
    return useMemo(()=>{
        if (!baseConfig.responsive) {
            return baseConfig;
        }
        const mobileConfig = {
            ...baseConfig,
            spacing: {
                ...baseConfig.spacing,
                // Adjust spacing for mobile
                headerPadding: "0.75rem 1rem",
                inputFontSize: "16px",
                inputPadding: "0.875rem 1rem",
                itemPadding: "0.875rem 1rem",
                resultsMaxHeight: "20rem"
            },
            // Disable animations on mobile for better performance
            animations: isMobile ? {
                ...baseConfig.animations,
                transitionFast: "0s",
                transitionNormal: "0s",
                transitionSlow: "0s"
            } : baseConfig.animations
        };
        return mobileConfig;
    }, [
        baseConfig,
        isMobile
    ]);
}
/**
 * Hook to toggle between light and dark themes
 */ export function useThemeToggle(lightConfig, darkConfig, isDark) {
    return useMemo(()=>{
        return isDark ? darkConfig : lightConfig;
    }, [
        lightConfig,
        darkConfig,
        isDark
    ]);
}
/**
 * Hook to create theme-aware CSS classes
 */ export function useThemeClasses(config) {
    return useMemo(()=>{
        const theme = mergeThemeConfig(config);
        const classes = generateThemeClasses(theme, config);
        // Convert to a more usable format
        const classMap = {};
        Object.entries(classes).forEach(([key, value])=>{
            classMap[key] = value;
        });
        return classMap;
    }, [
        config
    ]);
}
/**
 * Hook to get theme-aware color values
 */ export function useThemeColors(config) {
    return useMemo(()=>{
        const theme = mergeThemeConfig(config);
        return theme.colors;
    }, [
        config
    ]);
}
/**
 * Hook to get theme-aware spacing values
 */ export function useThemeSpacing(config) {
    return useMemo(()=>{
        const theme = mergeThemeConfig(config);
        return theme.spacing;
    }, [
        config
    ]);
}
/**
 * Hook to get theme-aware typography values
 */ export function useThemeTypography(config) {
    return useMemo(()=>{
        const theme = mergeThemeConfig(config);
        return theme.typography;
    }, [
        config
    ]);
}
/**
 * Hook to detect system theme preference
 */ export function useSystemTheme() {
    return useMemo(()=>{
        if (typeof window === "undefined") {
            return "light";
        }
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }, []);
}
/**
 * Hook to create auto theme configuration based on system preference
 */ export function useAutoTheme(lightTheme, darkTheme) {
    const systemTheme = useSystemTheme();
    return useMemo(()=>{
        return systemTheme === "dark" ? darkTheme : lightTheme;
    }, [
        systemTheme,
        lightTheme,
        darkTheme
    ]);
}
/**
 * Hook to create theme with custom overrides
 */ export function useCustomTheme(baseThemeName, overrides) {
    return useMemo(()=>{
        return {
            theme: baseThemeName,
            ...overrides
        };
    }, [
        baseThemeName,
        overrides
    ]);
}
// Export context for provider
export { ThemeContext };
