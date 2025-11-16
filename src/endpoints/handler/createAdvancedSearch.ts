import type Typesense from 'typesense'

import { type PayloadHandler, type PayloadRequest } from 'payload'

import { type TypesenseConfig } from '../../index.js'

export const createAdvancedSearch = (
  typesenseClient: Typesense.Client,
  pluginOptions: TypesenseConfig
): PayloadHandler => {
  return async (request: PayloadRequest) => {
    if (!request.url) {
      return Response.json({ error: 'Missing request URL' }, { status: 400 })
    }

    const url = new URL(request.url)

    const parts = url.pathname.split('/')
    const searchIndex = parts.indexOf('search')
    const collection =
      searchIndex >= 0 && parts[searchIndex + 1] ? String(parts[searchIndex + 1]) : ''

    if (!pluginOptions.collections?.[collection]?.enabled) {
      return Response.json({ error: 'Collection not enabled for search' }, { status: 400 })
    }

    if (!request.data) {
      return Response.json({ error: 'Missing search parameters in request body' }, { status: 400 })
    }

    const body = request.data

    try {
      const results = await typesenseClient.collections(collection).documents().search(body)

      return Response.json(results)
    } catch {
      return Response.json({ error: 'Advanced search failed' }, { status: 500 })
    }
  }
}
