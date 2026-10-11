import { type PayloadHandler, type PayloadRequest } from 'payload'
import type Typesense from 'typesense'

import { type TypesenseConfig } from '../../types.js'

export const createSuggest = (
  client: Typesense.Client,
  config: TypesenseConfig
): PayloadHandler => {
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

    const parts = url.pathname.split('/')
    const searchIndex = parts.indexOf('search')
    const collection = searchIndex >= 0 ? parts[searchIndex + 1] : undefined
    const settings = collection ? config.collections?.[collection] : undefined

    if (!collection || !settings?.enabled) {
      return Response.json({ error: 'Collection not enabled for search' }, { status: 400 })
    }

    const q = url.searchParams.get('q')?.trim()
    const limit = Number(url.searchParams.get('limit') ?? 5)

    if (!q) {
      return Response.json({ error: 'Query parameter "q" is required' }, { status: 400 })
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return Response.json({ error: 'Limit must be between 1 and 100' }, { status: 400 })
    }

    const fields = settings.searchFields?.length ? settings.searchFields.join(',') : 'title,content'

    try {
      const results = await client.collections(collection).documents().search({
        highlight_full_fields: fields,
        per_page: limit,
        q,
        query_by: fields,
        snippet_threshold: 30,
      })

      return Response.json(results)
    } catch {
      return Response.json({ error: 'Suggest failed' }, { status: 500 })
    }
  }
}
