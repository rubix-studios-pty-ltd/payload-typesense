import { searchCache } from '../lib/cache.js'

export const getCacheStats = () => {
  const stats = searchCache.getStats()
  return {
    hitRate: stats.hitRate || 0,
    maxSize: stats.maxSize,
    size: stats.size,
  }
}
