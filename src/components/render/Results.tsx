import React from 'react'

import { type SearchResult } from '../../types.js'
import { ClockIcon, CollectionIcon } from '../icons/index.js'
import { type ThemeContextValue } from '../themes/index.js'
import { toText } from '../utils/index.js'
import { Highlight } from './index.js'

type Props<T> = {
  index: number
  onResultClick: (result: SearchResult<T>) => void
  onResultHover?: (result: SearchResult<T>) => void
  renderDate?: boolean
  result: SearchResult<T>
  resultItemClassName?: string
  resultsContainerClassName?: string
  themeConfig: ThemeContextValue
}

export function RenderedResult<T = Record<string, unknown>>({
  onResultClick,
  onResultHover,
  renderDate = true,
  result,
  resultItemClassName = '',
  resultsContainerClassName = '',
  themeConfig,
}: Props<T>) {
  const classes = themeConfig.classes
  const doc = result.document as Record<string, unknown>

  const title = toText(doc.title) || toText(doc.name) || result.title || 'Untitled'
  const snippet =
    result.highlight?.title?.snippet ||
    result.highlight?.content?.snippet ||
    result.highlight?.description?.snippet ||
    result.highlights?.[0]?.snippet
  const description = snippet || toText(doc.description) || toText(doc.content) || result.content

  const dateValue = doc.updatedAt ?? result.updatedAt
  const date =
    typeof dateValue === 'string' || typeof dateValue === 'number' ? new Date(dateValue) : null

  return (
    <div className={resultsContainerClassName}>
      <div
        className={`${classes.resultItem} ${resultItemClassName}`}
        data-result-item
        onClick={() => onResultClick(result)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onResultClick(result)
          }
        }}
        onMouseEnter={() => onResultHover?.(result)}
        role="button"
        tabIndex={0}
      >
        <div className={classes.resultLayout}>
          <div aria-hidden="true" className={classes.resultIcon}>
            {result.collection?.charAt(0).toUpperCase() || '📄'}
          </div>

          <div className={classes.resultBody}>
            <h3 className={classes.resultTitle}>{title}</h3>

            {description && (
              <div className={classes.resultDescription}>
                {snippet ? Highlight(snippet, classes.resultHighlight) : description}
              </div>
            )}

            <div className={classes.resultMeta}>
              {result.collection && (
                <span className={classes.resultMetaItem}>
                  <CollectionIcon />
                  {result.displayName ?? result.collection}
                </span>
              )}

              {renderDate && date && !Number.isNaN(date.getTime()) && (
                <span className={classes.resultMetaItem}>
                  <ClockIcon />
                  {date.toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
