import { type Payload } from 'payload'
import type Typesense from 'typesense'

import {
  type BaseDocument,
  type ImportError,
  type TypesenseCollectionConfig,
  type TypesenseConfig,
} from '../types.js'
import { ensureCollection } from '../utils/ensureCollection.js'
import { testConnection } from '../utils/testConnection.js'
import { mapCollection, mapDoc } from './schema-mapper.js'

export async function initializeTypesense(
  payload: Payload,
  client: Typesense.Client,
  options: TypesenseConfig
): Promise<void> {
  const connected = await testConnection(client)
  if (!connected) return

  const vector = options.vectorSearch
  const autoSync = options.settings?.autoSync !== false

  for (const [slug, config] of Object.entries(options.collections || {})) {
    if (!config?.enabled) continue

    await initializeCollection(payload, client, slug, config, vector, autoSync)
  }
}

async function initializeCollection(
  payload: Payload,
  client: Typesense.Client,
  slug: string,
  config: TypesenseCollectionConfig,
  vector?: NonNullable<TypesenseConfig['vectorSearch']>,
  autoSync = true
): Promise<void> {
  if (!payload.collections[slug]) return

  const schema = mapCollection(slug, config, vector)
  const { available } = await ensureCollection(client, slug, schema, vector, true)

  if (!available || !autoSync) return

  await syncExisting(payload, client, slug, config, vector)
}

async function syncExisting(
  payload: Payload,
  client: Typesense.Client,
  slug: string,
  config: NonNullable<TypesenseConfig['collections']>[string],
  vector?: NonNullable<TypesenseConfig['vectorSearch']>
): Promise<void> {
  try {
    const limit = config.syncLimit ?? 1000
    const batchSize = 100

    let page = 1
    let hasMore = true

    while (hasMore) {
      const { docs, hasNextPage } = await payload.find({
        collection: slug,
        depth: 0,
        limit,
        page,
      })

      if (!docs.length) break

      for (let index = 0; index < docs.length; index += batchSize) {
        const batch = docs.slice(index, index + batchSize)

        const mapped = batch
          .filter((doc): doc is BaseDocument => {
            if (typeof doc !== 'object' || doc === null) return false
            if (!('id' in doc)) return false

            const id = (doc as Record<string, unknown>).id
            return typeof id === 'string' || typeof id === 'number'
          })
          .map((doc) => mapDoc(doc, slug, config, vector))
          .filter((doc): doc is Record<string, number | string> => doc !== null)

        if (!mapped.length) continue

        try {
          await client.collections(slug).documents().import(mapped, {
            action: 'upsert',
          })
        } catch (error) {
          const results = (error as ImportError).importResults

          if (!Array.isArray(results)) {
            payload.logger.error({
              err: error,
              msg: `Failed to import Typesense documents for ${slug}`,
            })

            return
          }

          for (const [index, result] of results.entries()) {
            if (result.success) continue

            const document = mapped[index]
            if (!document) continue

            try {
              await client.collections(slug).documents().upsert(document)
            } catch (syncError) {
              payload.logger.error({
                err: syncError,
                msg: `Failed to sync Typesense document in ${slug}`,
              })
            }
          }
        }
      }

      hasMore = hasNextPage
      page++
    }
  } catch (error) {
    payload.logger.error({
      err: error,
      msg: `Failed to synchronize Typesense collection ${slug}`,
    })
  }
}
