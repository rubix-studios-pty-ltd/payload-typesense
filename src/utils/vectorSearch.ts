import type Typesense from 'typesense'

import { buildParameters } from '../lib/search.js'
import { type TypesenseConfig } from '../types.js'

export async function vectorSearch(
  client: Typesense.Client,
  query: string,
  options: {
    collection: string
    page: number
    per_page: number
    sort_by?: string
    vectorSearch?: TypesenseConfig['vectorSearch']
  }
) {
  const { collection, page, per_page } = options

  const pageNum = Number.isInteger(page) && page > 0 ? page : 1
  const perPage = Number.isInteger(per_page) && per_page > 0 ? Math.min(per_page, 250) : 10

  return client
    .collections(collection)
    .documents()
    .search(
      buildParameters(
        {
          vectorSearch: { ...options.vectorSearch, enabled: true },
        },
        [],
        {
          page: pageNum,
          per_page: perPage,
          q: query,
          search_mode: 'semantic',
          ...(options.sort_by ? { sort_by: options.sort_by } : {}),
        }
      )
    )
}
