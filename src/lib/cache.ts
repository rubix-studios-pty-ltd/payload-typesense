import { type CacheEntry, type CacheOptions } from '../types.js'

export class SearchCache<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>()
  private readonly defaultTTL: number
  private readonly maxSize: number

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.ttl || 5 * 60 * 1000
    this.maxSize = options.maxSize || 1000
  }

  private generateKey(
    query: string,
    collection?: string,
    params?: Record<string, unknown>
  ): string {
    const baseKey = `${collection || 'universal'}:${query}`

    if (params) {
      const sortedParams = Object.keys(params)
        .sort()
        .map((key) => `${key}=${String(params[key])}`)
        .join('&')

      return `${baseKey}:${sortedParams}`
    }

    return baseKey
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  clear(pattern?: string): void {
    if (!pattern) {
      this.cache.clear()
      return
    }
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }

  get(query: string, collection?: string, params?: Record<string, unknown>): null | T {
    const key = this.generateKey(query, collection, params)
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  getStats(): { hitRate?: number; maxSize: number; size: number } {
    return {
      maxSize: this.maxSize,
      size: this.cache.size,
    }
  }

  has(query: string, collection?: string, params?: Record<string, unknown>): boolean {
    return this.get(query, collection, params) !== null
  }

  set(
    query: string,
    data: T,
    collection?: string,
    params?: Record<string, unknown>,
    ttl?: number
  ): void {
    const key = this.generateKey(query, collection || '', params)

    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    })
  }
}

export const searchCache = new SearchCache({
  maxSize: 1000,
  ttl: 5 * 60 * 1000,
})

setInterval(
  () => {
    searchCache.cleanup()
  },
  10 * 60 * 1000
)
