import { type PayloadHandler, type PayloadRequest } from 'payload'
import type Typesense from 'typesense'

import { searchCache } from '../../lib/cache.js'
import { getValidationErrors, validateSearchParams } from '../../lib/validation.js'
import { type TypesenseConfig } from '../../types.js'
import { getCollections } from '../../utils/getCollections.js'
import { vectorSearch } from '../../utils/vectorSearch.js'

export const createSearch = (client: Typesense.Client, config: TypesenseConfig): PayloadHandler => {
  return async (request: PayloadRequest): Promise<Response> => {
    if (!request.url) {
      return Response.json({ error: 'Request URL missing' }, { status: 400 })
    }

    let url: URL

    try {
      url = new URL(request.url)
    } catch {
      return Response.json({ error: 'Invalid request URL' }, { status: 400 })
    }

    try {
      const parts = url.pathname.split('/')
      const searchIndex = parts.indexOf('search')
      const collection = searchIndex >= 0 ? parts[searchIndex + 1] || '' : ''
      const settings = collection ? config.collections?.[collection] : undefined

      const q = url.searchParams.get('q')?.trim() || ''
      const page = Number(url.searchParams.get('page') ?? 1)
      const per_page = Number(url.searchParams.get('per_page') ?? 10)

      const collectionsParam = url.searchParams.get('collections')
      const collections = collectionsParam
        ? collectionsParam
            .split(',')
            .map((name) => name.trim())
            .filter(Boolean)
        : undefined

      const vector =
        url.searchParams.get('vector') === 'true' && config.vectorSearch?.enabled === true

      const sort_by = url.searchParams.has('sort_by')
        ? url.searchParams.get('sort_by') || ''
        : undefined

      if (!Number.isInteger(page) || page < 1) {
        return Response.json({ error: 'Invalid page parameter' }, { status: 400 })
      }

      if (!Number.isInteger(per_page) || per_page < 1 || per_page > 250) {
        return Response.json({ error: 'Invalid per_page parameter' }, { status: 400 })
      }

      const validation = validateSearchParams({ page, per_page, q, sort_by })

      if (!validation.success) {
        return Response.json(
          {
            details: getValidationErrors(validation.errors || []),
            error: 'Invalid search parameters',
          },
          { status: 400 }
        )
      }

      if (!q) {
        return Response.json(
          {
            details: 'Use /api/search?q=keyword',
            error: 'Query parameter "q" is required',
          },
          { status: 400 }
        )
      }

      if (!collection) {
        return getCollections(client, config, q, {
          collections,
          filters: {},
          page,
          per_page,
          sort_by,
          vector,
        })
      }

      if (!settings?.enabled) {
        return Response.json({ error: 'Collection not enabled for search' }, { status: 400 })
      }

      if (vector) {
        try {
          const results = await vectorSearch(client, q, {
            collection,
            page,
            per_page,
          })

          return Response.json(results)
        } catch (error) {
          return Response.json(
            {
              details: error instanceof Error ? error.message : 'Unknown vector search error',
              error: 'Vector search failed',
            },
            { status: 500 }
          )
        }
      }

      const fields = settings.searchFields?.length
        ? settings.searchFields.join(',')
        : 'title,content'

      const searchParams = {
        highlight_full_fields: fields,
        num_typos: 0,
        page,
        per_page,
        q,
        query_by: fields,
        snippet_threshold: 30,
        typo_tokens_threshold: 1,
        ...(sort_by ? { sort_by } : {}),
      }

      const cacheKey = { fields, page, per_page, sort_by, vector }
      const cached = searchCache.get(q, collection, cacheKey)

      if (cached) {
        return Response.json(cached)
      }

      const results = await client.collections(collection).documents().search(searchParams)

      searchCache.set(q, results, collection, cacheKey)

      return Response.json(results)
    } catch (error) {
      return Response.json(
        {
          details: error instanceof Error ? error.message : 'Unknown error',
          error: 'Search handler failed',
        },
        { status: 500 }
      )
    }
  }
}
