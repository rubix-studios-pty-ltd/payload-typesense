import { type Config } from 'payload'

import { createSearchEndpoints } from './endpoints/search.js'
import { createClient } from './lib/client.js'
import { deleteDoc, syncDoc } from './lib/hooks.js'
import { initializeTypesense } from './lib/initialization.js'
import { getErrors, validateConfig } from './lib/validation.js'
import { type TypesenseConfig } from './types.js'

export * from './components/index.js'
export type { TypesenseConfig } from './types.js'

export const typesenseSearch =
  (pluginConfig: TypesenseConfig) =>
  (incomingConfig: Config): Config => {
    if (pluginConfig.disabled) return incomingConfig

    const validate = validateConfig(pluginConfig)
    if (!validate.success) {
      throw new Error(`Invalid configuration\n${getErrors(validate.errors ?? [])}`)
    }

    const client = createClient(pluginConfig.typesense)

    const sync = pluginConfig.settings?.autoSync !== false
    const existingOnInit = incomingConfig.onInit

    const collections = incomingConfig.collections?.map((collection) => {
      const config = pluginConfig.collections?.[collection.slug]

      if (!sync || !config?.enabled) {
        return collection
      }

      return {
        ...collection,
        hooks: {
          ...collection.hooks,
          afterChange: [
            ...(collection.hooks?.afterChange || []),
            async ({ doc }) =>
              syncDoc(client, collection.slug, doc, config, pluginConfig.vectorSearch),
          ],
          afterDelete: [
            ...(collection.hooks?.afterDelete || []),
            async ({ doc }) => {
              if (typeof doc.id === 'string' || typeof doc.id === 'number') {
                await deleteDoc(client, collection.slug, String(doc.id))
              }
            },
          ],
        },
      }
    })

    return {
      ...incomingConfig,
      collections,
      endpoints: [
        ...(incomingConfig.endpoints || []),
        ...createSearchEndpoints(client, pluginConfig),
      ],
      onInit: async (payload) => {
        if (existingOnInit) {
          await existingOnInit(payload)
        }

        await initializeTypesense(payload, client, pluginConfig)
      },
    }
  }
