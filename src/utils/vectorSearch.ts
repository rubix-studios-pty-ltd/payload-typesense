import type Typesense from 'typesense'

export async function performVectorSearch(
  typesenseClient: Typesense.Client,
  query: string,
  options: {
    collection: string
    page: number
    per_page: number
  }
): Promise<any> {
  const { collection, page, per_page } = options

  const searchParams = {
    num_typos: 0,
    page,
    per_page,
    q: query,
    query_by: 'embedding',
    search_cutoff_ms: 5000,
  }

  return await typesenseClient.collections(collection).documents().search(searchParams)
}
