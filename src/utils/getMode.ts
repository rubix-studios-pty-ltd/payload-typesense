import { type SearchParams, type TypesenseConfig } from '../types.js'

type SearchConfiguration = Pick<TypesenseConfig, 'settings' | 'vectorSearch'>

export function getMode(config: SearchConfiguration, params: Partial<SearchParams> = {}) {
  const mode =
    params.search_mode ??
    (params.vector === true ? 'semantic' : (config.settings?.searchMode ?? 'keyword'))

  if (mode !== 'keyword' && !config.vectorSearch?.enabled) {
    throw new Error('Semantic and hybrid search require vectorSearch.enabled')
  }

  return mode
}
