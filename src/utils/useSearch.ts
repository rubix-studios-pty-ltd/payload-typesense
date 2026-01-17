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

  // Keep refs only for callbacks to avoid unnecessary re-renders of search function
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

        const isSingleCollection = Array.isArray(collections) && collections.length === 1
        const endpoint = isSingleCollection 
          ? `${baseUrl}/api/search/${collections[0]}` 
          : `${baseUrl}/api/search`
        
        const searchUrl = `${endpoint}?${params.toString()}`

        const response = await fetch(searchUrl)
        if (!response.ok) {
          throw new Error(`Search failed: ${response.status} ${response.statusText}`)
        }

        let searchResults: SearchResponse<T> = await response.json()

        if (Array.isArray(collections) && collections.length > 1) {
          const filteredHits =
            searchResults.hits?.filter(
              (hit) => hit.collection && collections.includes(hit.collection)
            ) || []

          const filteredCollections =
            searchResults.collections?.filter(
              (col) => col.collection && collections.includes(col.collection)
            ) || []

          const totalFound = filteredCollections.reduce((sum, col) => sum + (col.found || 0), 0)

          searchResults = {
            ...searchResults,
            collections: filteredCollections,
            found: totalFound,
            hits: filteredHits,
          }
        }

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