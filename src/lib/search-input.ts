'use client'

import {
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react'

import { type ThemeConfig } from '../components/themes/types.js'
import { type BaseSearchInputProps, type SearchResult } from '../types.js'

export interface SearchInputProps<T = Record<string, unknown>> extends BaseSearchInputProps<T> {
  /**
   * Collections to search in
   */
  collections?: string[]

  /**
   * Enable search suggestions
   */
  enableSuggestions?: boolean

  /**
   * Callback when a search result is hovered
   */
  onResultHover?: (result: SearchResult<T>) => void

  /**
   * Number of results to show per page
   */
  perPage?: number

  /**
   * Show dates in search results
   */
  renderDate?: boolean

  /**
   * Custom render function for error state
   */
  renderError?: (error: string) => ReactNode

  /**
   * Custom input element for complete rendering control
   */
  renderInput?: (props: {
    className: string
    'aria-label': string
    'aria-controls'?: string
    'aria-busy'?: boolean
    onBlur: (event: FocusEvent<HTMLInputElement>) => void
    onChange: (event: ChangeEvent<HTMLInputElement>) => void
    onFocus: () => void
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
    placeholder: string
    ref: RefObject<HTMLInputElement | null>
    value: string
  }) => ReactNode

  /**
   * Custom render function for loading state
   */
  renderLoading?: () => ReactNode

  /**
   * Custom render function for no results
   */
  renderNoResults?: (query: string) => ReactNode

  /**
   * Custom render function for individual search results
   */
  renderResult?: (
    result: SearchResult<T>,
    index: number,
    handlers: {
      onClick: (result: SearchResult<T>) => void
      onHover?: (result: SearchResult<T>) => void
    }
  ) => ReactNode

  /**
   * Custom render function for results header
   */
  renderResultsHeader?: (found: number) => ReactNode

  /**
   * Custom CSS class for individual result items
   */
  resultItemClassName?: string

  /**
   * Custom CSS class for the results content
   */
  resultsClassName?: string

  /**
   * Custom CSS class for the outer results container
   */
  resultsContainerClassName?: string

  /**
   * Show loading indicator during searches
   */
  showLoading?: boolean

  /**
   * Show the total number of search results
   */
  showResultCount?: boolean

  /**
   * Theme configuration
   */
  theme?: string | ThemeConfig

  /**
   * Legacy semantic-only switch. searchMode takes precedence when supplied.
   */
  vector?: boolean
}
