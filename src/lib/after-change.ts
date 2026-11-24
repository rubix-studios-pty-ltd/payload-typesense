import { type CollectionAfterChangeHook } from 'payload'
import type Typesense from 'typesense'

import { type TypesenseCollectionConfig, type TypesenseConfig } from '../types.js'
import { deleteDoc, syncDoc } from './hooks.js'

export const afterChange = (
  client: Typesense.Client,
  slug: string,
  config: TypesenseCollectionConfig,
  vector?: TypesenseConfig['vectorSearch']
): CollectionAfterChangeHook => {
  return async ({ doc, req }) => {
    if (typeof doc.id !== 'string' && typeof doc.id !== 'number') {
      return doc
    }

    try {
      const publicDoc = await req.payload.findByID({
        collection: slug,
        id: doc.id,
        depth: 0,
        draft: false,
        disableErrors: true,
        overrideAccess: false,
        req: {
          transactionID: req.transactionID,
          user: null,
        },
      })

      if (!publicDoc) {
        await deleteDoc(client, slug, String(doc.id))
        return doc
      }

      await syncDoc(client, slug, publicDoc, config, vector)
    } catch (error) {
      req.payload.logger.error({
        err: error,
        msg: `Failed to read public Typesense document in ${slug}`,
      })

      await deleteDoc(client, slug, String(doc.id))
    }

    return doc
  }
}
