'use client'

import React, { useCallback, useEffect, useId, useRef, useState } from 'react'

import { useDebounce } from '../hooks/useDebounce.js'
import { useSearch } from '../hooks/useSearch.js'
import {
  type HeadlessSearchDialogProps,
  type SearchPaginationProps,
} from '../lib/headlessSearchDialog.js'
import { type SearchResult } from '../types.js'
import { handleKeyboard } from '../utils/keyboard.js'
import {
  RenderedHeader,
  RenderedNoResults,
  RenderedResult,
  RenderedResultError,
} from './render/index.js'
import { SearchStyles } from './SearchThemeStyles.js'
import { useComponentTheme } from './ThemeProvider.js'

export function HeadlessSearchDialog<T = Record<string, unknown>>(
  props: HeadlessSearchDialogProps<T>
): React.ReactElement {
  const {
    baseUrl,
    collections,
    debounceMs = 300,
    minQueryLength = 2,
    perPage = 10,
    searchMode,
    numTypos,
    vector,
    onResults,
    onSearch,
    onError,
    onLoading,
    onResultClick,
    onResultHover,
    theme,
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    initialQuery = '',
    title = 'Search',
    dialogLabel,
    triggerLabel = 'Search',
    closeLabel = 'Close',
    previousPageLabel = 'Previous',
    nextPageLabel = 'Next',
    closeOnResultClick = true,
    closeOnBackdropClick = true,
    clearOnClose = false,
    showPagination = true,
    onPageChange,
    renderTrigger,
    renderDialogHeader,
    renderDialogContent,
    renderPagination,
    renderEmpty,
    renderInput,
    renderResult,
    renderError,
    renderLoading,
    renderNoResults,
    renderResultsHeader,
    renderDate = true,
    showLoading = true,
    showResultCount = true,
    placeholder = 'Search...',
    className = '',
    triggerClassName = '',
    dialogClassName = '',
    dialogHeaderClassName = '',
    dialogContentClassName = '',
    closeButtonClassName = '',
    paginationClassName = '',
    paginationButtonClassName = '',
    inputClassName = '',
    inputWrapperClassName = '',
    loadingClassName = '',
    errorClassName = '',
    noResultsClassName = '',
    resultsClassName = '',
    resultsContainerClassName = '',
    resultsHeaderClassName = '',
    resultsListClassName = '',
    resultItemClassName = '',
    triggerProps,
    dialogProps,
  } = props
  const scope = useId()
  const themeConfig = useComponentTheme(theme)

  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const [query, setQuery] = useState(initialQuery)
  const [page, setPage] = useState(1)

  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)

  const isOpen = controlledOpen ?? internalOpen
  const wasOpenRef = useRef(isOpen)

  const dialogId = dialogProps?.id ?? `${scope}-dialog`
  const resultsId = `${scope}-results`

  const classes = themeConfig.classes

  const debouncedQuery = useDebounce(query, debounceMs)

  const { results, error, isLoading, search, reset } = useSearch<T>({
    baseUrl,
    collections,
    enabled: isOpen,
    minQueryLength,
    perPage,
    searchMode,
    numTypos,
    vector,
    onResults,
    onSearch,
  })

  const changeOpen = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) {
        setInternalOpen(next)
      }

      onOpenChange?.(next)
    },
    [controlledOpen, onOpenChange]
  )

  const close = useCallback(() => changeOpen(false), [changeOpen])

  useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) {
      return
    }

    if (isOpen && !dialog.open) {
      openerRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : triggerRef.current

      dialog.showModal()
      inputRef.current?.focus()
    } else if (!isOpen && dialog.open) {
      dialog.close()
      openerRef.current?.focus()
    }

    if (!isOpen && wasOpenRef.current && clearOnClose) {
      setQuery('')
      setPage(1)
    }

    wasOpenRef.current = isOpen
  }, [isOpen, clearOnClose])

  useEffect(() => {
    const dialog = dialogRef.current

    return () => {
      if (dialog?.open) {
        dialog.close()
      }
    }
  }, [])

  useEffect(() => {
    if (isOpen && query === debouncedQuery) {
      void search(debouncedQuery, page)
    }
  }, [isOpen, query, debouncedQuery, page, search])

  useEffect(() => {
    if (error) {
      onError?.(error)
    }
  }, [error, onError])

  useEffect(() => {
    onLoading?.(isLoading)
  }, [isLoading, onLoading])

  const collectionKey = collections?.join(',')

  useEffect(() => {
    setPage(1)
  }, [baseUrl, collectionKey, perPage, searchMode, numTypos, vector])

  const totalPages = results ? Math.ceil(results.found / perPage) : 0

  useEffect(() => {
    if (results && !isLoading && page > Math.max(1, totalPages)) {
      setPage(Math.max(1, totalPages))
    }
  }, [results, isLoading, page, totalPages])

  const clickResult = (result: SearchResult<T>) => {
    onResultClick?.(result)

    if (closeOnResultClick) {
      close()
    }
  }

  const changePage = (next: number) => {
    if (isLoading || !Number.isInteger(next) || next < 1 || next > totalPages || next === page) {
      return
    }

    setPage(next)
    onPageChange?.(next)

    if (resultsRef.current) {
      resultsRef.current.scrollTop = 0
    }

    inputRef.current?.focus()
  }

  const inputProps = {
    'aria-label': 'Search input',
    'aria-controls': resultsId,
    'aria-busy': isLoading,
    className: `${classes.input} ${inputClassName}`,
    ref: inputRef,
    value: query,
    placeholder,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      reset()
      setQuery(event.target.value)
      setPage(1)
    },
    onFocus: () => {},
    onBlur: (_event: React.FocusEvent<HTMLInputElement>) => {},
    onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        handleKeyboard(event, { inputRef, isOpen, results, resultsRef })
      }
    },
  }

  const buttonProps = {
    ...triggerProps,
    type: 'button' as const,
    ref: triggerRef,
    'aria-haspopup': 'dialog' as const,
    'aria-expanded': isOpen,
    'aria-controls': dialogId,
    className: `${classes.trigger} ${triggerClassName} ${triggerProps?.className ?? ''}`,
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
      triggerProps?.onClick?.(event)
      if (!event.defaultPrevented) changeOpen(true)
    },
    children: triggerLabel,
  }

  const pagination: SearchPaginationProps = {
    page,
    perPage,
    found: results?.found ?? 0,
    totalPages,
    isLoading,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
    onPageChange: changePage,
  }

  const content = (
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
                    <React.Fragment
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
                    </React.Fragment>
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

  return (
    <div className={`${classes.dialogRoot} ${className}`} data-search-theme={scope}>
      <SearchStyles scope={scope} themeConfig={themeConfig} />

      {renderTrigger ? renderTrigger(buttonProps) : <button {...buttonProps} />}

      {/* biome-ignore lint/a11y/useKeyWithClickEvents: Backdrop clicks dismiss the dialog; keyboard dismissal uses Escape through onCancel. */}
      <dialog
        {...dialogProps}
        aria-label={
          dialogProps?.['aria-label'] ??
          dialogLabel ??
          (typeof title === 'string' ? title : 'Search')
        }
        className={`${classes.dialog} ${dialogClassName} ${dialogProps?.className ?? ''}`}
        id={dialogId}
        onCancel={(event) => {
          event.preventDefault()
          close()
        }}
        onClick={(event) => {
          if (!closeOnBackdropClick || event.target !== event.currentTarget) {
            return
          }

          const rect = event.currentTarget.getBoundingClientRect()

          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          ) {
            close()
          }
        }}
        onClose={() => {
          if (isOpen && !dialogRef.current?.open) {
            close()
          }
        }}
        ref={dialogRef}
      >
        {renderDialogHeader ? (
          renderDialogHeader({ title, close })
        ) : (
          <div className={`${classes.dialogHeader} ${dialogHeaderClassName}`}>
            <h2 className={classes.dialogTitle}>{title}</h2>

            <button
              className={`${classes.closeButton} ${closeButtonClassName}`}
              onClick={close}
              type="button"
            >
              {closeLabel}
            </button>
          </div>
        )}

        <div className={`${classes.dialogContent} ${dialogContentClassName}`}>
          {renderDialogContent
            ? renderDialogContent({
                children: content,
                close,
                query,
                page,
                results,
                isLoading,
                error,
              })
            : content}
        </div>
      </dialog>
    </div>
  )
}
export default HeadlessSearchDialog
