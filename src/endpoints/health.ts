import { type PayloadHandler } from 'payload'
import type Typesense from 'typesense'

import pkg from '../../package.json' with { type: 'json' }
import { type TypesenseConfig } from '../types.js'
import { buildError } from '../utils/buildError.js'
import { getCacheStats } from '../utils/getCacheStats.js'

const headers = { 'Cache-Control': 'no-store' }

export const createHealthCheck = (
  client: Typesense.Client,
  _config: TypesenseConfig,
  _lastSyncTime?: number
): PayloadHandler => {
  return async (request): Promise<Response> => {
    try {
      const health = await client.health.retrieve()
      const healthy = health.ok === true

      return Response.json(
        { status: healthy ? 'healthy' : 'unhealthy' },
        { headers, status: healthy ? 200 : 503 }
      )
    } catch (error) {
      request.payload.logger.error({ err: error, msg: 'Typesense health check failed' })

      return Response.json({ status: 'unhealthy' }, { headers, status: 503 })
    }
  }
}

export const createDetailedHealthCheck = (
  client: Typesense.Client,
  config: TypesenseConfig,
  lastSyncTime?: number
): PayloadHandler => {
  return async (request): Promise<Response> => {
    if (!config.healthAccess) {
      return Response.json({ error: 'Not found' }, { headers, status: 404 })
    }

    try {
      if ((await config.healthAccess(request)) !== true) {
        return Response.json({ error: 'Forbidden' }, { headers, status: 403 })
      }
    } catch (error) {
      request.payload.logger.error({ err: error, msg: 'Typesense health authorisation failed' })

      return Response.json({ error: 'Forbidden' }, { headers, status: 403 })
    }

    const start = Date.now()

    try {
      const health = (await client.health.retrieve()).ok === true

      const enabledCollections = Object.entries(config.collections ?? {})
        .filter(([, collection]) => collection?.enabled)
        .map(([name, collection]) => ({
          name,
          displayName: collection.displayName,
          facetFields: collection.facetFields ?? [],
          searchFields: collection.searchFields ?? [],
        }))

      const names = new Set(enabledCollections.map((collection) => collection.name))

      const collectionDetails = health
        ? (await client.collections().retrieve())
            .filter((collection) => names.has(collection.name))
            .map((collection) => ({
              createdAt: collection.created_at,
              fields: collection.fields?.length || 0,
              name: collection.name,
              numDocuments: collection.num_documents,
            }))
        : []

      const collections = collectionDetails.map((collection) => collection.name)
      const isHealthy = health && names.size > 0 && collections.length === names.size

      const error = isHealthy
        ? undefined
        : (buildError(health, collections.length > 0) ?? 'Enabled collections unavailable')

      return Response.json(
        {
          cache: getCacheStats(),
          collectionDetails,
          collections,
          config: {
            enabledCollections,
            totalCollections: enabledCollections.length,
          },
          status: isHealthy ? 'healthy' : 'unhealthy',
          typesense: { ok: health, version: 'unknown' },
          ...(lastSyncTime !== undefined && { lastSync: lastSyncTime }),
          ...(error && { error }),
          responseTime: Date.now() - start,
          timestamp: new Date().toISOString(),
          version: pkg.version,
        },
        { headers, status: isHealthy ? 200 : 503 }
      )
    } catch (error) {
      request.payload.logger.error({ err: error, msg: 'Typesense detailed health check failed' })

      return Response.json(
        { error: 'Health check failed', status: 'unhealthy' },
        { headers, status: 503 }
      )
    }
  }
}
