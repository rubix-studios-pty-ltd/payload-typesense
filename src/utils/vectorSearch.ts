import type Typesense from 'typesense'

export async function vectorSearch(
  typesenseClient: Typesense.Client,
  query: string,
  options: {
    collection: string
    page: number
    per_page: number
  }
): Promise<any> {
  const { collection, page, per_page } = options

  const pageNum = Number.isFinite(page) && page > 0 ? page : 1
  const perPageNum = Number.isFinite(per_page) && per_page > 0 ? Math.min(per_page, 250) : 10

  const searchParams: Record<string, unknown> = {
    num_typos: 0,
    page: pageNum,
    per_page: perPageNum,
    q: query,
    query_by: 'embedding',
    search_cutoff_ms: 5000,
  }

  return await typesenseClient.collections(collection).documents().search(searchParams)
}
