import { type PayloadHandler } from 'payload'

import { type TypesenseConfig } from '../../types.js'

export const createCollections = (config: TypesenseConfig): PayloadHandler => {
  return (): Response => {
    try {
      const enabled = Object.entries(config.collections ?? {})
        .filter(([, collection]) => collection?.enabled)
        .map(([slug, collection]) => ({
          slug,
          displayName: collection?.displayName || slug.charAt(0).toUpperCase() + slug.slice(1),
          facetFields: collection?.facetFields ?? [],
          icon: collection?.icon ?? '📄',
          searchFields: collection?.searchFields ?? [],
        }))

      return Response.json({
        categorized: Boolean(config.settings?.categorized),
        collections: enabled,
      })
    } catch {
      return Response.json({ error: 'Failed to get collections' }, { status: 500 })
    }
  }
}
