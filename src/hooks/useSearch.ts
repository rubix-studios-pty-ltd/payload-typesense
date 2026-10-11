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
  vector?: boolean
}

export function useSearch<T = Record<string, unknown>>({
  baseUrl,
  collections,
  minQueryLength,
  onResults,
  onSearch,
  perPage,
  vector = false,
}: UseSearchOptions<T>) {
  const [results, setResults] = useState<null | SearchResponse<T>>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<null | string>(null)

  const requestRef = useRef<AbortController | null>(null)
  const onResultsRef = useRef(onResults)
  const onSearchRef = useRef(onSearch)

  const collection =
    typeof collections === 'string'
      ? collections
      : collections?.length === 1
        ? collections[0]
        : undefined

  const collectionList =
    Array.isArray(collections) && collections.length > 1 ? collections.join(',') : undefined

  useEffect(() => {
    onResultsRef.current = onResults
    onSearchRef.current = onSearch
  }, [onResults, onSearch])

  useEffect(() => {
    return () => {
      requestRef.current?.abort()
      requestRef.current = null
    }
  }, [])

  const search = useCallback(
    async (searchQuery: string) => {
      requestRef.current?.abort()
      requestRef.current = null

      if (searchQuery.length < minQueryLength) {
        setResults(null)
        setIsLoading(false)
        setError(null)
        return
      }

      const controller = new AbortController()
      requestRef.current = controller

      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          per_page: String(perPage),
          q: searchQuery,
        })

        if (vector) {
          params.set('vector', 'true')
        }

        if (collectionList) {
          params.set('collections', collectionList)
        }

        let url = baseUrl

        while (url.endsWith('/')) {
          url = url.slice(0, -1)
        }

        const path = collection ? `/api/search/${encodeURIComponent(collection)}` : '/api/search'

        const response = await fetch(`${url}${path}?${params.toString()}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Search failed: ${response.status} ${response.statusText}`)
        }

        const data = (await response.json()) as SearchResponse<T>

        if (requestRef.current !== controller) {
          return
        }

        setResults(data)

        onResultsRef.current?.(data)
        onSearchRef.current?.(searchQuery, data)
      } catch (err) {
        if (controller.signal.aborted || requestRef.current !== controller) {
          return
        }

        setError(err instanceof Error ? err.message : 'Search failed')
        setResults(null)
      } finally {
        if (requestRef.current === controller) {
          requestRef.current = null
          setIsLoading(false)
        }
      }
    },
    [baseUrl, collection, collectionList, minQueryLength, perPage, vector]
  )

  return {
    error,
    isLoading,
    results,
    search,
  }
}
