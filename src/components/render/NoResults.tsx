import React from 'react'

import { NoResultsIcon } from '../icons/index.js'
import { type ThemeContextValue } from '../themes/index.js'

type Props = {
  noResultsClassName?: string
  query: string
  themeConfig: ThemeContextValue
}

export function RenderedNoResults({ noResultsClassName = '', themeConfig }: Props) {
  return (
    <div className={`${themeConfig.classes.noResults} ${noResultsClassName}`} role="status">
      <NoResultsIcon color={themeConfig.theme.colors.metaText} />

      <h3 className={themeConfig.classes.noResultsTitle}>No results found</h3>

      <p className={themeConfig.classes.noResultsDescription}>Try searching for something else</p>
    </div>
  )
}
