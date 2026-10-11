import { type Endpoint } from 'payload'
import type Typesense from 'typesense'

import { type TypesenseConfig } from '../types.js'
import { createAdvancedSearch } from './handler/createAdvancedSearch.js'
import { createCollections } from './handler/createCollections.js'
import { createSearch } from './handler/createSearch.js'
import { createSuggest } from './handler/createSuggest.js'
import { createDetailedHealthCheck, createHealthCheck } from './health.js'

export const createSearchEndpoints = (
  client: Typesense.Client,
  config: TypesenseConfig
): Endpoint[] => {
  const search = createSearch(client, config)

  return [
    {
      handler: createCollections(config),
      method: 'get',
      path: '/search/collections',
    },
    {
      handler: createHealthCheck(client, config),
      method: 'get',
      path: '/search/health',
    },
    {
      handler: createDetailedHealthCheck(client, config),
      method: 'get',
      path: '/search/health/detailed',
    },
    {
      handler: createSuggest(client, config),
      method: 'get',
      path: '/search/:collectionName/suggest',
    },
    {
      handler: search,
      method: 'get',
      path: '/search/:collectionName',
    },
    {
      handler: createAdvancedSearch(client, config),
      method: 'post',
      path: '/search/:collectionName',
    },
    {
      handler: search,
      method: 'get',
      path: '/search',
    },
  ]
}
