import { type ThemeContextValue } from '../themes/types.js'

interface RenderedResultErrorProps {
  error: string
  errorClassName?: string
  themeConfig: ThemeContextValue
}

export const RenderedResultError = ({
  error,
  errorClassName = '',
  themeConfig,
}: RenderedResultErrorProps) => (
  <div
    className={errorClassName}
    style={{
      alignItems: 'center',
      backgroundColor: themeConfig.theme.colors.errorBackground,
      borderBottom: `1px solid ${themeConfig.theme.colors.resultBorder}`,
      color: themeConfig.theme.colors.errorText,
      display: 'flex',
      fontFamily: themeConfig.theme.typography.fontFamily,
      fontSize: themeConfig.theme.typography.fontSizeSm,
      gap: '8px',
      padding: '16px',
    }}
  >
    <svg
      fill="currentColor"
      style={{ flexShrink: 0, height: '20px', width: '20px' }}
      viewBox="0 0 20 20"
    >
      <path
        clipRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
        fillRule="evenodd"
      />
    </svg>
    <div>
      <h3
        style={{
          fontSize: themeConfig.theme.typography.fontSizeSm,
          fontWeight: themeConfig.theme.typography.fontWeightMedium,
          margin: 0,
        }}
      >
        Search Error
      </h3>
      <p
        style={{
          color: themeConfig.theme.colors.errorText,
          fontSize: themeConfig.theme.typography.fontSizeSm,
          margin: 0,
        }}
      >
        {error}
      </p>
    </div>
  </div>
)
