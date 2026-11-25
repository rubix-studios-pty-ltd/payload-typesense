import type Typesense from 'typesense'

import {
  type BaseDocument,
  type TypesenseCollectionConfig,
  type TypesenseConfig,
} from '../types.js'
import { ensureCollection } from '../utils/ensureCollection.js'
import { searchCache } from './cache.js'
import { mapCollection, mapDoc } from './schema-mapper.js'

export const syncDoc = async (
  client: Typesense.Client,
  slug: string,
  doc: BaseDocument,
  config: TypesenseCollectionConfig,
  vector?: NonNullable<TypesenseConfig['vectorSearch']>
): Promise<void> => {
  try {
    const document = mapDoc(doc, slug, config, vector)

    if (!document) {
      await deleteDoc(client, slug, String(doc.id))
      return
    }

    const schema = mapCollection(slug, config, vector)
    const { available } = await ensureCollection(client, slug, schema, vector)

    if (!available) {
      console.error(`Typesense collection unavailable during synchronisation: ${slug}`)
      return
    }

    await client.collections(slug).documents().upsert(document)
  } catch {
    console.error(`Failed to synchronise Typesense document in ${slug}`)
  } finally {
    searchCache.invalidate(slug)
  }
}

export const deleteDoc = async (
  client: Typesense.Client,
  slug: string,
  id: string
): Promise<void> => {
  try {
    await client.collections(slug).documents(id).delete()
  } catch (error) {
    if (
      !error ||
      typeof error !== 'object' ||
      !('httpStatus' in error) ||
      error.httpStatus !== 404
    ) {
      console.error(`Failed to delete Typesense document in ${slug}`)
    }
  } finally {
    searchCache.invalidate(slug)
  }
}
