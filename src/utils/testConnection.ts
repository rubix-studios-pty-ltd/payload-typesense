import type Typesense from 'typesense'

export const testConnection = async (client: Typesense.Client): Promise<boolean> => {
  try {
    const health = await client.health.retrieve()
    return health.ok === true
  } catch {
    return false
  }
}
