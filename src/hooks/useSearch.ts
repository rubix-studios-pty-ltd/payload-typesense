'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { type SearchMode, type SearchResponse } from '../types.js'

export type UseSearchOptions<T> = {
  baseUrl: string
  collections?: string | string[]
  enabled?: boolean
  minQueryLength: number
  onResults?: (results: SearchResponse<T>) => void
  onSearch?: (query: string, results: SearchResponse<T>) => void
  perPage: number
  searchMode?: SearchMode
  numTypos?: 0 | 1 | 2
  vector?: boolean
}

export function useSearch<T = Record<string, unknown>>({
  baseUrl,
  collections,
  enabled = true,
  minQueryLength,
  onResults,
  onSearch,
  perPage,
  searchMode,
  numTypos,
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

  const reset = useCallback(() => {
    requestRef.current?.abort()
    requestRef.current = null
    setResults(null)
    setIsLoading(false)
    setError(null)
  }, [])

  useEffect(() => {
    if (!enabled) reset()
  }, [enabled, reset])

  useEffect(
    () => () => {
      requestRef.current?.abort()
      requestRef.current = null
    },
    []
  )

  const search = useCallback(
    async (searchQuery: string, page = 1) => {
      requestRef.current?.abort()
      requestRef.current = null

      const query = searchQuery.trim()

      if (!enabled || query.length < minQueryLength) {
        reset()
        return
      }

      const controller = new AbortController()
      requestRef.current = controller
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          per_page: String(perPage),
          page: String(page),
          q: query,
        })

        if (searchMode) {
          params.set('search_mode', searchMode)
        } else if (vector) {
          params.set('vector', 'true')
        }

        if (numTypos !== undefined) {
          params.set('num_typos', String(numTypos))
        }

        if (collectionList) {
          params.set('collections', collectionList)
        }

        let end = baseUrl.length

        while (end > 0 && baseUrl[end - 1] === '/') {
          end--
        }

        const url = baseUrl.slice(0, end)
        const path = collection ? `/api/search/${encodeURIComponent(collection)}` : '/api/search'
        const response = await fetch(`${url}${path}?${params}`, { signal: controller.signal })

        if (!response.ok) {
          let message = `Search failed (${response.status})`

          try {
            const body = (await response.json()) as { error?: unknown; details?: unknown }

            if (typeof body.error === 'string') {
              message = body.error
            }

            if (typeof body.details === 'string') {
              message += ` (${body.details})`
            }
          } catch {
            /* Keep the HTTP status when the response is not JSON. */
          }

          throw new Error(message)
        }

        const data = (await response.json()) as SearchResponse<T>

        if (requestRef.current !== controller || controller.signal.aborted) {
          return
        }

        setResults(data)
        onResultsRef.current?.(data)
        onSearchRef.current?.(query, data)
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
    [
      baseUrl,
      collection,
      collectionList,
      enabled,
      minQueryLength,
      perPage,
      searchMode,
      numTypos,
      vector,
      reset,
    ]
  )

  return { error, isLoading, results, search, reset }
}
