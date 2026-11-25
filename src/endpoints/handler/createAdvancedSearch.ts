import { type PayloadHandler, type PayloadRequest } from 'payload'
import type Typesense from 'typesense'

import { buildParameters } from '../../lib/search.js'
import { type AdvancedParams, AdvancedSchema, getErrors } from '../../lib/validation.js'
import { type TypesenseCollectionConfig, type TypesenseConfig } from '../../types.js'
import { getCollection } from '../../utils/getCollection.js'
import { getFilters } from '../../utils/getFilters.js'
import { getMode } from '../../utils/getMode.js'
import { getSort } from '../../utils/getSort.js'
import { validateFields } from '../../utils/validateFields.js'

const buildAdvancedParameters = (
  config: TypesenseConfig,
  settings: TypesenseCollectionConfig,
  params: AdvancedParams
) => {
  const searchFields = (
    settings.searchFields?.length ? settings.searchFields : ['title', 'content', 'description']
  ).filter((field) => field !== 'embedding' && /^[a-zA-Z0-9_.-]+$/.test(field))

  const facetFields = (settings.facetFields ?? []).filter(
    (field) => field !== 'embedding' && /^[a-zA-Z0-9_.-]+$/.test(field)
  )

  const sortFields = (settings.sortFields ?? []).filter(
    (field) => field !== 'embedding' && /^[a-zA-Z0-9_.-]+$/.test(field)
  )

  const fields = validateFields(params.query_by ?? searchFields, searchFields)
  const highlights = validateFields(params.highlight_fields ?? fields, searchFields)

  if (params.facets !== undefined && params.facet_by !== undefined) {
    throw new Error('Use either facets or facet_by')
  }

  const facets = validateFields(params.facets ?? params.facet_by ?? [], facetFields)
  const sort = getSort(params.sort_by, ['createdAt', 'updatedAt', '_text_match', ...sortFields])
  const filters = getFilters(params.filters, facetFields)

  const resultFields = [
    ...new Set([
      'id',
      'slug',
      'createdAt',
      'updatedAt',
      ...searchFields,
      ...facetFields,
      ...sortFields,
    ]),
  ]

  if (!fields.length && getMode(config, params) !== 'semantic') {
    throw new Error('At least one search field is required')
  }

  return {
    ...buildParameters(config, fields, {
      ...params,
      highlight_fields: highlights,
      sort_by: sort,
    }),
    include_fields: resultFields.join(','),
    exclude_fields: 'embedding',
    highlight_fields: highlights.join(',') || 'none',
    highlight_full_fields: highlights.join(',') || 'none',
    ...(facets.length > 0 && { facet_by: facets.join(',') }),
    ...(filters && { filter_by: filters }),
  }
}

export const createAdvancedSearch = (
  client: Typesense.Client,
  config: TypesenseConfig
): PayloadHandler => {
  return async (request: PayloadRequest): Promise<Response> => {
    if (!request.url) {
      return Response.json({ error: 'Request URL missing' }, { status: 400 })
    }

    let collection: string | undefined

    try {
      collection = getCollection(new URL(request.url))
    } catch {
      return Response.json({ error: 'Invalid request URL' }, { status: 400 })
    }

    const settings =
      collection && Object.hasOwn(config.collections ?? {}, collection)
        ? config.collections?.[collection]
        : undefined

    if (!collection || !settings?.enabled) {
      return Response.json({ error: 'Collection not enabled for search' }, { status: 400 })
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

    const validation = AdvancedSchema.safeParse(body)

    if (!validation.success) {
      return Response.json(
        {
          error: 'Invalid search parameters',
          details: getErrors(validation.error.issues.map((issue) => issue.message)),
        },
        { status: 400 }
      )
    }

    let searchParams: ReturnType<typeof buildAdvancedParameters>

    try {
      searchParams = buildAdvancedParameters(config, settings, validation.data)
    } catch (error) {
      return Response.json(
        { error: error instanceof Error ? error.message : 'Invalid search parameters' },
        { status: 400 }
      )
    }

    try {
      const results = await client.collections(collection).documents().search(searchParams)

      return Response.json({
        ...results,
        hits:
          results.hits?.map((hit) => ({
            ...hit,
            collection,
            displayName: settings.displayName ?? collection,
          })) ?? [],
      })
    } catch (error) {
      request.payload.logger.error({ err: error, msg: 'Typesense advanced search failed' })

      return Response.json({ error: 'Advanced search failed' }, { status: 500 })
    }
  }
}
