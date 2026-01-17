import type Typesense from 'typesense'

import { type TypesenseConfig } from '../types.js'

/**
 * Perform vector search using Typesense's auto-embedding capabilities.
 * When collections have auto-embedding fields defined in the schema,
 * Typesense automatically converts the query text to vectors and searches semantically.
 */
export async function performVectorSearch(
  typesenseClient: Typesense.Client,
  pluginOptions: TypesenseConfig,
  query: string,
  options: {
    collection: string
    embeddingModel?: string
    page: number
    per_page: number
    vectorField?: string
  }
): Promise<any> {
  const { collection, page, per_page, vectorField } = options
  const vectorConfig = pluginOptions.vectorSearch

  // Use configured vector field or default - this should match the field defined in schema
  const searchVectorField = vectorField || vectorConfig?.defaultVectorField || 'embedding'

  // Perform semantic search by querying the auto-embedding field
  // Typesense automatically converts the query text to vectors and finds semantic matches
  const searchParams = {
    page,
    per_page,
    q: query,
    query_by: searchVectorField,
    // Optimized for semantic search
    num_typos: 0,
    search_cutoff_ms: 5000,
  }

  return await typesenseClient.collections(collection).documents().search(searchParams)
}
