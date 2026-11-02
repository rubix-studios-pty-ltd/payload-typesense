'use client'

import React, {
  type ChangeEvent,
  type FocusEvent,
  Fragment,
  type KeyboardEvent,
  type ReactElement,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'

import { useDebounce } from '../../hooks/useDebounce.js'
import { useSearch } from '../../hooks/useSearch.js'
import { type SearchInputProps } from '../../lib/search-input.js'
import { type SearchResult } from '../../types.js'
import { handleKeyboard } from '../../utils/keyboard.js'
import {
  RenderedHeader,
  RenderedNoResults,
  RenderedResult,
  RenderedResultError,
} from '../render/index.js'
import { useComponentTheme } from '../ThemeProvider.js'
import { SearchStyles } from './SearchStyles.js'

export function HeadlessSearchInput<T = Record<string, unknown>>(
  props: SearchInputProps<T>
): ReactElement {
  const {
    baseUrl,
    className = '',
    collections,
    debounceMs = 300,
    enableSuggestions = true,
    errorClassName = '',
    inputClassName = '',
    inputWrapperClassName = '',
    loadingClassName = '',
    minQueryLength = 2,
    noResultsClassName = '',
    onError,
    onLoading,
    onResultClick,
    onResults,
    onSearch,
    perPage = 10,
    placeholder = 'Search...',
    onResultHover,
    renderDate = true,
    renderError,
    renderInput,
    renderLoading,
    renderNoResults,
    renderResult,
    renderResultsHeader,
    resultItemClassName = '',
    resultsClassName = '',
    resultsContainerClassName = '',
    resultsHeaderClassName = '',
    resultsListClassName = '',
    showLoading = true,
    showResultCount = true,
    theme,
    vector = false,
    searchMode,
    numTypos,
  } = props
  const scope = useId()
  const themeConfig = useComponentTheme(theme)

  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const resultsId = `${scope}-results`

  const classes = themeConfig.classes

  const debouncedQuery = useDebounce(query, debounceMs)

  const { error, isLoading, results, search, reset } = useSearch<T>({
    baseUrl,
    collections,
    minQueryLength,
    onResults,
    onSearch,
    perPage,
    vector,
    searchMode,
    numTypos,
  })

  useEffect(() => {
    if (query === debouncedQuery) {
      void search(debouncedQuery)
    }
  }, [query, debouncedQuery, search])

  useEffect(() => {
    if (error) {
      onError?.(error)
    }
  }, [error, onError])

  useEffect(() => {
    onLoading?.(isLoading)
  }, [isLoading, onLoading])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', outside)

    return () => document.removeEventListener('pointerdown', outside)
  }, [isOpen])

  const clickResult = (result: SearchResult<T>) => {
    onResultClick?.(result)
    setIsOpen(false)
    setQuery('')
    reset()
  }

  const keyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      setIsOpen(false)
      inputRef.current?.focus()
      return
    }

    handleKeyboard(event, { inputRef, isOpen, results, resultsRef })
  }

  const inputProps = {
    'aria-label': 'Search input',
    'aria-controls': isOpen ? resultsId : undefined,
    'aria-busy': isLoading,
    className: `${classes.input} ${inputClassName}`,
    ref: inputRef,
    value: query,
    placeholder,
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      reset()
      setQuery(event.target.value)
      setIsOpen(enableSuggestions && event.target.value.trim().length >= minQueryLength)
    },
    onFocus: () => {
      if (enableSuggestions && query.trim().length >= minQueryLength) {
        setIsOpen(true)
      }
    },
    onBlur: (_event: FocusEvent<HTMLInputElement>) => {},
    onKeyDown: keyDown,
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Closes when lost focus.
    <div
      className={`${classes.container} ${className}`}
      data-search-theme={scope}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false)
      }}
      ref={rootRef}
    >
      <SearchStyles scope={scope} themeConfig={themeConfig} />

      <div className={`${classes.inputContainer} ${inputWrapperClassName}`}>
        {renderInput ? (
          renderInput(inputProps)
        ) : (
          <input {...inputProps} autoComplete="off" type="search" />
        )}

        {isLoading &&
          showLoading &&
          (renderLoading ? (
            renderLoading()
          ) : (
            <div
              aria-label="Searching"
              className={`${classes.loadingIndicator} ${loadingClassName}`}
              role="status"
            >
              <div aria-hidden="true" className={classes.loadingSpinner} />
            </div>
          ))}
      </div>

      {enableSuggestions && isOpen && (results || error) && (
        // biome-ignore lint/a11y/noStaticElementInteractions: Handles keyboard navigation.
        <div
          className={`${classes.resultsContainer} ${resultsContainerClassName}`}
          id={resultsId}
          onKeyDown={keyDown}
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

            {!error && results && (
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

                {results.hits.length ? (
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
          </div>
        </div>
      )}
    </div>
  )
}

export default HeadlessSearchInput
