import type { ThemeConfig, ThemeContextValue } from './themes/types.js';
interface ThemeProviderProps {
    children: React.ReactNode;
    config: ThemeConfig;
}
export declare function ThemeProvider({ children, config }: ThemeProviderProps): import("react").JSX.Element;
export declare function useTheme(): ThemeContextValue;
export {};
//# sourceMappingURL=ThemeProvider.d.ts.map