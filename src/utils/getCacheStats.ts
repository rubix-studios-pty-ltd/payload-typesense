import { searchCache } from '../lib/cache.js'

export const getCacheStats = () => searchCache.getStats()
