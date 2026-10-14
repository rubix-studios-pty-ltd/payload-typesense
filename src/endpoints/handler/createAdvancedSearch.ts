import { type PayloadHandler, type PayloadRequest } from 'payload'
import type Typesense from 'typesense'

import { buildParameters, getCollectionName, getSearchMode } from '../../lib/search.js'
import { getErrors, validateParams } from '../../lib/validation.js'
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

    let collection: string | undefined
    try {
      collection = getCollectionName(url)
    } catch {
      return Response.json({ error: 'Invalid collection name' }, { status: 400 })
    }
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

    const validation = validateParams({
      ...params,
      q: typeof params.q === 'string' ? params.q.trim() : params.q,
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

    try {
      getSearchMode(config, validation.data)

      if (params.vector_query !== undefined && !config.vectorSearch?.enabled) {
        throw new Error('Vector search requires vectorSearch.enabled')
      }
    } catch (error) {
      return Response.json({ error: (error as Error).message }, { status: 400 })
    }

    const requestedFields =
      typeof params.query_by === 'string' ? params.query_by.split(',') : params.query_by
    const fields =
      Array.isArray(requestedFields) && requestedFields.length
        ? requestedFields.map((field) => String(field).trim()).filter(Boolean)
        : settings.searchFields?.length
          ? settings.searchFields
          : ['title', 'content', 'description']
    const { search_mode: _mode, vector: _vector, ...overrides } = params

    if (getSearchMode(config, validation.data) !== 'keyword') {
      delete overrides.query_by
    }

    const searchParams = {
      ...buildParameters(config, fields, validation.data),
      ...overrides,
      q: validation.data.q,
      page: validation.data.page,
      per_page: validation.data.per_page,
    }

    try {
      const results = await client
        .collections(collection)
        .documents()
        .search(searchParams as { q: string; query_by: string | string[] })

      return Response.json(results)
    } catch {
      return Response.json({ error: 'Advanced search failed' }, { status: 500 })
    }
  }
}
