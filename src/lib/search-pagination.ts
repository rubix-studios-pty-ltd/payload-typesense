'use client'

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
