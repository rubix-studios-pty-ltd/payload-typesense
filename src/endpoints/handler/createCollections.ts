import { type PayloadHandler } from 'payload'

import { type TypesenseConfig } from '../../index.js'

export const createCollections = (pluginOptions: TypesenseConfig): PayloadHandler => {
  return () => {
    try {
      const enabledCollections = Object.entries(pluginOptions.collections || {})
        .filter(([, config]) => config?.enabled)
        .map(([slug, config]) => ({
          slug,
          displayName: config?.displayName || slug.charAt(0).toUpperCase() + slug.slice(1),
          facetFields: config?.facetFields ?? [],
          icon: config?.icon ?? '📄',
          searchFields: config?.searchFields ?? [],
        }))

      return Response.json({
        categorized: Boolean(pluginOptions.settings?.categorized),
        collections: enabledCollections,
      })
    } catch {
      return Response.json({ error: 'Failed to get collections' }, { status: 500 })
    }
  }
}
