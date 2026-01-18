'use client'

import type React from 'react'

import { type ThemeConfig } from '../components/themes/types.js'
import { type BaseSearchInputProps, type SearchResult } from '../types.js'

export interface HeadlessSearchInputProps<T = Record<string, unknown>>
  extends BaseSearchInputProps<T> {
  /**
   * Collections to search in
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
   * Show date in search results
   */
  renderDate?: boolean
  /**
   * Custom render function for error state
   */
  renderError?: (error: string) => React.ReactNode
  /**
   * Custom input element (for complete control)
   */
  renderInput?: (props: {
    className: string
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onFocus: () => void
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
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
  renderResult?: (
    result: SearchResult<T>,
    index: number,
    handlers: {
      onClick: (result: SearchResult<T>) => void
      onHover?: (result: SearchResult<T>) => void
    }
  ) => React.ReactNode
  /**
   * Custom render function for results header
   */
  renderResultsHeader?: (found: number) => React.ReactNode
  /**
   * Custom CSS class for individual result items
   */
  resultItemClassName?: string
  /**
   * Custom CSS class for the results container
   */
  resultsClassName?: string
  /**
   * Custom CSS class for results container
   */
  resultsContainerClassName?: string
  /**
   * Show loading state
   */
  showLoading?: boolean
  /**
   * Show result count
   */
  showResultCount?: boolean
  /**
   * Theme configuration
   */
  theme?: string | ThemeConfig
  /**
   * Enable vector search mode (replaces text search)
   */
  vector?: boolean
}
