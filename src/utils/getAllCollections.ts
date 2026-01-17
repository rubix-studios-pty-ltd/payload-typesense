import type Typesense from 'typesense'

import { searchCache } from '../lib/cache.js'
import { type TypesenseConfig } from '../types.js'

export const getAllCollections = async (
  typesenseClient: Typesense.Client,
  pluginOptions: TypesenseConfig,
  query: string,
  options: {
    collections?: string[]
    filters: Record<string, unknown>
    page: number
    per_page: number
    sort_by?: string
  }
) => {
  try {
    const cacheKey = {
      ...options,
      collections: options.collections ? [...options.collections].sort().join(',') : undefined,
    }

    const cachedResult = searchCache.get(query, 'universal', cacheKey)
    if (cachedResult) {
      return Response.json(cachedResult)
    }

    let enabledCollections = Object.entries(pluginOptions.collections || {}).filter(
      ([_, config]) => config?.enabled
    )

    if (options.collections && options.collections.length > 0) {
      enabledCollections = enabledCollections.filter(([collectionName]) =>
        options.collections!.includes(collectionName)
      )
    }

    if (enabledCollections.length === 0) {
      return Response.json({ error: 'No collections enabled for search' }, { status: 400 })
    }

    const searchPromises = enabledCollections.map(async ([collectionName, config]) => {
      try {
        const searchParameters: Record<string, unknown> = {
          highlight_full_fields: config?.searchFields?.join(',') || 'title,content',
          num_typos: 0,
          page: options.page,
          per_page: options.per_page,
          q: query,
          query_by: config?.searchFields?.join(',') || 'title,content',
          snippet_threshold: 30,
          typo_tokens_threshold: 1,
        }

        const results = await typesenseClient
          .collections(collectionName)
          .documents()
          .search(searchParameters)

        return {
          collection: collectionName,
          displayName: config?.displayName || collectionName,
          icon: config?.icon || '📄',
          ...results,
          hits:
            results.hits?.map((hit) => ({
              ...hit,
              collection: collectionName,
              displayName: config?.displayName || collectionName,
              icon: config?.icon || '📄',
            })) || [],
        }
      } catch (_error) {
        return {
          collection: collectionName,
          displayName: config?.displayName || collectionName,
          error: _error instanceof Error ? _error.message : 'Unknown error',
          found: 0,
          hits: [],
          icon: config?.icon || '📄',
        }
      }
    })

    const results = await Promise.all(searchPromises)

    const combinedHits = results.flatMap((result) => result.hits || [])
    const totalFound = results.reduce((sum, result) => sum + (result.found || 0), 0)

    combinedHits.sort((a, b) => (b.text_match || 0) - (a.text_match || 0))

    const searchResult = {
      collections: results.map((r) => ({
        collection: r.collection,
        displayName: r.displayName,
        error: r.error,
        found: r.found || 0,
        icon: r.icon,
      })),
      found: totalFound,
      hits: combinedHits.slice(0, options.per_page),
      page: options.page,
      request_params: { per_page: options.per_page, q: query },
      search_cutoff: false,
      search_time_ms: 0,
    }

    searchCache.set(query, searchResult, 'universal', cacheKey)

    return Response.json(searchResult)
  } catch (error) {
    return Response.json(
      {
        details: error instanceof Error ? error.message : 'Unknown error',
        error: 'Universal search failed',
      },
      { status: 500 }
    )
  }
}
