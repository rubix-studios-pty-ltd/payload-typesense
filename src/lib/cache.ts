import type { CacheEntry, CacheOptions } from "./types.js"

export class SearchCache<T = any> {
	private cache = new Map<string, CacheEntry<T>>()
	private readonly defaultTTL: number
	private readonly maxSize: number

	constructor(options: CacheOptions = {}) {
		this.defaultTTL = options.ttl || 5 * 60 * 1000
		this.maxSize = options.maxSize || 1000
	}

	/**
	 * Generate cache key from search parameters
	 */
	private generateKey(
		query: string,
		collection?: string,
		params?: Record<string, any>
	): string {
		const baseKey = `${collection || "universal"}:${query}`
		if (params) {
			const sortedParams = Object.keys(params)
				.sort()
				.map((key) => `${key}=${params[key]}`)
				.join("&")
			return `${baseKey}:${sortedParams}`
		}
		return baseKey
	}

	/**
	 * Clear expired entries
	 */
	cleanup(): void {
		const now = Date.now()
		for (const [key, entry] of this.cache.entries()) {
			if (now - entry.timestamp > entry.ttl) {
				this.cache.delete(key)
			}
		}
	}

	/**
	 * Clear cache entries matching pattern
	 */
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

	/**
	 * Get cached search result
	 */
	get(
		query: string,
		collection?: string,
		params?: Record<string, any>
	): null | T {
		const key = this.generateKey(query, collection || "", params)
		const entry = this.cache.get(key)

		if (!entry) {
			return null
		}

		// Check if entry has expired
		if (Date.now() - entry.timestamp > entry.ttl) {
			this.cache.delete(key)
			return null
		}

		return entry.data
	}

	/**
	 * Get cache statistics
	 */
	getStats(): { hitRate?: number; maxSize: number; size: number } {
		return {
			maxSize: this.maxSize,
			size: this.cache.size,
		}
	}

	/**
	 * Check if cache has valid entry
	 */
	has(
		query: string,
		collection?: string,
		params?: Record<string, any>
	): boolean {
		return this.get(query, collection, params) !== null
	}

	/**
	 * Set cached search result
	 */
	set(
		query: string,
		data: T,
		collection?: string,
		params?: Record<string, any>,
		ttl?: number
	): void {
		const key = this.generateKey(query, collection || "", params)

		// Enforce max size by removing oldest entries
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

// Global cache instance
export const searchCache = new SearchCache({
	maxSize: 1000,
	ttl: 5 * 60 * 1000,
})

// Cleanup expired entries every 10 minutes
setInterval(() => {
	searchCache.cleanup()
}, 10 * 60 * 1000)
