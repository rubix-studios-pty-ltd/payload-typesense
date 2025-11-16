import type { Config } from 'payload'

import { createSearchEndpoints } from './endpoints/search.js'
import { createClient } from './lib/client.js'
import { deleteDocumentFromTypesense, syncDocumentToTypesense } from './lib/hooks.js'
import { initializeTypesenseCollections } from './lib/initialization.js'

export * from './components/index.js'

export type TypesenseConfig = {
  collections?: Partial<
    Record<
      string,
      {
        displayName?: string
        enabled: boolean
        facetFields?: string[]
        icon?: string
        searchFields?: string[]
        sortFields?: string[]
      }
    >
  >

  disabled?: boolean

  settings?: {
    autoSync?: boolean
    batchSize?: number
    categorized?: boolean
    searchEndpoint?: string
  }

  typesense: {
    apiKey: string
    connectionTimeoutSeconds?: number
    nodes: Array<{
      host: string
      port: number | string
      protocol: 'http' | 'https'
    }>
  }
}

export const typesenseSearch =
  (pluginOptions: TypesenseConfig) =>
  (config: Config): Config => {
    if (pluginOptions.disabled) {
      return config
    }

    const typesenseClient = createClient(pluginOptions.typesense)

    config.endpoints = [
      ...(config.endpoints || []),
      ...createSearchEndpoints(typesenseClient, pluginOptions, Date.now()),
    ]

    if (pluginOptions.settings?.autoSync !== false && pluginOptions.collections) {
      config.collections = (config.collections || []).map((collection) => {
        const collectionConfig = pluginOptions.collections?.[collection.slug]

        if (collectionConfig?.enabled) {
          return {
            ...collection,
            hooks: {
              ...collection.hooks,
              afterChange: [
                ...(collection.hooks?.afterChange || []),
                async ({ doc, operation, req: _req }) => {
                  await syncDocumentToTypesense(
                    typesenseClient,
                    collection.slug,
                    doc,
                    operation,
                    collectionConfig
                  )
                },
              ],
              afterDelete: [
                ...(collection.hooks?.afterDelete || []),
                async ({ doc, req: _req }) => {
                  await deleteDocumentFromTypesense(typesenseClient, collection.slug, doc.id)
                },
              ],
            },
          }
        }

        return collection
      })
    }

    const incomingOnInit = config.onInit
    config.onInit = async (payload) => {
      if (incomingOnInit) {
        await incomingOnInit(payload)
      }

      await initializeTypesenseCollections(payload, typesenseClient, pluginOptions)
    }

    return config
  }
