import type { CacheOptions } from "./types.js";
export declare class SearchCache<T = any> {
    private cache;
    private readonly defaultTTL;
    private readonly maxSize;
    constructor(options?: CacheOptions);
    /**
     * Generate cache key from search parameters
     */
    private generateKey;
    /**
     * Clear expired entries
     */
    cleanup(): void;
    /**
     * Clear cache entries matching pattern
     */
    clear(pattern?: string): void;
    /**
     * Get cached search result
     */
    get(query: string, collection?: string, params?: Record<string, any>): null | T;
    /**
     * Get cache statistics
     */
    getStats(): {
        hitRate?: number;
        maxSize: number;
        size: number;
    };
    /**
     * Check if cache has valid entry
     */
    has(query: string, collection?: string, params?: Record<string, any>): boolean;
    /**
     * Set cached search result
     */
    set(query: string, data: T, collection?: string, params?: Record<string, any>, ttl?: number): void;
}
export declare const searchCache: SearchCache<any>;
//# sourceMappingURL=cache.d.ts.map