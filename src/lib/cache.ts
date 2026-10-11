import { type CacheEntry, type CacheOptions, type CacheStats } from '../types.js'

export class SearchCache<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>()
  private readonly defaultTTL: number
  private readonly maxSize: number
  private stats: CacheStats = { hits: 0, misses: 0 }

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.ttl ?? 5 * 60 * 1000
    this.maxSize = options.maxSize ?? 1000

    if (!Number.isFinite(this.defaultTTL) || this.defaultTTL < 0) {
      throw new RangeError('Cache TTL must be a non-negative number')
    }

    if (!Number.isSafeInteger(this.maxSize) || this.maxSize < 0) {
      throw new RangeError('Cache maxSize must be a non-negative integer')
    }
  }

  private evict(): void {
    if (this.cache.size < this.maxSize) {
      return
    }

    this.cleanup()

    if (this.cache.size < this.maxSize) {
      return
    }

    const oldest = this.cache.keys().next()

    if (!oldest.done) {
      this.cache.delete(oldest.value)
    }
  }

  private generateKey(
    query: string,
    collection?: string,
    params?: Record<string, unknown>
  ): string {
    return `${this.normalize(collection)}:${JSON.stringify([query, this.serialize(params)])}`
  }

  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp >= entry.ttl
  }

  private lookup(
    query: string,
    collection?: string,
    params?: Record<string, unknown>
  ): CacheEntry<T> | null {
    const key = this.generateKey(query, collection, params)
    const entry = this.cache.get(key)

    if (!entry || this.isExpired(entry)) {
      if (entry) {
        this.cache.delete(key)
      }

      return null
    }

    this.cache.delete(key)
    this.cache.set(key, entry)

    return entry
  }

  private normalize(collection?: string): string {
    return collection ?? 'universal'
  }

  private serialize(params?: Record<string, unknown>): string {
    if (!params || Object.keys(params).length === 0) {
      return ''
    }

    return JSON.stringify(params, (_key, value) => {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)))
      }

      return value
    })
  }

  cleanup(): void {
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key)
      }
    }
  }

  clear(pattern?: RegExp | string): void {
    if (pattern === undefined) {
      this.cache.clear()
      return
    }

    for (const key of this.cache.keys()) {
      let matches: boolean

      if (typeof pattern === 'string') {
        matches = key.includes(pattern)
      } else {
        pattern.lastIndex = 0
        matches = pattern.test(key)
      }

      if (matches) {
        this.cache.delete(key)
      }
    }
  }

  get(query: string, collection?: string, params?: Record<string, unknown>): null | T {
    const entry = this.lookup(query, collection, params)

    if (!entry) {
      this.stats.misses++
      return null
    }

    this.stats.hits++
    return entry.data
  }

  getStats(): { hitRate: number; maxSize: number; size: number } {
    this.cleanup()

    const total = this.stats.hits + this.stats.misses

    return {
      hitRate: total === 0 ? 0 : this.stats.hits / total,
      maxSize: this.maxSize,
      size: this.cache.size,
    }
  }

  has(query: string, collection?: string, params?: Record<string, unknown>): boolean {
    return this.lookup(query, collection, params) !== null
  }

  set(
    query: string,
    data: T,
    collection?: string,
    params?: Record<string, unknown>,
    ttl?: number
  ): void {
    const duration = ttl ?? this.defaultTTL

    if (!Number.isFinite(duration) || duration < 0) {
      throw new RangeError('Cache TTL must be a non-negative number')
    }

    const key = this.generateKey(query, collection, params)

    if (this.maxSize === 0 || duration === 0) {
      this.cache.delete(key)
      return
    }

    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else {
      this.evict()
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: duration,
    })
  }
}

export const searchCache = new SearchCache({
  maxSize: 1000,
  ttl: 5 * 60 * 1000,
})
