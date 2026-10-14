import React, { Fragment, type RefObject } from 'react'

import { type useSearch } from '../../hooks/useSearch.js'
import { type SearchDialogProps } from '../../lib/search-dialog.js'
import { type SearchPaginationProps } from '../../lib/search-pagination.js'
import { type SearchResult } from '../../types.js'
import { handleKeyboard } from '../../utils/keyboard.js'
import { type ThemeContextValue } from '../themes/index.js'
import { RenderedHeader } from './Header.js'
import { RenderedNoResults } from './NoResults.js'
import { RenderedResultError } from './ResultError.js'
import { RenderedResult } from './Results.js'

type Props<T> = Pick<
  SearchDialogProps<T>,
  | 'renderInput'
  | 'showLoading'
  | 'renderLoading'
  | 'loadingClassName'
  | 'inputWrapperClassName'
  | 'resultsContainerClassName'
  | 'resultsClassName'
  | 'renderError'
  | 'errorClassName'
  | 'showResultCount'
  | 'renderResultsHeader'
  | 'resultsHeaderClassName'
  | 'resultsListClassName'
  | 'renderResult'
  | 'onResultHover'
  | 'renderDate'
  | 'resultItemClassName'
  | 'renderNoResults'
  | 'noResultsClassName'
  | 'renderEmpty'
  | 'showPagination'
  | 'renderPagination'
  | 'paginationClassName'
  | 'paginationButtonClassName'
  | 'previousPageLabel'
  | 'nextPageLabel'
> & {
  query: string
  page: number
  results: ReturnType<typeof useSearch<T>>['results']
  error: ReturnType<typeof useSearch<T>>['error']
  isLoading: boolean
  isOpen: boolean
  resultsId: string
  inputProps: Parameters<NonNullable<SearchDialogProps<T>['renderInput']>>[0]
  inputRef: RefObject<HTMLInputElement | null>
  resultsRef: RefObject<HTMLDivElement | null>
  pagination: SearchPaginationProps
  totalPages: number
  changePage: (page: number) => void
  clickResult: (result: SearchResult<T>) => void
  themeConfig: ThemeContextValue
}

export function RenderedContent<T = Record<string, unknown>>({
  renderInput,
  showLoading = true,
  renderLoading,
  loadingClassName = '',
  inputWrapperClassName = '',
  resultsContainerClassName = '',
  resultsClassName = '',
  renderError,
  errorClassName = '',
  showResultCount = true,
  renderResultsHeader,
  resultsHeaderClassName = '',
  resultsListClassName = '',
  renderResult,
  onResultHover,
  renderDate = true,
  resultItemClassName = '',
  renderNoResults,
  noResultsClassName = '',
  renderEmpty,
  showPagination = true,
  renderPagination,
  paginationClassName = '',
  paginationButtonClassName = '',
  previousPageLabel = 'Previous',
  nextPageLabel = 'Next',
  query,
  page,
  results,
  error,
  isLoading,
  isOpen,
  resultsId,
  inputProps,
  inputRef,
  resultsRef,
  pagination,
  totalPages,
  changePage,
  clickResult,
  themeConfig,
}: Props<T>) {
  const classes = themeConfig.classes

  return (
    <>
      <div className={`${classes.inputContainer} ${inputWrapperClassName}`}>
        {renderInput ? (
          renderInput(inputProps)
        ) : (
          <input {...inputProps} autoComplete="off" type="search" />
        )}
      </div>

      {showLoading &&
        isLoading &&
        (renderLoading ? (
          renderLoading()
        ) : (
          <div className={`${classes.loading} ${loadingClassName}`} role="status">
            <div aria-hidden="true" className={classes.loadingSpinner} />
            Searching...
          </div>
        ))}

      {/* biome-ignore lint/a11y/noStaticElementInteractions: Handles keyboard navigation between focusable search results. */}
      <div
        aria-busy={isLoading}
        className={`${classes.dialogResults} ${resultsContainerClassName}`}
        id={resultsId}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp')
            handleKeyboard(event, { inputRef, isOpen, results, resultsRef })
        }}
        ref={resultsRef}
      >
        <div className={`${classes.results} ${resultsClassName}`}>
          {error &&
            (renderError ? (
              renderError(error)
            ) : (
              <RenderedResultError
                error={error}
                errorClassName={errorClassName}
                themeConfig={themeConfig}
              />
            ))}

          {!error && !isLoading && results && (
            <>
              {showResultCount &&
                (renderResultsHeader ? (
                  renderResultsHeader(results.found)
                ) : (
                  <RenderedHeader
                    found={results.found}
                    resultsHeaderClassName={resultsHeaderClassName}
                    themeConfig={themeConfig}
                  />
                ))}

              {results.hits.length > 0 ? (
                <div className={`${classes.resultsList} ${resultsListClassName}`}>
                  {results.hits.map((result, index) => (
                    <Fragment
                      key={`${result.collection ?? ''}:${result.document?.id ?? result.id ?? index}`}
                    >
                      {renderResult ? (
                        renderResult(result, index, {
                          onClick: clickResult,
                          onHover: onResultHover,
                        })
                      ) : (
                        <RenderedResult<T>
                          index={index}
                          onResultClick={clickResult}
                          onResultHover={onResultHover}
                          renderDate={renderDate}
                          result={result}
                          resultItemClassName={resultItemClassName}
                          themeConfig={themeConfig}
                        />
                      )}
                    </Fragment>
                  ))}
                </div>
              ) : renderNoResults ? (
                renderNoResults(query)
              ) : (
                <RenderedNoResults
                  noResultsClassName={noResultsClassName}
                  query={query}
                  themeConfig={themeConfig}
                />
              )}
            </>
          )}

          {!results && !error && !isLoading && renderEmpty?.()}
        </div>
      </div>

      {showPagination &&
        results &&
        totalPages > 1 &&
        (renderPagination ? (
          renderPagination(pagination)
        ) : (
          <nav
            aria-label="Search result pages"
            className={`${classes.pagination} ${paginationClassName}`}
          >
            <button
              className={`${classes.paginationButton} ${paginationButtonClassName}`}
              disabled={isLoading || !pagination.hasPreviousPage}
              onClick={() => changePage(page - 1)}
              type="button"
            >
              {previousPageLabel}
            </button>

            <span className={classes.paginationStatus} role="status">
              Page {page} of {totalPages}
            </span>

            <button
              className={`${classes.paginationButton} ${paginationButtonClassName}`}
              disabled={isLoading || !pagination.hasNextPage}
              onClick={() => changePage(page + 1)}
              type="button"
            >
              {nextPageLabel}
            </button>
          </nav>
        ))}
    </>
  )
}
