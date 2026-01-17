import { type CacheEntry, type CacheOptions, type CacheStats } from '../types.js'

export class SearchCache<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>()
  private readonly defaultTTL: number
  private readonly maxSize: number
  private stats: CacheStats = { hits: 0, misses: 0 }

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.ttl ?? 5 * 60 * 1000
    this.maxSize = options.maxSize ?? 1000
  }

  private evict(): void {
    this.cleanup()

    if (this.cache.size < this.maxSize) return

    const oldestKey = this.cache.keys().next().value
    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  private generateKey(
    query: string,
    collection?: string,
    params?: Record<string, unknown>
  ): string {
    const base = `${this.normalize(collection)}:${query}`
    const serializedParams = this.serialize(params)
    return serializedParams ? `${base}:${serializedParams}` : base
  }

  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.ttl
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
    if (!params || Object.keys(params).length === 0) return ''

    const sorted = Object.keys(params)
      .sort()
      .map((key) => `${key}=${JSON.stringify(params[key])}`)
      .join('&')

    return sorted
  }

  cleanup(): void {
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key)
      }
    }
  }

  clear(pattern?: RegExp | string): void {
    if (!pattern) {
      this.cache.clear()
      return
    }

    const matcher =
      typeof pattern === 'string'
        ? (key: string) => key.includes(pattern)
        : (key: string) => pattern.test(key)

    for (const key of this.cache.keys()) {
      if (matcher(key)) {
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
    const total = this.stats.hits + this.stats.misses
    return {
      hitRate: total === 0 ? 0 : this.stats.hits / total,
      maxSize: this.maxSize,
      size: this.cache.size,
    }
  }

  has(query: string, collection?: string, params?: Record<string, unknown>): boolean {
    const key = this.generateKey(query, collection, params)
    const entry = this.cache.get(key)

    if (!entry || this.isExpired(entry)) {
      if (entry) {
        this.cache.delete(key)
      }

      return false
    }

    return true
  }

  set(
    query: string,
    data: T,
    collection?: string,
    params?: Record<string, unknown>,
    ttl?: number
  ): void {
    const key = this.generateKey(query, collection, params)

    this.evict()

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTTL,
    })
  }
}

export const searchCache = new SearchCache({
  maxSize: 1000,
  ttl: 5 * 60 * 1000,
})
