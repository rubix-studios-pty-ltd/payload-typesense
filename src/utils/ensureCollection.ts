import type Typesense from 'typesense'

import { type CollectionSchema, type TypesenseConfig } from '../types.js'

export const ensureCollection = async (
  client: Typesense.Client,
  slug: string,
  schema: CollectionSchema,
  vector?: NonNullable<TypesenseConfig['vectorSearch']>
): Promise<boolean> => {
  let existing

  try {
    existing = await client.collections(slug).retrieve()
  } catch (error) {
    if (
      !error ||
      typeof error !== 'object' ||
      !('httpStatus' in error) ||
      error.httpStatus !== 404
    ) {
      return false
    }

    try {
      await client.collections().create(schema)
      return true
    } catch {
      return false
    }
  }

  if (!vector?.enabled) return true

  const hasField = existing.fields?.some((field) => field.name === 'embedding')
  if (hasField) return true

  const field = schema.fields.find((field) => field.name === 'embedding')
  if (!field) return false

  try {
    await client.collections(slug).update({
      fields: [field],
    })

    return true
  } catch (error) {
    console.warn(
      `Could not add embedding field to collection ${slug}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    )

    return false
  }
}
