'use client'

import { useCallback, useRef, useState } from 'react'

import { type SearchResponse } from '../types.js'

type UseSearchOptions<T> = {
  baseUrl: string
  collections?: string | string[]
  minQueryLength: number
  onResults?: (results: SearchResponse<T>) => void
  onSearch?: (query: string, results: SearchResponse<T>) => void
  perPage: number
}

export function useSearch<T = Record<string, unknown>>({
  baseUrl,
  collections,
  minQueryLength,
  onResults,
  onSearch,
  perPage,
}: UseSearchOptions<T>) {
  const [results, setResults] = useState<null | SearchResponse<T>>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<null | string>(null)

  const onResultsRef = useRef(onResults)
  const onSearchRef = useRef(onSearch)

  onResultsRef.current = onResults
  onSearchRef.current = onSearch

  const search = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < minQueryLength) {
        setResults(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          per_page: String(perPage),
          q: searchQuery,
        })

        let searchUrl: string

        if (Array.isArray(collections) && collections.length > 0) {
          if (collections.length === 1) {
            searchUrl = `${baseUrl}/api/search/${collections[0]}?${params.toString()}`
          } else {
            params.append('collections', collections.join(','))
            searchUrl = `${baseUrl}/api/search?${params.toString()}`
          }
        } else {
          searchUrl = `${baseUrl}/api/search?${params.toString()}`
        }

        const response = await fetch(searchUrl)
        if (!response.ok) {
          throw new Error(`Search failed: ${response.status} ${response.statusText}`)
        }

        const searchResults: SearchResponse<T> = await response.json()

        setResults(searchResults)
        onResultsRef.current?.(searchResults)
        onSearchRef.current?.(searchQuery, searchResults)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Search failed'
        setError(errorMessage)
        setResults(null)
      } finally {
        setIsLoading(false)
      }
    },
    [baseUrl, collections, minQueryLength, perPage]
  )

  return {
    error,
    isLoading,
    results,
    search,
  }
}
