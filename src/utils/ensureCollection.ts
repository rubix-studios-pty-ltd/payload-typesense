import type Typesense from 'typesense'
import { type CollectionUpdateSchema } from 'typesense/lib/Typesense/Collection.js'

import { type CollectionSchema, type Readiness, type TypesenseConfig } from '../types.js'

export const ensureCollection = async (
  client: Typesense.Client,
  slug: string,
  schema: CollectionSchema,
  vector?: NonNullable<TypesenseConfig['vectorSearch']>,
  reconcile = false
): Promise<Readiness> => {
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
      return { available: false, embedding: false }
    }

    try {
      await client.collections().create(schema)
      return { available: true, embedding: Boolean(vector?.enabled) }
    } catch (error) {
      if (vector?.enabled) {
        try {
          await client.collections().create({
            ...schema,
            fields: schema.fields.filter((field) => field.name !== 'embedding'),
          })

          console.warn(`Created keyword collection ${slug} without embedding support`)

          return { available: true, embedding: false }
        } catch {
          // Another request may have created the collection
        }
      }

      try {
        existing = await client.collections(slug).retrieve()
      } catch {
        console.warn(
          `Could not create collection ${slug}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        )

        return { available: false, embedding: false }
      }
    }
  }

  if (reconcile) {
    const fields: NonNullable<CollectionUpdateSchema['fields']> = []

    for (const field of schema.fields) {
      if (field.name === 'embedding' || field.name === 'id') continue

      const current = existing.fields.find((item) => item.name === field.name)

      if (!current) {
        fields.push({ ...field, optional: true })
        continue
      }

      const facetChanged = Boolean(current.facet) !== Boolean(field.facet)
      const sortChanged = field.sort !== undefined && Boolean(current.sort) !== field.sort

      if (!facetChanged && !sortChanged) continue

      fields.push(
        { name: field.name, drop: true },
        {
          ...current,
          facet: field.facet ?? false,
          ...(field.sort !== undefined && { sort: field.sort }),
        }
      )
    }

    if (fields.length) {
      try {
        existing = await client.collections(slug).update({ fields })
      } catch (error) {
        console.warn(
          `Could not reconcile collection ${slug}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        )
      }
    }
  }

  const embedding = existing.fields.some((field) => field.name === 'embedding')

  if (!vector?.enabled || embedding) {
    return { available: true, embedding }
  }

  const field = schema.fields.find((field) => field.name === 'embedding')
  if (!field) return { available: true, embedding: false }

  try {
    await client.collections(slug).update({
      fields: [field],
    })

    return { available: true, embedding: true }
  } catch (error) {
    console.warn(
      `Could not add embedding field to collection ${slug}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    )

    return { available: true, embedding: false }
  }
}
