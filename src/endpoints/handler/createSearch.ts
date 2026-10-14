import { type PayloadHandler, type PayloadRequest } from 'payload'
import type Typesense from 'typesense'

import { searchCache } from '../../lib/cache.js'
import { buildParameters, getCollectionName, getSearchMode } from '../../lib/search.js'
import { getErrors, validateParams } from '../../lib/validation.js'
import { type TypesenseConfig } from '../../types.js'
import { getCollections } from '../../utils/getCollections.js'

export const createSearch = (client: Typesense.Client, config: TypesenseConfig): PayloadHandler => {
  return async (request: PayloadRequest): Promise<Response> => {
    if (!request.url) return Response.json({ error: 'Request URL missing' }, { status: 400 })

    let url: URL
    let collection: string | undefined

    try {
      url = new URL(request.url)
      collection = getCollectionName(url)
    } catch {
      return Response.json({ error: 'Invalid request URL' }, { status: 400 })
    }

    const value = (key: string) => url.searchParams.get(key)
    const number = (key: string) => (url.searchParams.has(key) ? Number(value(key)) : undefined)
    const boolean = (key: string) => {
      if (!url.searchParams.has(key)) {
        return undefined
      }

      return value(key) === 'true' ? true : value(key) === 'false' ? false : value(key)
    }

    const validation = validateParams({
      q: value('q')?.trim() ?? '',
      page: number('page'),
      per_page: number('per_page'),
      sort_by: value('sort_by') ?? undefined,
      num_typos: number('num_typos'),
      min_len_1typo: number('min_len_1typo'),
      min_len_2typo: number('min_len_2typo'),
      typo_threshold: number('typo_tokens_threshold'),
      numerical: boolean('numerical'),
      alpha_numerical: boolean('alpha_numerical'),
      search_mode: value('search_mode') ?? undefined,
      vector: boolean('vector'),
    })

    if (!validation.success || !validation.data) {
      return Response.json(
        {
          error: 'Invalid search parameters',
          details: getErrors(validation.errors ?? []),
        },
        { status: 400 }
      )
    }

    const params = validation.data

    try {
      getSearchMode(config, params)
    } catch (error) {
      return Response.json({ error: (error as Error).message }, { status: 400 })
    }

    try {
      if (!collection) {
        const collections = value('collections')
          ?.split(',')
          .map((name) => name.trim())
          .filter(Boolean)

        return getCollections(client, config, params.q, { ...params, collections, filters: {} })
      }

      const settings = config.collections?.[collection]
      if (!settings?.enabled) {
        return Response.json({ error: 'Collection not enabled for search' }, { status: 400 })
      }

      const fields = settings.searchFields?.length
        ? settings.searchFields
        : ['title', 'content', 'description']
      const searchParams = buildParameters(config, fields, params)
      const cached = searchCache.get(params.q, collection, searchParams)

      const search = () => client.collections(collection).documents().search(searchParams)

      const results = cached ? (cached as Awaited<ReturnType<typeof search>>) : await search()

      const response = {
        ...results,
        hits:
          results.hits?.map((hit) => ({
            ...hit,
            collection,
            displayName: settings.displayName ?? collection,
          })) ?? [],
      }

      if (!cached) {
        searchCache.set(params.q, response, collection, searchParams)
      }

      return Response.json(response)
    } catch (error) {
      return Response.json(
        {
          error: 'Search handler failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  }
}
