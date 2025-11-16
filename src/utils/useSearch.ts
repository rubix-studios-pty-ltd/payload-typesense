'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

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

  const collectionsRef = useRef<string | string[] | undefined>(collections)
  const onResultsRef = useRef<typeof onResults>(onResults)
  const onSearchRef = useRef<typeof onSearch>(onSearch)

  useEffect(() => {
    collectionsRef.current = collections
  }, [collections])

  useEffect(() => {
    onResultsRef.current = onResults
  }, [onResults])

  useEffect(() => {
    onSearchRef.current = onSearch
  }, [onSearch])

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
        const activeCollections = collectionsRef.current
        let searchUrl: string

        if (typeof activeCollections === 'string' && activeCollections) {
          searchUrl = `${baseUrl}/api/search/${activeCollections}?q=${encodeURIComponent(
            searchQuery
          )}&per_page=${perPage}`
        } else if (Array.isArray(activeCollections) && activeCollections.length > 0) {
          searchUrl = `${baseUrl}/api/search?q=${encodeURIComponent(
            searchQuery
          )}&per_page=${perPage * 2}`
        } else {
          searchUrl = `${baseUrl}/api/search?q=${encodeURIComponent(
            searchQuery
          )}&per_page=${perPage}`
        }

        const response = await fetch(searchUrl)

        if (!response.ok) {
          throw new Error(`Search failed: ${response.status} ${response.statusText}`)
        }

        let searchResults: SearchResponse<T> = await response.json()

        if (Array.isArray(activeCollections) && activeCollections.length > 0) {
          const filteredHits =
            searchResults.hits?.filter(
              (hit) => hit.collection && activeCollections.includes(hit.collection)
            ) || []

          const filteredCollections =
            searchResults.collections?.filter(
              (col) => col.collection && activeCollections.includes(col.collection)
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
    [baseUrl, minQueryLength, perPage]
  )

  return {
    error,
    isLoading,
    results,
    search,
  }
}
