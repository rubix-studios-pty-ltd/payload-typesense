import Typesense from 'typesense'

import { type TypesenseConfig } from '../types.js'

const error = new Error('Typesense offline')

const offline = (): boolean => {
  const evt = process.env.npm_lifecycle_event || ''

  if (evt.includes('build') || evt === 'tsc') return true

  if (process.argv.some((arg) => /(?:^|:|\/)(?:build|tsc)(?::|$)/i.test(arg))) {
    return true
  }

  if (process.env.CI === 'true') return true

  return false
}

const offlineClient = (): Typesense.Client => {
  const reject = () => Promise.reject(error)

  const documents = () => ({
    delete: reject,
    import: reject,
    search: reject,
    upsert: reject,
  })

  const collections = Object.assign(
    () => ({
      documents,
      retrieve: reject,
      update: reject,
    }),
    {
      create: reject,
      retrieve: reject,
    }
  )

  return {
    analytics: {
      retrieve: reject,
    },
    collections,
    health: {
      retrieve: reject,
    },
    multiSearch: {
      perform: reject,
    },
    operations: {
      get: reject,
    },
  } as unknown as Typesense.Client
}

export const createClient = (config: TypesenseConfig['typesense']): Typesense.Client => {
  if (offline()) {
    return offlineClient()
  }

  return new Typesense.Client({
    apiKey: config.apiKey,
    connectionTimeoutSeconds: config.connectionTimeoutSeconds ?? 2,
    nodes: config.nodes.map((node) => ({
      ...node,
      port: typeof node.port === 'string' ? parseInt(node.port, 10) : node.port,
    })),
  })
}
