import type Typesense from 'typesense'

import { type PayloadHandler } from 'payload'

import pkg from '../../package.json' with { type: 'json' }
import { type TypesenseConfig } from '../index.js'
import { type HealthCheckResponse } from '../types.js'
import { buildError } from '../utils/buildError.js'
import { getCacheStats } from '../utils/getCacheStats.js'
import { getCollectionInfo } from '../utils/getCollectionInfo.js'
import { testConnection } from '../utils/testConnection.js'

export const createHealthCheck = (
  typesenseClient: Typesense.Client,
  _pluginOptions: TypesenseConfig,
  lastSyncTime?: number
): PayloadHandler => {
  return async (): Promise<Response> => {
    const start = Date.now()

    try {
      const isTypesenseHealthy = await testConnection(typesenseClient)
      const collections = isTypesenseHealthy ? await getCollectionInfo(typesenseClient) : []
      const cacheStats = getCacheStats()
      const isHealthy = isTypesenseHealthy && collections.length > 0

      const base: HealthCheckResponse = {
        cache: cacheStats,
        collections,
        status: isHealthy ? 'healthy' : 'unhealthy',
        typesense: { ok: isTypesenseHealthy, version: 'unknown' },
        ...(lastSyncTime !== undefined && { lastSync: lastSyncTime }),
      }

      const error = buildError(isTypesenseHealthy, collections.length > 0)
      const responseTime = Date.now() - start

      return Response.json({
        ...base,
        ...(error && { error }),
        responseTime,
        timestamp: new Date().toISOString(),
        version: pkg.version,
      })
    } catch (err) {
      const errorResponse: HealthCheckResponse = {
        cache: getCacheStats(),
        error: err instanceof Error ? err.message : 'Unknown error',
        status: 'unhealthy',
      }

      return Response.json(errorResponse, { status: 500 })
    }
  }
}

export const createDetailedHealthCheck = (
  typesenseClient: Typesense.Client,
  pluginOptions: TypesenseConfig,
  lastSyncTime?: number
): PayloadHandler => {
  return async (): Promise<Response> => {
    const start = Date.now()

    try {
      const isTypesenseHealthy = await testConnection(typesenseClient)

      let collectionDetails: Array<{
        createdAt: number
        fields: number
        name: string
        numDocuments: number
      }> = []

      if (isTypesenseHealthy) {
        try {
          const collectionsData = await typesenseClient.collections().retrieve()
          collectionDetails = collectionsData.map((col) => ({
            name: col.name,
            createdAt: col.created_at,
            fields: col.fields?.length || 0,
            numDocuments: col.num_documents,
          }))
        } catch {
          // ignore detailed retrieval error
        }
      }

      const collections = collectionDetails.map((c) => c.name)
      const cacheStats = getCacheStats()

      const configInfo = {
        enabledCollections: Object.entries(pluginOptions.collections || {})
          .filter(([_, config]) => config?.enabled)
          .map(([name, config]) => ({
            name,
            displayName: config?.displayName,
            facetFields: config?.facetFields || [],
            searchFields: config?.searchFields || [],
          })),
        settings: pluginOptions.settings,
        totalCollections: Object.keys(pluginOptions.collections || {}).length,
      }

      const isHealthy = isTypesenseHealthy && collectionDetails.length > 0

      const response = {
        cache: cacheStats,
        collectionDetails,
        collections,
        config: configInfo,
        lastSync: lastSyncTime,
        responseTime: Date.now() - start,
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        typesense: {
          ok: isTypesenseHealthy,
          version: 'unknown',
        },
        version: pkg.version,
        ...(isHealthy
          ? {}
          : {
              error: [
                !isTypesenseHealthy && 'Typesense connection failed',
                collectionDetails.length === 0 && 'No collections available',
              ]
                .filter(Boolean)
                .join(', '),
            }),
      }

      return Response.json(response)
    } catch (error) {
      return Response.json(
        {
          cache: getCacheStats(),
          error: error instanceof Error ? error.message : 'Unknown error',
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          version: pkg.version,
        },
        { status: 500 }
      )
    }
  }
}
