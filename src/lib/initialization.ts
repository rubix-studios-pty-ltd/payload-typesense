import type Typesense from 'typesense'

import { type Payload } from 'payload'

import { type BaseDocument, type ImportError, type TypesenseConfig } from '../types.js'
import { ensureCollection } from '../utils/ensureCollection.js'
import { testConnection } from '../utils/testConnection.js'
import { mapCollectionToTypesense, mapToTypesense } from './schema-mapper.js'
import { validateConfig } from './validation.js'

export const initializeTypesense = async (
  payload: Payload,
  typesenseClient: Typesense.Client,
  pluginOptions: TypesenseConfig
) => {
  const validation = validateConfig(pluginOptions)
  if (!validation.success) {
    throw new Error('Invalid plugin configuration')
  }

  const isConnected = await testConnection(typesenseClient)
  if (!isConnected) {
    return
  }

  const entries = Object.entries(pluginOptions.collections || {})
  for (const [slug, cfg] of entries) {
    if (cfg?.enabled) {
      await initializeCollection(payload, typesenseClient, slug, cfg)
    }
  }
}

const initializeCollection = async (
  payload: Payload,
  typesenseClient: Typesense.Client,
  collectionSlug: string,
  config: NonNullable<TypesenseConfig['collections']>[string] | undefined
) => {
  const collection = payload.collections[collectionSlug]

  if (!collection) {
    return
  }

  const schema = mapCollectionToTypesense(collectionSlug, config)

  const exists = await ensureCollection(typesenseClient, collectionSlug, schema)
  if (!exists) {
    return
  }

  await syncExistingDocuments(payload, typesenseClient, collectionSlug, config)
}

const syncExistingDocuments = async (
  payload: Payload,
  typesenseClient: Typesense.Client,
  collectionSlug: string,
  config: NonNullable<TypesenseConfig['collections']>[string] | undefined
) => {
  try {
    const { docs } = await payload.find({
      collection: collectionSlug,
      depth: 0,
      limit: 1000,
    })

    if (!docs.length) {
      return
    }

    const batchSize = 100

    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = docs.slice(i, i + batchSize)
      const mapped = batch
        .filter((doc): doc is BaseDocument => {
          if (typeof doc !== 'object' || doc === null) {
            return false
          }

          if (!('id' in doc)) {
            return false
          }

          const id = (doc as Record<string, unknown>).id
          return typeof id === 'string'
        })
        .map((doc) => mapToTypesense(doc, collectionSlug, config))

      try {
        await typesenseClient
          .collections(collectionSlug)
          .documents()
          .import(mapped, { action: 'upsert' })
      } catch (error: unknown) {
        const err = error as ImportError
        if (err?.importResults) {
          for (const doc of mapped) {
            try {
              await typesenseClient.collections(collectionSlug).documents().upsert(doc)
            } catch {
              // ignore individual errors
            }
          }
        }
      }
    }
  } catch {
    // ignore main sync errors
  }
}
