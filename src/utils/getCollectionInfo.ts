import type Typesense from 'typesense'

export const getCollectionInfo = async (client: Typesense.Client): Promise<string[]> => {
  try {
    const collections = await client.collections().retrieve()
    return collections.map((c) => c.name)
  } catch {
    return []
  }
}
