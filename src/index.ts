import { type Config } from 'payload'

import { createSearchEndpoints } from './endpoints/search.js'
import { createClient } from './lib/client.js'
import { deleteDocumentFromTypesense, syncDocumentToTypesense } from './lib/hooks.js'
import { initializeTypesense } from './lib/initialization.js'
import { type TypesenseConfig } from './types.js'

export * from './components/index.js'
export { type TypesenseConfig } from './types.js'

export const typesenseSearch =
  (pluginConfig: TypesenseConfig) =>
  (incomingConfig: Config): Config => {
    if (pluginConfig.disabled) return incomingConfig

    const client = createClient(pluginConfig.typesense)

    incomingConfig.endpoints = [
      ...(incomingConfig.endpoints || []),
      ...createSearchEndpoints(client, pluginConfig, Date.now()),
    ]

    const shouldAutoSync = pluginConfig.settings?.autoSync !== false
    const hasCollections = !!pluginConfig.collections

    if (shouldAutoSync && hasCollections) {
      incomingConfig.collections = (incomingConfig.collections || []).map((collection) => {
        const colConfig = pluginConfig.collections?.[collection.slug]
        if (!colConfig?.enabled) return collection

        return {
          ...collection,
          hooks: {
            ...collection.hooks,
            afterChange: [
              ...(collection.hooks?.afterChange || []),
              async ({ doc, operation }) =>
                syncDocumentToTypesense(client, collection.slug, doc, operation, colConfig),
            ],
            afterDelete: [
              ...(collection.hooks?.afterDelete || []),
              async ({ doc }) => deleteDocumentFromTypesense(client, collection.slug, doc.id),
            ],
          },
        }
      })
    }

    const existingOnInit = incomingConfig.onInit

    incomingConfig.onInit = async (payload) => {
      if (existingOnInit) {
        await existingOnInit(payload)
      }
      await initializeTypesense(payload, client, pluginConfig)
    }

    return incomingConfig
  }
