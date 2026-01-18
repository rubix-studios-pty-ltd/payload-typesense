import { type PayloadHandler, type PayloadRequest } from 'payload'
import type Typesense from 'typesense'

import { type TypesenseConfig } from '../../types.js'

export const createSuggest = (
  typesenseClient: Typesense.Client,
  pluginOptions: TypesenseConfig
): PayloadHandler => {
  return async (request: PayloadRequest) => {
    if (!request.url) {
      return Response.json({ error: 'Request URL missing' }, { status: 400 })
    }

    const url = new URL(request.url)

    const parts = url.pathname.split('/')
    const searchIndex = parts.indexOf('search')
    const collectionName = searchIndex >= 0 ? parts[searchIndex + 1] : ''
    const collection = String(collectionName || '')

    if (!collection || !pluginOptions.collections?.[collection]?.enabled) {
      return Response.json({ error: 'Collection not enabled for search' }, { status: 400 })
    }

    const q = url.searchParams.get('q')
    const limitStr = url.searchParams.get('limit')
    const limit = Number(limitStr ?? 5)

    if (!q) {
      return Response.json({ error: 'Query parameter "q" is required' }, { status: 400 })
    }

    const fields =
      pluginOptions.collections?.[collection]?.searchFields?.join(',') || 'title,content'

    try {
      const suggestResults = await typesenseClient.collections(collection).documents().search({
        highlight_full_fields: fields,
        per_page: limit,
        q,
        query_by: fields,
        snippet_threshold: 30,
      })

      return Response.json(suggestResults)
    } catch {
      return Response.json({ error: 'Suggest failed' }, { status: 500 })
    }
  }
}
