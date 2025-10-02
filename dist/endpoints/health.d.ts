import type { PayloadHandler } from 'payload';
import type Typesense from 'typesense';
import type { TypesenseSearchConfig } from '../index.js';
/**
 * Create health check handler
 */
export declare const createHealthCheckHandler: (typesenseClient: Typesense.Client, pluginOptions: TypesenseSearchConfig, lastSyncTime?: number) => PayloadHandler;
/**
 * Create detailed health check handler with more information
 */
export declare const createDetailedHealthCheckHandler: (typesenseClient: Typesense.Client, pluginOptions: TypesenseSearchConfig, lastSyncTime?: number) => PayloadHandler;
//# sourceMappingURL=health.d.ts.map