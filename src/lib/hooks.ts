import type Typesense from 'typesense'

import {
  type BaseDocument,
  type TypesenseCollectionConfig,
  type TypesenseConfig,
} from '../types.js'
import { ensureCollection } from '../utils/ensureCollection.js'
import { mapCollectionToTypesense, mapToTypesense } from './schema-mapper.js'

export const syncDoc = async (
  client: Typesense.Client,
  slug: string,
  doc: BaseDocument,
  config: TypesenseCollectionConfig,
  vector?: NonNullable<TypesenseConfig['vectorSearch']>
): Promise<void> => {
  try {
    const document = mapToTypesense(doc, slug, config)
    if (!document) return

    const schema = mapCollectionToTypesense(slug, config, vector)
    const exists = await ensureCollection(client, slug, schema, vector)

    if (!exists) return

    await client.collections(slug).documents().upsert(document)
  } catch {
    // Avoid interrupting Payload document saves
  }
}

export const deleteDoc = async (
  client: Typesense.Client,
  slug: string,
  id: string
): Promise<void> => {
  try {
    await client.collections(slug).documents(id).delete()
  } catch {
    // Avoid interrupting Payload document deletions
  }
}
