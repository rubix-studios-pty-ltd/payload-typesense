import { type PayloadHandler } from 'payload'
import type Typesense from 'typesense'

import pkg from '../../package.json' with { type: 'json' }
import { type HealthCheckResponse, type TypesenseConfig } from '../types.js'
import { buildError } from '../utils/buildError.js'
import { getCacheStats } from '../utils/getCacheStats.js'
import { getCollectionInfo } from '../utils/getCollectionInfo.js'
import { testConnection } from '../utils/testConnection.js'

export const createHealthCheck = (
  client: Typesense.Client,
  _config: TypesenseConfig,
  lastSyncTime?: number
): PayloadHandler => {
  return async (): Promise<Response> => {
    const start = Date.now()

    try {
      const health = await testConnection(client)
      const collections = health ? await getCollectionInfo(client) : []
      const isHealthy = health && collections.length > 0
      const error = buildError(health, collections.length > 0)

      const response: HealthCheckResponse = {
        cache: getCacheStats(),
        collections,
        status: isHealthy ? 'healthy' : 'unhealthy',
        typesense: { ok: health, version: 'unknown' },
        ...(lastSyncTime !== undefined && { lastSync: lastSyncTime }),
        ...(error && { error }),
      }

      return Response.json(
        {
          ...response,
          responseTime: Date.now() - start,
          timestamp: new Date().toISOString(),
          version: pkg.version,
        },
        { status: isHealthy ? 200 : 503 }
      )
    } catch (error) {
      return Response.json(
        {
          cache: getCacheStats(),
          error: error instanceof Error ? error.message : 'Unknown error',
          responseTime: Date.now() - start,
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          version: pkg.version,
        },
        { status: 500 }
      )
    }
  }
}

export const createDetailedHealthCheck = (
  client: Typesense.Client,
  config: TypesenseConfig,
  lastSyncTime?: number
): PayloadHandler => {
  return async (): Promise<Response> => {
    const start = Date.now()

    try {
      const health = await testConnection(client)

      let collectionDetails: Array<{
        createdAt: number
        fields: number
        name: string
        numDocuments: number
      }> = []

      let collectionError: string | undefined

      if (health) {
        try {
          const collectionsData = await client.collections().retrieve()

          collectionDetails = collectionsData.map((collection) => ({
            createdAt: collection.created_at,
            fields: collection.fields?.length || 0,
            name: collection.name,
            numDocuments: collection.num_documents,
          }))
        } catch {
          collectionError = 'Failed to retrieve collection details'
        }
      }

      const collections = collectionDetails.map((collection) => collection.name)
      const isHealthy = health && !collectionError && collections.length > 0
      const error = collectionError || buildError(health, collections.length > 0)

      const configInfo = {
        enabledCollections: Object.entries(config.collections || {})
          .filter(([, collection]) => collection?.enabled)
          .map(([name, collection]) => ({
            name,
            displayName: collection?.displayName,
            facetFields: collection?.facetFields || [],
            searchFields: collection?.searchFields || [],
          })),
        totalCollections: Object.keys(config.collections || {}).length,
      }

      const response = {
        cache: getCacheStats(),
        collectionDetails,
        collections,
        config: configInfo,
        status: isHealthy ? 'healthy' : 'unhealthy',
        typesense: {
          ok: health,
          version: 'unknown',
        },
        ...(lastSyncTime !== undefined && { lastSync: lastSyncTime }),
        ...(error && { error }),
      }

      return Response.json(
        {
          ...response,
          responseTime: Date.now() - start,
          timestamp: new Date().toISOString(),
          version: pkg.version,
        },
        { status: isHealthy ? 200 : 503 }
      )
    } catch (error) {
      return Response.json(
        {
          cache: getCacheStats(),
          error: error instanceof Error ? error.message : 'Unknown error',
          responseTime: Date.now() - start,
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          version: pkg.version,
        },
        { status: 500 }
      )
    }
  }
}
