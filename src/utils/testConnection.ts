import type Typesense from 'typesense'

export async function testConnection(client: Typesense.Client): Promise<boolean> {
  try {
    const health = await client.health.retrieve()
    return health.ok === true
  } catch {
    return false
  }
}
