import type Typesense from 'typesense'

export async function vectorSearch(
  client: Typesense.Client,
  query: string,
  options: {
    collection: string
    page: number
    per_page: number
    sort_by?: string
  }
) {
  const { collection, page, per_page } = options

  const pageNum = Number.isInteger(page) && page > 0 ? page : 1
  const perPageNum = Number.isInteger(per_page) && per_page > 0 ? Math.min(per_page, 250) : 10

  return client
    .collections(collection)
    .documents()
    .search({
      num_typos: 0,
      page: pageNum,
      per_page: perPageNum,
      q: query,
      query_by: 'embedding',
      search_cutoff_ms: 5000,
      ...(options.sort_by ? { sort_by: options.sort_by } : {}),
    })
}
