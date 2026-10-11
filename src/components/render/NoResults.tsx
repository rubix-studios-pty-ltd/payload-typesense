import React from 'react'

import { NoResultsIcon } from '../icons/index.js'
import { type ThemeContextValue } from '../themes/types.js'

type Props = {
  noResultsClassName?: string
  query: string
  themeConfig: ThemeContextValue
}

export const RenderedNoResults = ({
  noResultsClassName = '',
  query: _query,
  themeConfig,
}: Props) => (
  <div
    className={noResultsClassName}
    style={{
      color: themeConfig.theme.colors.noResultsText,
      fontFamily: themeConfig.theme.typography.fontFamily,
      fontSize: themeConfig.theme.typography.fontSizeSm,
      padding: '40px 20px',
      textAlign: 'center',
    }}
  >
    <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
      <NoResultsIcon color={themeConfig.theme.colors.metaText} />

      <h3
        style={{
          color: themeConfig.theme.colors.titleText,
          fontSize: themeConfig.theme.typography.fontSizeSm,
          fontWeight: themeConfig.theme.typography.fontWeightMedium,
          margin: 0,
          marginBottom: '4px',
        }}
      >
        No results found
      </h3>

      <p
        style={{
          color: themeConfig.theme.colors.descriptionText,
          fontSize: themeConfig.theme.typography.fontSizeSm,
          margin: 0,
        }}
      >
        Try searching for something else
      </p>
    </div>
  </div>
)
