import type Typesense from 'typesense'

import { type PayloadHandler, type PayloadRequest } from 'payload'

import { searchCache } from '../../lib/cache.js'
import { getValidationErrors, validateSearchParams } from '../../lib/validation.js'
import { type TypesenseConfig } from '../../types.js'
import { getAllCollections } from '../../utils/getAllCollections.js'

export const createSearch = (
  typesenseClient: Typesense.Client,
  pluginOptions: TypesenseConfig
): PayloadHandler => {
  return async (request: PayloadRequest) => {
    try {
      if (!request.url) {
        return Response.json({ error: 'Request URL missing' }, { status: 400 })
      }

      const url = new URL(request.url)

      const parts = url.pathname.split('/')
      const searchIndex = parts.indexOf('search')
      const collectionName = searchIndex >= 0 ? parts[searchIndex + 1] : ''
      const collection = String(collectionName || '')

      const q = url.searchParams.get('q') || ''
      const page = Number(url.searchParams.get('page') || 1)
      const per_page = Number(url.searchParams.get('per_page') || 10)

      const sort_by = url.searchParams.has('sort_by')
        ? url.searchParams.get('sort_by') || ''
        : undefined

      if (isNaN(page) || page < 1) {
        return Response.json({ error: 'Invalid page parameter' }, { status: 400 })
      }

      if (isNaN(per_page) || per_page < 1 || per_page > 250) {
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

      if (!collection) {
        if (!q.trim()) {
          return Response.json(
            {
              details: 'Use /api/search?q=keyword',
              error: 'Query parameter "q" is required',
            },
            { status: 400 }
          )
        }

        return getAllCollections(typesenseClient, pluginOptions, q, {
          filters: {},
          page,
          per_page,
          sort_by,
        })
      }

      if (!pluginOptions.collections?.[collection]?.enabled) {
        return Response.json({ error: 'Collection not enabled for search' }, { status: 400 })
      }

      if (!q.trim()) {
        return Response.json({ error: 'Query parameter "q" is required' }, { status: 400 })
      }

      const fields =
        pluginOptions.collections?.[collection]?.searchFields?.join(',') || 'title,content'

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

      const cacheKey = { fields, page, per_page, sort_by }
      const cached = searchCache.get(q, collection, cacheKey)

      if (cached) {
        return Response.json(cached)
      }

      const results = await typesenseClient.collections(collection).documents().search(searchParams)

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
