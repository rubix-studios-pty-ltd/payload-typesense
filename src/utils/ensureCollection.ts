import type Typesense from 'typesense'

import { type CollectionSchema, type TypesenseConfig } from '../types.js'

export const ensureCollection = async (
  typesenseClient: Typesense.Client,
  collectionSlug: string,
  schema: CollectionSchema,
  vector?: NonNullable<TypesenseConfig['vectorSearch']>
): Promise<boolean> => {
  try {
    const existing = await typesenseClient.collections(collectionSlug).retrieve()

    if (vector?.enabled) {
      const hasEmbeddingField = (existing.fields as Array<{ name: string }> | undefined)?.some(
        (f) => f.name === 'embedding'
      )

      if (!hasEmbeddingField) {
        const embeddingField = schema.fields.find((f) => f.name === 'embedding')

        if (embeddingField) {
          try {
            await typesenseClient.collections(collectionSlug).update({
              fields: [embeddingField],
            })
          } catch (patchError) {
            console.warn(
              `Could not add embedding field to collection ${collectionSlug}: ${
                patchError instanceof Error ? patchError.message : 'Unknown error'
              }`
            )
          }
        }
      }
    }

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
