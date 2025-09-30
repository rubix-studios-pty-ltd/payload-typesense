/**
 * Health check endpoint for monitoring plugin status
 */

import type { PayloadHandler } from 'payload'
import type Typesense from 'typesense'

import type { TypesenseSearchConfig } from '../index.js'
import type { HealthCheckResponse } from '../lib/types.js'

import { searchCache } from '../lib/cache.js'

/**
 * Test Typesense connection
 */
const testTypesenseConnection = async (typesenseClient: Typesense.Client): Promise<boolean> => {
  try {
    const health = await typesenseClient.health.retrieve()
    return health.ok === true
  } catch (_error) {
    // Handle health check error
    return false
  }
}

/**
 * Get collection information
 */
const getCollectionInfo = async (typesenseClient: Typesense.Client): Promise<string[]> => {
  try {
    const collections = await typesenseClient.collections().retrieve()
    return collections.map((col) => col.name)
  } catch (_error) {
    // Handle collections retrieval error
    return []
  }
}

/**
 * Get cache statistics
 */
const getCacheStats = () => {
  const stats = searchCache.getStats()
  return {
    hitRate: stats.hitRate || 0,
    maxSize: stats.maxSize,
    size: stats.size,
  }
}

/**
 * Create health check handler
 */
export const createHealthCheckHandler = (
  typesenseClient: Typesense.Client,
  pluginOptions: TypesenseSearchConfig,
  lastSyncTime?: number,
): PayloadHandler => {
  return async (): Promise<Response> => {
    try {
      const startTime = Date.now()

      // Test Typesense connection
      const isTypesenseHealthy = await testTypesenseConnection(typesenseClient)
      const typesenseInfo = isTypesenseHealthy
        ? { ok: true, version: 'unknown' } // Typesense doesn't expose version in health check
        : { ok: false }

      // Get collection information
      const collections = isTypesenseHealthy ? await getCollectionInfo(typesenseClient) : []

      // Get cache statistics
      const cacheStats = getCacheStats()

      // Determine overall health status
      const isHealthy = isTypesenseHealthy && collections.length > 0

      const response: HealthCheckResponse = {
        cache: cacheStats,
        collections,
        ...(lastSyncTime !== undefined && { lastSync: lastSyncTime }),
        status: isHealthy ? 'healthy' : 'unhealthy',
        typesense: typesenseInfo,
      }

      // Add error details if unhealthy
      if (!isHealthy) {
        const errors: string[] = []
        if (!isTypesenseHealthy) {
          errors.push('Typesense connection failed')
        }
        if (collections.length === 0) {
          errors.push('No collections available')
        }
        response.error = errors.join(', ')
      }

      const responseTime = Date.now() - startTime

      return Response.json({
        ...response,
        responseTime,
        timestamp: new Date().toISOString(),
        version: '1.0.6', // Plugin version
      })
    } catch (_error) {
      // Handle health check error

      const errorResponse: HealthCheckResponse = {
        cache: getCacheStats(),
        error: _error instanceof Error ? _error.message : 'Unknown error',
        status: 'unhealthy',
      }

      return Response.json(errorResponse, { status: 500 })
    }
  }
}

/**
 * Create detailed health check handler with more information
 */
export const createDetailedHealthCheckHandler = (
  typesenseClient: Typesense.Client,
  pluginOptions: TypesenseSearchConfig,
  lastSyncTime?: number,
): PayloadHandler => {
  return async (): Promise<Response> => {
    try {
      const startTime = Date.now()

      // Test Typesense connection
      const isTypesenseHealthy = await testTypesenseConnection(typesenseClient)

      // Get detailed collection information
      let collections: any[] = []
      if (isTypesenseHealthy) {
        try {
          const collectionsData = await typesenseClient.collections().retrieve()
          collections = collectionsData.map((col) => ({
            name: col.name,
            createdAt: col.created_at,
            fields: col.fields?.length || 0,
            numDocuments: col.num_documents,
          }))
        } catch (_error) {
          // Handle detailed collection info error
        }
      }

      // Get cache statistics
      const cacheStats = getCacheStats()

      // Get plugin configuration info
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

      // Determine overall health status
      const isHealthy = isTypesenseHealthy && collections.length > 0

      const response: any = {
        cache: cacheStats,
        collectionDetails: collections,
        collections: collections.map((col) => col.name),
        config: configInfo,
        lastSync: lastSyncTime,
        responseTime: Date.now() - startTime,
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        typesense: {
          ok: isTypesenseHealthy,
          version: 'unknown',
        },
        version: '1.0.6',
      }

      // Add error details if unhealthy
      if (!isHealthy) {
        const errors: string[] = []
        if (!isTypesenseHealthy) {
          errors.push('Typesense connection failed')
        }
        if (collections.length === 0) {
          errors.push('No collections available')
        }
        response.error = errors.join(', ')
      }

      return Response.json(response)
    } catch (_error) {
      // Handle detailed health check error

      const errorResponse = {
        cache: getCacheStats(),
        error: _error instanceof Error ? _error.message : 'Unknown error',
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        version: '1.0.6',
      }

      return Response.json(errorResponse, { status: 500 })
    }
  }
}
