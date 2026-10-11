import React from 'react'

import { ErrorIcon } from '../icons/index.js'
import { type ThemeContextValue } from '../themes/types.js'

type Props = {
  error: string
  errorClassName?: string
  themeConfig: ThemeContextValue
}

export const RenderedResultError = ({ error, errorClassName = '', themeConfig }: Props) => (
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
    <ErrorIcon />

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
