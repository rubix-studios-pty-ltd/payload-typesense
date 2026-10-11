import React from 'react'

import { SearchIcon } from '../icons/index.js'
import { type ThemeContextValue } from '../themes/types.js'

type Props = {
  found: number
  resultsHeaderClassName?: string
  themeConfig: ThemeContextValue
}

export const RenderedHeader = ({ found, resultsHeaderClassName = '', themeConfig }: Props) => (
  <div
    className={resultsHeaderClassName}
    style={{
      alignItems: 'center',
      backgroundColor: themeConfig.theme.colors.headerBackground,
      borderBottom: `1px solid ${themeConfig.theme.colors.headerBorder}`,
      color: themeConfig.theme.colors.headerText,
      display: 'flex',
      fontFamily: themeConfig.theme.typography.fontFamily,
      fontSize: themeConfig.theme.spacing.headerFontSize,
      fontWeight: themeConfig.theme.typography.fontWeightMedium,
      justifyContent: 'space-between',
      padding: themeConfig.theme.spacing.headerPadding,
    }}
  >
    <div style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
      <SearchIcon color={themeConfig.theme.colors.metaText} />

      <span
        style={{
          color: themeConfig.theme.colors.headerText,
          fontSize: themeConfig.theme.typography.fontSizeSm,
          fontWeight: themeConfig.theme.typography.fontWeightMedium,
        }}
      >
        {found} result{found !== 1 ? 's' : ''} found
      </span>
    </div>
  </div>
)
