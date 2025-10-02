import pkg from '../../package.json';
import { searchCache } from '../lib/cache.js';
/**
 * Test Typesense connection
 */ const testTypesenseConnection = async (typesenseClient)=>{
    try {
        const health = await typesenseClient.health.retrieve();
        return health.ok === true;
    } catch (_error) {
        // Handle health check error
        return false;
    }
};
/**
 * Get collection information
 */ const getCollectionInfo = async (typesenseClient)=>{
    try {
        const collections = await typesenseClient.collections().retrieve();
        return collections.map((col)=>col.name);
    } catch (_error) {
        // Handle collections retrieval error
        return [];
    }
};
/**
 * Get cache statistics
 */ const getCacheStats = ()=>{
    const stats = searchCache.getStats();
    return {
        hitRate: stats.hitRate || 0,
        maxSize: stats.maxSize,
        size: stats.size
    };
};
/**
 * Create health check handler
 */ export const createHealthCheckHandler = (typesenseClient, pluginOptions, lastSyncTime)=>{
    return async ()=>{
        try {
            const startTime = Date.now();
            // Test Typesense connection
            const isTypesenseHealthy = await testTypesenseConnection(typesenseClient);
            const typesenseInfo = isTypesenseHealthy ? {
                ok: true,
                version: 'unknown'
            } // Typesense doesn't expose version in health check
             : {
                ok: false
            };
            // Get collection information
            const collections = isTypesenseHealthy ? await getCollectionInfo(typesenseClient) : [];
            // Get cache statistics
            const cacheStats = getCacheStats();
            // Determine overall health status
            const isHealthy = isTypesenseHealthy && collections.length > 0;
            const response = {
                cache: cacheStats,
                collections,
                ...lastSyncTime !== undefined && {
                    lastSync: lastSyncTime
                },
                status: isHealthy ? 'healthy' : 'unhealthy',
                typesense: typesenseInfo
            };
            // Add error details if unhealthy
            if (!isHealthy) {
                const errors = [];
                if (!isTypesenseHealthy) {
                    errors.push('Typesense connection failed');
                }
                if (collections.length === 0) {
                    errors.push('No collections available');
                }
                response.error = errors.join(', ');
            }
            const responseTime = Date.now() - startTime;
            return Response.json({
                ...response,
                responseTime,
                timestamp: new Date().toISOString(),
                version: pkg.version
            });
        } catch (_error) {
            // Handle health check error
            const errorResponse = {
                cache: getCacheStats(),
                error: _error instanceof Error ? _error.message : 'Unknown error',
                status: 'unhealthy'
            };
            return Response.json(errorResponse, {
                status: 500
            });
        }
    };
};
/**
 * Create detailed health check handler with more information
 */ export const createDetailedHealthCheckHandler = (typesenseClient, pluginOptions, lastSyncTime)=>{
    return async ()=>{
        try {
            const startTime = Date.now();
            // Test Typesense connection
            const isTypesenseHealthy = await testTypesenseConnection(typesenseClient);
            // Get detailed collection information
            let collections = [];
            if (isTypesenseHealthy) {
                try {
                    const collectionsData = await typesenseClient.collections().retrieve();
                    collections = collectionsData.map((col)=>({
                            name: col.name,
                            createdAt: col.created_at,
                            fields: col.fields?.length || 0,
                            numDocuments: col.num_documents
                        }));
                } catch (_error) {
                // Handle detailed collection info error
                }
            }
            // Get cache statistics
            const cacheStats = getCacheStats();
            // Get plugin configuration info
            const configInfo = {
                enabledCollections: Object.entries(pluginOptions.collections || {}).filter(([_, config])=>config?.enabled).map(([name, config])=>({
                        name,
                        displayName: config?.displayName,
                        facetFields: config?.facetFields || [],
                        searchFields: config?.searchFields || []
                    })),
                settings: pluginOptions.settings,
                totalCollections: Object.keys(pluginOptions.collections || {}).length
            };
            // Determine overall health status
            const isHealthy = isTypesenseHealthy && collections.length > 0;
            const response = {
                cache: cacheStats,
                collectionDetails: collections,
                collections: collections.map((col)=>col.name),
                config: configInfo,
                lastSync: lastSyncTime,
                responseTime: Date.now() - startTime,
                status: isHealthy ? 'healthy' : 'unhealthy',
                timestamp: new Date().toISOString(),
                typesense: {
                    ok: isTypesenseHealthy,
                    version: 'unknown'
                },
                version: pkg.version
            };
            // Add error details if unhealthy
            if (!isHealthy) {
                const errors = [];
                if (!isTypesenseHealthy) {
                    errors.push('Typesense connection failed');
                }
                if (collections.length === 0) {
                    errors.push('No collections available');
                }
                response.error = errors.join(', ');
            }
            return Response.json(response);
        } catch (_error) {
            // Handle detailed health check error
            const errorResponse = {
                cache: getCacheStats(),
                error: _error instanceof Error ? _error.message : 'Unknown error',
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                version: pkg.version
            };
            return Response.json(errorResponse, {
                status: 500
            });
        }
    };
};
