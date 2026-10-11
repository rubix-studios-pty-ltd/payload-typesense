import type Typesense from 'typesense'

import {
  type BaseDocument,
  type TypesenseCollectionConfig,
  type TypesenseConfig,
} from '../types.js'
import { ensureCollection } from '../utils/ensureCollection.js'
import { mapCollection, mapDoc } from './schema-mapper.js'

export const syncDoc = async (
  client: Typesense.Client,
  slug: string,
  doc: BaseDocument,
  config: TypesenseCollectionConfig,
  vector?: NonNullable<TypesenseConfig['vectorSearch']>
): Promise<void> => {
  try {
    const document = mapDoc(doc, slug, config)

    if (!document) {
      await deleteDoc(client, slug, String(doc.id))
      return
    }

    const schema = mapCollection(slug, config, vector)
    const { available } = await ensureCollection(client, slug, schema, vector)

    if (!available) return

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
