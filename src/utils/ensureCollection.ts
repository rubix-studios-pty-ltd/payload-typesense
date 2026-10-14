import type Typesense from 'typesense'
import { type CollectionUpdateSchema } from 'typesense/lib/Typesense/Collection.js'

import { type CollectionSchema, type Readiness, type TypesenseConfig } from '../types.js'

export async function ensureCollection(
  client: Typesense.Client,
  slug: string,
  schema: CollectionSchema,
  vector?: NonNullable<TypesenseConfig['vectorSearch']>,
  reconcile = false
): Promise<Readiness> {
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
      existing = await client.collections().create(schema)
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
          // Another request may have created the collection.
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

  type ExistingField = (typeof existing.fields)[number]

  function isIndexed(field: ExistingField | undefined): boolean {
    return field?.type === 'float[]' && (field.num_dim ?? 0) > 0 && field.index !== false
  }

  const current = existing.fields.find((field) => field.name === 'embedding')

  if (!vector?.enabled) {
    return { available: true, embedding: isIndexed(current) }
  }

  const desired = schema.fields.find((field) => field.name === 'embedding')

  if (!desired) {
    return { available: true, embedding: false }
  }

  const expectedEmbedding = desired.embed
  const expectedDimensions = desired.num_dim

  function isReady(field: ExistingField | undefined): boolean {
    if (!field || !isIndexed(field)) return false

    if (expectedDimensions !== undefined && field.num_dim !== expectedDimensions) {
      return false
    }

    if (!expectedEmbedding) return true

    const actualEmbedding = field.embed

    if (!actualEmbedding) return false

    return (
      actualEmbedding.model_config?.model_name === expectedEmbedding.model_config.model_name &&
      actualEmbedding.from.length === expectedEmbedding.from.length &&
      actualEmbedding.from.every((source, index) => source === expectedEmbedding.from[index])
    )
  }

  if (isReady(current)) {
    return { available: true, embedding: true }
  }

  const fields: NonNullable<CollectionUpdateSchema['fields']> = []

  if (current) {
    fields.push({ name: 'embedding', drop: true })
  }

  fields.push(desired)

  try {
    existing = await client.collections(slug).update({ fields })

    return {
      available: true,
      embedding: isReady(existing.fields.find((field) => field.name === 'embedding')),
    }
  } catch (error) {
    try {
      existing = await client.collections(slug).retrieve()

      if (isReady(existing.fields.find((field) => field.name === 'embedding'))) {
        return { available: true, embedding: true }
      }
    } catch {
      // Preserve the original alteration error for logging.
    }

    console.warn(
      `Could not configure embedding field for collection ${slug}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    )

    return { available: true, embedding: false }
  }
}
