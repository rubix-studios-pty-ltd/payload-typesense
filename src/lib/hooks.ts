import type Typesense from 'typesense'

import { type CollectionAfterChangeHook, type CollectionAfterDeleteHook } from 'payload'

import { type TypesenseSearchConfig } from '../index.js'
import { ensureCollection } from '../utils/ensureCollection.js'
import { mapCollectionToTypesense, mapToTypesense } from './schema-mapper.js'

export const setupHooks = (
  typesenseClient: Typesense.Client,
  pluginOptions: TypesenseSearchConfig,
  existingHooks: {
    afterChange?: Record<string, CollectionAfterChangeHook[]>
    afterDelete?: Record<string, CollectionAfterDeleteHook[]>
  } = {}
) => {
  const hooks = { ...existingHooks }

  for (const [collectionSlug, config] of Object.entries(pluginOptions.collections || {})) {
    if (!config?.enabled) {
      continue
    }

    const changeHook: CollectionAfterChangeHook = async ({ doc, operation }) => {
      await syncDocumentToTypesense(typesenseClient, collectionSlug, doc, operation, config)
    }

    hooks.afterChange = {
      ...hooks.afterChange,
      [collectionSlug]: [...(hooks.afterChange?.[collectionSlug] || []), changeHook],
    }

    const deleteHook: CollectionAfterDeleteHook = async ({ doc }) => {
      if (typeof doc?.id === 'string' || typeof doc?.id === 'number') {
        await deleteDocumentFromTypesense(typesenseClient, collectionSlug, String(doc?.id))
      }
    }

    hooks.afterDelete = {
      ...hooks.afterDelete,
      [collectionSlug]: [...(hooks.afterDelete?.[collectionSlug] || []), deleteHook],
    }
  }

  return hooks
}

export const syncDocumentToTypesense = async (
  typesenseClient: Typesense.Client,
  collectionSlug: string,
  doc: any,
  _operation: 'create' | 'update',
  config: NonNullable<TypesenseSearchConfig['collections']>[string] | undefined
) => {
  try {
    const schema = mapCollectionToTypesense(collectionSlug, config)

    await ensureCollection(typesenseClient, collectionSlug, schema)

    const typesenseDoc = mapToTypesense(doc, collectionSlug, config)

    await typesenseClient.collections(collectionSlug).documents().upsert(typesenseDoc)
  } catch {
    // swallow to avoid breaking payload saves
  }
}

export const deleteDocumentFromTypesense = async (
  typesenseClient: Typesense.Client,
  collectionSlug: string,
  docId: string
) => {
  try {
    await typesenseClient.collections(collectionSlug).documents(docId).delete()
  } catch {
    // ignore delete errors
  }
}
