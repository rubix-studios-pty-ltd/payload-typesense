'use client'

import React, { useEffect, useRef, useState } from 'react'

import { type HeadlessSearchInputProps } from '../lib/headlessSearch.js'
import { type SearchResult } from '../types.js'
import { handleKeyboard } from '../utils/keyboard.js'
import { useDebounce } from '../utils/useDebounce.js'
import { useSearch } from '../utils/useSearch.js'
import {
  RenderedHeader,
  RenderedNoResults,
  RenderedResult,
  RenderedResultError,
} from './render/index.js'
import { useThemeConfig } from './themes/hooks.js'

export function HeadlessSearchInput<T = Record<string, unknown>>(
  props: HeadlessSearchInputProps<T>
): React.ReactElement {
  const {
    baseUrl,
    className = '',
    collections,
    debounceMs = 300,
    enableSuggestions: _enableSuggestions = true,
    errorClassName = '',
    inputClassName = '',
    inputWrapperClassName = '',
    minQueryLength = 2,
    noResultsClassName = '',
    onResultClick,
    onResults,
    onSearch,
    perPage = 10,
    placeholder = 'Search...',
    renderDate = true,
    renderError,
    renderInput,
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
    theme = 'modern',
  } = props

  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const themeConfig = useThemeConfig({
    theme: typeof theme === 'string' ? theme : theme.theme || 'modern',
    ...(typeof theme === 'object' ? theme : {}),
  })

  const debouncedQuery = useDebounce(query, debounceMs)

  const { error, isLoading, results, search } = useSearch<T>({
    baseUrl,
    collections,
    minQueryLength,
    onResults,
    onSearch,
    perPage,
  })

  useEffect(() => {
    if (debouncedQuery.length >= minQueryLength) {
      void search(debouncedQuery)
    }
  }, [debouncedQuery, minQueryLength, search])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setIsOpen(value.length >= minQueryLength)
  }

  const handleInputFocus = () => {
    if (query.length >= minQueryLength) {
      setIsOpen(true)
    }
  }

  const handleInputBlur = (_e: React.FocusEvent) => {
    setTimeout(() => {
      if (!resultsRef.current?.contains(document.activeElement)) {
        setIsOpen(false)
      }
    }, 150)
  }

  const handleResultClick = (result: SearchResult<T>) => {
    onResultClick?.(result)
    setIsOpen(false)
    setQuery('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    handleKeyboard(e, {
      inputRef,
      isOpen,
      results,
      resultsRef,
    })
  }

  return (
    <div
      className={className}
      style={{
        margin: '0 auto',
        maxWidth: '600px',
        position: 'relative',
        width: '100%',
      }}
    >
      <div
        className={inputWrapperClassName}
        style={{
          position: 'relative',
          width: '100%',
        }}
      >
        {renderInput ? (
          renderInput({
            className: inputClassName,
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
            className={inputClassName}
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
            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
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

      {isOpen && results && (
        <div
          className={resultsContainerClassName}
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
            boxSizing: 'border-box',
            display: 'flex',
            left: '0',
            marginTop: '10px',
            maxHeight: themeConfig.theme.spacing.resultsMaxHeight,
            overflow: 'hidden',
            padding: '4px',
            position: 'absolute',
            right: '0',
            top: '100%',
            zIndex: 1000,
            ...(themeConfig.config.enableAnimations !== false && {
              animation: `slideDown ${themeConfig.theme.animations.animationNormal} ${themeConfig.theme.animations.easeOut}`,
            }),
          }}
        >
          <div
            className={`relative ${resultsClassName}`}
            style={{
              minHeight: 0,
              overflowY: 'auto',
            }}
          >
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

                {results.hits.length > 0 ? (
                  <div className={resultsListClassName}>
                    {results.hits.map((result, index) =>
                      renderResult ? (
                        renderResult(result, index, { onClick: handleResultClick })
                      ) : (
                        <RenderedResult
                          index={index}
                          key={result.document?.id || result.id || index}
                          onResultClick={handleResultClick}
                          renderDate={renderDate}
                          result={result}
                          resultItemClassName={resultItemClassName}
                          resultsContainerClassName={resultsContainerClassName}
                          themeConfig={themeConfig}
                        />
                      )
                    )}
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
