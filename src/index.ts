import { type Config } from 'payload'

import { createSearchEndpoints } from './endpoints/search.js'
import { createClient } from './lib/client.js'
import { deleteDocumentFromTypesense, syncDocumentToTypesense } from './lib/hooks.js'
import { initializeTypesense } from './lib/initialization.js'
import { type TypesenseConfig } from './types.js'

export * from './components/index.js'

export const typesenseSearch =
  (pluginOptions: TypesenseConfig) =>
  (config: Config): Config => {
    if (pluginOptions.disabled) {
      return config
    }

    const client = createClient(pluginOptions.typesense)

    config.endpoints = [
      ...(config.endpoints || []),
      ...createSearchEndpoints(client, pluginOptions, Date.now()),
    ]

    const shouldAutoSync = pluginOptions.settings?.autoSync !== false
    const hasCollections = !!pluginOptions.collections

    if (shouldAutoSync && hasCollections) {
      config.collections = (config.collections || []).map((collection) => {
        const colConfig = pluginOptions.collections?.[collection.slug]
        if (!colConfig?.enabled) {
          return collection
        }

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

    const existingOnInit = config.onInit
    config.onInit = async (payload) => {
      if (existingOnInit) {
        await existingOnInit(payload)
      }
      await initializeTypesense(payload, client, pluginOptions)
    }

    return config
  }
