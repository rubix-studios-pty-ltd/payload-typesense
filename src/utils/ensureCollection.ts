import type Typesense from 'typesense'

import { type CollectionSchema } from '../types.js'

export const ensureCollection = async (
  typesenseClient: Typesense.Client,
  collectionSlug: string,
  schema: CollectionSchema
): Promise<boolean> => {
  try {
    await typesenseClient.collections(collectionSlug).retrieve()
    return true
  } catch {
    try {
      await typesenseClient.collections().create(schema)
      return true
    } catch {
      return false
    }
  }
}
