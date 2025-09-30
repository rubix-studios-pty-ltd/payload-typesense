'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import type { BaseSearchInputProps, SearchResponse, SearchResult } from '../lib/types.js'
import type { ThemeConfig } from './themes/types.js'

import { useThemeConfig } from './themes/hooks.js'

export interface HeadlessSearchInputProps<T = Record<string, unknown>>
  extends BaseSearchInputProps<T> {
  /**
   * Collection to search in (for single collection search)
   */
  collection?: string
  /**
   * Collections to search in (for multi-collection search)
   */
  collections?: string[]
  /**
   * Enable suggestions
   */
  enableSuggestions?: boolean
  /**
   * Number of results to show per page
   */
  perPage?: number
  /**
   * Custom render function for error state
   */
  renderError?: (error: string) => React.ReactNode
  /**
   * Custom input element (for complete control)
   */
  renderInput?: (props: {
    className: string
    onBlur: (e: React.FocusEvent) => void
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onFocus: () => void
    onKeyDown: (e: React.KeyboardEvent) => void
    placeholder: string
    ref: React.RefObject<HTMLInputElement | null>
    value: string
  }) => React.ReactNode
  /**
   * Custom render function for loading state
   */
  renderLoading?: () => React.ReactNode
  /**
   * Custom render function for no results
   */
  renderNoResults?: (query: string) => React.ReactNode
  /**
   * Custom render function for results
   */
  renderResult?: (result: SearchResult<T>, index: number) => React.ReactNode
  /**
   * Custom render function for results header
   */
  renderResultsHeader?: (found: number, searchTime: number) => React.ReactNode
  /**
   * Custom CSS class for results container
   */
  resultContainerClassName?: string
  /**
   * Custom CSS class for individual result items
   */
  resultItemClassName?: string
  /**
   * Custom CSS class for the results container
   */
  resultsClassName?: string
  /**
   * Show loading state
   */
  showLoading?: boolean
  /**
   * Show result count
   */
  showResultCount?: boolean
  /**
   * Show search time
   */
  showSearchTime?: boolean
  /**
   * Theme configuration
   */
  theme?: string | ThemeConfig
}

const HeadlessSearchInput = <T = Record<string, unknown>,>({
  baseUrl,
  className = '',
  collection,
  collections,
  debounceMs = 300,
  enableSuggestions: _enableSuggestions = true,
  errorClassName = '',
  inputClassName = '',
  inputWrapperClassName = '',
  loadingClassName = '',
  minQueryLength = 2,
  noResultsClassName = '',
  onResultClick,
  onResults,
  onSearch,
  perPage = 10,
  placeholder = 'Search...',
  renderError,
  renderInput,
  renderLoading: _renderLoading,
  renderNoResults,
  renderResult,
  renderResultsHeader,
  resultContainerClassName = '',
  resultItemClassName = '',
  resultsClassName = '',
  resultsHeaderClassName = '',
  resultsListClassName = '',
  showLoading = true,
  showResultCount = true,
  showSearchTime = true,
  theme = 'modern',
}: HeadlessSearchInputProps<T>): React.ReactElement => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<null | SearchResponse<T>>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<null | string>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const collectionsRef = useRef(collections)

  // Theme configuration
  const themeConfig = useThemeConfig({
    theme: typeof theme === 'string' ? theme : theme.theme || 'modern',
    ...(typeof theme === 'object' ? theme : {}),
  })

  // Note: If neither collection nor collections is provided, the component will search all collections

  // Update collections ref when prop changes
  useEffect(() => {
    collectionsRef.current = collections
  }, [collections])

  // Debounced search function
  // Use refs to avoid recreating functions on every render
  const onResultsRef = useRef(onResults)
  const onSearchRef = useRef(onSearch)
  onResultsRef.current = onResults
  onSearchRef.current = onSearch

  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < minQueryLength) {
        setResults(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        let searchUrl: string
        let searchResults: SearchResponse<T>

        if (collection) {
          // Single collection search
          searchUrl = `${baseUrl}/api/search/${collection}?q=${encodeURIComponent(searchQuery)}&per_page=${perPage}`
        } else if (collectionsRef.current && collectionsRef.current.length > 0) {
          // Multiple collections specified - use universal search and filter client-side
          searchUrl = `${baseUrl}/api/search?q=${encodeURIComponent(searchQuery)}&per_page=${perPage * 2}`
        } else {
          // No collections specified - use universal search
          searchUrl = `${baseUrl}/api/search?q=${encodeURIComponent(searchQuery)}&per_page=${perPage}`
        }

        const response = await fetch(searchUrl)

        if (!response.ok) {
          throw new Error(`Search failed: ${response.status} ${response.statusText}`)
        }

        searchResults = await response.json()

        // Filter results if specific collections were requested
        if (collectionsRef.current && collectionsRef.current.length > 0) {
          const filteredHits =
            searchResults.hits?.filter(
              (hit) => hit.collection && collectionsRef.current!.includes(hit.collection),
            ) || []

          const filteredCollections =
            searchResults.collections?.filter(
              (col) => col.collection && collectionsRef.current!.includes(col.collection),
            ) || []

          searchResults = {
            ...searchResults,
            collections: filteredCollections,
            found: filteredHits.length,
            hits: filteredHits,
          }
        }

        setResults(searchResults)
        onResultsRef.current?.(searchResults)
        onSearchRef.current?.(searchQuery, searchResults)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed')
        setResults(null)
      } finally {
        setIsLoading(false)
      }
    },
    [baseUrl, collection, perPage, minQueryLength],
  )

  // Debounced search effect
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (query.length >= minQueryLength) {
      debounceRef.current = setTimeout(() => {
        void performSearch(query)
        void onSearchRef.current?.(
          query,
          results || {
            found: 0,
            hits: [],
            page: 1,
            request_params: { per_page: 10, q: query },
            search_cutoff: false,
            search_time_ms: 0,
          },
        )
      }, debounceMs)
    } else {
      setResults(null)
      setIsLoading(false)
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, debounceMs, minQueryLength, performSearch])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setIsOpen(value.length >= minQueryLength)
  }

  // Handle input focus
  const handleInputFocus = () => {
    if (query.length >= minQueryLength) {
      setIsOpen(true)
    }
  }

  // Handle input blur
  const handleInputBlur = (_e: React.FocusEvent) => {
    // Delay hiding results to allow clicking on them
    setTimeout(() => {
      if (!resultsRef.current?.contains(document.activeElement)) {
        setIsOpen(false)
      }
    }, 150)
  }

  // Handle result click
  const handleResultClick = (result: SearchResult<T>) => {
    onResultClick?.(result)
    setIsOpen(false)
    setQuery('')
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || !results) {
      return
    }

    const resultItems = resultsRef.current?.querySelectorAll('[data-result-item]')
    if (!resultItems) {
      return
    }

    const currentIndex = Array.from(resultItems).findIndex(
      (item) => item === document.activeElement,
    )

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault()
        const nextIndex = currentIndex < resultItems.length - 1 ? currentIndex + 1 : 0
        ;(resultItems[nextIndex] as HTMLElement)?.focus()
        break
      }
      case 'ArrowUp': {
        e.preventDefault()
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : resultItems.length - 1
        ;(resultItems[prevIndex] as HTMLElement)?.focus()
        break
      }
      case 'Enter':
        e.preventDefault()
        if (currentIndex >= 0 && resultItems[currentIndex]) {
          ;(resultItems[currentIndex] as HTMLElement)?.click()
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  // Default render functions
  const defaultRenderResult = (result: SearchResult, _index: number) => {
    // Calculate relative percentage based on the highest score in current results
    const maxScore = results?.hits?.reduce((max, hit) => Math.max(max, hit.text_match || 0), 0) || 1
    const relativePercentage = Math.round(((result.text_match || 0) / maxScore) * 100)

    return (
      <div
        className={`${resultContainerClassName}`}
      >
        <div
          className={`${themeConfig.classes.resultItem} ${resultItemClassName}`}
          data-result-item
          key={result.document?.id || result.id || _index}
          onBlur={(e) => {
            e.currentTarget.style.backgroundColor = themeConfig.theme.colors.resultBackground
          }}
          onClick={() => handleResultClick(result)}
          onFocus={(e) => {
            e.currentTarget.style.backgroundColor = themeConfig.theme.colors.resultBackgroundFocus
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleResultClick(result)
            }
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = themeConfig.theme.colors.resultBackgroundHover
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = themeConfig.theme.colors.resultBackground
          }}
          role="button"
          style={{
            backgroundColor: themeConfig.theme.colors.resultBackground,
            borderBottom: `1px solid ${themeConfig.theme.colors.resultBorder}`,
            cursor: 'pointer',
            padding: themeConfig.theme.spacing.itemPadding,
            transition:
              themeConfig.config.enableAnimations !== false
                ? `all ${themeConfig.theme.animations.transitionFast} ${themeConfig.theme.animations.easeInOut}`
                : 'none',
          }}
          tabIndex={0}
        >
          <div style={{ alignItems: 'flex-start', display: 'flex', gap: '12px' }}>
            {/* Collection Icon */}
            <div style={{ flexShrink: 0, marginTop: '4px' }}>
              <div
                style={{
                  alignItems: 'center',
                  backgroundColor: themeConfig.theme.colors.collectionBadge,
                  borderRadius: themeConfig.theme.spacing.inputBorderRadius,
                  color: themeConfig.theme.colors.collectionBadgeText,
                  display: 'flex',
                  fontSize: '14px',
                  fontWeight: themeConfig.theme.typography.fontWeightMedium,
                  height: '32px',
                  justifyContent: 'center',
                  width: '32px',
                }}
              >
                {result.collection?.charAt(0).toUpperCase() || '📄'}
              </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  alignItems: 'center',
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}
              >
                <h3
                  style={{
                    color: themeConfig.theme.colors.titleText,
                    fontFamily: themeConfig.theme.typography.fontFamily,
                    fontSize: themeConfig.theme.typography.fontSizeLg,
                    fontWeight: themeConfig.theme.typography.fontWeightSemibold,
                    lineHeight: themeConfig.theme.typography.lineHeightTight,
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {result.document?.title || result.document?.name || result.title || 'Untitled'}
                </h3>
                {typeof result.text_match === 'number' && !isNaN(result.text_match) && (
                  <span
                    style={{
                      alignItems: 'center',
                      backgroundColor: themeConfig.theme.colors.scoreBadge,
                      borderRadius: '4px',
                      color: themeConfig.theme.colors.scoreBadgeText,
                      display: 'inline-flex',
                      fontSize: themeConfig.theme.typography.fontSizeXs,
                      fontWeight: themeConfig.theme.typography.fontWeightMedium,
                      marginLeft: '8px',
                      padding: '2px 6px',
                    }}
                  >
                    {relativePercentage}%
                  </span>
                )}
              </div>

              {(result.highlight?.title?.snippet || result.highlight?.content?.snippet) && (
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      result.highlight?.title?.snippet || result.highlight?.content?.snippet || '',
                  }}
                  style={{
                    color: themeConfig.theme.colors.descriptionText,
                    display: '-webkit-box',
                    fontSize: themeConfig.theme.typography.fontSizeSm,
                    lineHeight: themeConfig.theme.typography.lineHeightNormal,
                    marginTop: '4px',
                    overflow: 'hidden',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 2,
                  }}
                />
              )}

              <div
                style={{
                  alignItems: 'center',
                  color: themeConfig.theme.colors.metaText,
                  display: 'flex',
                  fontSize: themeConfig.theme.typography.fontSizeXs,
                  gap: '12px',
                  marginTop: '8px',
                }}
              >
                <span style={{ alignItems: 'center', display: 'inline-flex' }}>
                  <svg
                    fill="currentColor"
                    style={{ height: '12px', marginRight: '4px', width: '12px' }}
                    viewBox="0 0 20 20"
                  >
                    <path
                      clipRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      fillRule="evenodd"
                    />
                  </svg>
                  {result.collection}
                </span>
                {(result.document?.updatedAt || result.updatedAt) && (
                  <span style={{ alignItems: 'center', display: 'inline-flex' }}>
                    <svg
                      fill="currentColor"
                      style={{ height: '12px', marginRight: '4px', width: '12px' }}
                      viewBox="0 0 20 20"
                    >
                      <path
                        clipRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        fillRule="evenodd"
                      />
                    </svg>
                    {new Date(result.document?.updatedAt || result.updatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* Arrow Icon */}
            <div
              style={{
                flexShrink: 0,
                opacity: 0,
                transition: `opacity ${themeConfig.theme.animations.transitionNormal} ${themeConfig.theme.animations.easeInOut}`,
              }}
            >
              <svg
                fill="none"
                stroke="currentColor"
                style={{ color: themeConfig.theme.colors.metaText, height: '16px', width: '16px' }}
                viewBox="0 0 24 24"
              >
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
              </svg>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const defaultRenderNoResults = (_query: string) => (
    <div
      className={`${noResultsClassName}`}
      style={{
        color: themeConfig.theme.colors.noResultsText,
        fontFamily: themeConfig.theme.typography.fontFamily,
        fontSize: themeConfig.theme.typography.fontSizeSm,
        padding: '40px 20px',
        textAlign: 'center',
      }}
    >
      <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
        <svg
          fill="none"
          stroke="currentColor"
          style={{
            color: themeConfig.theme.colors.metaText,
            height: '48px',
            marginBottom: '12px',
            width: '48px',
          }}
          viewBox="0 0 24 24"
        >
          <path
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
          />
        </svg>
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

  const _defaultRenderLoading = () => (
    <div
      className={`${loadingClassName}`}
      style={{
        alignItems: 'center',
        color: themeConfig.theme.colors.loadingText,
        display: 'flex',
        fontFamily: themeConfig.theme.typography.fontFamily,
        fontSize: themeConfig.theme.typography.fontSizeSm,
        gap: '12px',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          animation: `spin 1s linear infinite`,
          border: `2px solid ${themeConfig.theme.colors.inputBorder}`,
          borderRadius: '50%',
          borderTop: `2px solid ${themeConfig.theme.colors.inputBorderFocus}`,
          height: '20px',
          width: '20px',
        }}
      />
      <span>Searching...</span>
    </div>
  )

  const defaultRenderError = (error: string) => (
    <div
      className={`${errorClassName}`}
      style={{
        alignItems: 'center',
        backgroundColor: themeConfig.theme.colors.errorBackground,
        borderBottom: `1px solid ${themeConfig.theme.colors.resultBorder}`,
        color: themeConfig.theme.colors.errorText,
        display: 'flex',
        fontFamily: themeConfig.theme.typography.fontFamily,
        fontSize: themeConfig.theme.typography.fontSizeSm,
        gap: '8px',
        padding: '16px',
      }}
    >
      <svg
        fill="currentColor"
        style={{ flexShrink: 0, height: '20px', width: '20px' }}
        viewBox="0 0 20 20"
      >
        <path
          clipRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          fillRule="evenodd"
        />
      </svg>
      <div>
        <h3
          style={{
            fontSize: themeConfig.theme.typography.fontSizeSm,
            fontWeight: themeConfig.theme.typography.fontWeightMedium,
            margin: 0,
          }}
        >
          Search Error
        </h3>
        <p
          style={{
            color: themeConfig.theme.colors.errorText,
            fontSize: themeConfig.theme.typography.fontSizeSm,
            margin: 0,
          }}
        >
          {error}
        </p>
      </div>
    </div>
  )

  const defaultRenderResultsHeader = (found: number, searchTime: number) => (
    <div
      className={`${resultsHeaderClassName}`}
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
        <svg
          fill="currentColor"
          style={{ color: themeConfig.theme.colors.metaText, height: '16px', width: '16px' }}
          viewBox="0 0 20 20"
        >
          <path
            clipRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            fillRule="evenodd"
          />
        </svg>
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
      {showSearchTime && (
        <span
          style={{
            backgroundColor: themeConfig.theme.colors.inputBorder,
            borderRadius: '12px',
            color: themeConfig.theme.colors.metaText,
            fontSize: themeConfig.theme.typography.fontSizeXs,
            padding: '4px 8px',
          }}
        >
          {searchTime}ms
        </span>
      )}
    </div>
  )

  return (
    <div
      className={`${className}`}
      style={{
        margin: '0 auto',
        maxWidth: '600px',
        position: 'relative',
        width: '100%',
      }}
    >
      <div
        className={`${inputWrapperClassName}`}
        style={{
          position: 'relative',
          width: '100%',
        }}
      >
        {renderInput ? (
          renderInput({
            className: `${inputClassName}`,
            onBlur: handleInputBlur,
            onChange: handleInputChange,
            onFocus: handleInputFocus,
            onKeyDown: handleKeyDown,
            placeholder,
            ref: inputRef,
            value: query,
          })
        ) : (
          <input
            aria-label="Search input"
            autoComplete="off"
            className={`${inputClassName}`}
            onBlur={(e) => {
              e.target.style.borderColor = themeConfig.theme.colors.inputBorder
              e.target.style.boxShadow = 'none'
              handleInputBlur(e)
            }}
            onChange={handleInputChange}
            onFocus={(e) => {
              e.target.style.borderColor = themeConfig.theme.colors.inputBorderFocus
              e.target.style.boxShadow =
                themeConfig.config.enableShadows !== false
                  ? `0 0 0 3px ${themeConfig.theme.colors.inputBorderFocus}20`
                  : 'none'
              handleInputFocus()
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            ref={inputRef}
            style={{
              backgroundColor: themeConfig.theme.colors.inputBackground,
              border: `2px solid ${themeConfig.theme.colors.inputBorder}`,
              borderRadius:
                themeConfig.config.enableRoundedCorners !== false
                  ? themeConfig.theme.spacing.inputBorderRadius
                  : '0',
              boxShadow: 'none',
              color: themeConfig.theme.colors.inputText,
              fontFamily: themeConfig.theme.typography.fontFamily,
              fontSize: themeConfig.theme.spacing.inputFontSize,
              fontWeight: themeConfig.theme.typography.fontWeightNormal,
              lineHeight: themeConfig.theme.typography.lineHeightNormal,
              outline: 'none',
              padding: themeConfig.theme.spacing.inputPadding,
              transition:
                themeConfig.config.enableAnimations !== false
                  ? `all ${themeConfig.theme.animations.transitionNormal} ${themeConfig.theme.animations.easeInOut}`
                  : 'none',
              width: '100%',
            }}
            title="Search input"
            type="text"
            value={query}
          />
        )}
        {isLoading && showLoading && (
          <div
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            <div
              data-testid="loading-spinner"
              style={{
                animation: `spin 1s linear infinite`,
                border: `2px solid ${themeConfig.theme.colors.inputBorder}`,
                borderRadius: '50%',
                borderTop: `2px solid ${themeConfig.theme.colors.inputBorderFocus}`,
                height: '16px',
                width: '16px',
              }}
            />
          </div>
        )}
      </div>

      {isOpen && (
        <div
          className={`${resultsClassName}`}
          ref={resultsRef}
          style={{
            backgroundColor: themeConfig.theme.colors.resultsBackground,
            border: `1px solid ${themeConfig.theme.colors.resultsBorder}`,
            borderRadius:
              themeConfig.config.enableRoundedCorners !== false
                ? themeConfig.theme.spacing.resultsBorderRadius
                : '0',
            boxShadow:
              themeConfig.config.enableShadows !== false
                ? themeConfig.theme.shadows.shadowLg
                : 'none',
            left: '0',
            marginTop: '4px',
            maxHeight: themeConfig.theme.spacing.resultsMaxHeight,
            overflowY: 'auto',
            position: 'absolute',
            right: '0',
            top: '100%',
            zIndex: 1000,
            ...(themeConfig.config.enableAnimations !== false && {
              animation: `slideDown ${themeConfig.theme.animations.animationNormal} ${themeConfig.theme.animations.easeOut}`,
            }),
          }}
        >
          {error && (renderError ? renderError(error) : defaultRenderError(error))}

          {!error && results && (
            <>
              {showResultCount &&
                (renderResultsHeader
                  ? renderResultsHeader(results.found, results.search_time_ms)
                  : defaultRenderResultsHeader(results.found, results.search_time_ms))}

              {results.hits.length > 0 ? (
                <div
                  className={`${resultsListClassName}`}
                  style={{
                    padding: '8px 0',
                  }}
                >
                  {results.hits.map((result, index) =>
                    renderResult ? renderResult(result, index) : defaultRenderResult(result, index),
                  )}
                </div>
              ) : renderNoResults ? (
                renderNoResults(query)
              ) : (
                defaultRenderNoResults(query)
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default HeadlessSearchInput
export { HeadlessSearchInput }
