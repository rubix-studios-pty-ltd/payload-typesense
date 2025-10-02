'use client';
import { createContext, use } from 'react';
import { useThemeConfig } from './themes/hooks.js';
const ThemeContext = /*#__PURE__*/ createContext(null);
export function ThemeProvider({ children, config }) {
    const themeContext = useThemeConfig(config);
    return /*#__PURE__*/ React.createElement(ThemeContext, {
        value: themeContext
    }, children);
}
export function useTheme() {
    const context = use(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
