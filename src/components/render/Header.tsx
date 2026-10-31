import React from 'react'

import { SearchIcon } from '../icons/index.js'
import { type ThemeContextValue } from '../themes/index.js'

type Props = {
  found: number
  resultsHeaderClassName?: string
  themeConfig: ThemeContextValue
}

export function RenderedHeader({ found, resultsHeaderClassName = '', themeConfig }: Props) {
  return (
    <div className={`${themeConfig.classes.resultsHeader} ${resultsHeaderClassName}`}>
      <SearchIcon color={themeConfig.theme.colors.metaText} />

      <span>
        {found} result{found !== 1 ? 's' : ''} found
      </span>
    </div>
  )
}
