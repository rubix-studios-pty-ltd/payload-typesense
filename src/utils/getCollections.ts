import type Typesense from 'typesense'

import { searchCache } from '../lib/cache.js'
import { buildParameters, getSearchMode } from '../lib/search.js'
import { type SearchParams, type TypesenseConfig } from '../types.js'
import { getCompare } from './sortResults.js'

export const getCollections = async (
  client: Typesense.Client,
  config: TypesenseConfig,
  query: string,
  options: Omit<SearchParams, 'q'> & {
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

    const multiple = enabledCollections.length > 1
    const mode = getSearchMode(config, options)

    let compare: ReturnType<typeof getCompare> | undefined

    if (multiple) {
      try {
        compare = getCompare(options.sort_by, mode)
      } catch (error) {
        return Response.json(
          { error: error instanceof Error ? error.message : 'Invalid sort_by parameter' },
          { status: 400 }
        )
      }
    }

    const limit = multiple ? options.page * options.per_page : options.per_page
    const perPage = Math.min(limit, 250)

    const cacheKey = {
      ...options,
      settings: config.settings,
      vectorSearch: config.vectorSearch && {
        enabled: config.vectorSearch.enabled,
        alpha: config.vectorSearch.alpha,
        k: config.vectorSearch.k,
        distanceThreshold: config.vectorSearch.distanceThreshold,
      },
      fields: enabledCollections.map(([slug, collection]) => [slug, collection.searchFields]),
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
        const fields = collection.searchFields?.length
          ? collection.searchFields
          : ['title', 'content', 'description']

        const search = (page: number) =>
          client
            .collections(slug)
            .documents()
            .search(
              buildParameters(config, fields, {
                ...options,
                page,
                per_page: perPage,
                q: query,
                search_mode: mode,
              })
            )

        let page = multiple ? 1 : options.page

        const results = await search(page)
        const hits = [...(results.hits ?? [])]

        let cutoff = results.search_cutoff
        let time = results.search_time_ms

        while (multiple && hits.length < Math.min(limit, results.found) && !cutoff) {
          const next = await search(++page)
          const batch = next.hits ?? []

          cutoff ||= next.search_cutoff
          time += next.search_time_ms
          hits.push(...batch)

          if (batch.length < perPage) break
        }

        return {
          collection: slug,
          displayName,
          found: results.found,
          hits: hits.slice(0, limit).map((hit) => ({
            ...hit,
            collection: slug,
            displayName,
            icon,
          })),
          icon,
          search_cutoff: cutoff,
          search_time_ms: time,
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

    if (results.every((result) => 'error' in result)) {
      return Response.json(
        { error: 'All collection searches failed', collections: results },
        { status: 500 }
      )
    }

    const hits = results.flatMap((result) => result.hits)
    const found = results.reduce((total, result) => total + result.found, 0)

    if (compare) hits.sort(compare)

    const offset = multiple ? (options.page - 1) * options.per_page : 0

    const response = {
      collections: results.map((result) => ({
        collection: result.collection,
        displayName: result.displayName,
        error: 'error' in result ? result.error : undefined,
        found: result.found,
        icon: result.icon,
      })),
      found,
      hits: hits.slice(offset, offset + options.per_page),
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
