import Typesense from 'typesense'

import type { TypesenseSearchConfig } from '../index.js'

export const createTypesenseClient = (typesenseConfig: TypesenseSearchConfig['typesense']) => {
  return new Typesense.Client({
    apiKey: typesenseConfig.apiKey,
    connectionTimeoutSeconds: typesenseConfig.connectionTimeoutSeconds || 2,
    nodes: typesenseConfig.nodes.map((node) => ({
      ...node,
      port: typeof node.port === 'string' ? parseInt(node.port) : node.port,
    })),
  })
}

export const testTypesenseConnection = async (client: Typesense.Client): Promise<boolean> => {
  try {
    await client.health.retrieve()
    return true
  } catch (_error) {
    // Handle Typesense connection error
    return false
  }
}
