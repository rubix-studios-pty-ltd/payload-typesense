import React from 'react'

import { ErrorIcon } from '../icons/index.js'
import { type ThemeContextValue } from '../themes/index.js'

type Props = {
  error: string
  errorClassName?: string
  themeConfig: ThemeContextValue
}

export function RenderedResultError({ error, errorClassName = '', themeConfig }: Props) {
  return (
    <div className={`${themeConfig.classes.error} ${errorClassName}`} role="alert">
      <ErrorIcon />
      <div>{error}</div>
    </div>
  )
}
