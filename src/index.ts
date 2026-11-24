import { type Config } from 'payload'

import { createEndpoints } from './endpoints/search.js'
import { createClient } from './lib/client.js'
import { initializeTypesense } from './lib/initialization.js'
import { getErrors, validateConfig } from './lib/validation.js'
import { type TypesenseConfig } from './types.js'

export * from './components/index.js'
export type { TypesenseConfig } from './types.js'

import { afterChange } from './lib/after-change.js'
import { deleteDoc } from './lib/hooks.js'

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
            afterChange(client, collection.slug, config, pluginConfig.vectorSearch),
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

    const existing = incomingConfig.onInit

    return {
      ...incomingConfig,
      collections,
      endpoints: [...(incomingConfig.endpoints || []), ...createEndpoints(client, pluginConfig)],
      onInit: async (payload) => {
        if (existing) {
          await existing(payload)
        }

        await initializeTypesense(payload, client, pluginConfig)
      },
    }
  }
