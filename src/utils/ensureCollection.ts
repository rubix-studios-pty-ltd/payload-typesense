import type Typesense from 'typesense'

export const ensureCollection = async (
  typesenseClient: Typesense.Client,
  collectionSlug: string,
  schema: any
): Promise<boolean> => {
  try {
    await typesenseClient.collections(collectionSlug).retrieve()
    return true
  } catch {
    try {
      await typesenseClient.collections().create(schema)
      return true
    } catch {
      return false
    }
  }
}
