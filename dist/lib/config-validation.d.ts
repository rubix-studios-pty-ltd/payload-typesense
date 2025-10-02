import { z } from "zod";
export declare const TypesenseSearchConfigSchema: z.ZodObject<{
    collections: z.ZodRecord<z.ZodString, z.ZodObject<{
        displayName: z.ZodOptional<z.ZodString>;
        enabled: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        facetFields: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
        fieldMapping: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        icon: z.ZodOptional<z.ZodString>;
        searchFields: z.ZodArray<z.ZodString>;
    }, z.core.$strip>>;
    settings: z.ZodOptional<z.ZodObject<{
        cache: z.ZodOptional<z.ZodObject<{
            maxSize: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
            ttl: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        }, z.core.$strip>>;
        categorized: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, z.core.$strip>>;
    typesense: z.ZodObject<{
        apiKey: z.ZodString;
        connectionTimeoutSeconds: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        nodes: z.ZodArray<z.ZodObject<{
            host: z.ZodString;
            port: z.ZodNumber;
            protocol: z.ZodEnum<{
                http: "http";
                https: "https";
            }>;
        }, z.core.$strip>>;
        numRetries: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        retryIntervalSeconds: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type ValidatedTypesenseSearchConfig = z.infer<typeof TypesenseSearchConfigSchema>;
export interface ValidationResult {
    data?: ValidatedTypesenseSearchConfig;
    errors?: string[];
    success: boolean;
}
/**
 * Validate plugin configuration
 */
export declare function validateConfig(config: unknown): ValidationResult;
/**
 * Validate and transform configuration with defaults
 */
export declare function validateAndTransformConfig(config: unknown): ValidationResult;
/**
 * Validate individual collection configuration
 */
export declare function validateCollectionConfig(collectionSlug: string, config: unknown): ValidationResult;
/**
 * Get configuration validation errors in a user-friendly format
 */
export declare function getValidationErrors(errors: string[]): string;
/**
 * Validate search parameters
 */
export declare const SearchParamsSchema: z.ZodObject<{
    facets: z.ZodOptional<z.ZodArray<z.ZodString>>;
    filters: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    highlight_fields: z.ZodOptional<z.ZodArray<z.ZodString>>;
    num_typos: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    per_page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    q: z.ZodString;
    snippet_threshold: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    sort_by: z.ZodOptional<z.ZodString>;
    typo_tokens_threshold: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
export type ValidatedSearchParams = z.infer<typeof SearchParamsSchema>;
/**
 * Validate search parameters
 */
export declare function validateSearchParams(params: unknown): ValidationResult;
//# sourceMappingURL=config-validation.d.ts.map