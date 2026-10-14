'use client'

import {
  type ButtonHTMLAttributes,
  type DialogHTMLAttributes,
  type ReactNode,
  type RefObject,
} from 'react'

import { type SearchResponse } from '../types.js'
import { type HeadlessSearchInputProps } from './headlessSearch.js'

/**
 * State and navigation supplied to a custom pagination renderer.
 */
export type SearchPaginationProps = {
  /**
   * Current one-based page number.
   */
  page: number

  /**
   * Number of results requested per page.
   */
  perPage: number

  /**
   * Total matches reported by the current search response.
   */
  found: number

  /**
   * Number of pages calculated from the match count and page size.
   */
  totalPages: number

  /**
   * Whether a search request is currently loading.
   */
  isLoading: boolean

  /**
   * Whether a page exists before the current page.
   */
  hasPreviousPage: boolean

  /**
   * Whether a page exists after the current page.
   */
  hasNextPage: boolean

  /**
   * Requests a different page. Invalid, unchanged or loading-state requests are ignored.
   */
  onPageChange: (page: number) => void
}

/**
 * Search state and default content supplied to a custom dialog content renderer.
 */
export type SearchDialogContentProps<T> = {
  /**
   * Default input, search states, results and pagination. Render these to retain the built-in controls.
   */
  children: ReactNode

  /**
   * Requests dialog dismissal through the component's open-state handler.
   */
  close: () => void

  /**
   * Current input query, including changes awaiting the debounce delay.
   */
  query: string

  /**
   * Current one-based page number.
   */
  page: number

  /**
   * Latest completed search response, or null when no response is available.
   */
  results: SearchResponse<T> | null

  /**
   * Whether a search request is currently loading.
   */
  isLoading: boolean

  /**
   * Current search error message, or null when no error is present.
   */
  error: string | null
}

/**
 * Configuration for a button that opens a modal search dialog.
 */
export interface HeadlessSearchDialogProps<T = Record<string, unknown>>
  extends Omit<HeadlessSearchInputProps<T>, 'enableSuggestions' | 'maxResults'> {
  /**
   * Clear the query and reset pagination when the dialog closes. Defaults to false.
   */
  clearOnClose?: boolean

  /**
   * Custom CSS class for the default dialog close button.
   */
  closeButtonClassName?: string

  /**
   * Text for the default close button. Defaults to "Close".
   */
  closeLabel?: string

  /**
   * Dismiss the dialog when its backdrop is clicked. Defaults to true.
   */
  closeOnBackdropClick?: boolean

  /**
   * Dismiss the dialog after a result is selected. Defaults to true.
   */
  closeOnResultClick?: boolean

  /**
   * Initial open state for an uncontrolled dialog. Defaults to false.
   */
  defaultOpen?: boolean

  /**
   * Custom CSS class for the native dialog element.
   */
  dialogClassName?: string

  /**
   * Custom CSS class for the dialog content wrapper.
   */
  dialogContentClassName?: string

  /**
   * Custom CSS class for the default dialog header.
   */
  dialogHeaderClassName?: string

  /**
   * Accessible dialog name when dialogProps does not provide aria-label.
   */
  dialogLabel?: string

  /**
   * Additional native dialog attributes. Open state and dismissal handlers are managed internally.
   */
  dialogProps?: Omit<
    DialogHTMLAttributes<HTMLDialogElement>,
    'children' | 'open' | 'onCancel' | 'onClose' | 'onClick' | 'onKeyDown'
  >

  /**
   * Query used when the component first mounts. Defaults to an empty string.
   */
  initialQuery?: string

  /**
   * Text for the default next-page button. Defaults to "Next".
   */
  nextPageLabel?: string

  /**
   * Callback when opening or closing is requested.
   * For controlled use, update the open prop in response.
   */
  onOpenChange?: (open: boolean) => void

  /**
   * Callback when a different valid page is selected through pagination.
   */
  onPageChange?: (page: number) => void

  /**
   * Controlled open state. When omitted, the component manages its own state.
   */
  open?: boolean

  /**
   * Custom CSS class shared by the default pagination buttons.
   */
  paginationButtonClassName?: string

  /**
   * Custom CSS class for the default pagination container.
   */
  paginationClassName?: string

  /**
   * Text for the default previous-page button. Defaults to "Previous".
   */
  previousPageLabel?: string

  /**
   * Custom renderer for dialog content and layout.
   * Receives the default controls as children alongside the current search state.
   */
  renderDialogContent?: (props: SearchDialogContentProps<T>) => ReactNode

  /**
   * Custom renderer replacing the default title and close button.
   */
  renderDialogHeader?: (props: { title: ReactNode; close: () => void }) => ReactNode

  /**
   * Custom content when no response or error is available and no request is loading.
   */
  renderEmpty?: () => ReactNode

  /**
   * Custom pagination renderer with page state and the page-change handler.
   * Used when pagination is enabled and more than one page exists.
   */
  renderPagination?: (props: SearchPaginationProps) => ReactNode

  /**
   * Custom trigger button renderer.
   * Spread the supplied attributes and handlers, including the ref, onto the button.
   */
  renderTrigger?: (
    props: ButtonHTMLAttributes<HTMLButtonElement> & { ref: RefObject<HTMLButtonElement | null> }
  ) => ReactNode

  /**
   * Show pagination when the response spans multiple pages. Defaults to true.
   */
  showPagination?: boolean

  /**
   * Content for the default dialog heading. Defaults to "Search".
   */
  title?: ReactNode

  /**
   * Custom CSS class for the trigger button.
   */
  triggerClassName?: string

  /**
   * Content for the default trigger button. Defaults to "Search".
   */
  triggerLabel?: ReactNode

  /**
   * Additional trigger button attributes. Its click handler runs before the dialog opens;
   * preventDefault() cancels opening. The component supplies type="button" and its label.
   */
  triggerProps?: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>
}
