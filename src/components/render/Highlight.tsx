import React, { Fragment } from 'react'

import { decodeEntities } from '../utils/index.js'

export const Highlight = (snippet: string, className: string) => {
  let highlighted = false

  return snippet.split(/(<mark>|<\/mark>)/g).map((part, index) => {
    if (part === '<mark>') {
      highlighted = true
      return null
    }

    if (part === '</mark>') {
      highlighted = false
      return null
    }

    return highlighted ? (
      <mark className={className} key={index}>
        {decodeEntities(part)}
      </mark>
    ) : (
      <Fragment key={index}>{decodeEntities(part)}</Fragment>
    )
  })
}
