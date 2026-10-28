import type Typesense from 'typesense'

import { buildParameters } from '../lib/search.js'
import { type VectorOptions } from '../types.js'

function getPagination(options: VectorOptions) {
  const { page, per_page } = options

  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    per_page: Number.isInteger(per_page) && per_page > 0 ? Math.min(per_page, 250) : 10,
  }
}

function getParameters(query: string, options: VectorOptions) {
  return buildParameters(
    {
      vectorSearch: { ...options.vectorSearch, enabled: true },
    },
    [],
    {
      ...getPagination(options),
      q: query,
      search_mode: 'semantic',
      ...(options.sort_by ? { sort_by: options.sort_by } : {}),
    }
  )
}

export async function vectorSearch(
  client: Typesense.Client,
  query: string,
  options: VectorOptions
) {
  return client.collections(options.collection).documents().search(getParameters(query, options))
}
