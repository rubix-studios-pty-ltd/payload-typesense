import type { Config } from "payload";
export * from "./components/index.js";
export type TypesenseSearchConfig = {
    /**
     * Collections to index in Typesense
     */
    collections?: Partial<Record<string, {
        displayName?: string;
        enabled: boolean;
        facetFields?: string[];
        icon?: string;
        searchFields?: string[];
        sortFields?: string[];
    }>>;
    disabled?: boolean;
    /**
     * Global plugin settings
     */
    settings?: {
        autoSync?: boolean;
        batchSize?: number;
        categorized?: boolean;
        searchEndpoint?: string;
    };
    /**
     * Typesense server configuration
     */
    typesense: {
        apiKey: string;
        connectionTimeoutSeconds?: number;
        nodes: Array<{
            host: string;
            port: number | string;
            protocol: "http" | "https";
        }>;
    };
};
export declare const typesenseSearch: (pluginOptions: TypesenseSearchConfig) => (config: Config) => Config;
//# sourceMappingURL=index.d.ts.map