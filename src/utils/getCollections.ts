import type Typesense from 'typesense'

import { searchCache } from '../lib/cache.js'
import { type TypesenseConfig } from '../types.js'
import { vectorSearch } from './vectorSearch.js'

export const getCollections = async (
  client: Typesense.Client,
  config: TypesenseConfig,
  query: string,
  options: {
    collections?: string[]
    filters: Record<string, unknown>
    page: number
    per_page: number
    sort_by?: string
    vector?: boolean
  }
) => {
  try {
    const enabledCollections = Object.entries(config.collections ?? {}).filter(
      ([slug, collection]) =>
        collection.enabled && (!options.collections?.length || options.collections.includes(slug))
    )

    if (!enabledCollections.length) {
      return Response.json({ error: 'No collections enabled for search' }, { status: 400 })
    }

    const cacheKey = {
      ...options,
      collections: enabledCollections
        .map(([slug]) => slug)
        .sort()
        .join(','),
    }

    const cached = searchCache.get(query, 'universal', cacheKey)

    if (cached) {
      return Response.json(cached)
    }

    const searches = enabledCollections.map(async ([slug, collection]) => {
      const displayName = collection.displayName || slug
      const icon = collection.icon || '📄'

      try {
        let results

        if (options.vector && config.vectorSearch?.enabled) {
          results = await vectorSearch(client, query, {
            collection: slug,
            page: options.page,
            per_page: options.per_page,
          })
        } else {
          const fields = collection.searchFields?.join(',') || 'title,content,description'

          results = await client
            .collections(slug)
            .documents()
            .search({
              highlight_full_fields: fields,
              num_typos: 0,
              page: options.page,
              per_page: options.per_page,
              q: query,
              query_by: fields,
              snippet_threshold: 30,
              typo_tokens_threshold: 1,
              ...(options.sort_by ? { sort_by: options.sort_by } : {}),
            })
        }

        return {
          collection: slug,
          displayName,
          found: results.found,
          hits: (results.hits ?? []).map((hit) => ({
            ...hit,
            collection: slug,
            displayName,
            icon,
          })),
          icon,
          search_cutoff: results.search_cutoff,
          search_time_ms: results.search_time_ms,
        }
      } catch (error) {
        return {
          collection: slug,
          displayName,
          error: error instanceof Error ? error.message : 'Unknown error',
          found: 0,
          hits: [],
          icon,
          search_cutoff: false,
          search_time_ms: 0,
        }
      }
    })

    const results = await Promise.all(searches)

    const hits = results.flatMap((result) => result.hits)
    const found = results.reduce((total, result) => total + result.found, 0)

    hits.sort((a, b) => (b.text_match ?? 0) - (a.text_match ?? 0))

    const response = {
      collections: results.map((result) => ({
        collection: result.collection,
        displayName: result.displayName,
        error: 'error' in result ? result.error : undefined,
        found: result.found,
        icon: result.icon,
      })),
      found,
      hits: hits.slice(0, options.per_page),
      page: options.page,
      request_params: {
        page: options.page,
        per_page: options.per_page,
        q: query,
        sort_by: options.sort_by,
      },
      search_cutoff: results.some((result) => result.search_cutoff),
      search_time_ms: Math.max(...results.map((result) => result.search_time_ms)),
    }

    if (results.every((result) => !('error' in result))) {
      searchCache.set(query, response, 'universal', cacheKey)
    }

    return Response.json(response)
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
