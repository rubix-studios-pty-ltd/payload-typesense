import { type PayloadHandler, type PayloadRequest } from 'payload'
import type Typesense from 'typesense'

import { type TypesenseConfig } from '../../types.js'

export const createAdvancedSearch = (
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

    if (request.data == null && !request.body) {
      return Response.json({ error: 'Missing search parameters in request body' }, { status: 400 })
    }

    let body: unknown = request.data

    if (body == null) {
      if (typeof request.json !== 'function') {
        return Response.json({ error: 'Unable to read request body' }, { status: 400 })
      }

      try {
        body = await request.json()
      } catch {
        return Response.json({ error: 'Invalid JSON request body' }, { status: 400 })
      }
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return Response.json({ error: 'Invalid search parameters' }, { status: 400 })
    }

    const params = body as Record<string, unknown>

    if (
      params.page !== undefined &&
      (typeof params.page !== 'number' || !Number.isInteger(params.page) || params.page < 1)
    ) {
      return Response.json({ error: 'Invalid page parameter' }, { status: 400 })
    }

    if (
      params.per_page !== undefined &&
      (typeof params.per_page !== 'number' ||
        !Number.isInteger(params.per_page) ||
        params.per_page < 1 ||
        params.per_page > 250)
    ) {
      return Response.json({ error: 'Invalid per_page parameter' }, { status: 400 })
    }

    if (params.q !== undefined && typeof params.q !== 'string') {
      return Response.json({ error: 'Invalid query parameter' }, { status: 400 })
    }

    if (
      params.query_by !== undefined &&
      typeof params.query_by !== 'string' &&
      !(
        Array.isArray(params.query_by) &&
        params.query_by.every((field) => typeof field === 'string')
      )
    ) {
      return Response.json({ error: 'Invalid query_by parameter' }, { status: 400 })
    }

    try {
      const results = await client
        .collections(collection)
        .documents()
        .search(params as { q?: string; query_by?: string | string[] })

      return Response.json(results)
    } catch {
      return Response.json({ error: 'Advanced search failed' }, { status: 500 })
    }
  }
}
