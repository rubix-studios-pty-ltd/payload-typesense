import type Typesense from 'typesense'

import { type TypesenseSearchConfig } from '../index.js'
import { createAdvancedSearch } from './handler/createAdvancedSearch.js'
import { createCollections } from './handler/createCollections.js'
import { createSearch } from './handler/createSearch.js'
import { createSuggest } from './handler/createSuggest.js'
import { createDetailedHealthCheck, createHealthCheck } from './health.js'

export const createSearchEndpoints = (
  typesenseClient: Typesense.Client,
  pluginOptions: TypesenseSearchConfig,
  lastSyncTime?: number
) => {
  return [
    {
      handler: createCollections(pluginOptions),
      method: 'get' as const,
      path: '/search/collections',
    },
    {
      handler: createSuggest(typesenseClient, pluginOptions),
      method: 'get' as const,
      path: '/search/:collectionName/suggest',
    },
    {
      handler: createSearch(typesenseClient, pluginOptions),
      method: 'get' as const,
      path: '/search/:collectionName',
    },
    {
      handler: createAdvancedSearch(typesenseClient, pluginOptions),
      method: 'post' as const,
      path: '/search/:collectionName',
    },
    {
      handler: createSearch(typesenseClient, pluginOptions),
      method: 'get' as const,
      path: '/search',
    },
    {
      handler: createHealthCheck(typesenseClient, pluginOptions, lastSyncTime),
      method: 'get' as const,
      path: '/search/health',
    },
    {
      handler: createDetailedHealthCheck(typesenseClient, pluginOptions, lastSyncTime),
      method: 'get' as const,
      path: '/search/health/detailed',
    },
  ]
}
