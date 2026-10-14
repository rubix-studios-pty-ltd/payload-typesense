import { type PayloadHandler, type PayloadRequest } from 'payload'
import type Typesense from 'typesense'

import { buildParameters, getCollectionName } from '../../lib/search.js'
import { type TypesenseConfig } from '../../types.js'

export const createSuggest = (
  client: Typesense.Client,
  config: TypesenseConfig
): PayloadHandler => {
  return async (request: PayloadRequest): Promise<Response> => {
    let url: URL
    let collection: string | undefined

    try {
      if (!request.url) throw new Error('Request URL missing')
      url = new URL(request.url)
      collection = getCollectionName(url)
    } catch {
      return Response.json({ error: 'Invalid request URL' }, { status: 400 })
    }

    const settings = collection ? config.collections?.[collection] : undefined
    if (!collection || !settings?.enabled) {
      return Response.json({ error: 'Collection not enabled for search' }, { status: 400 })
    }

    const q = url.searchParams.get('q')?.trim()
    const limit = Number(url.searchParams.get('limit') ?? 5)

    if (!q) return Response.json({ error: 'Query parameter "q" is required' }, { status: 400 })
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return Response.json({ error: 'Limit must be between 1 and 100' }, { status: 400 })
    }

    try {
      const fields = settings.searchFields?.length
        ? settings.searchFields
        : ['title', 'content', 'description']

      const results = await client
        .collections(collection)
        .documents()
        .search(buildParameters(config, fields, { q, per_page: limit, search_mode: 'keyword' }))
      return Response.json(results)
    } catch {
      return Response.json({ error: 'Suggest failed' }, { status: 500 })
    }
  }
}
